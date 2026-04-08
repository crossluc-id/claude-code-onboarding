# Artifact Validation System — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce structural and semantic validation on user-created Claude Code skills, commands, and agents via a two-layer hybrid system (PreToolUse hook + pre-commit validator).

**Architecture:** Layer 1 is a PreToolUse hook (`validate-artifact.js`) that intercepts Write operations targeting skill/command/agent files and hard-blocks broken frontmatter. Layer 2 is a standalone validator (`validate-claude-artifacts.js`) that runs 5 comprehensive passes at commit time. Both layers skip plugin directories.

**Tech Stack:** Node.js (no dependencies), Claude Code hook protocol (stdin JSON, exit codes, hookSpecificOutput)

**Spec:** `~/.claude/docs/superpowers/specs/2026-04-05-artifact-validation-design.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `~/.claude/hooks/validate-artifact.js` | NEW — PreToolUse hook. Receives Write stdin, classifies artifact type by path, parses frontmatter, hard-blocks or warns. ~150 lines. |
| `~/.claude/hooks/validate-claude-artifacts.js` | NEW — Standalone validator. Scans directories, runs 5 passes, outputs `[ERROR]`/`[WARN]` lines, exits 1 on errors. ~350 lines. |
| `~/.claude/settings.json` | EDIT — Add one PreToolUse hook entry after md/txt blocker. |

---

## Task 1: Shared Frontmatter Parser (utility used by both layers)

Both scripts need identical frontmatter extraction. We'll write it as an inline function in each file (no shared module — hooks must be self-contained).

**Files:**
- Create: `~/.claude/hooks/validate-artifact.js` (initial scaffold with parser + path classifier)

- [ ] **Step 1: Create validate-artifact.js with frontmatter parser and path classifier**

```js
#!/usr/bin/env node
// Artifact Validation Hook — PreToolUse (Write only)
// Validates SKILL.md, command .md, and agent .md files on creation.
// Hard-blocks broken frontmatter. Advisory warns on style issues.

const path = require('path');

// --- Frontmatter parser (shared logic, inlined for hook independence) ---

function extractFrontmatter(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      // Handle multi-line values (quoted strings with >)
      let value = line.slice(idx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      fm[key] = value;
    }
  }
  return fm;
}

// --- Path classifier ---

const PLUGIN_SKIP = ['plugins/cache/', 'plugins/marketplaces/'];
const GSD_AGENT_RE = /agents\/gsd-[^/]*\.md$/;
const VALID_MODELS = ['haiku', 'sonnet', 'opus'];

function classifyArtifact(filePath) {
  // Skip plugin directories
  for (const skip of PLUGIN_SKIP) {
    if (filePath.includes(skip)) return null;
  }

  const normalized = filePath.replace(/\\/g, '/');

  // SKILL.md
  if (/\/skills\/[^/]+\/SKILL\.md$/.test(normalized)) {
    return 'skill';
  }

  // Command .md (in commands/ directory)
  if (/\/commands\/.*\.md$/.test(normalized)) {
    return 'command';
  }

  // Agent .md (in agents/ directory)
  if (/\/agents\/.*\.md$/.test(normalized)) {
    // Skip GSD plugin agents at ~/.claude/agents/ root level
    if (GSD_AGENT_RE.test(normalized) && normalized.includes('.claude/agents/')) {
      return null;
    }
    return 'agent';
  }

  return null;
}

// --- Validation logic ---

function validateSkill(content, filePath) {
  const errors = [];
  const warnings = [];
  const fm = extractFrontmatter(content);

  if (!fm) {
    errors.push('Missing frontmatter block (must start with ---)');
    return { errors, warnings };
  }

  if (!fm.name || !fm.name.trim()) {
    errors.push("Missing required field 'name'");
  }
  if (!fm.description || !fm.description.trim()) {
    errors.push("Missing required field 'description'");
  }

  // Advisory checks
  if (fm.description && fm.description.length > 1024) {
    warnings.push(`Description is ${fm.description.length} chars (recommended: ≤1024)`);
  }
  if (fm.name) {
    const dirName = path.basename(path.dirname(filePath));
    if (fm.name !== dirName) {
      warnings.push(`Name '${fm.name}' does not match directory '${dirName}'`);
    }
  }

  return { errors, warnings };
}

