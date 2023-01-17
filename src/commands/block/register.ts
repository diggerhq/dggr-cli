import { Flags } from "@oclif/core";
import { registerBlock } from "../../utils/helpers";
import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";

export default class Register extends BaseCommand<typeof Register> {
  static description =
    "Registers an existing dgctl block folder as a block to the project by adding it to dgctl.json";

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container", "mysql", "postgres", "docdb", "redis", "imported"],
    }),
  };

  static args = [{ name: "name", description: "new name for the block" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Register);
    trackEvent("block register called", { flags, args });
    if (!flags.type) {
      this.log(
        "No type provided for the block. Example: dgctl block register -t=container <folder_name>"
      );
      return;
    }

    if (!args.name) {
      this.log(
        "No folder name provided. Example: dgctl block register -t=container <folder_name>"
      );
      return;
    }

    const blockName = args.name;
    const type = flags.type;

    try {
      registerBlock(type, blockName);
      this.log("Successfully registered a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
