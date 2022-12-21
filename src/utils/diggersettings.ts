import * as fs from "node:fs";
import { getHomeDir } from "./io";
import path = require("node:path");
const ini = require("ini");

const initConfig = () => {
    const diggerfolder = path.join(getHomeDir(), ".digger")
    const diggerconfigPath = path.join(diggerfolder, "config")
    if (!fs.existsSync(diggerfolder)) {
        fs.mkdirSync(diggerfolder)
    }
    return diggerconfigPath
}
export const getDiggerConfig = () => {
    const diggerConfigPath = initConfig()
    if (fs.existsSync(diggerConfigPath)) {
        const rawContent = fs.readFileSync(diggerConfigPath, "utf8");
        return ini.parse(rawContent)
    }
    return {}
}

export const overwriteDiggerConfig = (newSettings:object) => {
    const diggerConfigPath = initConfig()
    const contents = ini.stringify(newSettings)
    fs.writeFileSync(diggerConfigPath, contents)
}

export const updateDiggerConfig = (newSettings:{}) => {
    const config = getDiggerConfig()
    const newConfig = {config, ...newSettings}
    overwriteDiggerConfig(newConfig)
}
