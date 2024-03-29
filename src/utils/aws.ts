import * as fs from "node:fs";
import * as AWS from "@aws-sdk/client-ssm";
import { ux } from "@oclif/core";
import * as path from "node:path";
import * as ini from "ini";
import { getHomeDir } from "./io";
import { diggerJson } from "./helpers";
import { getDiggerConfig, updateDiggerConfig } from "./digger-settings";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as inquirer from "inquirer-shortcuts";

export const promptForAwsCredentials = async () => {
  const awsLogin = await ux.prompt("AWS Access key?");
  const awsPassword = await ux.prompt("AWS Secret access key?", {
    type: "hide",
  });
  return { awsLogin, awsPassword };
};

const promptForProfile = async (profiles: Array<string>): Promise<string> => {
  const { profile } = await inquirer.prompt([
    {
      type: "list",
      name: "profile",
      message: "Select your aws profile?",
      choices: profiles,
    },
  ]);

  return profile;
};

export const getProfile = (id: string) => {
  const config = getDiggerConfig();
  return config[id] ? config[id].aws_profile : null;
};

const setProfile = (id: string, profileName: string) => {
  const newConfig: { [key: string]: any } = {};
  // eslint-disable-next-line camelcase
  newConfig[id] = { aws_profile: profileName };
  updateDiggerConfig(newConfig);
};

export const getAwsCreds = async (
  profileToUse?: string
): Promise<{ awsLogin: string; awsPassword: string; awsProfile: string }> => {
  const projectId: string = diggerJson().id;
  const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials");
  profileToUse = profileToUse ?? getProfile(projectId);

  if (fs.existsSync(awsCredsFilePath)) {
    const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials");
    const awsIniFile = ini.parse(fs.readFileSync(awsCredsFilePath, "utf8"));
    const profiles = Object.keys(awsIniFile);

    if (profileToUse) {
      const awsLogin = awsIniFile[profileToUse].aws_access_key_id;
      const awsPassword = awsIniFile[profileToUse].aws_secret_access_key;
      setProfile(projectId, profileToUse);

      return { awsLogin, awsPassword, awsProfile: profileToUse };
    }

    const selectedProfile = await promptForProfile(profiles);
    const awsLogin = awsIniFile[selectedProfile].aws_access_key_id;
    const awsPassword = awsIniFile[selectedProfile].aws_secret_access_key;
    setProfile(projectId, selectedProfile);

    return { awsLogin, awsPassword, awsProfile: selectedProfile };
  }

  return createNewAwsProfile();
};

export const resetAwsProfile = async () => {
  const projectId: string = diggerJson().id;
  const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials");

  if (fs.existsSync(awsCredsFilePath)) {
    const awsIniFile = ini.parse(fs.readFileSync(awsCredsFilePath, "utf8"));
    const profiles = Object.keys(awsIniFile);
    const selectedProfile = await promptForProfile(profiles);
    const awsLogin = awsIniFile[selectedProfile].aws_access_key_id;
    const awsPassword = awsIniFile[selectedProfile].aws_secret_access_key;
    setProfile(projectId, selectedProfile);

    return { awsLogin, awsPassword, awsProfile: selectedProfile };
  }

  return createNewAwsProfile();
};

export const createNewAwsProfile = async () => {
  const projectId: string = diggerJson().id;
  const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials");

  if (!fs.existsSync(awsCredsFilePath)) {
    fs.mkdirSync(path.join(getHomeDir(), ".aws/"));
  }

  const { awsLogin, awsPassword } = await promptForAwsCredentials();
  const selectedProfile = "digger_profile";
  const contents = ini.stringify({
    // eslint-disable-next-line camelcase
    digger_profile: {
      // eslint-disable-next-line camelcase
      aws_access_key_id: awsLogin,
      // eslint-disable-next-line camelcase
      aws_secret_access_key: awsPassword,
    },
  });
  fs.writeFileSync(awsCredsFilePath, contents);
  setProfile(projectId, selectedProfile);

  return { awsLogin, awsPassword, awsProfile: selectedProfile };
};

export const getSsmParameterArn = async function (
  key: string,
  awsProfile?: string
): Promise<{ arn: string }> {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const diggerConfig = diggerJson();
    const { awsLogin, awsPassword } = await getAwsCreds(awsProfile);
    const params = {
      Name: key,
      WithDecruption: false,
    };
    const client = new AWS.SSM({
      region: diggerConfig.region,
      credentials: { accessKeyId: awsLogin, secretAccessKey: awsPassword },
    });

    client.getParameter(params, function (err: any, data: any) {
      if (err) {
        reject(err);
      }

      resolve({
        arn: data.Parameter.ARN,
      });
    });
  });
};

export const createSsmParameter = async (
  key: string,
  value: string,
  awsProfile?: string
): Promise<{ arn: string }> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const diggerConfig = diggerJson();
    const { awsLogin, awsPassword } = await getAwsCreds(awsProfile);
    const params = {
      Name: key,
      Value: value,
      Type: "SecureString",
      Overwrite: true,
    };
    const client = new AWS.SSM({
      region: diggerConfig.region,
      credentials: { accessKeyId: awsLogin, secretAccessKey: awsPassword },
    });

    client.putParameter(params, function (err: any, _data: any) {
      if (err) {
        reject(err);
      }

      resolve(getSsmParameterArn(key, awsProfile));
    });
  });
};

export const deleteSsmParameter = async (
  key: string,
  awsProfile?: string
): Promise<void> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const diggerConfig = diggerJson();
    const { awsLogin, awsPassword } = await getAwsCreds(awsProfile);
    const params = {
      Name: key,
    };
    const client = new AWS.SSM({
      region: diggerConfig.region,
      credentials: { accessKeyId: awsLogin, secretAccessKey: awsPassword },
    });

    client.deleteParameter(params, (err: any) =>
      err ? reject(err) : resolve()
    );
  });
};
