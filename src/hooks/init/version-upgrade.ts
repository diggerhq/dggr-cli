/* eslint-disable max-depth */
import {Hook} from '@oclif/core'
import { diggerJson, diggerJsonExists, updateDiggerJson } from '../../utils/helpers';
import fs from 'node:fs';

const hook: Hook<'init'> = async function () {
  if (diggerJsonExists()) {
    const config = diggerJson();
    if ("aws_region" in config) {
      try {
        const region = config.aws_region;
        for (const block of config.blocks) {
          const blockPath = `${process.cwd()}/${block.name}`;
          if (fs.existsSync(blockPath) && !fs.existsSync(`${blockPath}/regions.json`)) {
            fs.writeFileSync(`${blockPath}/regions.json`, JSON.stringify({
              [region]: {
                // eslint-disable-next-line camelcase
                config_overrides: {}
              }
            }, null, 4));
          }
        }
      } catch (error: any) {
        console.log(error);
      }
    }

    if (!("addons" in config)) {
      config.addons = [];
    }

      
    updateDiggerJson({ ...config, updated: Date.now() });
  }
}

export default hook