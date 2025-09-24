const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");

const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.start((ctx) => ctx.reply("Welcome to SolBot !. Here is your public key"));

bot.launch();
