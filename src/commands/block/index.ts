import { diggerJsonExists } from "@utils/helpers";
import { BaseCommand } from "base";

export default class Index extends BaseCommand<typeof Index> {
  static description = "Adds a infra block to a Digger infra bundle";

  static flags = {};

  static args = {};

  public async run(): Promise<void> {
    if (!diggerJsonExists()) {
      this.log(
        "No Digger infra project found. Try running `dgctl init` first or changing to a directory with dgctl.json"
      );
    }
  }
}
