import { Command, Flags } from "@oclif/core";
import {
  createBlock,
  diggerJson,
  diggerJsonExists,
  updateDiggerJson,
} from "../utils/helpers";

export default class Eject extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Eject);

    if (!diggerJsonExists()) {
      this.log("No dgclt.json found in path");
      return;
    }

    const json = diggerJson();

    if (!json.advanced && !flags.force) {
      this.log("dgctl.json is not in advanced mode, cannot be ejected.");
    }

    json.blocks.map(({ type, blockName }: any) => {
      return createBlock(type, blockName);
    });

    const { advanced, ...rest } = json;
    this.log(`Setting advanced to ${!advanced}`);

    updateDiggerJson(rest);
  }
}
