import * as fs from "node:fs";
import * as blocks from "../utils/block-defaults";
import * as crypto from "node:crypto";
import { execSync } from 'node:child_process'

export const diggerJsonPath = `${process.cwd()}/dgctl.json`;

export const diggerJsonExists = () => {
  return fs.existsSync(diggerJsonPath);
};

export const diggerJson = () => {
  const rawContent = fs.readFileSync(diggerJsonPath, "utf8");
  return JSON.parse(rawContent);
};

export const updateDiggerJson = (obj: unknown) => {
  fs.writeFileSync(diggerJsonPath, JSON.stringify(obj, null, 4));
};

export const importBlock = (blockName: string, id: string, service: string, profile: string) => {
  const currentDiggerJson = diggerJson();
  const awsIdentifier = `${blockName}-${crypto.randomBytes(4).toString("hex")}`;
  fs.mkdirSync(`${process.cwd()}/${blockName}`);
  const tfFileName = `${process.cwd()}/${blockName}/tf.hcl`
  execSync(`npx former2 generate --output-terraform ${tfFileName} --search-filter ${id} --services ${service} --profile ${profile}`)
  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      {
        // eslint-disable-next-line camelcase
        aws_app_identifier: awsIdentifier,
        name: blockName,
        // Better logic to determine type based on top-level type since for resources it differs
        type: "imported",
      },
    ],
  });
  fs.writeFileSync(
    `${process.cwd()}/${blockName}/config.json`,
    JSON.stringify({
      // eslint-disable-next-line camelcase
      imported_id: id,
      // eslint-disable-next-line camelcase
      terraform_files: [tfFileName],
    }, null, 4)
  );
}

export const createBlock = (
  blockType: string,
  blockName: string,
  extraOptions = {}
) => {
  const currentDiggerJson = diggerJson();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = blocks[blockType];

  const awsIdentifier = `${blockName}-${crypto.randomBytes(4).toString("hex")}`;

  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      {
        // eslint-disable-next-line camelcase
        aws_app_identifier: awsIdentifier,
        name: blockName,
        // Better logic to determine type based on top-level type since for resources it differs
        type:
          blockType === "container" || blockType === "vpc"
            ? blockType
            : "resource",
        ...extraOptions,
      },
    ],
  });

  fs.mkdirSync(`${process.cwd()}/${blockName}`);
  fs.mkdirSync(`${process.cwd()}/${blockName}/overrides`);

  fs.writeFileSync(
    `${process.cwd()}/${blockName}/config.json`,
    JSON.stringify(defaults, null, 4)
  );
  fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlsecrets`, "");
  fs.writeFileSync(`${process.cwd()}/${blockName}/.dgctlvariables`, "");
};
