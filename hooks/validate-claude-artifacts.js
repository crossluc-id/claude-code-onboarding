#!/usr/bin/env node
/**
 * Comprehensive Artifact Validator — Pre-Commit / Manual (Layer 2)
 *
 * Scans ~/.claude/ and project .claude/ for structural integrity of
 * skills, commands, agents, and routing JSON files.
 *
 * Usage:
 *   node validate-claude-artifacts.js [--path <dir>] [--fix-suggestions]
 *
 * Exit codes:
 *   0 — all clear (warnings may be present)
 *   1 — errors found (blocks commit)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// --- Configuration ---
const VALID_MODELS = ['haiku', 'sonnet', 'opus'];
const MAX_DESCRIPTION_LENGTH = 1024;
const MIN_COMMAND_CONTENT = 10;

const SKIP_PATTERNS = [
  /plugins\/cache\//,
  /plugins\/marketplaces\//,
  /node_modules\//,
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
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    fm[key] = value;
  }
  return fm;
}

// --- File Discovery ---
function shouldSkip(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return SKIP_PATTERNS.some(p => p.test(normalized));
}

function findFiles(dir, pattern) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  function walk(current) {
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (shouldSkip(fullPath)) continue;
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results;
}

// --- Collectors ---
const errors = [];
const warnings = [];

function error(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function relPath(p, base) {
  return path.relative(base, p) || p;
}

// --- Pass 1: Skills ---
function validateSkills(baseDir) {
  const skillsDir = path.join(baseDir, 'skills');
  if (!fs.existsSync(skillsDir)) return;

  const seenNames = new Map();
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch { return; }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(skillsDir, entry.name);
    if (shouldSkip(dirPath)) continue;

    const skillFile = path.join(dirPath, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      error(`skills/${entry.name}/: missing SKILL.md`);
      continue;
    }

    let content;
    try { content = fs.readFileSync(skillFile, 'utf8'); } catch { continue; }

    const fm = parseFrontmatter(content);
    if (!fm) {
      error(`skills/${entry.name}/SKILL.md: missing frontmatter`);
      continue;
    }

    if (!fm.name || fm.name.trim() === '') {
      error(`skills/${entry.name}/SKILL.md: missing required 'name'`);
    } else {
      // Check name matches directory
      const expected = entry.name;
      if (fm.name !== expected && fm.name.toLowerCase().replace(/\s+/g, '-') !== expected) {
        error(`skills/${entry.name}/SKILL.md: name '${fm.name}' doesn't match directory '${expected}'`);
      }
      // Check duplicates
      if (seenNames.has(fm.name)) {
        error(`skills/${entry.name}/SKILL.md: duplicate name '${fm.name}' (also in ${seenNames.get(fm.name)})`);
      } else {
        seenNames.set(fm.name, `skills/${entry.name}`);
      }
    }

    if (!fm.description || fm.description.trim() === '') {
      error(`skills/${entry.name}/SKILL.md: missing required 'description'`);
    } else if (fm.description.length > MAX_DESCRIPTION_LENGTH) {
      warn(`skills/${entry.name}/SKILL.md: description ${fm.description.length} chars (max ${MAX_DESCRIPTION_LENGTH})`);
    }

    // Check referenced files
    const refsDir = path.join(dirPath, 'references');
    const scriptsDir = path.join(dirPath, 'scripts');
    for (const subDir of [refsDir, scriptsDir]) {
      if (!fs.existsSync(subDir)) continue;
      try {
        const files = fs.readdirSync(subDir);
        // Just check they're not empty stubs
        for (const f of files) {
          const fp = path.join(subDir, f);
          try {
            const stat = fs.statSync(fp);
            if (stat.size === 0) {
              warn(`skills/${entry.name}/${path.basename(subDir)}/${f}: empty file`);
            }
          } catch { /* skip */ }
        }
      } catch { /* skip */ }
    }
  }
}

