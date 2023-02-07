import * as fs from "node:fs";
import * as path from "node:path";
import * as Mixpanel from "mixpanel";
import { getHomeDir } from "./io";
import * as crypto from "node:crypto";
import { MIXPANEL_TOKEN } from "config";
import { diggerAPIKey, diggerAPIKeyExists } from "@utils/helpers";

const mixpanel = initialiseMixpanel();

function initialiseMixpanel(): Mixpanel.Mixpanel | null {
  if (process.env.NODE_ENV === "production") {
    return Mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.DEBUG || false,
    });
  }

  return null;
}

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
  const sessionId = diggerAPIKeyExists() ? diggerAPIKey() : getSessionId();

  if (mixpanel) {
    mixpanel.track(eventName, {
      // eslint-disable-next-line camelcase
      distinct_id: sessionId,
      ...extraData,
    });
  }
};
