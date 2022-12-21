



export const getHomeDir = ():string => {
	var env = process.env;
	var home = env.HOME ||
		env.USERPROFILE ||
		(env.HOMEPATH ? ((env.HOMEDRIVE || 'C:/') + env.HOMEPATH) : null);
	if (home) {
        return home;
    } else {
        throw Error("Could not find home directory")
    }
}