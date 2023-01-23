import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import { Flags } from "@oclif/core";
import { PRESET_URL } from "../../config";
import chalk from "chalk";
import axios from "axios";
import { createBlock } from "../../utils/helpers";

export default class Unpack extends BaseCommand<typeof Unpack> {
  static description =
    "Unpacks s dgctl block folder and registers it to dgctl.json";

  static flags = {
    name: Flags.string({
      char: "n",
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

    if (!flags.url && !flags.name) {
      this.log(
        "No block name or url provided. Example: dgctl block unpack -n example_container <new_name>"
      );
      return;
    }

    const blockUrl =
      flags.url ?? `${PRESET_URL}/blocks/${flags.name}/config.packed.json`;

    this.log(
      chalk.green`Downloading ${chalk.greenBright`${flags.name}`} preset`
    );

    const response = await axios.get(blockUrl);

    const { type, name, ...blockData } = response.data;

    const blockName = args.name ?? name;

    this.log(
      chalk.green`Saving ${chalk.greenBright`${flags.name}`} as ${chalk.greenBright`${blockName}/`}`
    );

    createBlock({ type, name: blockName, blockDefault: blockData });

    try {
      this.log("Successfully packed a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
