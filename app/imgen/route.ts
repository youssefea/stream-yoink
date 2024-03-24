// app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { URL } from '../../constants'

async function loadSVG() {
  try {
    const response = await fetch(`${URL}/logo.svg`);
    const logo = await response.text();
    return logo;
  } catch (error) {
    console.error('Error fetching SVG:', error);
  }
}
// Helper function to create an SVG with text
async function generateSVG(text: string, color: string[], backgroundColor: string, size: string[]) {
    // Load SVG logo
    const logo= await loadSVG();
    // Split text into lines
    const lines = text.split('_'); // Assuming you use _ to indicate new lines in your text input
    const lineHeight = 18; // Adjust line height as needed
    const startingY = 20; // Adjust starting Y position based on number of lines to keep it centered
  
    // Lines of text SVG
    const textSVG = lines.map((line, index) => {
      const fillColor = color[index] === "superfluid" ? "#1DB227" : color[index];
      return `
      <text 
          x="50%" 
          y="${startingY + index * lineHeight}" 
          dominant-baseline="middle" 
          text-anchor="middle" 
          font-family="Helvetica" 
          font-size="${size[index] || 10}" 
          fill="${fillColor}"
      >
          ${line}
      </text>
      `;
  }).join('');

    
  
    // SVG template with text and simple styling, including logo transformation
    return `
      <svg width="191" height="100" viewBox="0 0 191 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        ${textSVG}
        <g transform="translate(70, 85) scale(0.35)">
          ${logo}
        </g>
      </svg>
    `;
  }

  export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const text = searchParams.get('text') || 'Default Text';
    const color = searchParams.get('color')?.split(",") || new Array(10).fill('black');
    const size = request.nextUrl.searchParams.get('size')?.split(",") || new Array(10).fill('12');
    const backgroundColor = searchParams.get('background') || 'white';
  
    // Generate the SVG content
    const svg = await generateSVG(text, color, backgroundColor, size);
  
    // Convert SVG buffer to PNG with sharp, specifying higher DPI for better quality
    const pngBuffer = await sharp(Buffer.from(svg), { density: 300 }) // Increase DPI for better quality
      .resize({ width: 600 }) // Adjust width as needed, height is auto-scaled to maintain aspect ratio
      .png({
        quality: 100, // Set high quality for PNG output
        compressionLevel: 9 // Use higher compression level for smaller file size with minimal quality loss
      })
      .toBuffer();
  
    // Return the PNG image in the response
    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 's-maxage=1, stale-while-revalidate',
      },
    });
  }

// Force the function to be considered dynamic to bypass any caching
export const dynamic = 'force-dynamic';
