import { Telegraf } from 'telegraf';
import { botToken } from '../environment';
import { setUpBot } from './setup';


const bot = new Telegraf(botToken);

setUpBot(bot);
bot.launch();

