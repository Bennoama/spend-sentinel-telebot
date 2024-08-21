import env from "env-var";

export const botToken = env.get("botToken").required().asString();
export const allowedIDs = env.get("allowedIDs").required().asArray();
export const serverUrl = env.get("serverUrl").required().asString();