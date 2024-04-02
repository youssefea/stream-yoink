// Adjusted POST method in app/currentYoinkerApi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { fetchSubgraphData, totalStreamedQuery } from "../api";
import { formatEther } from "viem";
import {URL} from "../../constants";

type OldYoinker = {
  profileHandle: string;
  address: string;
};

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request to get the profileHandle and address
    const body = await request.json();
    const { profileHandle, address } = body;

    // Validate the incoming data
    if (!profileHandle || !address) {
      return new NextResponse(
        JSON.stringify({ error: "Profile handle and address are required" }),
        {
          status: 400, // Bad Request status
          headers: {
            "Content-Type": "application/json", // Specify the content type
          },
        }
      );
    }

    // Get Old Yoiner data
    const currentYoinkerResponse = await fetch(`${URL}/currentYoinkerApi`);
    const oldYoinkerData:OldYoinker = await currentYoinkerResponse.json();
    const oldYoinker = oldYoinkerData.profileHandle;
    const oldAddress = oldYoinkerData.address;
    const subgraphResponse: any = await fetchSubgraphData(
      totalStreamedQuery(oldAddress)
    );
    const outflows =
      subgraphResponse?.data?.accountTokenSnapshots?.[0]?.account?.outflows;
    let totalStreamed;
    if (!outflows) {
      console.error(`No outflows found for ${oldYoinker}`);
      totalStreamed = 0; // Fallback to 0 if outflows are not found
    } else {
      totalStreamed = outflows.reduce(
        (acc, curr) =>
          acc + parseInt(formatEther(curr.streamedUntilUpdatedAt), 10),
        0
      );
    }
    await kv.hset("balances", { oldYoinker: totalStreamed });

    // Update the new yoinker
    await kv.hset("currentYoinker", {
      profileHandle: profileHandle,
      address: address,
    });
    // Increment the score for the new yoinker
    await kv.zincrby("yoinkedStreams", 1, profileHandle);
    // Update the wallet address for the new yoinker
    await kv.hset("walletAddresses", { [profileHandle]: address });

    // Return a success response
    return new NextResponse(
      JSON.stringify({ message: "Profile data updated successfully" }),
      {
        status: 200, // OK status
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
      }
    );
  } catch (error) {
    // Handle any errors that occur during the save operation
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500, // Internal Server Error status
        headers: {
          "Content-Type": "application/json", // Specify the content type
        },
      }
    );
  }
}
