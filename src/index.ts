import { Telegraf } from 'telegraf';
import { botToken } from './services/environment';
import { setUpBot } from './services/setup';
const bot = new Telegraf(botToken);

setUpBot(bot);
bot.launch();