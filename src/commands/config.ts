import { BaseCommand } from "../base";
import { setNewAwsProfile } from "../utils/aws";

export default class Config extends BaseCommand<typeof Config> {
  static description = "Allows changing dgctl configuration";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static args = [
    {
      name: "name",
      options: ["aws"],
      description: "name for the config to change. Example `dgctl config <name>`",
      required: true,
    },
  ];

  public async run(): Promise<void> {
    const { args } = await this.parse(Config);

    switch (args.name) {
      case "aws": {
        const profile = await setNewAwsProfile();
        this.log(`Set active profile to: ${profile.awsProfile}`);
        break;
      }
    }
  }
}
