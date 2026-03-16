import fetch from 'node-fetch';

const courseSlug = 'prompting-for-club-visuals';
const url = `http://localhost:3003/courses/${courseSlug}`;

console.log(`\n🔍 Testing course page: ${url}\n`);

try {
  const response = await fetch(url);
  const html = await response.text();

  // Check if DisplayCarousel is in the HTML
  const hasDisplayCarousel = html.includes('DisplayCarousel');
  const hasGallerySection = html.includes('Courses Gallery');
  const hasMonitorModel = html.includes('monitor.glb');
  
  console.log(`✅ Status: ${response.status}`);
  console.log(`📄 Content type: ${response.headers.get('content-type')}`);
  console.log(`📏 HTML length: ${html.length} bytes`);
  console.log(`\n🔎 Component checks:`);
  console.log(`  - DisplayCarousel component: ${hasDisplayCarousel ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`  - Gallery section markup: ${hasGallerySection ? '✅ FOUND' : '❌ NOT FOUND'}`);
  console.log(`  - 3D model reference: ${hasMonitorModel ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // Look for script tags with DisplayCarousel
  const displayCarouselMatches = html.match(/DisplayCarousel/g);
  if (displayCarouselMatches) {
    console.log(`\n📊 DisplayCarousel mentions: ${displayCarouselMatches.length}`);
  }

  // Check for errors in the HTML
  const errorMatches = html.match(/error|Error|ERROR/gi);
  if (errorMatches && errorMatches.length > 0) {
    console.log(`\n⚠️  Potential errors found: ${errorMatches.length} matches`);
  }

  // Show a snippet around DisplayCarousel if found
  if (hasDisplayCarousel) {
    const idx = html.indexOf('DisplayCarousel');
    const snippet = html.substring(Math.max(0, idx - 200), Math.min(html.length, idx + 300));
    console.log(`\n📋 Context around DisplayCarousel:\n${snippet}\n`);
  }

} catch (error) {
  console.error(`❌ Error fetching page: ${error.message}`);
  console.error(`\nMake sure dev server is running on http://localhost:3003`);
}
