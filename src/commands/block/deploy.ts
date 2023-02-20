import { Args, ux, Flags } from "@oclif/core";
import chalk = require("chalk");
import { execSync } from "node:child_process";
import { lookpath } from "lookpath";
import { getAwsCreds } from "../../utils/aws";
import { diggerJson } from "../../utils/helpers";
import { trackEvent } from "../../utils/mixpanel";
import { tfOutput } from "../../utils/terraform";
import { BaseCommand } from "../../base";

export default class Deploy extends BaseCommand<typeof Deploy> {
  static description = "Deploy application to AWS";

  static flags = {
    context: Flags.string({
      char: "c",
      description: "The code context for block deployment",
    }),
    displayOnly: Flags.boolean({
      char: "d",
      description:
        "Only display commands, do not run them for block deployment",
      default: false,
    }),
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      default: undefined,
    }),
    "no-input": Flags.boolean({
      char: "n",
      description: "Skip prompts",
      default: false,
    }),    
    region: Flags.string({
      char: "r",
      description: "AWS region to use"
    }),
  };

  static args = { name: Args.string() };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Deploy);

    trackEvent("block deploy called", { flags, args });

    const awsExists = await lookpath("aws");
    if (!awsExists) {
      this.log("aws cli installation not found.");
      return;
    }

    const dockerExist = await lookpath("docker");
    if (!dockerExist) {
      this.log(
        "Docker installation not found. Visit https://docs.docker.com/get-docker/ to learn more."
      );
      return;
    }

    if (!args.name) {
      this.log("No application name provided");
      return;
    }

    if (!flags.context && flags["no-input"]) {
      this.log("No application context provided");
      return;
    }

    const diggerConfig = diggerJson();
    const codeDirectory =
      flags.context ?? (await ux.prompt("Where is your code checked out?"));
    const infraDirectory = "generated";
    const region = flags.region
    const terraformOutputs = await tfOutput(infraDirectory);

    const blockRegions = Object.keys(diggerConfig.blocks.find((block: any) => block.name === args.name)?.aws_regions) ?? [region];

    const configPerRegion: {[region: string]: {[key: string]: any}} = {}
    const awsProfile = "default";
    for (const region of blockRegions) {
      
      const moduleName = `${args.name}_${region}`;
      const {
        lb_dns: lbUrl,
        docker_registry_url: ecrRepoUrl,
        ecs_cluster_name: ecsClusterName,
        ecs_service_name: ecsServiceName
      } = terraformOutputs[moduleName].value
      
      configPerRegion[region] = {
        moduleName: moduleName,
        lbUrl: lbUrl,
        ecrRepoUrl: ecrRepoUrl,
        ecsClusterName: ecsClusterName,
        ecsServiceName: ecsServiceName,
      }
    }

    const ecrTags = Object.values(configPerRegion).map((config: any) => `-t ${config.ecrRepoUrl}`).join(" ")

    if (flags.displayOnly) {
      this.log(
        `To build this application, in the folder containing the Dockerfile run:`
      );
      this.log(chalk.green(`docker build ${ecrTags} .`));

      for (const [region, config] of Object.entries(configPerRegion)) {
        this.log(
          chalk.green(`aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
        docker login --username AWS --password-stdin ${config.ecrRepoUrl}`)
        );
        this.log(chalk.green(`docker push ${config.ecrRepoUrl}:latest`));
        this.log(
          chalk.green(
            `aws ecs update-service --region ${region} --cluster ${config.ecsClusterName} --service ${config.ecsServiceName} --profile ${awsProfile} --force-new-deployment`
          )
        );

        this.log(`The block is accessible in this url: ${config.lbUrl}`);
      }
    } else {
      const { awsProfile } = await getAwsCreds(flags.profile);
      this.log(`[INFO] Using profile from aws credentials file: ${awsProfile}`);

      execSync(`docker build --platform linux/amd64 ${ecrTags} .`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: codeDirectory,
      });


      for (const [region, config] of Object.entries(configPerRegion)) {

        this.log(
          chalk.blueBright(`[INFO] Logging to ECR registry ${config.ecrRepoUrl}`)
        );
        execSync(
          `aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
                    docker login --username AWS --password-stdin ${config.ecrRepoUrl}`,
          {
            stdio: [process.stdin, process.stdout, process.stderr],
            cwd: codeDirectory,
          }
        );
        this.log(chalk.blueBright(`[INFO] Pushing docker image`));
        execSync(`docker push ${config.ecrRepoUrl}:latest`, {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: codeDirectory,
        });
        this.log(chalk.blueBright(`[INFO] Triggering ECS deployment`));
        execSync(
          `aws ecs update-service \
                    --cluster ${config.ecsClusterName} \
                    --service ${config.ecsServiceName}\
                    --profile ${awsProfile} \
                    --region ${region} \
                    --force-new-deployment`,
          {
            cwd: codeDirectory,
          }
        );
        this.log(chalk.greenBright(`Success! Your app is deployed at ${config.lbUrl} in region ${region}`));
      }

      if (!flags["no-input"] && blockRegions.length === 1 && await ux.confirm("Do you want to follow logs?")) {
        const region = blockRegions[0]; 
        this.log(
          chalk.blueBright(
            `[INFO] Streaming logs from ECS service ${configPerRegion[region].ecsServiceName}`
          )
        );
        execSync(
          `aws logs tail --follow --profile ${awsProfile} /ecs/service/${configPerRegion[region].ecsServiceName} --region ${region} --color auto`,
          {
            stdio: [process.stdin, process.stdout, process.stderr],
          }
        );
      }
    }

    trackEvent("block deploy successful", { flags, args, diggerConfig });
  }
}
