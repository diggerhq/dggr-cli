import { Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import {
  createBlock,
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
        const envid = crypto.randomUUID().replace(/\-/g, "_");
        const content = {
          target: "diggerhq/tf-module-bundler@master",
          aws_region: "us-east-1",
          environment_id: envid,
          for_local_run: false,
          version,
          id: crypto.randomUUID(),
          region: "us-west-1",
          blocks: [],
          created: Date.now(),
        };

        updateDiggerJson(content);

        try {
          createBlock("vpc", "default_network", {});
          this.log("Successfully added default network block to the Digger project");
        } catch (error: any) {
          this.error(error);
        }
        fs.mkdirSync(`${process.cwd()}/overrides`);
        fs.writeFileSync(`${process.cwd()}/.dgctlsecrets`, "");
        fs.writeFileSync(`${process.cwd()}/.dgctlvariables`, "");
        this.log("Successfully initiated a Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
