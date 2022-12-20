import * as fs from "node:fs";
import { fstat } from "fs";
import { CliUx } from "@oclif/core";
import path = require("node:path");
const ini = require("ini");
// @ts-ignore
const inquirer = require('inquirer-shortcuts');


const getHomeDir = ():string => {
	var env = process.env;
	var home = env.HOME ||
		env.USERPROFILE ||
		(env.HOMEPATH ? ((env.HOMEDRIVE || 'C:/') + env.HOMEPATH) : null);
	if (home)
        return home
    else {
        throw Error("Could not find home directory")
    }
}

export const promptForAwsCredentials = async () => {
    const awsLogin = await CliUx.ux.prompt("AWS Access key?");
    const awsPassword = await CliUx.ux.prompt("AWS Secret access key?", {
      type: "hide",
    });
    return {awsLogin, awsPassword}
}

const createNewProfile = () => {

}

export const getAwsCreds = async (): Promise<any> => {
    const promise = new Promise(async (resolve, reject) => {
        const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials")
        if (fs.existsSync(awsCredsFilePath)) {
            const awsIniFile = ini.parse(fs.readFileSync(awsCredsFilePath, 'utf-8'))
            const profiles = Object.keys(awsIniFile);    
            inquirer.prompt([{
                type: "list",
                name: "profile",
                message: "Select your aws profile?",
                choices: profiles
            }]).then((res:any) => {
                console.log(res)
                const selectedProfile = res.profile
                const awsLogin = awsIniFile[selectedProfile].aws_access_key_id
                const awsPassword = awsIniFile[selectedProfile].aws_secret_access_key
                resolve({awsLogin, awsPassword})
            })    
        } else {
            const {awsLogin, awsPassword} = await promptForAwsCredentials()
            const contents = ini.stringify({
                digger_profile: {
                    aws_access_key_id: awsLogin, aws_secret_access_key: awsPassword
                }
            })
            fs.writeFileSync(awsCredsFilePath, contents})
            resolve({awsLogin, awsPassword})
        }


    })
    return promise
}