function validateCommand(content, filePath) {
  const errors = [];
  const warnings = [];

  // Strip frontmatter to measure body content
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
  if (body.length <= 10) {
    errors.push('Command body is empty or too short (≤10 chars)');
    return { errors, warnings };
  }

  // Advisory: check for description in frontmatter
  const fm = extractFrontmatter(content);
  if (!fm || !fm.description || !fm.description.trim()) {
    warnings.push("No 'description' in frontmatter (improves discoverability)");
  }

  return { errors, warnings };
}

function validateAgent(content, filePath) {
  const errors = [];
  const warnings = [];
  const fm = extractFrontmatter(content);

  if (!fm) {
    errors.push('Missing frontmatter block (must start with ---)');
    return { errors, warnings };
  }

  // Hard block: if model present, must be valid
  if (fm.model && !VALID_MODELS.includes(fm.model.trim())) {
    errors.push(`Invalid model '${fm.model}'. Must be one of: ${VALID_MODELS.join(', ')}`);
  }

  // Advisory checks
  if (!fm.model) {
    warnings.push("No 'model' field (may cause unpredictable routing)");
  }
  if (!fm.tools) {
    warnings.push("No 'tools' field");
  }

  return { errors, warnings };
}

// --- Hook entry point ---

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);

    // Write-only — ignore Edit operations
    if (data.tool_name !== 'Write') {
      process.exit(0);
    }

    const filePath = data.tool_input?.file_path || '';
    const content = data.tool_input?.content || '';
    const artifactType = classifyArtifact(filePath);

    if (!artifactType) {
      process.exit(0);
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
        process.exit(0);
    }

    // Hard block on errors
    if (result.errors.length > 0) {
      const label = artifactType.toUpperCase();
      console.error(`[validate-artifact] BLOCKED: Invalid ${label} at ${path.basename(filePath)}`);
      for (const e of result.errors) {
        console.error(`  - ${e}`);
      }
      process.exit(1);
    }

    // Advisory warnings
    if (result.warnings.length > 0) {
      const output = {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `\u26a0\ufe0f Artifact validation warnings for ${path.basename(filePath)}: ` +
            result.warnings.join('; ') + '. These are advisory — the write will proceed.',
        },
      };
      process.stdout.write(JSON.stringify(output));
    }
  } catch {
    // Silent fail — never block on hook errors
    process.exit(0);
  }
});
```

- [ ] **Step 2: Verify the hook runs correctly with a mock skill input**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/skills/test-skill/SKILL.md","content":"---\nname: test-skill\ndescription: A test skill\n---\n\nContent here"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 0, no errors (valid skill).

- [ ] **Step 3: Verify hard block on missing frontmatter**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/skills/bad-skill/SKILL.md","content":"No frontmatter here"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 1, stderr shows "BLOCKED: Invalid SKILL" with "Missing frontmatter block".

- [ ] **Step 4: Verify Edit operations are ignored**

Run:
```bash
echo '{"tool_name":"Edit","tool_input":{"file_path":"/Users/zephyr/.claude/skills/test/SKILL.md","old_string":"foo","new_string":"bar"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 0, no output.

- [ ] **Step 5: Verify plugin paths are skipped**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/plugins/cache/foo/skills/bar/SKILL.md","content":"no frontmatter"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 0 (skipped, not validated).

- [ ] **Step 6: Verify GSD agent skip**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/agents/gsd-executor.md","content":"no frontmatter"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 0 (GSD agent skipped).

