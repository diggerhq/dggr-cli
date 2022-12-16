import * as fs from "node:fs";
import * as blocks from "../utils/block-defaults";
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

export const createBlock = (blockType: String, blockName: String, extraOptions={}) => {
  const currentDiggerJson = diggerJson();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const defaults = blocks[blockType];

  updateDiggerJson({
    ...currentDiggerJson,
    blocks: [
      ...(currentDiggerJson.blocks ?? []),
      { name: blockName, type: blockType, ...extraOptions },
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
}