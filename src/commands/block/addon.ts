import { Flags } from "@oclif/core";
import { createBlock, importBlock } from "../../utils/helpers";
import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import { ux } from "@oclif/core/lib/cli-ux";

export default class Addon extends BaseCommand<typeof Addon> {
  static description = "Addon to a block or blocks";

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of addon",
      options: ["routing"],
    })
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Addon);
    trackEvent("block addon called", { flags, args });
    if (!flags.type) {
      this.log(
        "No type provided for the addon. Example: dgctl block addon -t=routing"
      );
      return;
    }

    const type = flags.type;
    const blocks = flags.block;

    try {
      if (type === "routing") {
        const domainName = await ux.prompt("Enter the domain name for the routing addon", { required: true });
        
        const subdomainByBlock = await ux.prompt("Enter the subdomain for each block, separated by a comma, e.g. block1=", { required: true });



        this.log("Successfully added a block to the Digger project");
      } else {
        createBlock({ type, name: blockName, region: flags.region });
        this.log("Successfully added a block to the Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