- [ ] **Step 7: Verify agent model validation**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/agents/core/test.md","content":"---\nmodel: gpt4\ntools: [\"Read\"]\n---\nContent"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 1, "Invalid model 'gpt4'".

- [ ] **Step 8: Verify advisory warning output**

Run:
```bash
echo '{"tool_name":"Write","tool_input":{"file_path":"/Users/zephyr/.claude/agents/core/test.md","content":"---\ndescription: test agent\n---\nContent"}}' | node ~/.claude/hooks/validate-artifact.js
echo "Exit code: $?"
```
Expected: Exit code 0, stdout contains JSON with `hookSpecificOutput` warning about missing `model` and `tools`.

- [ ] **Step 9: Commit Layer 1**

```bash
git add ~/.claude/hooks/validate-artifact.js
git commit -m "feat: add PreToolUse hook for artifact validation (Layer 1)"
```

---

## Task 2: Pre-Commit Validator — Passes 1-3 (Skills, Commands, Agents)

**Files:**
- Create: `~/.claude/hooks/validate-claude-artifacts.js`

- [ ] **Step 1: Create validate-claude-artifacts.js with CLI scaffold and Pass 1 (Skills)**

```js
#!/usr/bin/env node
// Artifact Validation — Pre-Commit / Manual Validator
// Runs 5 validation passes across ~/.claude/ and project .claude/ directories.
// Exit 1 on errors (blocks commit). Warnings don't block.
//
// Usage: node validate-claude-artifacts.js [--path <dir>]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// --- Configuration ---

const VALID_MODELS = ['haiku', 'sonnet', 'opus'];
const PLUGIN_SKIP = ['plugins/cache', 'plugins/marketplaces'];
const GSD_AGENT_RE = /^gsd-.*\.md$/;
const HOME = process.env.HOME || process.env.USERPROFILE;

// --- Shared utilities ---

function extractFrontmatter(content) {
  const clean = content.replace(/^\uFEFF/, '');
  const match = clean.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;
  for (const line of lines) {
    // Handle YAML continuation lines (indented under a key)
    if (currentKey && /^\s+/.test(line) && !line.trim().startsWith('-')) {
      fm[currentKey] = ((fm[currentKey] || '') + ' ' + line.trim()).trim();
      continue;
    }
    // Handle YAML list items under a key
    if (currentKey && /^\s+-\s/.test(line)) {
      fm[currentKey] = (fm[currentKey] || '') + ', ' + line.trim().replace(/^-\s*/, '');
      continue;
    }
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      let value = line.slice(idx + 1).trim();
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Handle YAML multiline indicators (> or |)
      if (value === '>' || value === '|') {
        currentKey = key;
        fm[key] = '';
        continue;
      }
      currentKey = key;
      fm[key] = value;
    }
  }
  return fm;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function shouldSkip(dirPath) {
  const normalized = dirPath.replace(/\\/g, '/');
  return PLUGIN_SKIP.some(skip => normalized.includes(skip));
}

function relPath(filePath, baseDir) {
  return path.relative(baseDir, filePath);
}

// --- Result collector ---

const results = { errors: [], warnings: [] };

function addError(file, msg) {
  results.errors.push({ file, msg });
}

function addWarning(file, msg) {
  results.warnings.push({ file, msg });
}

// --- Determine scan directories ---

function getScanDirs() {
  const dirs = [];
  const args = process.argv.slice(2);
  const pathIdx = args.indexOf('--path');

  if (pathIdx !== -1 && args[pathIdx + 1]) {
    dirs.push(path.resolve(args[pathIdx + 1]));
  } else {
    // Default: global ~/.claude/
    const globalDir = path.join(HOME, '.claude');
    if (fs.existsSync(globalDir)) dirs.push(globalDir);

    // Project-level .claude/ (if in a git repo)
    try {
      const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
      const projectDir = path.join(gitRoot, '.claude');
      if (fs.existsSync(projectDir) && projectDir !== globalDir) {
        dirs.push(projectDir);
      }
    } catch {
      // Not in a git repo — skip project scan
    }
  }

  return dirs;
}

// --- Pass 1: Skill Validation ---

function pass1Skills(baseDir) {
  const skillsDir = path.join(baseDir, 'skills');
  if (!fs.existsSync(skillsDir)) return;

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  const skillNames = new Map(); // name -> filePath (for duplicate detection)

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const dirPath = path.join(skillsDir, entry.name);
    if (shouldSkip(dirPath)) continue;

    const skillMd = path.join(dirPath, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      // Skip dirs without SKILL.md (e.g., learned/ is a pattern archive)
      continue;
    }

    const content = readFile(skillMd);
    if (!content || content.trim().length === 0) {
      addError(relPath(skillMd, baseDir), 'Empty SKILL.md');
      continue;
    }

    const fm = extractFrontmatter(content);
    if (!fm) {
      addError(relPath(skillMd, baseDir), 'Missing frontmatter block');
      continue;
    }

    if (!fm.name || !fm.name.trim()) {
      addError(relPath(skillMd, baseDir), "Missing required field 'name'");
    } else {
      // Name must match directory
      if (fm.name !== entry.name) {
        addError(relPath(skillMd, baseDir), `Name '${fm.name}' does not match directory '${entry.name}'`);
      }

      // Duplicate detection
      if (skillNames.has(fm.name)) {
        addError(relPath(skillMd, baseDir), `Duplicate skill name '${fm.name}' (also at ${skillNames.get(fm.name)})`);
      } else {
        skillNames.set(fm.name, relPath(skillMd, baseDir));
      }
    }

    if (!fm.description || !fm.description.trim()) {
      addError(relPath(skillMd, baseDir), "Missing required field 'description'");
    } else if (fm.description.length > 1024) {
      addWarning(relPath(skillMd, baseDir), `Description is ${fm.description.length} chars (recommended: ≤1024)`);
    }

    // Check referenced files
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const refMatches = body.matchAll(/(?:references|scripts)\/[^\s`)]+/g);
    for (const m of refMatches) {
      const refPath = path.join(dirPath, m[0]);
      if (!fs.existsSync(refPath)) {
        addWarning(relPath(skillMd, baseDir), `References non-existent file: ${m[0]}`);
      }
    }
  }

  return skillNames;
}

