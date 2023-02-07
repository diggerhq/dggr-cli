import { BaseCommand } from "@/base";
import { writeDiggerApiKey } from "@utils/helpers";
import { Args } from "@oclif/core";

export default class Login extends BaseCommand<typeof Login> {
  static description = "Login with Digger key";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static args = {
    key: Args.string(),
  };

  public async run(): Promise<void> {
    const { args } = await this.parse(Login);

    if (!args.key) {
      this.log("No API key provided. Example command: dgctl login <API_KEY>.");
      this.log("For a key, contact the Digger team.");
      return;
    }

    writeDiggerApiKey(args.key);
    this.log("Successfully saved the API key to .dgctl");
  }
}
