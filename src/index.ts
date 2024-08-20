import { Telegraf } from 'telegraf';
import { botToken } from './environment';
import { setUpBot } from './setup';
import axios from 'axios';

const bot = new Telegraf(botToken);

setUpBot(bot);
bot.launch();

// const response = axios.get("http://localhost:8080/");
