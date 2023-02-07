import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "base";
import { deleteSsmParameter } from "@utils/aws";
import { ConfigIniParser } from "config-ini-parser";
import fs from "node:fs";
import chalk from "chalk";
import { diggerJson } from "@utils/helpers";

export default class Delete extends BaseCommand<typeof Delete> {
  static description = "Delete secret";

  static flags = {
    block: Flags.string({ char: "b", description: "name of the block" }),
  };

  static args = { key: Args.string() };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Delete);

    if (!flags.block) {
      this.warn(
        "No block provided for the variable. Global secret will be deleted"
      );
    }

    const block = flags.block ?? "_bundle_";

    if (!args.key) {
      this.log(
        "No key provided. Example command: dgctl variable delete -b=myapp <key>"
      );
      return;
    }

    if (!fs.existsSync("dgctl.secrets.ini")) {
      this.log("No secrets file found");
      return;
    }

    if (!args.key) {
      this.log(chalk.red("Missing parameter: key"));
    }

    const diggerConfig = diggerJson();
    const id = diggerConfig.id;
    try {
      await deleteSsmParameter(`/${id}/${block}/${args.key}`);
    } catch {
      this.log(
        chalk.red("Could not delete ssm parameter, does the key exist?")
      );
      return;
    }

    const parser = new ConfigIniParser();
    const iniFile = fs.readFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      "utf8"
    );
    parser.parse(iniFile);
    if (parser.isHaveSection(block)) {
      parser.removeOption(block, args.key);
    }

    fs.writeFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      parser.stringify("\n")
    );

    this.log("Secret removed successfully");
  }
}
