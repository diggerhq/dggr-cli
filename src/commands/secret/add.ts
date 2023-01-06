import { Flags } from "@oclif/core";
import {BaseCommand}  from "../base";
import {createSsmParameter} from "../../utils/aws";
import { ConfigIniParser } from "config-ini-parser";
import fs from "node:fs";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { diggerJson } from "../../utils/helpers";

export default class Add extends BaseCommand<typeof Add> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    block: Flags.string({ char: "b", description: "name of the block" }),
    force: Flags.boolean({ char: "f" }),
  };

  static args = [
    { name: "kv" },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);

    let block:string;
    if (flags.block) {
      block = flags.block;
    } else {
      this.warn(
        "No block provided for the variable. Secret will be stored as a global parameter"
      );
      block = "_bundle_";
    }

    if (!args.kv) {
      this.log(
        "No key or value provided. Example command: dgctl variable add -b=myapp <key=value>"
      );
      return;
    }

    const [key, value] = args.kv.split("=")

    if (!fs.existsSync("dgctl.secrets.ini")) {
      fs.writeFileSync("dgctl.secrets.ini", "");
    }

    if (!key || !value) {
      console.log(chalk.red("Missing parameter: key and value"))
    }
    
    const diggerConfig = diggerJson();
    const id = diggerConfig.id;
    let result;
    let valueSsmArn;
    try {
      result = await createSsmParameter(`/${id}/${block}/${key}`, value)
      valueSsmArn = result.arn
    } catch (error) {
      console.log(chalk.red("Could not create ssm parameter, does the key already exist?"))
      throw error;
    }

    const parser = new ConfigIniParser();
    const iniFile = fs.readFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      "utf8"
    );
    console.log(iniFile);
    parser.parse(iniFile);
    if (!parser.isHaveSection(block)) {
      parser.addSection(block);
    }

    parser.set(block, key, valueSsmArn);

    fs.writeFileSync(
      `${process.cwd()}/dgctl.secrets.ini`,
      parser.stringify("\n")
    );
  }
}
