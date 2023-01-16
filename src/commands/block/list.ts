import { trackEvent } from "../../utils/mixpanel";
import { diggerJson } from "../../utils/helpers";
import { BaseCommand } from "../../base";
import { CliUx } from "@oclif/core";

export default class List extends BaseCommand<typeof List> {
  static description = "list all blocks in the project";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  public async run(): Promise<void> {
    trackEvent("block list called", {});
    const currentDiggerJson = diggerJson();

    if (currentDiggerJson.blocks.length === 0) {
      this.log("No blocks found");
      return;
    }

    CliUx.ux.table(
      currentDiggerJson.blocks,
      {
        type: {},
        name: {
          minWidth: 7,
        },
      },
      {
        printLine: this.log.bind(this),
      }
    );
  }
}
