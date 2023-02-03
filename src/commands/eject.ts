import {
  diggerJson,
  diggerJsonExists,
  recreateAddonFromJson,
  recreateBlockFromJson,
  updateDiggerJson,
} from "../utils/helpers";
import { BaseCommand } from "../base";
import { Flags } from "@oclif/core";
import fs from "node:fs";

export default class Eject extends BaseCommand<typeof Eject> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Eject);

    if (!diggerJsonExists()) {
      this.log("No dgctl.json found in path");
      return;
    }

    const json = diggerJson();

    if (!json.advanced && !flags.force) {
      this.log("dgctl.json is not in advanced mode, cannot be ejected.");
    }

    fs.writeFileSync(`${process.cwd()}/dgctl.secrets.ini`, "");
    fs.writeFileSync(`${process.cwd()}/dgctl.variables.ini`, "");

    json.blocks.map(({ name }: any) => {
      return recreateBlockFromJson(name);
    });
    
    // eslint-disable-next-line camelcase
    json.addons.map(({ block_name, type, ...rest }: {block_name:string, type: string, rest: any}) => {
      return recreateAddonFromJson(block_name, type, rest);
    });

    const { advanced, ...rest } = json;
    this.log(`Setting advanced to ${!advanced}`);

    updateDiggerJson(rest);
  }
}
