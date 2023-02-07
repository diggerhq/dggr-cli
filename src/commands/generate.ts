import {
  combinedDiggerJson,
  diggerAPIKey,
  diggerAPIKeyExists,
  diggerJson,
  diggerJsonExists,
} from "@utils/helpers";
import * as fs from "node:fs";
import axios from "axios";
import extract = require("extract-zip");
import path = require("node:path");
import { trackEvent } from "@utils/mixpanel";
import { BaseCommand } from "base";
import { getTrowelUrl } from "config";

export default class Generate extends BaseCommand<typeof Generate> {
  static description = "Generates terraform based on the Digger infra bundle";

  public async run(): Promise<void> {
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
      combinedJson = combinedDiggerJson();
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

    const headers = diggerAPIKeyExists()
      ? {
          "X-Digger-Api-Key": diggerAPIKey(),
        }
      : undefined;

    const response = await axios.post(getTrowelUrl(), combinedJson, {
      headers,
    });

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
