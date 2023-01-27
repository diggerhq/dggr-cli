import { Flags } from "@oclif/core";
import chalk = require("chalk");
import { execSync } from "node:child_process";
import { lookpath } from "lookpath";
import { getAwsCreds } from "../../utils/aws";
import { trackEvent } from "../../utils/mixpanel";
import { tfOutput } from "../../utils/terraform";
import { BaseCommand } from "../../base";

export default class Logs extends BaseCommand<typeof Logs> {
  static description = "Show application logs from AWS";

  static flags = {
    profile: Flags.string({
      char: "p",
      description: "AWS profile to use",
      default: undefined,
    }),
    region: Flags.string({
      char: "r",
      description: "AWS region to use",
      default: "us-east-1",
    }),
    follow: Flags.boolean({
      char: "f",
      description: "Follow logs",
      default: false,
    })
  };

  static args = [{ name: "name" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Logs);

    trackEvent("logs are called", { flags, args });

    const awsExists = await lookpath("aws");
    if (!awsExists) {
      this.log("aws cli installation not found.");
      return;
    }

    if (!args.name) {
      this.log("No application name provided");
      return;
    }

    const infraDirectory = "generated";
    const terraformOutputs = await tfOutput(infraDirectory);

    const ecsServiceName = terraformOutputs[args.name].value.ecs_service_name;

    const { awsProfile } = await getAwsCreds(flags.profile);
    this.log(`[INFO] Using profile from aws credentials file: ${awsProfile}`);

    this.log(
      chalk.blueBright(
        `[INFO] Streaming logs from ECS service ${ecsServiceName}`
      )
    );
    execSync(
      `aws logs tail ${flags.follow ? "--follow" : ""} --profile ${awsProfile} /ecs/service/${ecsServiceName} --region ${flags.region} --color auto`,
      {
        stdio: [process.stdin, process.stdout, process.stderr]
      }
    );
    
  }
}
