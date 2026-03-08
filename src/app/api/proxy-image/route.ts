/**
 * Image Proxy Endpoint
 * 
 * Fetches images from WordPress with CORS headers
 * This bypasses CORS restrictions by serving images through our own domain
 * 
 * Usage: /api/proxy-image?url=https://...image-url...
 */

import { NextRequest, NextResponse } from 'next/server';

// Cache images for 24 hours (in production)
const CACHE_DURATION = 24 * 60 * 60; // seconds

async function fetchImageWithRetry(url: string, retries = 3): Promise<Buffer | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[proxy-image] Fetching (attempt ${attempt}/${retries}): ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NextJS-ImageProxy/1.0',
        },
      });

      if (!response.ok) {
        console.error(`[proxy-image] HTTP ${response.status} for ${url}`);
        if (attempt < retries) continue;
        return null;
      }

      const buffer = await response.arrayBuffer();
      console.log(`[proxy-image] Success: Fetched ${buffer.byteLength} bytes`);
      return Buffer.from(buffer);
    } catch (error) {
      console.error(`[proxy-image] Attempt ${attempt} failed:`, error instanceof Error ? error.message : error);
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    // Get image URL from query parameter
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing "url" parameter' },
        { status: 400 }
      );
    }

    // Validate URL (only allow WordPress images)
    try {
      const parsedUrl = new URL(imageUrl);
      if (!parsedUrl.hostname.includes('fs26-back.felixseeger.de')) {
        return NextResponse.json(
          { error: 'Only WordPress images are allowed' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid image URL' },
        { status: 400 }
      );
    }

    // Fetch the image
    const imageBuffer = await fetchImageWithRetry(imageUrl);

    if (!imageBuffer) {
      console.error(`[proxy-image] Failed to fetch: ${imageUrl}`);
      return NextResponse.json(
        { error: 'Failed to fetch image from WordPress' },
        { status: 502 }
      );
    }

    // Determine content type from URL or default to JPEG
    let contentType = 'image/jpeg';
    if (imageUrl.includes('.png')) contentType = 'image/png';
    else if (imageUrl.includes('.gif')) contentType = 'image/gif';
    else if (imageUrl.includes('.webp')) contentType = 'image/webp';

    // Return image with CORS headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${CACHE_DURATION}, immutable`,
        // CORS Headers - Allow all origins (safe for public images)
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Security headers
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch (error) {
    console.error('[proxy-image] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
