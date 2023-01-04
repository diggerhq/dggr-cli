import { CliUx, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import {
  createBlock,
  diggerJson,
  diggerJsonExists,
  updateDiggerJson,
} from "../../utils/helpers";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { lookpath } from "lookpath";
import { execSync } from "node:child_process";
import { tfOutput } from "../../utils/terraform";
import { getAwsCreds } from "../../utils/aws";
import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../base";

export default class Index extends BaseCommand<typeof Index> {
  static description = "Adds a infra block to a Digger infra bundle";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container", "mysql", "postgres", "docdb", "redis"],
    }),
    name: Flags.string({
      char: "n",
      description: "new name for the block",
    }),
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
  };

  static args = [
    {
      name: "command",
      options: ["add", "remove", "rename", "build", "deploy"],
    },
    { name: "name" },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Index);

    if (!diggerJsonExists()) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
      return;
    }

    if (!args.command) {
      this.log(
        "No command provided for the block. Example command: dgctl block add -t=container <name>"
      );
      return;
    }

    switch (args.command) {
      case "add": {
        trackEvent("block add called", { flags, args });
        if (!flags.type) {
          this.log(
            "No type provided for the block. Example: dgctl block add -t=container <name>"
          );
          return;
        }

        if (!args.name) {
          this.log("No name provided, will be using an auto generated name.");
        }

        const blockName =
          args.name ?? `${flags.type}_${crypto.randomUUID().slice(0, 5)}`;
        const type = flags.type;
        try {
          createBlock(type, blockName, {});
          this.log("Successfully added a block to the Digger project");
        } catch (error: any) {
          this.error(error);
        }

        break;
      }

      case "deploy": {
        trackEvent("block deploy called", { flags, args });
        // const terraform = (await lookpath("terraform")) ?? "terraform";

        const awsExists = await lookpath("aws");
        this.log(awsExists);
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

        const diggerConfig = diggerJson();
        const codeDirectory =
          flags.context ??
          (await CliUx.ux.prompt("Where is your code checked out?"));
        const infraDirectory = "generated";
        const region = diggerConfig.aws_region;
        const terraformOutputs = await tfOutput(infraDirectory);
        const url = terraformOutputs[args.name].value.lb_dns;
        const ecrRepoUrl =
          terraformOutputs[args.name].value.docker_registry_url;
        const ecsClusterName =
          terraformOutputs[args.name].value.ecs_cluster_name;
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
              `aws ecs update-service --cluster ${ecsClusterName} --service ${ecsClusterName} --profile ${awsProfile} --force-new-deployment`
            )
          );

          this.log(`The block is accessible in this url: ${url}`);
        } else {
          const { awsProfile } = await getAwsCreds(flags.profile);
          this.log(
            `[INFO] Using profile from aws credentials file: ${awsProfile}`
          );

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
                      --service ${ecsClusterName}\
                      --profile ${awsProfile} \
                      --region ${region} \
                      --force-new-deployment`,
            {
              cwd: codeDirectory,
            }
          );

          this.log(
            chalk.greenBright(`Success! Your app is deployed at ${url}`)
          );
        }

        trackEvent("block deploy successful", { flags, args, diggerConfig });
        break;
      }

      case "remove": {
        trackEvent("block remove called", { flags, args });
        if (!args.name) {
          this.log(`No app name provided. Example: dgctl block remove <name> `);
          return;
        }

        if (fs.existsSync(`${process.cwd()}/${args.name}`)) {
          const parsedContent = diggerJson();
          const removedBlock = parsedContent.blocks.filter(
            ({ name }: any) => name !== args.name
          );

          updateDiggerJson({
            ...parsedContent,
            blocks: [...removedBlock],
          });

          fs.renameSync(
            `${process.cwd()}/${args.name}`,
            `${process.cwd()}/REMOVED_${args.name}`
          );

          this.log(`${args.name} block removed`);
        } else {
          this.log(`${args.name} app directory not found`);
        }

        break;
      }

      case "rename": {
        trackEvent("block rename called", { flags, args });
        if (!args.name) {
          this.log(
            `No app name provided. Example: dgctl block rename <name> -n=<newName>`
          );
          return;
        }

        if (!fs.existsSync(`${process.cwd()}/${args.name}`)) {
          this.log(`${args.name} directory not found.`);
          return;
        }

        if (!flags.name) {
          this.log(
            `No new app name provided. Example: dgctl block rename ${args.name} -n=<newName>`
          );
          return;
        }

        const currentDiggerJson = diggerJson();
        const renamedApp = currentDiggerJson.blocks.map((block: any) => {
          if (block.name === args.name) {
            return { ...block, name: flags.name };
          }

          return block;
        });

        fs.renameSync(
          `${process.cwd()}/${args.name}`,
          `${process.cwd()}/${flags.name}`
        );
        updateDiggerJson({
          ...currentDiggerJson,
          blocks: [...renamedApp],
        });

        break;
      }
    }
  }
}
