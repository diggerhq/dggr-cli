import { Flags } from "@oclif/core";
import { BaseCommand } from "./base";
import { ConfigIniParser } from "config-ini-parser";
import fs from "node:fs";

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
    const parser = new ConfigIniParser();
    const iniFile = fs.readFileSync(
      `${process.cwd()}/dgctl.variables.ini`,
      "utf8"
    );
    parser.parse(iniFile);

    if (!args.command) {
      this.log(
        "No command provided. Example command: dgctl variable <add> -b=myapp key=value"
      );
      return;
    }

    switch (args.command) {
      case "add": {
        if (!flags.block) {
          this.log(
            "No block provided for the variable. Example command: dgctl variable add -b=<myapp> key=value"
          );
          return;
        }

        if (!args.kv) {
          this.log(
            "No key or value provided. Example command: dgctl variable add -b=myapp <key=value>"
          );
          return;
        }

        if (!parser.isHaveSection(flags.block)) {
          parser.addSection(flags.block);
        }

        const [key, value] = args.kv.split("=");
        parser.set(flags.block, key, value);


        fs.writeFileSync(
          `${process.cwd()}/dgctl.variables.ini`,
          parser.stringify("\n")
        );

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
