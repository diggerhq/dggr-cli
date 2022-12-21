import * as fs from "node:fs";
import path = require('path');
import * as Mixpanel from 'mixpanel';
import { getHomeDir } from './io';
import * as crypto from "node:crypto";

const mixpanel = Mixpanel.init('48099e85f3813b7b22eaa082f514d8ca', {debug: process.env.DEBUG || false})

const getSessionId = () => {
    const diggerfolder = path.join(getHomeDir(), ".digger")
    const sessionIdPath = path.join(diggerfolder, "session")
    if (!fs.existsSync(diggerfolder)) {
        fs.mkdirSync(diggerfolder)
    }
    if (!fs.existsSync(sessionIdPath)) {
        const sessionId = crypto.randomUUID();
        fs.writeFileSync(sessionIdPath, sessionId)
        return sessionId
    } else {
        return fs.readFileSync(sessionIdPath).toString()
    }
    
}

export const track_event = (eventName:string, extraData: object) => {
    const sessionId = getSessionId()
    // mixpanel.identify(sessionId)
    mixpanel.track(eventName, {distinct_id: sessionId, ...extraData})
}

