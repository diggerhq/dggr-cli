import { CliUx, Flags } from "@oclif/core";
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
    'no-input': Flags.boolean({
      char: "n",
      description: "Skip prompts",
      default: false,
    }),
  };

  static args = [{ name: "name" }];

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
      flags.context ??
      (await CliUx.ux.prompt("Where is your code checked out?"));
    const infraDirectory = "generated";
    const region = diggerConfig.aws_region;
    const terraformOutputs = await tfOutput(infraDirectory);
    const url = terraformOutputs[args.name].value.lb_dns;
    const ecrRepoUrl = terraformOutputs[args.name].value.docker_registry_url;
    const ecsClusterName = terraformOutputs[args.name].value.ecs_cluster_name;
    const ecsServiceName = terraformOutputs[args.name].value.ecs_service_name;
    const awsProfile = "default";

    if (flags.displayOnly) {
      this.log(
        `To build this application, in the folder containing the Dockerfile run:`
      );
      this.log(
        chalk.green(`aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
      docker login --username AWS --password-stdin ${ecrRepoUrl}`)
      );
      this.log(chalk.green(`docker build -t ${ecrRepoUrl} .`));
      this.log(chalk.green(`docker push ${ecrRepoUrl}:latest`));
      this.log(
        chalk.green(
          `aws ecs update-service --cluster ${ecsClusterName} --service ${ecsServiceName} --profile ${awsProfile} --force-new-deployment`
        )
      );

      this.log(`The block is accessible in this url: ${url}`);
    } else {
      const { awsProfile } = await getAwsCreds(flags.profile);
      this.log(`[INFO] Using profile from aws credentials file: ${awsProfile}`);

      this.log(
        chalk.blueBright(`[INFO] Logging to ECR registry ${ecrRepoUrl}`)
      );
      execSync(
        `aws ecr get-login-password --region ${region} --profile ${awsProfile} | 
                  docker login --username AWS --password-stdin ${ecrRepoUrl}`,
        {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: codeDirectory,
        }
      );
      this.log(
        chalk.blueBright(`[INFO] Building docker image at ${codeDirectory}`)
      );
      execSync(`docker build -t ${ecrRepoUrl} .`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: codeDirectory,
      });
      this.log(chalk.blueBright(`[INFO] Pushing docker image`));
      execSync(`docker push ${ecrRepoUrl}:latest`, {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: codeDirectory,
      });
      this.log(chalk.blueBright(`[INFO] Triggering ECS deployment`));
      execSync(
        `aws ecs update-service \
                  --cluster ${ecsClusterName} \
                  --service ${ecsServiceName}\
                  --profile ${awsProfile} \
                  --region ${region} \
                  --force-new-deployment`,
        {
          cwd: codeDirectory,
        }
      );

      this.log(chalk.greenBright(`Success! Your app is deployed at ${url}`));
      if (!flags["no-input"] && await CliUx.ux.confirm("Do you want to follow logs?")) {
        this.log(
          chalk.blueBright(
            `[INFO] Streaming logs from ECS service ${ecsServiceName}`
          )
        );
        execSync(
          `aws logs tail --follow --profile ${awsProfile} /ecs/service/${ecsServiceName} --color auto`,
          {
            stdio: [process.stdin, process.stdout, process.stderr]
          }
        );
      }

    }

    trackEvent("block deploy successful", { flags, args, diggerConfig });
  }
}
