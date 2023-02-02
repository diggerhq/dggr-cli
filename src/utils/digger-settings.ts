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

export const awsRegions = [
  { name: "US East (Ohio)", value: "us-east-2" },
  { name: "US East (N. Virginia)", value: "us-east-1" },
  { name: "US West (N. California)", value: "us-west-1" },
  { name: "US West (Oregon)", value: "us-west-2" },
  { name: "Asia Pacific (Mumbai)", value: "ap-south-1" },
  { name: "Asia Pacific (Seoul)", value: "ap-northeast-2" },
  { name: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
  { name: "Asia Pacific (Sydney)", value: "ap-southeast-2" },
  { name: "Asia Pacific (Tokyo)", value: "ap-northeast-1" },
  { name: "Canada (Central)", value: "ca-central-1" },
  { name: "Europe (Frankfurt)", value: "eu-central-1" },
  { name: "Europe (Ireland)", value: "eu-west-1" },
  { name: "Europe (London)", value: "eu-west-2" },
  { name: "Europe (Paris)", value: "eu-west-3" },
  { name: "Europe (Stockholm)", value: "eu-north-1" },
  { name: "South America (São Paulo)", value: "sa-east-1" }
]