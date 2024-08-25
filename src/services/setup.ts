import { Context, Telegraf } from "telegraf";
import { handleStart, handleHelp, handleText } from "./handlers";

type TelegramBot = Telegraf<Context<import("@telegraf/types").Update>>;

export const setUpBot = (bot: TelegramBot) => {
    bot.start(handleStart);

    bot.help(handleHelp);

    bot.on('text', handleText) // deprecated - todo change to current api
}

