import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { createSsmParameter } from "../../utils/aws";
import { ConfigIniParser } from "config-ini-parser";
import fs from "node:fs";

import chalk = require("chalk");
import { diggerJson } from "../../utils/helpers";

export default class Add extends BaseCommand<typeof Add> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    block: Flags.string({ char: "b", description: "name of the block" }),
  };

  static args = { kv: Args.string() };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);

    if (!args.kv) {
      this.log(
        "No key or value provided. Example command: dgctl variable add -b=myapp <key=value>"
      );
      return;
    }

    const block = flags.block;
    const [key, value] = args.kv.split("=");

    if (!fs.existsSync("dgctl.secrets.ini")) {
      fs.writeFileSync("dgctl.secrets.ini", "");
    }

    if (!key || !value) {
      this.log(chalk.red("Missing parameter: key and value"));
    }

    const diggerConfig = diggerJson();
    const id = diggerConfig.id;
    let result;
    let valueSsmArn;
    try {
      const paramName = block ? `/${id}/${block}/${key}` : `/${id}/${key}`;
      result = await createSsmParameter(paramName, value);
      valueSsmArn = result.arn;
    } catch (error) {
      this.log(
        chalk.red("Could not create ssm parameter, does the key already exist?")
      );
      throw error;
    }

    const parser = new ConfigIniParser();
    const iniFile = fs.readFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      "utf8"
    );
    parser.parse(iniFile);
    if (block && !parser.isHaveSection(block)) {
      parser.addSection(block);
    }

    if (block) {
      parser.set(block, key, valueSsmArn);
    } else {
      this.warn(
        "No block provided for the variable. Secret will be stored as a global parameter"
      );
      parser.setOptionInDefaultSection(key, valueSsmArn);
    }

    fs.writeFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      parser.stringify("\n")
    );

    this.log("Secret added successfully");
  }
}
