import { BaseCommand } from "../base";
import axios from "axios";
import { PRESET_URL } from "../config";
import fs from "node:fs";
import chalk from "chalk";
import {
  diggerJson,
  recreateBlockFromJson,
  updateDiggerJson,
} from "../utils/helpers";
import { Flags } from "@oclif/core";

export default class Preset extends BaseCommand<typeof Preset> {
  static description = "Initialise project based on preset";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    advanced: Flags.boolean({ char: "a" }),
    path: Flags.string({
      char: "p",
      description: "Full path to a json file that contains dgctl configuration",
    }),
  };

  static args = [{ name: "preset" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Preset);
    const { preset } = args;

    const presetUrl = flags.path ?? `${PRESET_URL}/${preset}/dgctl.json`;

    this.log(chalk.green`Downloading ${chalk.greenBright`${preset}`} preset`);
    const response = await axios.get(presetUrl);

    this.log(
      chalk.green`Saving ${
        chalk.greenBright`${flags.path}` ?? chalk.greenBright`${preset}`
      } as ${chalk.greenBright`dgctl.json`}`
    );
    fs.writeFileSync("dgctl.json", JSON.stringify(response.data, null, 4));

    this.log(chalk.green`Initializing project based of dgctl.json`);

    const json = diggerJson();

    if (flags.advanced) {
      this.log(
        chalk.green`Project initialised in advanced mode. To turn off advanced mode, run ${chalk.greenBright`dgctl eject`}`
      );
    } else {
      fs.writeFileSync(`${process.cwd()}/dgctl.secrets.ini`, "");
      fs.writeFileSync(`${process.cwd()}/dgctl.variables.ini`, "");

      json.blocks.map(({ name }: any) => {
        return recreateBlockFromJson(name);
      });

      const { advanced, ...rest } = json;
      this.log(
        chalk.green`Setting dgctl.json advanced to ${chalk.greenBright`${!advanced}`}`
      );

      updateDiggerJson(rest);
    }
  }
}
