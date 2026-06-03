const fs = require('fs');
const data = fs.readFileSync('parsed.json', 'utf8').trim();
try {
  const json = JSON.parse(data);
  const projects = json.projects || '';
  const lines = projects.split('\n');
  for (let i = 0; i < 10 && i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const sanitized = line.replace(/^[\s\u200B-\u200D\uFEFF]+/, '');
    const firstChar = sanitized.charAt(0);
    console.log(`Line: ${line.substring(0, 15)}...`);
    console.log(`First sanitized char: '${firstChar}' (code: ${firstChar.charCodeAt(0)})`);
    console.log(`Regex match: ${/^[•\-\*\,➢▪●○❖·‚¸\–\—\~>+，]/.test(sanitized)}`);
  }
} catch(e) {
  console.log("Error parsing json", e);
}
