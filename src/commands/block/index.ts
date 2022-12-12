import { Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as blocks from "../../utils/block-defaults";

export default class Index extends Command {
  static description = "Adds a infra block to a Digger infra bundle";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [{ name: "type", options: ["container"] }, { name: "name" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Index);
    const diggerJson = `${process.cwd()}/dgctl.json`;

    if (!fs.existsSync(diggerJson)) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
      return;
    }

    if (!args.type) {
      this.log(
        "No type provided for the block. Example: dgctl block container <name>"
      );
      return;
    }

    if (!args.name) {
      this.log("No name provided, will be using an auto generated name.");
    }

    try {
      const rawContent = fs.readFileSync(diggerJson, "utf8");
      const parsedContent = JSON.parse(rawContent);
      const blockName = args.name ?? crypto.randomUUID();
      const type = args.type;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const defaults = blocks[type];

      fs.writeFileSync(
        diggerJson,
        JSON.stringify({
          ...parsedContent,
          blocks: [
            ...parsedContent.blocks,
            { name: blockName, type: args.type },
          ],
        })
      );
      fs.mkdirSync(`${process.cwd()}/${blockName}`);
      fs.mkdirSync(`${process.cwd()}/${blockName}/overrides`);

      fs.writeFileSync(`${process.cwd()}/${blockName}/config.json`, JSON.stringify(defaults));
      fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlsecrets`, "");
      fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlvariables`, "");
      this.log("Successfully added a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
