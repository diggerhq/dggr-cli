import * as fs from "node:fs";
import * as path from "node:path";
import * as Mixpanel from "mixpanel";
import { getHomeDir } from "./io";
import * as crypto from "node:crypto";

const mixpanel = Mixpanel.init("48099e85f3813b7b22eaa082f514d8ca", {
  debug: process.env.DEBUG || false,
});

const getSessionId = () => {
  const diggerFolder = path.join(getHomeDir(), ".digger");
  const sessionIdPath = path.join(diggerFolder, "session");
  if (!fs.existsSync(diggerFolder)) {
    fs.mkdirSync(diggerFolder);
  }

  if (fs.existsSync(sessionIdPath)) {
    return fs.readFileSync(sessionIdPath).toString();
  }

  const sessionId = crypto.randomUUID();
  fs.writeFileSync(sessionIdPath, sessionId);
  return sessionId;
};

export const trackEvent = (eventName: string, extraData: object) => {
  const sessionId = getSessionId();
  // mixpanel.identify(sessionId)
  // eslint-disable-next-line camelcase
  mixpanel.track(eventName, { distinct_id: sessionId, ...extraData });
};
