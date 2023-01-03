import * as fs from "node:fs";
import { getHomeDir } from "./io";
import * as path from "node:path";
import * as ini from "ini";
import * as crypto from 'node:crypto'

const initConfig = () => {
  const diggerFolder = path.join(getHomeDir(), ".digger");
  const diggerConfigPath = path.join(diggerFolder, "config");

  if (!fs.existsSync(diggerFolder)) {
    fs.mkdirSync(diggerFolder);
  }

  return diggerConfigPath;
};

export const getDiggerConfig = () => {
  const diggerConfigPath = initConfig();
  if (fs.existsSync(diggerConfigPath)) {
    const rawContent = fs.readFileSync(diggerConfigPath, "utf8");
    return ini.parse(rawContent);
  }

  return {};
};

export const overwriteDiggerConfig = (newSettings: object) => {
  const diggerConfigPath = initConfig();
  const contents = ini.stringify(newSettings);
  fs.writeFileSync(diggerConfigPath, contents);
};

export const updateDiggerConfig = (newSettings: object) => {
  const config = getDiggerConfig();
  const newConfig = { config, ...newSettings };
  overwriteDiggerConfig(newConfig);
};


export const defaultContent = (envId: any, version: any) => ({
  target: "diggerhq/tf-module-bundler@master",
  // eslint-disable-next-line camelcase
  aws_region: "us-east-1",
  // eslint-disable-next-line camelcase
  environment_id: envId,
  // eslint-disable-next-line camelcase
  for_local_run: false,
  version,
  id: crypto.randomUUID(),
  region: "us-west-1",
  blocks: [],
  created: Date.now(),
})
