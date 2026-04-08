# Artifact Validation System — Design Spec

**Date**: 2026-04-05
**Status**: Approved
**Scope**: Hybrid enforcement for Claude Code skill/command/agent creation

## Problem

Rules for creating skills, commands, and agents exist as documentation but enforcement is almost entirely advisory. Plugin-sourced content has CI validation, but user-created content bypasses all of it. This leads to:

- Skills with missing/invalid frontmatter that fail silently at runtime
- Agents with invalid model declarations
- Routing tables pointing to deleted files
- Duplicate names across user + plugin namespaces with no warning
- Commands with empty content occupying namespace slots

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Global `~/.claude/` + project-level `.claude/` | Covers all user content; plugins have their own CI |
| Enforcement mode | Hard block on critical, advisory on soft | Prevents broken artifacts without being rigid during iteration |
| Validator architecture | Single unified script (not forked plugin scripts) | Simpler to maintain, our own stricter rules |
| Routing validation | Structural integrity only | Semantic trigger-to-content matching would be noisy and brittle |
| Approach | Layered hybrid (hook + pre-commit) | Hook catches structural issues instantly; pre-commit catches semantic issues before commit |

## Architecture

### Layer 1: PreToolUse Hook (`validate-artifact.js`)

**File**: `~/.claude/hooks/validate-artifact.js`
**Trigger**: PreToolUse on **Write only** (Edit validation deferred to Layer 2)
**Targets**: Files matching `*/skills/*/SKILL.md`, `*/commands/**/*.md`, `*/agents/**/*.md`, `*/agents/*.md`
**Skips**: Paths containing `plugins/cache/` or `plugins/marketplaces/`

**Why Write-only**: Edit operations provide `old_string`/`new_string` fragments, not the full file. Reconstructing the complete file requires disk I/O + replacement logic + handling `replace_all`. This adds latency and edge cases (file not yet flushed, partial frontmatter edits). Layer 2 catches Edit-induced issues at commit time instead.

#### Hard Block Rules

| Artifact | Check |
|----------|-------|
| SKILL.md | Has `---` frontmatter block |
| SKILL.md | `name` field present and non-empty |
| SKILL.md | `description` field present and non-empty |
| Command .md | Non-empty content (>10 chars after frontmatter) |
| Agent .md (user dirs only) | Has frontmatter block |
| Agent .md (user dirs only) | If `model` field present, value must be in `[haiku, sonnet, opus]` |

**Agent scope note**: Agent validation targets user-created agent directories (`agents/core/`, `agents/review+test/`, `agents/research+docs/`) and any project `.claude/agents/`. GSD plugin agents (flat files like `agents/gsd-*.md`) are skipped — they use a different schema (`color`, `permissionMode`) managed by the GSD plugin's own tooling. Detection: skip files matching `agents/gsd-*.md` at the `~/.claude/` level.

#### Advisory Warning Rules

| Artifact | Check |
|----------|-------|
| SKILL.md | `description` under 1024 chars |
| SKILL.md | `name` matches directory name (lowercase-with-hyphens) |
| Command .md | Has `description` in frontmatter |
| Agent .md (user dirs) | Has `model` field (missing = unpredictable routing) |
| Agent .md (user dirs) | Has `tools` field |

#### Behavior

- Receives tool_input via stdin (standard hook protocol)
- Implements 3-second stdin timeout (consistent with existing hooks like `gsd-prompt-guard.js`): `setTimeout(() => process.exit(0), 3000)`
- Extracts `file_path` and `content` from `tool_input` (Write operations only)
- Only parses frontmatter (first `---` to second `---`), target <50ms after stdin received
- Hard block: exits with code 1 + error message on stderr
- Advisory: outputs `hookSpecificOutput.additionalContext` warning, exits 0
- Ignores Edit operations (exits 0 immediately if `tool_name !== 'Write'`)

### Layer 2: Pre-Commit Validator (`validate-claude-artifacts.js`)

**File**: `~/.claude/hooks/validate-claude-artifacts.js`
**Trigger**: Pre-commit git hook / manual invocation
**Invocation**: `node ~/.claude/hooks/validate-claude-artifacts.js [--path <dir>]`
**Default scan**: `~/.claude/` + `$(git rev-parse --show-toplevel)/.claude/` if it exists
**Skips**: `plugins/cache/`, `plugins/marketplaces/`

#### Pass 1: Skill Validation

| Check | Mode |
|-------|------|
| SKILL.md exists in each skill dir (skip dirs without SKILL.md — e.g., `learned/` is a pattern archive, not a skill) | Error |
| Required frontmatter (`name`, `description`) | Error |
| `name` matches directory name | Error |
| `description` ≤ 1024 chars | Warning |
| No duplicate `name` values across all scanned skill dirs | Error |
| Referenced files exist (`references/`, `scripts/`) | Warning |

#### Pass 2: Command Validation

