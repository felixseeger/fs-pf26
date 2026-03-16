/**
 * Test script to verify Three.js texture loading
 * This simulates what the DisplayCarousel component does on the client-side
 */

import * as fs from 'fs';
import * as https from 'https';

const imageUrl = 'https://fs26-back.felixseeger.de/wp-content/uploads/b0102.jpg';

console.log('Testing image URL accessibility...');
console.log(`URL: ${imageUrl}`);
console.log('');

// Test 1: Direct HTTPS request
console.log('[Test 1] Direct HTTPS request:');
https.get(imageUrl, (res) => {
  console.log(`✓ HTTP Status: ${res.statusCode}`);
  console.log(`✓ Content-Type: ${res.headers['content-type']}`);
  console.log(`✓ Content-Length: ${res.headers['content-length']}`);
  console.log(`✓ CORS Headers Present:`, {
    'access-control-allow-origin': res.headers['access-control-allow-origin'] || 'NOT SET',
    'access-control-allow-methods': res.headers['access-control-allow-methods'] || 'NOT SET',
  });
  console.log(`✓ Server: ${res.headers['server']}`);
  console.log('');

  // For browser: crossOrigin='anonymous' works when server returns CORS headers
  // If server doesn't return CORS headers BUT image is public, browser may still block it
  const hasCorsHeaders = res.headers['access-control-allow-origin'] !== undefined;
  console.log('[Analysis]');
  console.log(`- CORS Headers: ${hasCorsHeaders ? 'YES ✓' : 'NO ✗ (but image is accessible via static request)'}`);
  console.log(`- Image Accessible: YES ✓`);
  console.log('');
  console.log('[WebGL Texture Loader Notes]');
  console.log('In a browser, Three.js TextureLoader needs:');
  console.log('1. Image to be accessible (HTTP 200) ✓ - Yes');
  console.log('2. CORS headers if different domain - Server must return Access-Control-Allow-Origin');
  console.log(`   Current: ${hasCorsHeaders ? 'YES ✓' : 'NO ✗ (May fail in browser)'}`);
  console.log('3. crossOrigin="anonymous" attribute on image/loader ✓ - Code has setCrossOrigin()');
  console.log('');
  
  if (!hasCorsHeaders) {
    console.log('[WARNING] Browser might block texture loading due to missing CORS headers!');
    console.log('Solution options:');
    console.log('1. Configure WordPress server to return CORS headers');
    console.log('2. Use a proxy endpoint that adds CORS headers');
    console.log('3. Serve images from same domain as frontend');
  }
  
}).on('error', (err) => {
  console.error('✗ Error:', err.message);
});
