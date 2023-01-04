import { expect, test } from "@oclif/test";

describe("init", () => {
  test
    .stdout()
    .command(["init"])
    .it("runs init", (ctx) => {
      const value = ctx.stdout;
      expect(value).to.contain("Successfully initiated a Digger project\n");
    });
});