// --- Pass 2: Command Validation ---

function pass2Commands(baseDir) {
  const cmdsDir = path.join(baseDir, 'commands');
  if (!fs.existsSync(cmdsDir)) return new Map();

  const commandNames = new Map(); // derived name -> filePath

  function scanDir(dir, prefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath, prefix ? `${prefix}:${entry.name}` : entry.name);
      } else if (entry.name.endsWith('.md')) {
        const baseName = entry.name.replace(/\.md$/, '');
        const derivedName = prefix ? `${prefix}:${baseName}` : baseName;
        const rel = relPath(fullPath, baseDir);

        const content = readFile(fullPath);
        if (!content || content.trim().length === 0) {
          addError(rel, 'Empty command file');
          continue;
        }

        const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
        if (body.length <= 10) {
          addError(rel, `Command body too short (${body.length} chars, need >10)`);
        }

        // Advisory: frontmatter description
        const fm = extractFrontmatter(content);
        if (!fm || !fm.description || !fm.description.trim()) {
          addWarning(rel, "No 'description' in frontmatter");
        }

        // Track for duplicate detection
        if (commandNames.has(derivedName)) {
          addWarning(rel, `Duplicate command name '${derivedName}' (also at ${commandNames.get(derivedName)})`);
        } else {
          commandNames.set(derivedName, rel);
        }
      }
    }
  }

  scanDir(cmdsDir, '');

  // Cross-reference validation (second pass)
  const allCmdFiles = [...commandNames.keys()];
  for (const [name, filePath] of commandNames) {
    const fullPath = path.join(baseDir, filePath);
    const content = readFile(fullPath);
    if (!content) continue;

    // Strip fenced code blocks before checking refs
    const noCode = content.replace(/```[\s\S]*?```/g, '');
    const refs = noCode.matchAll(/`\/([a-z][-a-z0-9:]*)`/g);
    for (const m of refs) {
      const refName = m[1];
      if (!commandNames.has(refName)) {
        // Warning not error — ref may point to a plugin-provided command
        // which is out of scope for local scanning
        addWarning(relPath(fullPath, baseDir), `References command /${refName} (not found locally — may be plugin-provided)`);
      }
    }
  }

  return commandNames;
}

// --- Pass 3: Agent Validation ---

