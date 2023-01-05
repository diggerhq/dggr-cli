import { BaseCommand } from "../base";

export default class Index extends BaseCommand<typeof Index> {
  static description = "Perform secret management actions";

  static flags = {};

  static args = [];

  public async run(): Promise<void> {
  }
}