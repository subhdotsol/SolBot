import axios from "axios";

const JUP_URL = "https://lite-api.jup.ag";
const SLIPPAGE = 0.5;

//@params qty - with decimals means
// 1 sol = 1_000_000_000 lamports
export async function swap(
  inputMint: string,
  outputMint: string,
  quantity: number
) {
  let quoteConfig = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${JUP_URL}/swap/v1/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${quantity}&slippage=${SLIPPAGE}`,
    headers: {
      Accept: "application/json",
    },
  };

  const response = axios.request(quoteConfig);

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://lite-api.jup.ag/swap/v1/swap",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    data: response.data,
  };

  axios.request(config);
}
