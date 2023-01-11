import { BaseCommand } from "../../base";

export default class Index extends BaseCommand<typeof Index> {
  static description = "Perform secret management actions";

  static flags = {};

  static args = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async run(): Promise<void> {
  }
}
