import { Args, Flags } from "@oclif/core";
import { combinedDiggerJson, createBlock, importBlock } from "../../utils/helpers";
import { trackEvent } from "../../utils/mixpanel";
import { BaseCommand } from "../../base";
import * as crypto from "node:crypto";
import { blockOptions } from "../../utils/digger-settings";

export default class Add extends BaseCommand<typeof Add> {
  static description = "Adds a block to the project";

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: blockOptions,
    }),
    name: Flags.string({
      char: "n",
      description: "new name for the block",
    }),
    id: Flags.string({
      char: "i",
      description: "id of the resource to import",
    }),
    service: Flags.string({
      char: "s",
      description: "aws service name to search",
    }),   
    region: Flags.string({
      char: "r",
      description: "aws region to add to",
      default: "us-east-1",
    }),
  };

  static args = {
    name: Args.string({ description: "new name for the block" }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Add);
    trackEvent("block add called", { flags, args });
    if (!flags.type) {
      this.log(
        "No type provided for the block. Example: dgctl block add -t=container <name>"
      );
      return;
    }

    if (!args.name) {
      this.log("No name provided, will be using an auto generated name.");
    }

    const blockName =
      args.name ?? `${flags.type}_${crypto.randomUUID().slice(0, 5)}`;
    const type = flags.type;
    const service = flags.service;

    try {
      if (type === "imported") {
        if (!flags.id) {
          this.log(
            "No id provided for the imported block. Example: dgctl block add -t=imported -i=<id> <name>"
          );
          return;
        }

        if (!service) {
          this.log(
            "No service provided for the imported block. Example: dgctl block add -t=imported -s=<service> <name>"
          );
          return;
        }

        importBlock(blockName, flags.id);
        this.log("Successfully added a block to the Digger project");
      } else {
        createBlock({ type, name: blockName, region: flags.region });
        
        const currentCombinedDiggerJson = combinedDiggerJson()
        
        if (type === "container" || ["redis", "docdb", "mysql", "postgres".includes(type)]) {

          const vpcRegions = currentCombinedDiggerJson.blocks?.find(
            (block: any) => block.name === "default_network"
          )?.aws_regions ?? {};
          if (!(flags.region in vpcRegions)) {
            createBlock({ type: "vpc", name: "default_network", region: flags.region });
          }
        }

        this.log("Successfully added a block to the Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
