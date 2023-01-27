import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import { diggerJson, prepareBlockJson } from "../../utils/helpers";
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

    const currentDiggerJson = diggerJson();
    const blockName = args.name;
    const blocksToPack = currentDiggerJson.blocks.filter(
      ({ name }: { name: string }) => name === blockName
    );

    for (const blockToPack of blocksToPack) {
      const packedBlock = prepareBlockJson(blockToPack);
      delete packedBlock.aws_app_identifier;

      fs.writeFileSync(
        `${process.cwd()}/${blockName}/${blockToPack.region}/config.packed.json`,
        JSON.stringify(packedBlock, null, 4)
      );
    }

    try {
      this.log("Successfully packed a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
