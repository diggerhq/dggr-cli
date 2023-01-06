import { Flags } from '@oclif/core'
import { profile } from 'node:console'
import { createBlock, importBlock } from '../../utils/helpers'
import { trackEvent } from '../../utils/mixpanel'
import { BaseCommand } from '../base'

export default class Add extends BaseCommand<typeof Add>  {
  static description = 'Adds a block to the project'

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container", "mysql", "postgres", "docdb", "redis", "imported"],
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
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      default: undefined,
    }),
  }

  static args = [{name: 'name', description: "new name for the block"}]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Add)
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
    const profile = flags.profile;

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

        if (!profile) {
          this.log(
            "No aws profile provided for the imported block. Example: dgctl block add -t=imported -p=<profile> <name>"
          );
          return;
        }

        importBlock(blockName, flags.id, service, profile);
        this.log("Successfully added a block to the Digger project");
      } else {
        createBlock(type, blockName, {});
        this.log("Successfully added a block to the Digger project");
      }
    } catch (error: any) {
      this.error(error);
    }
  }
}
