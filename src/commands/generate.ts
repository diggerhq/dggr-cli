import { Command } from "@oclif/core";
import { diggerJson, diggerJsonExists } from "../utils/helpers";
import * as fs from "node:fs";
import axios from "axios";

export default class Generate extends Command {
  static description = "Generates terraform based on the Digger infra bundle";

  static args = [{ name: "environment" }];

  public async run(): Promise<void> {
    const { args } = await this.parse(Generate);

    if (!diggerJsonExists()) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
      return;
    }

    if (!args.environment) {
      this.log(
        "No environment provided for the block. Example command: dgctl generate <environment>"
      );
      return;
    }

    const currentDiggerJson = diggerJson();
    const mergedBlocks = currentDiggerJson.blocks.map((block: any) => {
      const configRaw = fs.readFileSync(`${process.cwd()}/${block.name}/config.json`, "utf8");
      const config = JSON.parse(configRaw)
      return { ...block, ...config };
    });

    const combinedJson = { ...currentDiggerJson, blocks: mergedBlocks };
    console.log(combinedJson)
    
    const response = await axios.post("https://ejvbvuq6kceclqiehhnu75igt40pbuju.lambda-url.us-east-1.on.aws", combinedJson)
    console.log(response)
  }
}