function pass3Agents(baseDir) {
  const agentsDir = path.join(baseDir, 'agents');
  if (!fs.existsSync(agentsDir)) return;

  const agentFiles = new Map(); // filename -> filePath

  function scanAgentDir(dir) {
    if (shouldSkip(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanAgentDir(fullPath);
        continue;
      }

      if (!entry.name.endsWith('.md')) continue;

      // Skip GSD agents at ~/.claude/agents/ root level
      const isGlobalAgentsRoot = dir === path.join(HOME, '.claude', 'agents');
      if (isGlobalAgentsRoot && GSD_AGENT_RE.test(entry.name)) continue;

      const rel = relPath(fullPath, baseDir);
      const content = readFile(fullPath);
      if (!content || content.trim().length === 0) {
        addError(rel, 'Empty agent file');
        continue;
      }

      const fm = extractFrontmatter(content);
      if (!fm) {
        addError(rel, 'Missing frontmatter block');
        continue;
      }

      // Hard: if model present, must be valid
      if (fm.model && !VALID_MODELS.includes(fm.model.trim())) {
        addError(rel, `Invalid model '${fm.model}'. Must be one of: ${VALID_MODELS.join(', ')}`);
      }

      // Advisory
      if (!fm.model) {
        addWarning(rel, "No 'model' field (may cause unpredictable routing)");
      }
      if (!fm.tools) {
        addWarning(rel, "No 'tools' field");
      }

      // Duplicate detection
      if (agentFiles.has(entry.name)) {
        addWarning(rel, `Duplicate agent filename '${entry.name}' (also at ${agentFiles.get(entry.name)})`);
      } else {
        agentFiles.set(entry.name, rel);
      }
    }
  }

  scanAgentDir(agentsDir);
  return agentFiles;
}

// --- Pass 4: Routing JSON Integrity ---

function pass4Routing(baseDir) {
  const lookupDir = path.join(baseDir, 'lookup');
  if (!fs.existsSync(lookupDir)) return;

  // Load enabled plugins from settings.json
  const settingsPath = path.join(HOME, '.claude', 'settings.json');
  let enabledPlugins = {};
  const settingsContent = readFile(settingsPath);
  if (settingsContent) {
    try {
      const settings = JSON.parse(settingsContent);
      enabledPlugins = settings.enabledPlugins || {};
    } catch { /* ignore parse errors */ }
  }
  // Extract plugin name portion (before @)
  const enabledPluginNames = new Set(
    Object.keys(enabledPlugins)
      .filter(k => enabledPlugins[k])
      .map(k => k.split('@')[0])
  );

  for (const jsonFile of ['agent-routing.json', 'skill-routing.json']) {
    const filePath = path.join(lookupDir, jsonFile);
    if (!fs.existsSync(filePath)) continue;

    const content = readFile(filePath);
    if (!content) continue;

    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      addError(jsonFile, `Invalid JSON: ${e.message}`);
      continue;
    }

    // Walk all entries looking for path:, source:, fallback_to:, and triggers
    const triggersByCategory = new Map(); // category -> Map<trigger, agentName>

    function walkEntries(obj, category) {
      if (!obj || typeof obj !== 'object') return;

      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          // Check if this is an agent/skill entry
          if (value.path) {
            // Resolve ~ to HOME
            const resolvedPath = value.path.replace(/^~/, HOME);
            if (!fs.existsSync(resolvedPath)) {
              addError(jsonFile, `path '${value.path}' does not exist (entry: ${key})`);
            }
          }

          if (value.source && typeof value.source === 'string') {
            if (value.source.startsWith('plugin:')) {
              const pluginName = value.source.replace('plugin:', '');
              if (!enabledPluginNames.has(pluginName)) {
                addWarning(jsonFile, `source '${value.source}' references disabled/unknown plugin (entry: ${key})`);
              }
            }
            // Skip user:* entries — not plugin refs
          }

          if (value.fallback_to) {
            // fallback_to should reference an existing agent entry
            // Forward-looking — not currently used, but validate when present
            const fbName = value.fallback_to;
            let found = false;
            function findAgent(obj) {
              if (!obj || typeof obj !== 'object') return;
              for (const [k, v] of Object.entries(obj)) {
                if (k === fbName && v && typeof v === 'object' && (v.path || v.source)) {
                  found = true;
                  return;
                }
                if (v && typeof v === 'object' && !Array.isArray(v)) findAgent(v);
              }
            }
            if (data.agents) findAgent(data.agents);
            if (!found) {
              addError(jsonFile, `fallback_to '${fbName}' in ${key} references non-existent agent`);
            }
          }

          // Track triggers for duplicate detection
          if (value.triggers && Array.isArray(value.triggers)) {
            const cat = category || 'root';
            if (!triggersByCategory.has(cat)) {
              triggersByCategory.set(cat, new Map());
            }
            const catTriggers = triggersByCategory.get(cat);
            for (const trigger of value.triggers) {
              if (catTriggers.has(trigger)) {
                addWarning(jsonFile, `Duplicate trigger '${trigger}' in category '${cat}' (${catTriggers.get(trigger)} and ${key})`);
              } else {
                catTriggers.set(trigger, key);
              }
            }
          }

          // Recurse into nested categories
          walkEntries(value, key);
        }
      }
    }

    // Start walking from known top-level keys
    if (data.agents) walkEntries(data.agents, null);
    if (data.plugins) walkEntries(data.plugins, null);
    if (data.skills) walkEntries(data.skills, null);
  }
}

