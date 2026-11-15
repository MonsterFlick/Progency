const fs = require('fs');
const html = fs.readFileSync('scratch_perappelgren.html', 'utf8');

// Find the main or header or layout elements
const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
if (headerMatch) {
  console.log('HEADER:');
  console.log(headerMatch[0].slice(0, 1500));
} else {
  console.log('No <header> tag found');
}

// Find nav
const navMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);
if (navMatch) {
  console.log('NAV:');
  console.log(navMatch[0].slice(0, 1500));
}

// Find main
const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
if (mainMatch) {
  console.log('MAIN: length', mainMatch[0].length);
  console.log(mainMatch[0].slice(0, 1500));
}
