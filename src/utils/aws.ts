import * as fs from "node:fs";
import { CliUx } from "@oclif/core";
import * as path from "node:path";
import * as ini from "ini";
import { getHomeDir } from "./io";
import { diggerJson } from "./helpers";
import { getDiggerConfig, updateDiggerConfig } from "./digger-settings";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as inquirer from "inquirer-shortcuts";

export const promptForAwsCredentials = async () => {
  const awsLogin = await CliUx.ux.prompt("AWS Access key?");
  const awsPassword = await CliUx.ux.prompt("AWS Secret access key?", {
    type: "hide",
  });
  return { awsLogin, awsPassword };
};

const promptForProfile = (profiles: Array<string>): Promise<string> => {
  return new Promise<string>((resolve) => {
    inquirer
      .prompt([
        {
          type: "list",
          name: "profile",
          message: "Select your aws profile?",
          choices: profiles,
        },
      ])
      .then((res: any) => {
        resolve(res.profile);
      });
  });
};

const getProfile = (id: string) => {
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
  profileToUse: string | null | undefined
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

  fs.mkdirSync(path.join(getHomeDir(), ".aws/"));
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
