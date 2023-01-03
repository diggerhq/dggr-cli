export const getHomeDir = (): string => {
  const env = process.env;
  const home =
    env.HOME ||
    env.USERPROFILE ||
    (env.HOMEPATH ? (env.HOMEDRIVE || "C:/") + env.HOMEPATH : null);
  if (home) {
    return home;
  }

  throw new Error("Could not find home directory");
};
