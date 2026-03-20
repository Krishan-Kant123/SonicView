import { NextResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ color: 'rgb(24, 24, 27)' }); // Default zinc-900 fallback
  }

  try {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const image = sharp(buffer);
    const metadata = await image.metadata();

    if (metadata.width && metadata.height) {
      // Force crop directly into the center 50% avoiding all external YouTube letterboxing
      const width = Math.floor(metadata.width * 0.5);
      const height = Math.floor(metadata.height * 0.5);
      const left = Math.floor(metadata.width * 0.25);
      const top = Math.floor(metadata.height * 0.25);
      image.extract({ left, top, width, height });
    }

    const { dominant } = await image.stats();

    let r = dominant.r;
    let g = dominant.g;
    let b = dominant.b;

    // Prevent pure black gradients by providing a minimum brightness clamp
    if (r + g + b < 40) {
       r += 40; g += 40; b += 40;
    }

    // Reduce overwhelming brightness to allow white text to pop natively
    r = Math.min(Math.floor(r * 0.7), 160);
    g = Math.min(Math.floor(g * 0.7), 160);
    b = Math.min(Math.floor(b * 0.7), 160);

    const colorStr = `rgb(${r}, ${g}, ${b})`;

    return NextResponse.json({ color: colorStr }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (error) {
    console.error('Error computing dominant color:', error);
    return NextResponse.json({ color: 'rgb(24, 24, 27)' });
  }
}
