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
    // Fetch the sorted leaderboard data directly from KV
    const leaderboardDataRaw : any = await kv.zrange("yoinkedStreams", 0, 10000, {
      withScores: true,
    });

    // Process leaderboard data to pair user handles with their scores
    const leaderboardData:any = [];
    for (let i = 0; i < leaderboardDataRaw.length; i += 2) {
      leaderboardData.push({
        userHandle: leaderboardDataRaw[i],
        score: leaderboardDataRaw[i + 1],
      });
    }

    // Fetch additional data for each user in parallel and handle possible null values
    const enrichedLeaderboardDataPromises = leaderboardData.map(
      async (entry:any) => {
        try {
          let userAddress;
          const initialHandle = entry.userHandle.toString().startsWith("@")
            ? entry.userHandle.slice(1)
            : entry.userHandle;
          const { data: initialProfileResponse } = await fetchQuery(
            profileQuery(initialHandle),
            { id: initialHandle }
          );
          userAddress =
            initialProfileResponse?.Socials?.Social?.[0]
              ?.userAssociatedAddresses?.[1];

          // If the initial attempt fails and the handle originally started with "@"
          if (!userAddress && entry.userHandle.toString().startsWith("@")) {
            const modifiedHandle = `${initialHandle}.eth`;
            const { data: modifiedProfileResponse } = await fetchQuery(
              profileQuery(modifiedHandle),
              { id: modifiedHandle }
            );
            userAddress =
              modifiedProfileResponse?.Socials?.Social?.[0]
                ?.userAssociatedAddresses?.[1];

            if (!userAddress) {
              // If no address is found even after modification
              console.error(`No user address found for ${entry.userHandle}`);
              return { ...entry, totalStreamed: 0 };
            }
          } else if (!userAddress) {
            // If no address is found and the handle does not start with "@"
            console.error(`No user address found for ${entry.userHandle}`);
            return { ...entry, totalStreamed: 0 };
          }

          const subgraphResponse: any = await fetchSubgraphData(
            totalStreamedQuery(userAddress)
          );
          const outflows =
            subgraphResponse?.data?.accountTokenSnapshots?.[0]?.account
              ?.outflows;

          if (!outflows) {
            console.error(`No outflows found for ${entry.userHandle}`);
            return { ...entry, totalStreamed: 0 }; // Fallback to 0 if outflows are not found
          }

          const totalStreamed = outflows.reduce(
            (acc, curr) =>
              acc + parseInt(formatEther(curr.streamedUntilUpdatedAt), 10),
            0
          );

          return { ...entry, totalStreamed };
        } catch (error) {
          console.error(`Error fetching data for ${entry.userHandle}:`, error);
          return { ...entry, totalStreamed: 0 }; // Fallback to 0 in case of any error
        }
      }
    );

    const enrichedLeaderboardData = await Promise.all(
      enrichedLeaderboardDataPromises
    );

    // Return the enriched leaderboard data with NextResponse
    return new NextResponse(JSON.stringify(enrichedLeaderboardData), {
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
