import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../base";

export default class Infra extends BaseCommand<typeof Infra> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = { action: Args.string({ options: ["apply"] }) };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Infra);

    const name = flags.name ?? "world";
    this.log(`hello ${name}`);
    if (args.action && flags.force) {
      this.log(`${args.action}`);
    }
  }
}
