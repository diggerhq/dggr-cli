import { Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import * as blocks from "../../utils/block-defaults";

export default class Index extends Command {
  static description = "Adds a infra block to a Digger infra bundle";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    type: Flags.string({
      char: "t",
      description: "type of block",
      options: ["container"],
    }),
    name: Flags.string({
      char: "n",
      description: "new name for the block",
    }),
  };

  static args = [
    { name: "command", options: ["add", "remove", "rename"] },
    { name: "name" },
  ];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Index);
    const diggerJson = `${process.cwd()}/dgctl.json`;

    if (!fs.existsSync(diggerJson)) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
      return;
    }

    if (!args.command) {
      this.log(
        "No command provided for the block. Example command: dgctl block add -t=container <name>"
      );
      return;
    }

    if (args.command === "remove") {
      if (!args.name) {
        this.log(`No app name provided. Example: dgctl block remove <name> `);
        return;
      }

      if (fs.existsSync(`${process.cwd()}/${args.name}`)) {
        const rawContent = fs.readFileSync(diggerJson, "utf8");
        const parsedContent = JSON.parse(rawContent);
        const removedBlock = parsedContent.blocks.filter(
          ({ name }: any) => name !== args.name
        );

        fs.writeFileSync(
          diggerJson,
          JSON.stringify({
            ...parsedContent,
            blocks: [...removedBlock],
          })
        );

        fs.renameSync(
          `${process.cwd()}/${args.name}`,
          `${process.cwd()}/REMOVED_${args.name}`
        );

        this.log(`${args.name} block removed`);
      } else {
        this.log(`${args.name} app directory not found`);
      }

      return;
    }

    if (args.command === "rename") {
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

      const rawContent = fs.readFileSync(diggerJson, "utf8");
      const parsedContent = JSON.parse(rawContent);
      const renamedApp = parsedContent.blocks.map((block: any) => {
        if (block.name === args.name) {
          return { ...block, name: flags.name };
        }

        return block;
      });

      fs.renameSync(
        `${process.cwd()}/${args.name}`,
        `${process.cwd()}/${flags.name}`
      );
      fs.writeFileSync(
        diggerJson,
        JSON.stringify({
          ...parsedContent,
          blocks: [...renamedApp],
        })
      );

      return;
    }

    if (!flags.type) {
      this.log(
        "No type provided for the block. Example: dgctl block add -t=container <name>"
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
      const type = flags.type;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const defaults = blocks[type];

      fs.writeFileSync(
        diggerJson,
        JSON.stringify({
          ...parsedContent,
          blocks: [
            ...(parsedContent.blocks ?? []),
            { name: blockName, type: flags.type },
          ],
        })
      );
      fs.mkdirSync(`${process.cwd()}/${blockName}`);
      fs.mkdirSync(`${process.cwd()}/${blockName}/overrides`);

      fs.writeFileSync(
        `${process.cwd()}/${blockName}/config.json`,
        JSON.stringify(defaults)
      );
      fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlsecrets`, "");
      fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlvariables`, "");
      this.log("Successfully added a block to the Digger project");
    } catch (error: any) {
      this.error(error);
    }
  }
}
