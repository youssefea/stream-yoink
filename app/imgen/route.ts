// app/api/image/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Helper function to create an SVG with text
function generateSVG(text: string, color: string, backgroundColor: string, logo: string) {
  // Split the text into lines
  const lines = text.split('\n'); // Assuming that lines are delimited by '\n'
  const lineHeight = 20; // Set the line height
  const svgHeight = 200; // Adjust SVG height based on number of lines

  // SVG start
  let svgText = `
    <svg width="200" height="${svgHeight}" viewBox="0 0 200 ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}" />
  `;

  // Add each line of text to SVG
  lines.forEach((line, index) => {
    const yPosition = 100 + (index - lines.length / 2) * lineHeight;
    svgText += `
      <text 
        x="50%" y="${yPosition}" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        font-family="Helvetica" 
        font-size="12" 
        fill="${color}"
      >
        ${line}
      </text>
    `;
  });

  // SVG logo and end
  svgText += `
      <image href="${logo}" x="10" y="10" height="30px" width="30px"/>
    </svg>
  `;

  return svgText;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const text = searchParams.get('text') || 'Default Text';
  const color = searchParams.get('color') || 'black';
  const backgroundColor = searchParams.get('background') || 'white';
  const logo = searchParams.get('logo') || 'path_to_default_logo_image';

  // Validate inputs as needed
  if (!text) {
    return new NextResponse('Query parameter "text" is required', { status: 400 });
  }

  const svg = generateSVG(text, color, backgroundColor, logo);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 's-maxage=1, stale-while-revalidate',
    },
  });
}

// Force the function to be considered dynamic to bypass any caching
export const dynamic = 'force-dynamic';
