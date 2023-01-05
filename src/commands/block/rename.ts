import {Command, Flags} from '@oclif/core'
import { trackEvent } from '../../utils/mixpanel'
import * as fs from "node:fs";
import { diggerJson, updateDiggerJson } from '../../utils/helpers';

export default class Rename extends Command {
  static description = 'rename a block in the project'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    name: Flags.string({char: 'n', description: 'new name to rename to'}),
  }

  static args = [{name: 'name'}]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Rename)
    trackEvent("block rename called", { flags, args });
    if (!args.name) {
      this.log(
        `No app name provided. Example: dgctl block rename <name> -n=<newName>`
      );
      return;
    }

    if (!fs.existsSync(`${process.cwd()}/${args.name}`)) {
      this.log(`${args.name} directory not found.`);
      return;
    }

    if (!flags.name) {
      this.log(
        `No new app name provided. Example: dgctl block rename ${args.name} -n=<newName>`
      );
      return;
    }

    const currentDiggerJson = diggerJson();
    const renamedApp = currentDiggerJson.blocks.map((block: any) => {
      if (block.name === args.name) {
        return { ...block, name: flags.name };
      }

      return block;
    });

    fs.renameSync(
      `${process.cwd()}/${args.name}`,
      `${process.cwd()}/${flags.name}`
    );
    updateDiggerJson({
      ...currentDiggerJson,
      blocks: [...renamedApp],
    });
    this.log(
      `Successfully renamed ${args.name} to ${flags.name} in the project`
    );
  }
}