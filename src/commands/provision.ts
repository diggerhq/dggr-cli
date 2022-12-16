import { CliUx, Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as AWS from "@aws-sdk/client-s3";
import { diggerJson } from "../utils/helpers";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { spawn } from "node:child_process";

export default class Provision extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    "s3-state": Flags.boolean({
      char: "s",
      description: "Store terraform state in s3",
    }),
    bucket: Flags.string({ char: "b", description: "S3 bucket name" }),
  };

  static args = [{ name: "file" }];

  public async run(): Promise<void> {
    if (!fs.existsSync(`${process.cwd()}/generated`)) {
      this.log(
        `No generated terraform found. Run ${chalk.green(
          "dgctl generate"
        )} to generate terraform.`
      );
      return;
    }

    const { flags } = await this.parse(Provision);
    const diggerConfig = diggerJson();

    const awsLogin = await CliUx.ux.prompt("AWS Access key?");
    const awsPassword = await CliUx.ux.prompt("AWS Secret access key?", {
      type: "hide",
    });

    const client = new AWS.S3({
      region: diggerConfig.region,
      credentials: { accessKeyId: awsLogin, secretAccessKey: awsPassword },
    });

    const s3Enabled = flags["s3-state"];
    const bucketName = flags.bucket ?? diggerConfig.id;

    try {
      const initTF = await spawn("terraform init generated")
      const applyTF = await spawn("terraform apply --auto-approve plan-name.out")

      console.log(initTF);
      console.log(applyTF);

    } catch (error: any) {
      this.error(error);
    }
  }
}
