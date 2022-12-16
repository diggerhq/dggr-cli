import { Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import {
  diggerJson,
  diggerJsonExists,
  updateDiggerJson,
} from "../utils/helpers";

export default class Init extends Command {
  static description = "Creates a Digger infra bundle project";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);
    const { version } = this.config;

    try {
      if (diggerJsonExists() && !flags.force) {
        const currentJson = diggerJson();
        updateDiggerJson({ ...currentJson, updated: Date.now() });

        this.log("Successfully updated a Digger project");
      } else {
        const content = {
          version,
          id: crypto.randomUUID(),
          target: "diggerhq/tf-module-bundler@master",
          region: "us-west-1",
          blocks: [],
          created: Date.now(),
        };
        fs.mkdirSync(`${process.cwd()}/overrides`);
        updateDiggerJson(content);
        fs.writeFileSync(`${process.cwd()}/.dgctlsecrets`, "");
        fs.writeFileSync(`${process.cwd()}/.dgctlvariables`, "");
        this.log("Successfully initiated a Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
