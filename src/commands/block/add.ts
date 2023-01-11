import { Flags } from '@oclif/core'
import { createBlock } from '../../utils/helpers'
import { trackEvent } from '../../utils/mixpanel'
import { BaseCommand } from '../base'
import * as crypto from 'node:crypto'

export default class Add extends BaseCommand<typeof Add>  {
  static description = 'Adds a block to the project'

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container", "mysql", "postgres", "docdb", "redis"],
    }),
    name: Flags.string({
      char: "n",
      description: "new name for the block",
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
    try {
      createBlock(type, blockName, {});
      this.log("Successfully added a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