// --- Pass 2: Commands ---
function validateCommands(baseDir) {
  const commandsDir = path.join(baseDir, 'commands');
  if (!fs.existsSync(commandsDir)) return;

  const commandFiles = findFiles(commandsDir, /\.md$/);
  const seenNames = new Map();

  for (const filePath of commandFiles) {
    const rel = path.relative(commandsDir, filePath);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

    // Check non-empty
    const withoutFm = content.replace(/^---[\s\S]*?---\r?\n?/, '').trim();
    if (withoutFm.length < MIN_COMMAND_CONTENT) {
      error(`commands/${rel}: empty or near-empty command (${withoutFm.length} chars)`);
    }

    // Check frontmatter
    const fm = parseFrontmatter(content);
    if (fm && (!fm.description || fm.description.trim() === '')) {
      warn(`commands/${rel}: no 'description' in frontmatter`);
    }

    // Check duplicate names
    const cmdName = rel.replace(/\.md$/, '').replace(/\//g, ':');
    if (seenNames.has(cmdName)) {
      warn(`commands/${rel}: duplicate command name '${cmdName}'`);
    } else {
      seenNames.set(cmdName, rel);
    }
  }
}

// --- Pass 3: Agents ---
function validateAgents(baseDir) {
  const agentsDir = path.join(baseDir, 'agents');
  if (!fs.existsSync(agentsDir)) return;

  const agentFiles = findFiles(agentsDir, /\.md$/);
  const seenNames = new Map();

  for (const filePath of agentFiles) {
    const rel = path.relative(agentsDir, filePath);
    let content;
    try { content = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

    const fm = parseFrontmatter(content);
    if (!fm) {
      error(`agents/${rel}: missing frontmatter`);
      continue;
    }

    if (!fm.model) {
      error(`agents/${rel}: missing required 'model' field`);
    } else if (!VALID_MODELS.includes(fm.model.toLowerCase())) {
      error(`agents/${rel}: invalid model '${fm.model}' — must be: ${VALID_MODELS.join(', ')}`);
    }

    if (!fm.tools) {
      warn(`agents/${rel}: no 'tools' field`);
    }

    const name = path.basename(filePath, '.md');
    if (seenNames.has(name)) {
      warn(`agents/${rel}: duplicate agent name '${name}' (also at ${seenNames.get(name)})`);
    } else {
      seenNames.set(name, rel);
    }
  }
}

// --- Pass 4: Routing JSON ---
function validateRouting(baseDir) {
  const lookupDir = path.join(baseDir, 'lookup');
  if (!fs.existsSync(lookupDir)) return;

  for (const filename of ['agent-routing.json', 'skill-routing.json']) {
    const filePath = path.join(lookupDir, filename);
    if (!fs.existsSync(filePath)) continue;

    let data;
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(raw);
    } catch (e) {
      error(`lookup/${filename}: invalid JSON — ${e.message}`);
      continue;
    }

    // Validate path references
    function checkPaths(obj, prefix) {
      if (!obj || typeof obj !== 'object') return;
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          if (value.path) {
            const resolved = value.path.replace(/^~/, os.homedir());
            if (!fs.existsSync(resolved)) {
              error(`lookup/${filename}: ${prefix}${key}.path '${value.path}' does not exist`);
            }
          }
          if (value.fallback_to) {
            const resolved = value.fallback_to.replace(/^~/, os.homedir());
            if (!fs.existsSync(resolved)) {
              error(`lookup/${filename}: ${prefix}${key}.fallback_to '${value.fallback_to}' does not exist`);
            }
          }
          checkPaths(value, `${prefix}${key}.`);
        }
      }
    }

    checkPaths(data, '');
  }
}

// --- Pass 5: Cross-Artifact Consistency ---
function validateCrossArtifacts(baseDir) {
  const lookupDir = path.join(baseDir, 'lookup');
  if (!fs.existsSync(lookupDir)) return;

  // Collect actual agent/skill files
  const agentsDir = path.join(baseDir, 'agents');
  const skillsDir = path.join(baseDir, 'skills');

  const actualAgents = new Set();
  const actualSkills = new Set();

  if (fs.existsSync(agentsDir)) {
    const files = findFiles(agentsDir, /\.md$/);
    files.forEach(f => actualAgents.add(path.basename(f, '.md')));
  }

  if (fs.existsSync(skillsDir)) {
    try {
      const dirs = fs.readdirSync(skillsDir, { withFileTypes: true });
      dirs.filter(d => d.isDirectory() && !shouldSkip(path.join(skillsDir, d.name)))
        .forEach(d => actualSkills.add(d.name));
    } catch { /* skip */ }
  }

  // Check agent-routing.json references
  const agentRoutingPath = path.join(lookupDir, 'agent-routing.json');
  if (fs.existsSync(agentRoutingPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(agentRoutingPath, 'utf8'));
      const agents = data.agents || {};
      for (const category of Object.values(agents)) {
        if (typeof category !== 'object') continue;
        for (const [name, config] of Object.entries(category)) {
          if (config && config.path && !config.source) {
            // User agent — check if .md exists
            const resolved = config.path.replace(/^~/, os.homedir());
            if (!fs.existsSync(resolved)) {
              error(`agent-routing.json: agent '${name}' references missing file '${config.path}'`);
            }
          }
        }
      }
    } catch { /* skip */ }
  }
}

// --- Main ---
function main() {
  const args = process.argv.slice(2);
  let scanDirs = [];

  // Parse --path argument
  const pathIdx = args.indexOf('--path');
  if (pathIdx !== -1 && args[pathIdx + 1]) {
    scanDirs.push(path.resolve(args[pathIdx + 1]));
  } else {
    // Default: ~/.claude/ + project .claude/ if in a git repo
    const globalDir = path.join(os.homedir(), '.claude');
    if (fs.existsSync(globalDir)) scanDirs.push(globalDir);

    // Try to find project .claude/
    try {
      const { execSync } = require('child_process');
      const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
      const projectDir = path.join(gitRoot, '.claude');
      if (fs.existsSync(projectDir) && projectDir !== globalDir) {
        scanDirs.push(projectDir);
      }
    } catch { /* not in a git repo */ }
  }

  if (scanDirs.length === 0) {
    console.log('No directories to scan.');
    process.exit(0);
  }

  console.log(`Scanning: ${scanDirs.join(', ')}\n`);

  for (const dir of scanDirs) {
    console.log(`--- ${dir} ---`);
    validateSkills(dir);
    validateCommands(dir);
    validateAgents(dir);
    validateRouting(dir);
    validateCrossArtifacts(dir);
  }

  // Output
  console.log('');
  for (const e of errors) {
    console.log(`[ERROR] ${e}`);
  }
  for (const w of warnings) {
    console.log(`[WARN]  ${w}`);
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('All artifacts valid.');
  }

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
