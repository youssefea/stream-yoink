// Import statements for Next.js and your custom API utilities
import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { profileQuery, totalStreamedQuery, fetchSubgraphData } from "../api";
import { init, fetchQuery } from "@airstack/node";
import { formatEther } from "viem";

// Initialize your Airstack environment
init(process.env.AIRSTACK_KEY || "");

export async function GET(req) {
  noStore();
  try {
    // Fetch the sorted leaderboard data by balances directly from KV
    const leaderboardDataRaw: any = await kv.zrange(
      "sortedBalances",
      0,
      10000,
      {
        withScores: true,
      }
    );

    // Process leaderboard data to pair user handles with their balances
    const leaderboardData: any = [];
    for (let i = 0; i < leaderboardDataRaw.length; i += 2) {
      leaderboardData.push({
        userHandle: leaderboardDataRaw[i],
        totalStreamed: leaderboardDataRaw[i + 1],
      });
    }

    // Fetch additional data for each user in parallel and handle possible null values
    const enrichedLeaderboardDataPromises = leaderboardData.map(
      async (entry: any) => {
        try {
          let userAddress;
          userAddress = await kv.hget("walletAddresses", entry.userHandle);

          if (!userAddress) {
            console.error(`No user address found for ${entry.userHandle}`);
            return { ...entry, score: 0 };
          }
          const score: any = await kv.zscore("yoinkedStreams", entry.userHandle);

          return { ...entry, score };
        } catch (error) {
          console.error(`Error fetching data for ${entry.userHandle}:`, error);
          return { ...entry, score: 0 }; // Fallback to 0 in case of any error
        }
      }
    );

    const enrichedLeaderboardData = await Promise.all(
      enrichedLeaderboardDataPromises
    );

    // Sort the enriched data by balance (Note: balance may need to be converted from string to number if necessary)
    const finalLeaderboardData= enrichedLeaderboardData.reverse();

    // Return the enriched and sorted leaderboard data with NextResponse
    return new NextResponse(JSON.stringify(finalLeaderboardData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Leaderboard data fetching error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
