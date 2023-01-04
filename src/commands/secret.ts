import { Flags } from "@oclif/core";
import { BaseCommand } from "./base";
import {createSsmParameter} from "../utils/aws";
import * as chalk from "chalk";

export default class Secret extends BaseCommand<typeof Secret> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
  };

  static args = [
    { name: "key", require: true },
    { name: "value", require: true },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Secret);

    const key = args.key
    const value = args.value

    if (!key || !value) {
      console.log(chalk.red("Missing parameter: key and value"))
    }
    
    try {
      const result = await createSsmParameter(key, value)
      console.log(result)
    } catch (error) {
      console.log(error)
      console.log(chalk.red("Could not create ssm parameter, does the key already exist?"))
    }
    
  }
}
