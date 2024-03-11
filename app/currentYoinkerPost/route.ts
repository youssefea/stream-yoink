// Adjusted POST method in app/currentYoinkerApi/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request to get the profileHandle and address
    const body = await request.json();
    const { profileHandle, address } = body;

    // Validate the incoming data
    if (!profileHandle || !address) {
      return new NextResponse(JSON.stringify({ error: 'Profile handle and address are required' }), {
        status: 400, // Bad Request status
        headers: {
          'Content-Type': 'application/json', // Specify the content type
        },
      });
    }

    // Save the new profileHandle and address for the current yoinker
    await kv.hset('currentYoinker', { profileHandle: profileHandle, address: address});
    await kv.zincrby('yoinkedStreams', 1, profileHandle);

    // Return a success response
    return new NextResponse(JSON.stringify({ message: 'Profile data updated successfully' }), {
      status: 200, // OK status
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
    });
  } catch (error) {
    // Handle any errors that occur during the save operation
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500, // Internal Server Error status
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
    });
  }
}
