import { Flags } from "@oclif/core";
import { BaseCommand } from "../base";
import {createSsmParameter} from "../../utils/aws";
import fs from "node:fs";
import * as chalk from "chalk";
import { diggerJson } from "../../utils/helpers";

export default class Add extends BaseCommand<typeof Add> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    block: Flags.boolean({ char: "f" }),
    force: Flags.boolean({ char: "f" }),
  };

  static args = [
    { name: "key", require: true },
    { name: "value", require: true },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);

    const key = args.key
    const value = args.value

    if (!key || !value) {
      console.log(chalk.red("Missing parameter: key and value"))
    }
    
    const diggerConfig = diggerJson();
    const id = diggerConfig.id
    try {
      const result = await createSsmParameter(`/${id}/${key}`, value)
      console.log(result)
    } catch (error) {
      console.log(error)
      console.log(chalk.red("Could not create ssm parameter, does the key already exist?"))
    }

    const iniFile = fs.readFileSync(
      `${process.cwd()}/dgctl.variables.ini`,
      "utf8"
    );
    parser.parse(iniFile);
    if (!parser.isHaveSection(flags.block)) {
      parser.addSection(flags.block);
    }
    parser.set(flags.block, key, valueSsmArn);
    fs.writeFileSync(
      `${process.cwd()}/dgctl.variables.ini`,
      parser.stringify("\n")
    );




  }
}