| Check | Mode |
|-------|------|
| Non-empty content | Error |
| Valid cross-references: regex `` `\/([a-z][-a-z0-9:]*)` `` in body text (outside fenced code blocks) must resolve to a known command. Matches both `/learn` and `/gsd:plan-phase` namespaced forms. | Error |
| Frontmatter `description` present | Warning |
| No duplicate derived command names across global + project scope. Derived name = `<dir>:<filename>` (e.g., `gsd/do.md` → `gsd:do`). Root-level commands use filename only. | Warning |

#### Pass 3: Agent Validation

Scans user agent directories only. Skips GSD plugin agents (`gsd-*.md` at `~/.claude/agents/` root level) — these use a different schema managed by the GSD plugin.

| Check | Mode |
|-------|------|
| Frontmatter exists | Error |
| If `model` present, value in `[haiku, sonnet, opus]` | Error |
| `model` field present | Warning |
| `tools` field present | Warning |
| No duplicate agent filenames across scanned dirs | Warning |

#### Pass 4: Routing JSON Integrity

Scans `agent-routing.json` and `skill-routing.json`:

| Check | Mode |
|-------|------|
| Every `path:` value points to existing file | Error |
| Every `source: plugin:X` references enabled plugin in `settings.json` `enabledPlugins`. Key mapping: match `X` against the portion before `@` in enabledPlugins keys (e.g., `plugin:everything-claude-code` → `everything-claude-code@everything-claude-code`). Skip `source: user:*` entries — these are user paths, not plugin refs. | Warning |
| No duplicate trigger keywords in same category | Warning |
| If `fallback_to` field present, referenced agent exists | Error |

**Note on `fallback_to`**: This field is not currently used in any routing entry. The check is forward-looking — validates the reference only when the field is present. Absence of `fallback_to` is always valid.

#### Pass 5: Cross-Artifact Consistency

| Check | Mode |
|-------|------|
| Agents in routing JSON have matching `.md` files | Error |
| Skills in routing JSON have matching SKILL.md | Error |
| Agent `.md` files not in routing JSON | Warning |

#### Output Format

```
[ERROR] skills/foo/SKILL.md: missing required field 'name'
[WARN]  commands/bar.md: no 'description' in frontmatter
[ERROR] agent-routing.json: path '~/.claude/agents/core/old-agent.md' does not exist
───
2 errors, 1 warning
```

Exit code 1 if any errors (blocks commit). Warnings don't block.

### Integration

#### settings.json Hook Registration

New PreToolUse entry placed after the md/txt file blocker, before prompt-guard:

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

**Hook ordering interaction**: The md/txt file blocker (existing) uses a complex matcher that rejects unexpected `.md`/`.txt` filenames but explicitly allows `SKILL.md`. Our hook uses `matcher: "Write"` which is broader but self-filters by path pattern internally. The blocker runs first and rejects disallowed filenames before our hook ever sees them — no conflict.

#### Pre-Commit Wiring

- **For `~/.claude/`**: Manual invocation via alias `claude-validate` or wired into commit-commands
- **For project repos**: Add to pre-commit hook chain (husky, lefthook, or bare `.git/hooks/pre-commit`)
- Script auto-detects project `.claude/` and scans alongside global

## Layer Overlap (Defense in Depth)

Some checks intentionally appear in both layers:
- SKILL.md frontmatter presence/fields: Layer 1 (hard block) + Layer 2 Pass 1 (Error)
- Agent model validation: Layer 1 (hard block) + Layer 2 Pass 3 (Error)
- Command non-empty: Layer 1 (hard block) + Layer 2 Pass 2 (Error)

**Rationale**: Layer 1 prevents creation of broken artifacts during a Claude Code session. Layer 2 catches artifacts modified outside Claude Code (direct file edits, git operations, scripts) or via Edit operations that Layer 1 intentionally skips. Both layers are needed.

## Performance Notes

- **Layer 2 directory traversal**: Skip logic uses path-prefix filtering during `fs.readdirSync` walk, not post-filtering. The `plugins/` directory is never entered, avoiding traversal of 90+ plugin skill directories.
- **Layer 2 settings.json dependency**: Pass 4 (`source: plugin:X` check) reads `settings.json` to get the `enabledPlugins` map. This is the only external file dependency beyond the scanned directories.

## Out of Scope

- Semantic trigger-to-content matching
- Auto-fix capabilities
- Plugin directory scanning (they have their own CI)
- settings.json validation
- Learning system instinct-to-skill conversion validation

## File Inventory

| File | Type | Purpose |
|------|------|---------|
| `~/.claude/hooks/validate-artifact.js` | New — PreToolUse hook | Real-time structural validation |
| `~/.claude/hooks/validate-claude-artifacts.js` | New — standalone script | Comprehensive pre-commit validation |
| `~/.claude/settings.json` | Edit — add hook entry | Wire the PreToolUse hook |
