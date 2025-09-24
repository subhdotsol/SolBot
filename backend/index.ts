const { Telegraf, Markup } = require("telegraf");
const { message } = require("telegraf/filters");
import { PrismaClient } from "./generated/prisma";
import { Keypair, Connection } from "@solana/web3.js";
import { getBalanceMessage } from "./solana";

// connecting to the solana RPC node
const connection = new Connection(process.env.RPC_URL!);

const prismaClient = new PrismaClient();

// adding inline Keyboard in our telegram bot
const DEFAULT_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.callback("Show public key", "public_key"), // first is placeholder , second is action name
  Markup.button.callback("Show private key", "private_key"),
]);

const bot = new Telegraf(process.env.BOT_TOKEN!);

// starting the bot
bot.start(async (ctx) => {
  // check if the user already exists in the database
  const existingUser = await prismaClient.user.findFirst({
    where: {
      tgUserId: ctx.chat.id.toString(),
    },
  });

  if (existingUser) {
    const publicKey = existingUser.publicKey;
    const { empty, message } = await getBalanceMessage(
      existingUser.publicKey.toString()
    );
    ctx.reply(
      `Welcome to SolBot !. Here is your public key : ${publicKey} .
      
      ${
        empty
          ? "Your wallet is empty. Please fund it to trade on SOL "
          : message
      }`
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
      `Welcome to SolBot! 🎉 Your public key: ${publickey}\n\n👉 load it up with some SOL if you’re man enough. No guts, no glory 🔥💸 .`,
      {
        ...DEFAULT_KEYBOARD,
      }
    );
  }
});

// calling what happens when the action button is triggered
bot.action("public_key", async (ctx) => {
  const existingUser = await prismaClient.user.findFirst({
    where: {
      tgUserId: ctx.chat?.id.toString(),
    },
  });

  const { empty, message } = await getBalanceMessage(
    existingUser.publicKey.toString()
  );

  return ctx.reply(
    `Your public key is : ${existingUser?.publicKey} .\n ${
      empty ? "Fund your wallet to trade" : message
    }`,
    {
      ...DEFAULT_KEYBOARD,
    }
  );
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
