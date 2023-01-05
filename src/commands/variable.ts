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
        if (!args.kv) {
          this.log(
            "No key or value provided. Example command: dgctl variable add -b=myapp <key=value>"
          );
          break;
        }

        const [key, value] = args.kv.split("=");

        if (flags.block) {
          if (!parser.isHaveSection(flags.block)) {
            parser.addSection(flags.block);
          }

          parser.set(flags.block, key, value);
          break;
        }

        parser.setOptionInDefaultSection(key, value);

        break;
      }

      case "get": {
        const key = args.kv;
        if (!key) {
          this.log(
            "No key provided. Example command: dgctl variable get -b=myapp <key>"
          );
          break;
        }

        if (flags.block) {
          const blockName = flags.block;
          this.log(parser.get(blockName, key));

          break;
        }

        this.log(parser.getOptionFromDefaultSection(key));
        break;
      }

      case "delete": {
        if (!args.kv) {
          this.log(
            "No key provided. Example command: dgctl variable delete -b=myapp <key>"
          );
          break;
        }

        if (flags.block) {
          const blockName = flags.block;
          parser.removeOption(blockName, args.kv);

          break;
        }

        parser.removeOptionFromDefaultSection(args.kv);
        break;
      }

      case "import": {
        this.log("Not implemented yet");

        break;
      }

      case "list": {
        if (flags.block) {
          const blockName = flags.block;
          const sectionVars = parser.options(blockName);
          this.log(sectionVars.join("\n"));

          break;
        }

        this.log(parser.stringify("\n"));
      }
    }

    fs.writeFileSync(
      `${process.cwd()}/dgctl.variables.ini`,
      parser.stringify("\n")
    );
    this.log("Done");
  }
}
