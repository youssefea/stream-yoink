// app/currentYoinkerApi/route.ts
"use server";
import { unstable_noStore as noStore } from "next/cache";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  noStore();
  try {
    // Fetch the profileHandle of the current yoinker
    let profileHandle = await kv.hget("currentYoinker", "profileHandle");
    let address = await kv.hget("currentYoinker", "address");

    // If profileHandle is not found, return a fake profileHandle and address
    if (!profileHandle) {
      profileHandle = "fakeHandle";
      address = "0xfabababababababababa740f03963281634847ba";
    }

    // Use NextResponse to return the profileHandle
    return new NextResponse(JSON.stringify({ profileHandle, address }), {
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
