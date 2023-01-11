import { diggerJson, diggerJsonExists } from "../utils/helpers";
import * as fs from "node:fs";
import axios from "axios";
import extract = require("extract-zip");
import path = require("node:path");
import { trackEvent } from "../utils/mixpanel";
import { BaseCommand } from "./base";
import { getTrowelUrl } from "../config";
import { getSecretsFromIniFile, getVarsFromIniFile } from "../utils/io";

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

    let combinedJson;

    if (currentDiggerJson.advanced) {
      // advanced mode, just take the digger json directly
      combinedJson = currentDiggerJson;
    } else {
      const mergedBlocks = currentDiggerJson.blocks.map((block: any) => {
        const configRaw = fs.readFileSync(
          `${process.cwd()}/${block.name}/config.json`,
          "utf8"
        );

        // read override.tf, base64 encode it and add as one item list in "custom_terraform" parameter to the block's json"

        const config = JSON.parse(configRaw);
        if (block.type === "imported") {
          const tfFileLocation = `${process.cwd()}/${block.name}/${
            config.terraform_file
          }`;
          // eslint-disable-next-line camelcase
          config.custom_terraform = fs.readFileSync(
            `${tfFileLocation}`,
            "base64"
          );
          delete config.terraform_files;
        }

        // eslint-disable-next-line camelcase
        block.environment_variables = getVarsFromIniFile(
          "dgctl.variables.ini",
          block.name
        );
        block.secrets = getSecretsFromIniFile("dgctl.secrets.ini", block.name);
          
        const overridesPath = `${process.cwd()}/${block.name}/dgctl.overrides.tf`;
        if (fs.existsSync(overridesPath)) {
          const tfBase64 = fs.readFileSync(
            overridesPath,
            { encoding: "base64" }
          );
          return {
            ...block,
            ...config,
            // eslint-disable-next-line camelcase
            custom_terraform: tfBase64,
          };
        }

        return {
          ...block,
          ...config,
        };
      

      });

      combinedJson = {
        ...currentDiggerJson,
        // eslint-disable-next-line camelcase
        environment_variables: getVarsFromIniFile("dgctl.variables.ini", null),
        secrets: getSecretsFromIniFile("dgctl.secrets.ini", null),
        blocks: mergedBlocks,
      };
      trackEvent("generate called", {
        diggerConfig: currentDiggerJson,
        combinedJson,
      });

      // before call, create the generated json. Will be overwritten fully every time.
      fs.writeFileSync(
        `${process.cwd()}/dgctl.generated.json`,
        JSON.stringify(combinedJson, null, 4)
      );
    }

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
