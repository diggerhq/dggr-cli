import { Hook } from "@oclif/core";
import {
  diggerJsonExists,
  diggerJson,
  updateDiggerJson,
} from "../../utils/helpers";
import * as fs from "node:fs";
import * as semver from "semver";

const hook: Hook<"init"> = async function () {
  if (diggerJsonExists()) {
    const config = diggerJson();
    if (semver.lt(config.version, "0.0.25")) {
      try {
        const region = config.aws_region;
        for (const block of config.blocks) {
          const blockPath = `${process.cwd()}/${block.name}`;
          if (fs.existsSync(blockPath)) {
            fs.mkdirSync(`${process.cwd()}/${block.name}/${region}`);
            fs.renameSync(
              `${process.cwd()}/${block.name}/config.json`,
              `${process.cwd()}/${block.name}/${region}/config.json`
            );
            fs.renameSync(
              `${process.cwd()}/${block.name}/dgctl.overrides.tf`,
              `${process.cwd()}/${block.name}/${region}/dgctl.overrides.tf`
            );
            fs.renameSync(
              `${process.cwd()}/${block.name}/dgctl.secrets.ini`,
              `${process.cwd()}/${block.name}/${region}/dgctl.secrets.ini`
            );
            fs.renameSync(
              `${process.cwd()}/${block.name}/dgctl.variables.ini`,
              `${process.cwd()}/${block.name}/${region}/dgctl.variables.ini`
            );
            block.region = region;
          }
        }
      } catch (error: any) {
        console.log(error);
      }

      config.version = "0.0.25"

      updateDiggerJson({ ...config, updated: Date.now() });
    }
  }
};

export default hook;
