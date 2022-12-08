import { expect, test } from "@oclif/test";

describe("init", () => {
  test
    .stdout()
    .command(["init"])
    .it("runs hello", (ctx) => {
      expect(ctx.stdout).to.contain("Successfully initiated a Digger project");
    });
});
