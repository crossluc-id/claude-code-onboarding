#!/usr/bin/env node
/**
 * Artifact Validation — PreToolUse Hook (Layer 1)
 *
 * Real-time structural validation for skills, commands, and agents.
 * Catches critical issues instantly during Write/Edit operations.
 *
 * Hook config (settings.json):
 * {
 *   "matcher": "Write|Edit",
 *   "hooks": [{
 *     "type": "command",
 *     "command": "node \"$HOME/.claude/hooks/validate-artifact.js\"",
 *     "timeout": 5
 *   }]
 * }
 */

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const VALID_MODELS = ['haiku', 'sonnet', 'opus'];
const MAX_DESCRIPTION_LENGTH = 1024;
const MIN_COMMAND_CONTENT = 10;

// Paths to skip (plugin content has its own CI)
const SKIP_PATTERNS = [
  /plugins\/cache\//,
  /plugins\/marketplaces\//,
];

// --- Frontmatter Parser ---
function parseFrontmatter(content) {
  if (!content || typeof content !== 'string') return null;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

// --- Artifact Detection ---
function getArtifactType(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');

  // Skip plugin directories
  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(normalized)) return null;
  }

  if (/\/skills\/[^/]+\/SKILL\.md$/.test(normalized)) return 'skill';
  if (/\/commands\/.*\.md$/.test(normalized)) return 'command';
  if (/\/agents\/.*\.md$/.test(normalized)) return 'agent';
  return null;
}

// --- Validators ---
function validateSkill(content, filePath) {
  const errors = [];
  const warnings = [];

  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push(`${filePath}: missing frontmatter block (needs --- delimiters)`);
    return { errors, warnings };
  }

  if (!fm.name || fm.name.trim() === '') {
    errors.push(`${filePath}: missing required field 'name'`);
  }

  if (!fm.description || fm.description.trim() === '') {
    errors.push(`${filePath}: missing required field 'description'`);
  }

  // Advisory checks
  if (fm.description && fm.description.length > MAX_DESCRIPTION_LENGTH) {
    warnings.push(`${filePath}: description exceeds ${MAX_DESCRIPTION_LENGTH} chars (${fm.description.length}) — may be truncated`);
  }

  if (fm.name) {
    const dirName = path.basename(path.dirname(filePath));
    if (fm.name !== dirName && fm.name.toLowerCase().replace(/\s+/g, '-') !== dirName) {
      warnings.push(`${filePath}: name '${fm.name}' doesn't match directory '${dirName}'`);
    }
  }

  return { errors, warnings };
}

function validateCommand(content, filePath) {
  const errors = [];
  const warnings = [];

  // Strip frontmatter to check content
  const withoutFm = content.replace(/^---[\s\S]*?---\r?\n?/, '').trim();
  if (withoutFm.length < MIN_COMMAND_CONTENT) {
    errors.push(`${filePath}: command has no meaningful content (${withoutFm.length} chars after frontmatter)`);
  }

  const fm = parseFrontmatter(content);
  if (fm && (!fm.description || fm.description.trim() === '')) {
    warnings.push(`${filePath}: no 'description' in frontmatter — command won't show in listings`);
  }
  if (!fm) {
    warnings.push(`${filePath}: no frontmatter — consider adding description for discoverability`);
  }

  return { errors, warnings };
}

function validateAgent(content, filePath) {
  const errors = [];
  const warnings = [];

  const fm = parseFrontmatter(content);
  if (!fm) {
    errors.push(`${filePath}: missing frontmatter block (needs --- delimiters)`);
    return { errors, warnings };
  }

  if (!fm.model) {
    errors.push(`${filePath}: missing required field 'model'`);
  } else if (!VALID_MODELS.includes(fm.model.toLowerCase())) {
    errors.push(`${filePath}: invalid model '${fm.model}' — must be one of: ${VALID_MODELS.join(', ')}`);
  }

  if (!fm.tools) {
    warnings.push(`${filePath}: no 'tools' field — agent may have limited capabilities`);
  }

  return { errors, warnings };
}

// --- Main ---
async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  let data;
  try {
    data = JSON.parse(input);
  } catch {
    // Not valid JSON — pass through (not our concern)
    process.stdout.write(input);
    return;
  }

  const toolInput = data.tool_input || {};
  const toolName = data.tool_name || data.tool || '';

  // Determine file path and content
  let filePath, content;

  if (toolName === 'Write' || toolName === 'write') {
    filePath = toolInput.file_path;
    content = toolInput.content;
  } else if (toolName === 'Edit' || toolName === 'edit') {
    filePath = toolInput.file_path;
    // For Edit, reconstruct full file if possible
    if (filePath && fs.existsSync(filePath)) {
      try {
        const existing = fs.readFileSync(filePath, 'utf8');
        const oldStr = toolInput.old_string || '';
        const newStr = toolInput.new_string || '';
        content = existing.replace(oldStr, newStr);
      } catch {
        // Can't read file — skip validation
        process.stdout.write(input);
        return;
      }
    } else {
      process.stdout.write(input);
      return;
    }
  } else {
    process.stdout.write(input);
    return;
  }

  const artifactType = getArtifactType(filePath);
  if (!artifactType) {
    process.stdout.write(input);
    return;
  }

  let result;
  switch (artifactType) {
    case 'skill':
      result = validateSkill(content, filePath);
      break;
    case 'command':
      result = validateCommand(content, filePath);
      break;
    case 'agent':
      result = validateAgent(content, filePath);
      break;
    default:
      process.stdout.write(input);
      return;
  }

  // Hard block on errors
  if (result.errors.length > 0) {
    for (const err of result.errors) {
      process.stderr.write(`[ArtifactValidator] ERROR: ${err}\n`);
    }
    process.stderr.write(`[ArtifactValidator] Fix errors above before saving.\n`);
    process.exit(1);
  }

  // Advisory warnings (don't block)
  if (result.warnings.length > 0) {
    for (const warn of result.warnings) {
      process.stderr.write(`[ArtifactValidator] WARN: ${warn}\n`);
    }
  }

  process.stdout.write(input);
}

main().catch(err => {
  process.stderr.write(`[ArtifactValidator] Internal error: ${err.message}\n`);
  // Don't block on internal errors — fail open
  process.stdout.write('');
});
