import { Args, Flags } from "@oclif/core";
import { trackEvent } from "../../utils/mixpanel";
import * as fs from "node:fs";
import { diggerJson, updateDiggerJson } from "../../utils/helpers";
import { BaseCommand } from "../../base";

export default class Rename extends BaseCommand<typeof Rename> {
  static description = "Add an image tag to a block";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    tag: Flags.string({ char: "t", description: "Tag name to add." }),
  };

  static args = {
    name: Args.string(),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Rename);
    trackEvent("block tag called", { flags, args });
    if (!args.name) {
      this.log(
        `No app name provided. Example: dgctl block <name>`
      );
      return;
    }

    if (!fs.existsSync(`${process.cwd()}/${args.name}`)) {
      this.log(`${args.name} directory not found.`);
      return;
    }

    if (!flags.tag) {
      this.log(
        `No tag name provided. Example: dgctl block ${args.name} -t tag_name`
      );
      return;
    }

    const currentDiggerJson = diggerJson();
    const updatedApp = currentDiggerJson.blocks.map((block: any) => {
      if (block.name === args.name) {
        const configRaw = fs.readFileSync(
          `${process.cwd()}/${block.name}/config.json`,
          "utf8"
        );

        const config = JSON.parse(configRaw);
        config["ecr_image_tag"] = flags.tag

        fs.writeFileSync(
          `${process.cwd()}/${block.name}/config.json`,
          JSON.stringify(config, null, 4)
        );

      }

      return block;
    });

    updateDiggerJson({
      ...currentDiggerJson,
      blocks: [...updatedApp],
    });
    this.log(
      `Successfully added a tag ${flags.tag} to ${args.name} block in the project`
    );
  }
}
