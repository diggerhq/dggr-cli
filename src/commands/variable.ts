import { Flags } from "@oclif/core";
import { BaseCommand } from "./base";

export default class Variable extends BaseCommand<typeof Variable> {
  static description = "Manage environment variables for your infrastructure";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    block: Flags.string({ char: "b", description: "name of the block" }),
  };

  static args = [
    {
      name: "command",
      options: ["add", "get", "delete", "import", "list"],
    },
    { name: "kv" },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Variable);

    if (!args.command) {
      this.log(
        "No block provided for the variable. Example command: dgctl variable add -b=myapp key=value"
      );
      return;
    }

    switch (args.command) {
      case "add": {
        this.log(flags.block);
        this.log(args.kv);

        return;
      }

      case "get": {
        this.log(args.kv);

        return;
      }

      case "delete": {
        this.log(args.kv);

        return;
      }

      case "import": {
        this.log(args.kv);

        return;
      }

      case "list": {
        this.log(args.kv);
      }
    }
  }
}
