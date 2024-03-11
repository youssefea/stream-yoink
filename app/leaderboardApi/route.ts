'use server'
import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET(req) {
  try {
    // Fetch the sorted leaderboard data directly from KV
    const leaderboardData = await kv.zrange('yoinkedStreams', 0, 10000, { withScores: true });

    // Use NextResponse to return the leaderboard data
    return new NextResponse(JSON.stringify(leaderboardData), {
      status: 200, // OK status
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
    });
  } catch (error) {
    // Handle any errors that occur during the fetch operation
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500, // Internal Server Error status
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
    });
  }
}