// --- Pass 5: Cross-Artifact Consistency ---

function pass5Consistency(baseDir) {
  const lookupDir = path.join(baseDir, 'lookup');
  if (!fs.existsSync(lookupDir)) return;

  // Collect all agent .md files
  const agentFiles = new Set();
  const agentsDir = path.join(baseDir, 'agents');
  if (fs.existsSync(agentsDir)) {
    function collectAgentFiles(dir) {
      if (shouldSkip(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          collectAgentFiles(path.join(dir, entry.name));
        } else if (entry.name.endsWith('.md')) {
          const isGlobalRoot = dir === path.join(HOME, '.claude', 'agents');
          if (isGlobalRoot && GSD_AGENT_RE.test(entry.name)) continue;
          agentFiles.add(path.join(dir, entry.name));
        }
      }
    }
    collectAgentFiles(agentsDir);
  }

  // Collect all skill dirs with SKILL.md
  const skillDirs = new Set();
  const skillsDir = path.join(baseDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillMd)) {
        skillDirs.add(entry.name);
      }
    }
  }

  // Collect all routed paths from routing JSON files
  const routedAgentPaths = new Set();
  const routedSkillNames = new Set();

  function collectRoutedEntries(obj, type) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value.path) {
          const resolved = value.path.replace(/^~/, HOME);
          if (type === 'agents') routedAgentPaths.add(resolved);
        }
        // For skill routing, track skill names referenced with invoke: or path:
        if (type === 'skills' && value.invoke) {
          // invoke format: "superpowers:brainstorming" or "continuity"
          // Extract the skill name (last segment after colon, or whole string)
          const parts = value.invoke.split(':');
          routedSkillNames.add(parts[parts.length - 1]);
        }
        collectRoutedEntries(value, type);
      }
    }
  }

  // Process agent-routing.json
  const agentRoutingPath = path.join(lookupDir, 'agent-routing.json');
  if (fs.existsSync(agentRoutingPath)) {
    const content = readFile(agentRoutingPath);
    if (content) {
      try {
        const data = JSON.parse(content);
        if (data.agents) collectRoutedEntries(data.agents, 'agents');
      } catch { /* skip */ }
    }
  }

  // Process skill-routing.json
  const skillRoutingPath = path.join(lookupDir, 'skill-routing.json');
  if (fs.existsSync(skillRoutingPath)) {
    const content = readFile(skillRoutingPath);
    if (content) {
      try {
        const data = JSON.parse(content);
        if (data.plugins) collectRoutedEntries(data.plugins, 'skills');
        if (data.skills) collectRoutedEntries(data.skills, 'skills');
      } catch { /* skip */ }
    }
  }

  // Check: agents in routing JSON have matching .md files
  // (path: checks already done in Pass 4 — this catches source: refs)

  // Check: skills in routing JSON have matching SKILL.md (user skills only)
  for (const skillName of routedSkillNames) {
    // Only check user skills (skip plugin-provided skill names)
    const skillMdPath = path.join(baseDir, 'skills', skillName, 'SKILL.md');
    if (skillDirs.has(skillName) && !fs.existsSync(skillMdPath)) {
      addError('skill-routing.json', `Skill '${skillName}' referenced but SKILL.md not found at skills/${skillName}/`);
    }
  }

  // Check: orphaned agent files (in agents/ but not in routing) — advisory
  for (const agentFile of agentFiles) {
    if (!routedAgentPaths.has(agentFile)) {
      addWarning(relPath(agentFile, baseDir), 'Agent file not referenced in agent-routing.json');
    }
  }
}

