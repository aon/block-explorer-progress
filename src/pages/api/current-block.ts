import type { APIRoute } from "astro";
import { ethers } from "ethers";
import { ETH_RPC_URL } from "astro:env/server";

const provider = new ethers.JsonRpcProvider(ETH_RPC_URL);

export const GET: APIRoute = async () => {
  try {
    const blockNumber = await provider.getBlockNumber();

    return new Response(
      JSON.stringify({
        success: true,
        currentBlock: blockNumber,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching current block number:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to fetch current block number.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
