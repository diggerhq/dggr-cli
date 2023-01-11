import fs from "node:fs";
import { ConfigIniParser } from "config-ini-parser";

export const getHomeDir = (): string => {
  const env = process.env;
  const home =
    env.HOME ||
    env.USERPROFILE ||
    (env.HOMEPATH ? (env.HOMEDRIVE || "C:/") + env.HOMEPATH : null);
  if (home) {
    return home;
  }

  throw new Error("Could not find home directory");
};


export const getVarsFromIniFile = (iniFilePath:string, sectionName:string|null) : object => {
  if (!fs.existsSync(iniFilePath)) {
    return [];
  }

  const iniFile = fs.readFileSync(
    iniFilePath,
    "utf8"
  );
  const parser = new ConfigIniParser();
  parser.parse(iniFile);
  if (sectionName && !parser.isHaveSection(sectionName)) {
    return []
  }

  return parser.items(sectionName).map((item) => {
    return {
      key: item[0],
      value: item[1]
    }
  });

}

export const getSecretsFromIniFile = (iniFilePath:string, sectionName:string|null) : object => {
  if (!fs.existsSync(iniFilePath)) {
    return {};
  }

  const iniFile = fs.readFileSync(
    iniFilePath,
    "utf8"
  );
  const parser = new ConfigIniParser();
  parser.parse(iniFile);
  if (sectionName && !parser.isHaveSection(sectionName)) {
    return {};
  }

  const result: { [key: string]: string } = {};
  const items = parser.items(sectionName);
  for (const [, item] of items) {
    result[item[0]] = item[1];
  }

  return result;

}