import { CliUx, Command, Flags } from "@oclif/core";
import * as fs from "node:fs";
import * as AWS from "@aws-sdk/client-s3";
import { diggerJson } from "../utils/helpers";
// eslint-disable-next-line unicorn/import-style
import * as chalk from "chalk";
import { execSync } from "node:child_process";
import { lookpath } from "lookpath";

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
      process.env.AWS_ACCESS_KEY_ID = awsLogin;
      process.env.AWS_SECRET_ACCESS_KEY = awsPassword;
  
      console.log("init started")
      const terraformDir = "generated"
      const initTF = await callTF("init", terraformDir);
      console.log("init completed")

      console.log("apply started")
      const applyTF = await callTF("apply --auto-approve", terraformDir);
      console.log("apply completed")

    } catch (error: any) {
      this.error(error);
    }
  }
}

const callTF = async (args: string, workingDirectory: string) => {
  const tfPath = (await lookpath("terraform")) ?? "terraform";

  const terraform = execSync(`${tfPath} ${args}`, {
    stdio: [process.stdin, process.stdout, process.stderr],
    cwd: workingDirectory
  });

  // terraform.on("close", (code) => console.log(code || undefined));
};
