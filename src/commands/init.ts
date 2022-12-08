import { Command, Flags } from "@oclif/core";
import * as fs from "fs";

export default class Init extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);
    const { version } = this.config;
    const diggerJson = `${process.cwd()}/dgctl.json`;

    try {
      if (fs.existsSync(diggerJson) && !flags.force) {
        const rawContent = fs.readFileSync(diggerJson, "utf-8");
        const parsedContent = JSON.parse(rawContent);
        fs.writeFileSync(
          diggerJson,
          JSON.stringify({ ...parsedContent, updated: Date.now() })
        );
        this.log("Successfully updated a Digger project");
      } else {
        const content = {
          version,
          created: Date.now(),
        };
        fs.writeFileSync(diggerJson, JSON.stringify(content));
        fs.writeFileSync(`${process.cwd()}/.dgctlsecrets`, "");
        fs.writeFileSync(`${process.cwd()}/.dgctlvariables`, "");
        this.log("Successfully initiated a Digger project");
      }
    } catch (err: any) {
      this.error(err);
    }
  }
}
