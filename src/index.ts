import { Telegraf } from 'telegraf';
import { allowedIDs, botToken } from './environment';
import { setUpBot } from './setup';
const bot = new Telegraf(botToken);

setUpBot(bot);
bot.launch();