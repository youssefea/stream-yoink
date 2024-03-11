// app/currentYoinkerApi/route.ts
"use server";
import { unstable_noStore as noStore } from "next/cache";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  noStore();
  try {
    // Fetch the profileHandle of the current yoinker
    const key = "yoinkedStreams";

    // Fetch all members and their scores from the sorted set
    const membersWithScores = await kv.zrange(key, 0, -1, { withScores: true });

    if (!membersWithScores) {
        return new NextResponse(
          JSON.stringify({ error: "Current yoinker not found" }),
          {
            status: 404, // Not Found status
            headers: {
              "Content-Type": "application/json", // Specify the content type
            },
          }
        );
      }

    // Sum up all the scores
    let totalScore = 0;
    for (let i = 1; i < membersWithScores.length; i += 2) {
        totalScore += parseFloat(String(membersWithScores[i]));
    }

    // Use NextResponse to return the profileHandle
    return new NextResponse(JSON.stringify({ totalScore }), {
      status: 200, // OK status
      headers: {
        "Content-Type": "application/json", // Specify the content type
      },
    });
  } catch (error) {
    // Handle any errors that occur during the fetch operation
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
