import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import { Flags } from "@oclif/core";

export default class Unpack extends BaseCommand<typeof Unpack> {
  static description =
    "Unpacks s dgctl block folder and registers it to dgctl.json";

  static flags = {
    name: Flags.string({
      char: "p",
      description: "Name of the block preset from dgctl block repository",
    }),
    url: Flags.string({
      char: "u",
      description:
        "Url path to a json file that contains a packed block configuration",
    }),
  };

  static args = [{ name: "name", description: "name of the block to unpack" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Unpack);
    trackEvent("block pack called", { args });

    if (!args.name) {
      this.log(
        "No type provided for the block. Example: dgctl block pack <folder_name>"
      );
      return;
    }

    const blockName = args.name;

    try {
      this.log("Successfully packed a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
