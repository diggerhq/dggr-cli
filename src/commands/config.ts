import { BaseCommand } from "base";
import { createNewAwsProfile, getProfile, resetAwsProfile } from "@utils/aws";
import { Args, Flags } from "@oclif/core";
import { diggerJson } from "@utils/helpers";

export default class Config extends BaseCommand<typeof Config> {
  static description = "Allows changing dgctl configuration";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    create: Flags.boolean({
      char: "c",
      description: "force creation of a new profile",
    }),
  };

  static args = {
    name: Args.string({
      options: ["aws"],
      description:
        "name for the config to change. Example `dgctl config <name>`",
      required: true,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Config);
    const currentProfile = await getProfile(diggerJson().id);
    this.log(`Current active profile: ${currentProfile ?? "No set profile"}`);

    if (flags.create) {
      const profile = await createNewAwsProfile();
      this.log(`Created and set active profile to: ${profile.awsProfile}`);
      return;
    }

    switch (args.name) {
      case "aws": {
        const profile = await resetAwsProfile();
        this.log(`Set active profile to: ${profile.awsProfile}`);
        break;
      }
    }
  }
}
