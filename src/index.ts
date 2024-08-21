import { Telegraf } from 'telegraf';
import { allowedIDs, botToken } from './environment';
import { setUpBot } from './setup';
import axios, { AxiosResponse } from 'axios';
console.log(botToken);
console.log(allowedIDs);
const bot = new Telegraf(botToken);

setUpBot(bot);
bot.launch();