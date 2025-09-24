const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
import { PrismaClient } from "./generated/prisma";
import { Keypair } from "@solana/web3.js";

const prismaClient = new PrismaClient();

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
        privateKey: JSON.stringify(keypair.secretKey),
      },
    });
    const publickey = keypair.publicKey.toString();
    ctx.reply(
      `Welcome to SolBot! 🎉 Your public key: ${publickey}\n\nNow the real flex 👉 load it up with some SOL if you’re man enough. No guts, no glory 🔥💸`
    );
  }
});

bot.launch();
