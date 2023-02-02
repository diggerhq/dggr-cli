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


export const defaultContent = (version: any) => ({
  target: "diggerhq/tf-module-bundler@master",
  version,
  id: crypto.randomUUID(),
  blocks: [],  
  addons: [],
  created: Date.now(),
})

export const blockOptions = ["container", "mysql", "postgres", "docdb", "redis", "imported"]
