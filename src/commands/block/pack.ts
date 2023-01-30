import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import { prepareBlockJson } from "../../utils/helpers";
import fs from "node:fs";

export default class Pack extends BaseCommand<typeof Pack> {
  static description =
    "Packs an existing dgctl block folder that can be shared";

  static args = [{ name: "name", description: "name of the block to pack" }];

  public async run(): Promise<void> {
    const { args } = await this.parse(Pack);
    trackEvent("block pack called", { args });

    if (!args.name) {
      this.log(
        "No type provided for the block. Example: dgctl block pack <folder_name>"
      );
      return;
    }

    const configRaw = fs.readFileSync(
      `${process.cwd()}/${args.name}/config.json`,
      "utf8"
    );
    const config = JSON.parse(configRaw);

    const blockName = args.name;
    const packedBlock = prepareBlockJson(config);
    delete packedBlock.aws_app_identifier;

    fs.writeFileSync(
      `${process.cwd()}/${blockName}/config.packed.json`,
      JSON.stringify(packedBlock, null, 4)
    );

    try {
      this.log("Successfully packed a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
