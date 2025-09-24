import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const connection = new Connection(process.env.RPC_URL!);

export async function getBalanceMessage(publicKey: string): Promise<{
  empty: boolean;
  message: string;
}> {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  if (balance) {
    return {
      empty: false,
      message: `Your current balance is ${balance / LAMPORTS_PER_SOL} SOL`,
    };
  } else {
    return {
      empty: true,
      message: "",
    };
  }
}
