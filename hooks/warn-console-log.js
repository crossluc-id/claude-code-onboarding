#!/usr/bin/env node
/**
 * Console.log Warner — PostToolUse Hook
 *
 * After editing JS/TS files, warns if console.log statements are present.
 * Reminds to remove debug statements before committing.
 *
 * Reads tool_input from stdin (standard hook protocol).
 */

const fs = require('fs');

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path;

    if (filePath && fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = [];

      content.split('\n').forEach((line, idx) => {
        if (/console\.log/.test(line)) {
          matches.push(`${idx + 1}: ${line.trim()}`);
        }
      });

      if (matches.length > 0) {
        process.stderr.write(`[Hook] WARNING: console.log found in ${filePath}\n`);
        matches.slice(0, 5).forEach(m => process.stderr.write(`${m}\n`));
        process.stderr.write('[Hook] Remove console.log before committing\n');
      }
    }

    process.stdout.write(data);
  } catch {
    process.stdout.write(data);
  }
});
