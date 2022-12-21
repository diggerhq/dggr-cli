import * as fs from "node:fs";
import { fstat } from "fs";
import { CliUx } from "@oclif/core";
import path = require("node:path");
const ini = require("ini");
import {getHomeDir} from "./io";
import { diggerJson } from "./helpers";
import { resolve } from "node:path";
import { getDiggerConfig, updateDiggerConfig } from "./diggersettings";
import { stringify } from "node:querystring";
import { string } from "@oclif/core/lib/parser";
const inquirer = require('inquirer-shortcuts');


export const promptForAwsCredentials = async () => {
    const awsLogin = await CliUx.ux.prompt("AWS Access key?");
    const awsPassword = await CliUx.ux.prompt("AWS Secret access key?", {
      type: "hide",
    });
    return {awsLogin, awsPassword}
}

const promptForProfile = (profiles:Array<string>): Promise<string> => {
    const promise = new Promise<string>((resolve, reject) => {
        inquirer.prompt([{
            type: "list",
            name: "profile",
            message: "Select your aws profile?",
            choices: profiles
        }]).then((res:any) => {
            resolve(res.profile)
        })
    })
    return promise
}

const getProfile = (id:string) => {
    const config = getDiggerConfig()
    return config[id] ? config[id].aws_profile : null
}

const setProfile = (id:string, profileName:string) => {
    let newConfig: {[key: string]: any} = {}
    newConfig[id] = {aws_profile: profileName}
    updateDiggerConfig(newConfig)
}


export const getAwsCreds = async (profileToUse : string|null|undefined) : Promise<{awsLogin: string, awsPassword: string, awsProfile: string}> => {
        const projectId:string = diggerJson().id
        const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials")
        profileToUse = profileToUse ?? getProfile(projectId)
        if (fs.existsSync(awsCredsFilePath)) {
            const awsCredsFilePath = path.join(getHomeDir(), ".aws/credentials")
            const awsIniFile = ini.parse(fs.readFileSync(awsCredsFilePath, 'utf-8'))
            const profiles = Object.keys(awsIniFile);
            if (profileToUse) {
                const awsLogin = awsIniFile[profileToUse].aws_access_key_id
                const awsPassword = awsIniFile[profileToUse].aws_secret_access_key
                setProfile(projectId, profileToUse)
                return {awsLogin, awsPassword, awsProfile: profileToUse}
            } else {
                const selectedProfile = await promptForProfile(profiles)
                const awsLogin = awsIniFile[selectedProfile].aws_access_key_id
                const awsPassword = awsIniFile[selectedProfile].aws_secret_access_key
                setProfile(projectId, selectedProfile)
                return {awsLogin, awsPassword, awsProfile: selectedProfile}
            }
        } else {
            fs.mkdirSync(path.join(getHomeDir(), ".aws/"))
            const {awsLogin, awsPassword} = await promptForAwsCredentials()
            const selectedProfile = "digger_profile"
            const contents = ini.stringify({
                digger_profile: {
                    aws_access_key_id: awsLogin, aws_secret_access_key: awsPassword
                }
            })
            fs.writeFileSync(awsCredsFilePath, contents)
            setProfile(projectId, selectedProfile)
            return {awsLogin, awsPassword, awsProfile: selectedProfile}
        }
}
