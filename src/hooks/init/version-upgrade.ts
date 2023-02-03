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
          if (fs.existsSync(blockPath)) {
            fs.writeFileSync(`${blockPath}/regions.json`, JSON.stringify({
              [region]: {
                // eslint-disable-next-line camelcase
                config_overrides: {}
              }
            }, null, 4));
          }
        }

        delete config.aws_region;
      } catch (error: any) {
        console.log(error);
      }
      
      updateDiggerJson({ ...config, updated: Date.now() });
    }
  }
}

export default hook