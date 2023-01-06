import { diggerJson, diggerJsonExists } from "../utils/helpers";
import * as fs from "node:fs";
import axios from "axios";
import extract = require("extract-zip");
import path = require("node:path");
import { trackEvent } from "../utils/mixpanel";
import { BaseCommand } from "./base";
import { getTrowelUrl } from "../config";

export default class Generate extends BaseCommand<typeof Generate> {
  static description = "Generates terraform based on the Digger infra bundle";

  // static args = [{ name: "environment" }];

  public async run(): Promise<void> {
    // const { args } = await this.parse(Generate);

    if (!diggerJsonExists()) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
      return;
    }

    const currentDiggerJson = diggerJson();
    const mergedBlocks = currentDiggerJson.blocks.map((block: any) => {
      const configRaw = fs.readFileSync(
        `${process.cwd()}/${block.name}/config.json`,
        "utf8"
      );
      const config = JSON.parse(configRaw);
      console.log(config)
      if (block.type === "imported") {
        // eslint-disable-next-line camelcase
        config.custom_terraform = config.terraform_files.map((tfFileName: string) => {
          const tfFileLocation = `${process.cwd()}/${block.name}/${tfFileName}`;
          return {
            filename: tfFileName,
            content: Buffer.from(fs.readFileSync(`${tfFileLocation}`, "utf8")).toString("base64")
          }
        })
        delete config.terraform_files;
      }

      console.log(config)
      return { ...block, ...config };
    });

    const combinedJson = { ...currentDiggerJson, blocks: mergedBlocks };
    console.log(combinedJson)
    trackEvent("generate called", {
      diggerConfig: currentDiggerJson,
      combinedJson,
    });
    const response = await axios.post(getTrowelUrl(), combinedJson);

    // write response to file
    fs.writeFileSync("tmp.zip", Buffer.from(response.data, "base64"));
    // remove previous generated folder except tfstate file
    if (fs.existsSync("generated")) {
      fs.readdir("generated", (err, files) => {
        if (err) {
          console.log(err);
        }

        for (const file of files) {
          const fileDir = path.join("generated", file);
          if (file !== "terraform.tfstate" && file !== ".terraform") {
            fs.rmSync(fileDir, { recursive: true, force: true });
          }
        }
      });
    }

    try {
      await extract("tmp.zip", { dir: `${process.cwd()}/generated` });
      console.log("Infrastructure generation complete!");
      console.log(
        "You can now create your infrastructure using dgctl provision command"
      );
    } catch (error) {
      console.log(error);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.unlink("tmp.zip", () => {});
    }
  }
}
