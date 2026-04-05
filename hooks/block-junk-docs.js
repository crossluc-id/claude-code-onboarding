#!/usr/bin/env node
/**
 * Block Junk Documentation Files — PreToolUse Hook
 *
 * Prevents Claude from creating unnecessary .md/.txt files.
 * Only allows: README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, SKILL.md, MEMORY.md
 *
 * Reads tool_input from stdin (standard hook protocol).
 */

let data = '';
process.stdin.on('data', chunk => data += chunk);
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const filePath = input.tool_input?.file_path || '';

    if (/\.(md|txt)$/.test(filePath) &&
        !/(README|CLAUDE|AGENTS|CONTRIBUTING|SKILL|MEMORY)\.md$/.test(filePath)) {
      process.stderr.write('[Hook] BLOCKED: Unnecessary documentation file creation\n');
      process.stderr.write(`[Hook] File: ${filePath}\n`);
      process.stderr.write('[Hook] Allowed: README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, SKILL.md, MEMORY.md\n');
      process.exit(1);
    }

    process.stdout.write(data);
  } catch {
    process.stdout.write(data);
  }
});
