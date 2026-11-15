const fs = require('fs');
const html = fs.readFileSync('scratch_perappelgren.html', 'utf8');

const contactIdx = html.indexOf('Hi!');
if (contactIdx !== -1) {
  console.log('Contact section found:');
  console.log(html.slice(Math.max(0, contactIdx - 400), contactIdx + 2500));
}
