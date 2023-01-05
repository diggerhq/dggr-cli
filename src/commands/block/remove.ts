import { Command } from '@oclif/core'
import { diggerJson, updateDiggerJson } from '../../utils/helpers'
import { trackEvent } from '../../utils/mixpanel'
import * as fs from "node:fs";

export default class Remove extends Command {
  static description = 'removes a block from the project'

  static args = [{name: 'name'}]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Remove)
    trackEvent("block remove called", { flags, args });
    if (!args.name) {
      this.log(`No block name provided. Example: dgctl block remove <name> `);
      return;
    }

    if (fs.existsSync(`${process.cwd()}/${args.name}`)) {
      const parsedContent = diggerJson();
      const removedBlock = parsedContent.blocks.filter(
        ({ name }: any) => name !== args.name
      );

      updateDiggerJson({
        ...parsedContent,
        blocks: [...removedBlock],
      });

      fs.renameSync(
        `${process.cwd()}/${args.name}`,
        `${process.cwd()}/REMOVED_${args.name}`
      );

      this.log(`${args.name} block removed`);
    } else {
      this.log(`${args.name} app directory not found`);
    }
  }
}
