import { Flags } from "@oclif/core";
import * as fs from "node:fs";
import {
  createBlock,
  diggerJson,
  diggerJsonExists,
  gitIgnore,
  updateDiggerJson,
} from "../utils/helpers";
import { trackEvent } from "../utils/mixpanel";
import { BaseCommand } from "../base";
import { blockOptions, defaultContent } from "../utils/digger-settings";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as inquirer from "inquirer-shortcuts";
import chalk from "chalk";

export default class Init extends BaseCommand<typeof Init> {
  static description = "Creates a Digger infra bundle project";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
    advanced: Flags.boolean({ char: "a", hidden: true, default: false }),
    block: Flags.boolean({ char: "b", default: false }),
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: blockOptions,
    }),
  };

  static args = [
    { name: "name", description: "name of the block to initialise" },
  ];

  public async run(): Promise<void> {
    const { flags, args } = await this.parse(Init);
    const { version } = this.config;
    trackEvent("init called", { flags });

    if (flags.block) {
      if (!args.name) {
        this.log(
          chalk.green`Block name is missing. Try something like this: ${chalk.greenBright`dgctl init -b <name>`}`
        );

        return;
      }

      this.log(chalk.green`Initialising a standalone Digger project block`);
      const { type } = flags.type
        ? { type: flags.type }
        : await inquirer.prompt([
            {
              type: "list",
              name: "type",
              message: "Select type of block?",
              choices: blockOptions,
            },
          ]);

      createBlock({ type, name: args.name, blockOnly: true });

      this.log(
        chalk.green`Successfully created a standalone block. Access it in ${chalk.greenBright`${args.name}`} directory`
      );

      return;
    }

    try {
      if (diggerJsonExists() && !flags.force) {
        const currentJson = diggerJson();
        updateDiggerJson({ ...currentJson, updated: Date.now() });

        this.log("Successfully updated a Digger project");
      } else {
        const defContent = defaultContent(version);

        // make sure to only add advanced if the hidden flag is used
        const content = flags.advanced
          ? { ...defContent, advanced: true }
          : defContent;
        updateDiggerJson(content);

        // if advanced, don't bother creating other files - just the json
        if (!flags.advanced) {
          createBlock({ type: "vpc", name: "default_network" });
          this.log(
            "Successfully added default network block to the Digger project"
          );

          // fs.mkdirSync(`${process.cwd()}/overrides`); Re-enable when we start using it
          fs.writeFileSync(`${process.cwd()}/dgctl.secrets.ini`, "");
          fs.writeFileSync(`${process.cwd()}/dgctl.variables.ini`, "");
        }

        fs.writeFileSync(`${process.cwd()}/.gitignore`, gitIgnore);
        this.log("Successfully initiated a Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