// --- Main ---

function main() {
  const scanDirs = getScanDirs();

  if (scanDirs.length === 0) {
    console.log('No .claude/ directories found to scan');
    process.exit(0);
  }

  for (const dir of scanDirs) {
    console.log(`Scanning: ${dir}`);
    pass1Skills(dir);
    pass2Commands(dir);
    pass3Agents(dir);
    pass4Routing(dir);
    pass5Consistency(dir);
  }

  // Output results
  for (const e of results.errors) {
    console.error(`[ERROR] ${e.file}: ${e.msg}`);
  }
  for (const w of results.warnings) {
    console.warn(`[WARN]  ${w.file}: ${w.msg}`);
  }

  if (results.errors.length > 0 || results.warnings.length > 0) {
    console.log('───');
  }
  console.log(`${results.errors.length} error(s), ${results.warnings.length} warning(s)`);

  if (results.errors.length > 0) {
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: Run the validator against ~/.claude/ and check output**

Run:
```bash
node ~/.claude/hooks/validate-claude-artifacts.js --path ~/.claude/
```
Expected: Should produce 0 errors for existing valid artifacts. May produce warnings for agents missing `model`/`tools` fields and commands missing `description`. No false positives on GSD agents. No errors from plugin directories.

- [ ] **Step 3: Fix any false positives discovered in Step 2**

Review the output. If any existing valid artifacts produce errors, adjust the validation logic. Common issues to watch for:
- `learned/` directory being flagged (should be skipped — no SKILL.md)
- GSD agents being scanned (should be skipped by `GSD_AGENT_RE`)
- Commands in subdirectories with cross-references to other plugins' commands (should warn, not error, if command not found locally)

- [ ] **Step 4: Commit Layer 2**

```bash
git add ~/.claude/hooks/validate-claude-artifacts.js
git commit -m "feat: add comprehensive pre-commit artifact validator (Layer 2)"
```

---

## Task 3: Wire Hook into settings.json

**Files:**
- Modify: `~/.claude/settings.json` (PreToolUse array, after md/txt blocker entry)

- [ ] **Step 1: Add the PreToolUse hook entry**

In `~/.claude/settings.json`, add this entry to the `hooks.PreToolUse` array, after the md/txt file blocker (index 1) and before the prompt-guard (index 2):

```json
{
  "matcher": "Write",
  "hooks": [
    {
      "type": "command",
      "command": "node \"$HOME/.claude/hooks/validate-artifact.js\"",
      "timeout": 5
    }
  ]
}
```

The PreToolUse array should now have 4 entries:
1. strategic-compact (matcher: "")
2. md/txt file blocker (complex matcher)
3. **validate-artifact** (matcher: "Write") ← NEW
4. prompt-guard (matcher: "Write|Edit")

- [ ] **Step 2: Verify settings.json is valid JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync(process.env.HOME + '/.claude/settings.json', 'utf-8')); console.log('Valid JSON')"
```
Expected: "Valid JSON"

- [ ] **Step 3: Test the hook fires on a real Write operation**

Start a new Claude Code session and attempt to create a skill with missing frontmatter. The hook should block it. Then create a valid skill — the hook should allow it.

- [ ] **Step 4: Commit settings.json change**

```bash
git add ~/.claude/settings.json
git commit -m "feat: wire validate-artifact hook into PreToolUse"
```

---

## Task 4: Integration Testing

- [ ] **Step 1: Test full Layer 1 + Layer 2 flow**

Create a temporary test skill with intentional errors:
```bash
mkdir -p /tmp/test-claude/.claude/skills/bad-skill
echo "No frontmatter" > /tmp/test-claude/.claude/skills/bad-skill/SKILL.md
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `[ERROR] skills/bad-skill/SKILL.md: Missing frontmatter block`

- [ ] **Step 2: Test with valid artifacts**

```bash
mkdir -p /tmp/test-claude/.claude/skills/good-skill
cat > /tmp/test-claude/.claude/skills/good-skill/SKILL.md << 'EOF'
---
name: good-skill
description: A valid test skill
---

This skill does things.
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `0 error(s), 0 warning(s)`

- [ ] **Step 3: Test agent validation with mixed valid/invalid**

```bash
mkdir -p /tmp/test-claude/.claude/agents/core
cat > /tmp/test-claude/.claude/agents/core/valid.md << 'EOF'
---
model: opus
tools: ["Read", "Write"]
---
A valid agent.
EOF
cat > /tmp/test-claude/.claude/agents/core/invalid.md << 'EOF'
---
model: gpt4
---
Invalid model.
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: 1 error (invalid model), 1 warning (missing tools on valid.md)

- [ ] **Step 4: Test routing integrity with a stale path**

```bash
mkdir -p /tmp/test-claude/.claude/lookup
cat > /tmp/test-claude/.claude/lookup/agent-routing.json << 'EOF'
{
  "version": "1.0.0",
  "agents": {
    "core": {
      "ghost-agent": {
        "path": "~/.claude/agents/core/does-not-exist.md",
        "triggers": ["ghost"]
      }
    }
  }
}
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `[ERROR] agent-routing.json: path '~/.claude/agents/core/does-not-exist.md' does not exist`

- [ ] **Step 5: Test duplicate skill name detection**

```bash
mkdir -p /tmp/test-claude/.claude/skills/dup-a /tmp/test-claude/.claude/skills/dup-b
cat > /tmp/test-claude/.claude/skills/dup-a/SKILL.md << 'EOF'
---
name: same-name
description: First skill
---
Content
EOF
cat > /tmp/test-claude/.claude/skills/dup-b/SKILL.md << 'EOF'
---
name: same-name
description: Second skill
---
Content
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `[ERROR]` for duplicate skill name `same-name` and name-directory mismatch.

- [ ] **Step 6: Test command cross-reference warnings**

```bash
mkdir -p /tmp/test-claude/.claude/commands/test
cat > /tmp/test-claude/.claude/commands/test/real.md << 'EOF'
---
description: A real command
---
This command references `/test:fake` which does not exist.
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `[WARN]` about `/test:fake` not found locally.

- [ ] **Step 7: Test orphaned agent detection (Pass 5)**

```bash
mkdir -p /tmp/test-claude/.claude/agents/core /tmp/test-claude/.claude/lookup
cat > /tmp/test-claude/.claude/agents/core/orphan.md << 'EOF'
---
model: opus
tools: ["Read"]
---
An orphaned agent.
EOF
cat > /tmp/test-claude/.claude/lookup/agent-routing.json << 'EOF'
{
  "version": "1.0.0",
  "agents": {}
}
EOF
node ~/.claude/hooks/validate-claude-artifacts.js --path /tmp/test-claude/.claude/
```
Expected: `[WARN]` that `agents/core/orphan.md` is not referenced in agent-routing.json.

- [ ] **Step 8: Clean up test fixtures**

```bash
rm -rf /tmp/test-claude
```

- [ ] **Step 9: Run final validation against real ~/.claude/**

```bash
node ~/.claude/hooks/validate-claude-artifacts.js
```
Expected: 0 errors. Review all warnings to confirm they are genuine advisory items, not false positives.

- [ ] **Step 10: Final commit if any fixes were made**

```bash
git add ~/.claude/hooks/validate-artifact.js ~/.claude/hooks/validate-claude-artifacts.js
git commit -m "fix: address integration test findings"
```
(Skip if no changes needed.)
