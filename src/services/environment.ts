import env from "env-var";

export const botToken = env.get("BOT_TOKEN").required().asString();
export const allowedIDs = env.get("ALLOWED_IDS").required().asArray();
export const transactionApiUrl = env.get("TRANSACTION_API_URL").required().asString();
export const botSampleInterval = env.get("BOT_SAMPLE_INTERVAL").asInt();