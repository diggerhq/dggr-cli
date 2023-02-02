import { Args, Flags } from "@oclif/core";
import * as fs from "node:fs";
import { diggerJson } from "../utils/helpers";

import chalk = require("chalk");
import { callTF } from "../utils/terraform";
import { getAwsCreds } from "../utils/aws";
import { trackEvent } from "../utils/mixpanel";
import { BaseCommand } from "../base";
import { createRemoteState } from "../utils/remote-state";

export default class Provision extends BaseCommand<typeof Provision> {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    "s3-state": Flags.boolean({
      char: "s",
      description: "Store terraform state in s3",
      default: true,
    }),
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      default: undefined,
    }),
    bucket: Flags.string({ char: "b", description: "S3 bucket name" }),
  };

  static args = {
    file: Args.string(),
  };

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
    trackEvent("provision called", { flags, diggerConfig });
    const { awsLogin, awsPassword, awsProfile } = await getAwsCreds(
      flags.profile
    );
    this.log(`[INFO] Using profile from aws credentials file: ${awsProfile}`);

    try {
      process.env.AWS_ACCESS_KEY_ID = awsLogin;
      process.env.AWS_SECRET_ACCESS_KEY = awsPassword;

      await createRemoteState(diggerConfig);

      const terraformDir = "generated";
      // Init tf
      await callTF("init", terraformDir);
      // Apply TF
      await callTF("apply --auto-approve", terraformDir);
    } catch (error: any) {
      this.error(error);
    }
  }
}
