import { Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as blocks from "../../utils/block-defaults";
import {
  createBlock,
  diggerJson,
  diggerJsonExists,
  updateDiggerJson,
} from "../../utils/helpers";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { createBrotliCompress } from "node:zlib";
import { lookpath } from "lookpath";

export default class Index extends Command {
  static description = "Adds a infra block to a Digger infra bundle";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container"],
    }),
    name: Flags.string({
      char: "n",
      description: "new name for the block",
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
        if (!flags.type) {
          this.log(
            "No type provided for the block. Example: dgctl block add -t=container <name>"
          );
          return;
        }

        if (!args.name) {
          this.log("No name provided, will be using an auto generated name.");
        }

        const blockName = args.name ?? crypto.randomUUID().replace(/\-/g, "_");
        const type = flags.type;    
        try {
          createBlock(type, blockName, {aws_app_identifier: blockName})
          this.log("Successfully added a block to the Digger project");
        } catch (error: any) {
          this.error(error);
        }  
        break;
      }

      case "build": {
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

        this.log(
          `To build this application, in the folder containing the Dockerfile run:`
        );
        this.log(chalk.green(`docker build . -t ${args.name}:latest`));
        const styledCommand = chalk.green(
          `dgctl block rename ${args.name} -n=<new_name>`
        );
        this.log(`Application name can be changed by running ${styledCommand}`);

        break;
      }

      case "deploy": {
        const terraformExists = await lookpath("terraform");
        this.log(terraformExists)
        if (!terraformExists) {
          this.log("Terraform installation not found.");
          return;
        }

        if (!args.name) {
          this.log("No application name provided");
          return;
        }

        this.log(
          `To deploy this application, run ${chalk.green(
            "aws ecs deploy <ecr_id> <image_id>"
          )}`
        );
        this.log("In the same directory as the image, run these commands:");
        this.log(chalk.green(`aws ecr login`));
        this.log(chalk.green(`docker push`));

        break;
      }

      case "remove": {
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
