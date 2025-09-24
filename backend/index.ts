const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
import { PrismaClient } from "./generated/prisma";
import { Keypair, Connection } from "@solana/web3.js";

// connecting to the solana RPC node
const connection = new Connection(process.env.RPC_URL!);

const prismaClient = new PrismaClient();

// adding inline Keyboard in our telegram bot
const DEFAULT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback("Show public key", "public_key"), // first is placeholder , second is action name
  Markup.button.callback("Show private key", "private_key"),
]);

const bot = new Telegraf(process.env.BOT_TOKEN!);
bot.start(async (ctx) => {
  // check if the user already exists in the database
  const existingUser = await prismaClient.user.findFirst({
    where: {
      tgUserId: ctx.chat.id.toString(),
    },
  });

  if (existingUser) {
    const publicKey = existingUser.publicKey;
    ctx.reply(
      `Welcome to SolBot !. Here is your public key : ${publicKey} . You can start trading on Solana now !!`
    );
  } else {
    // create a new user in the database if the user does not exist
    const keypair = Keypair.generate();
    await prismaClient.user.create({
      data: {
        tgUserId: ctx.chat.id.toString(),
        publicKey: keypair.publicKey.toBase58(),
        privateKey: keypair.secretKey.toBase64(),
      },
    });
    const publickey = keypair.publicKey.toString();
    ctx.reply(
      `Welcome to SolBot! 🎉 Your public key: ${publickey}\n\nNow the real flex 👉 load it up with some SOL if you’re man enough. No guts, no glory 🔥💸 .`,
      {
        ...DEFAULT_KEYBOARD,
      }
    );
  }
});

// calling what happens when the action button is triggered
bot.action("public_key", async (ctx) => {
  const user = await prismaClient.user.findFirst({
    where: {
      tgUserId: ctx.chat?.id.toString(),
    },
  });
  return ctx.reply(`Your public key is : ${user?.publicKey}`, {
    ...DEFAULT_KEYBOARD,
  });
});

bot.action("private_key", async (ctx) => {
  const user = await prismaClient.user.findFirst({
    where: {
      tgUserId: ctx.chat?.id.toString(),
    },
  });
  return ctx.reply(`Your private key is : ${user?.privateKey}`, {
    ...DEFAULT_KEYBOARD,
  });
});

bot.launch();
