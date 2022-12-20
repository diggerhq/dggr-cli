import { CliUx, Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as AWS from "@aws-sdk/client-s3";
import { diggerJson } from "../utils/helpers";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { execSync } from "node:child_process";
import { lookpath } from "lookpath";
import { callTF } from "../utils/terraform";
import { getAwsCreds } from "../utils/aws";

export default class Provision extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    "s3-state": Flags.boolean({
      char: "s",
      description: "Store terraform state in s3",
      default: true
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
    const {awsLogin, awsPassword} = await getAwsCreds()
    console.log(awsLogin, awsPassword)
    // const client = new AWS.S3({
    //   region: diggerConfig.region,
    //   credentials: { accessKeyId: awsLogin, secretAccessKey: awsPassword },
    // });

    const s3Enabled = flags["s3-state"];
    const bucketName = flags.bucket ?? diggerConfig.id;

    try {
      process.env.AWS_ACCESS_KEY_ID = awsLogin;
      process.env.AWS_SECRET_ACCESS_KEY = awsPassword;
  
      const terraformDir = "generated"
      const initTF = await callTF("init", terraformDir);
      const applyTF = await callTF("apply --auto-approve", terraformDir);

    } catch (error: any) {
      this.error(error);
    }
  }
}
