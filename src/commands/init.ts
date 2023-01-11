import { Flags } from "@oclif/core";
import * as fs from "node:fs";
import {
  createBlock,
  diggerJson,
  diggerJsonExists,
  gitIgnore,
  updateDiggerJson,
} from "../utils/helpers";
import { trackEvent } from "../utils/mixpanel";
import { BaseCommand } from "./base";
import { defaultContent } from "../utils/digger-settings";

export default class Init extends BaseCommand<typeof Init> {
  static description = "Creates a Digger infra bundle project";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
    advanced: Flags.boolean({ char: "a", hidden: true, default: false }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init);
    const { version } = this.config;
    trackEvent("init called", { flags });

    try {
      if (diggerJsonExists() && !flags.force) {
        const currentJson = diggerJson();
        updateDiggerJson({ ...currentJson, updated: Date.now() });

        this.log("Successfully updated a Digger project");
      } else {
        const defContent = defaultContent(version);

        // make sure to only add advanced if the hidden flag is used
        const content = flags.advanced
          ? { ...defContent, advanced: true }
          : defContent;
        updateDiggerJson(content);

        // if advanced, don't bother creating other files - just the json
        if (!flags.advanced) {
          createBlock("vpc", "default_network", {});
          this.log(
            "Successfully added default network block to the Digger project"
          );

          // fs.mkdirSync(`${process.cwd()}/overrides`); Re-enable when we start using it
          fs.writeFileSync(`${process.cwd()}/dgctl.secrets.ini`, "");
          fs.writeFileSync(`${process.cwd()}/dgctl.variables.ini`, "");
        }

        fs.writeFileSync(`${process.cwd()}/.gitignore`, gitIgnore);
        this.log("Successfully initiated a Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
