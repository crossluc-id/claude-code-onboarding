# Claude Code Concepts — Quick Reference

Claude Code is a terminal-based AI assistant. Out of the box it's powerful, but
you can extend it with **5 building blocks**. Here's what each one is:

---

## 1. Skills

**What:** Packaged expertise that Claude loads automatically when relevant.
**Where:** `~/.claude/skills/<name>/SKILL.md`
**Example:** A "research" skill that teaches Claude how to do deep academic research.

Skills activate by context — you don't need to call them. Claude reads the
skill description and loads it when the situation matches.

**Learn more after setup:** Read `~/.claude/references/skill-writing-research.md`

---

## 2. Commands

**What:** Shortcuts you type to trigger a specific workflow.
**Where:** `~/.claude/commands/<name>.md`
**How:** Type `/command-name` in Claude Code.
**Example:** `/commit` creates a git commit with a good message.

Commands in subdirectories use colon namespaces:
`commands/git/commit.md` → `/git:commit`

---

## 3. Agents

**What:** Specialized sub-assistants that Claude delegates to for specific tasks.
**Where:** `~/.claude/agents/<name>.md`
**Example:** A "code-reviewer" agent that only does code review.

You don't call agents directly — Claude spawns them when needed. Plugins
provide many pre-built agents (ECC has 25+).

---

## 4. Hooks

**What:** Scripts that run automatically at specific moments.
**Where:** Configured in `~/.claude/settings.json` under `"hooks"`.
**Trigger points:**
- **SessionStart** — when you open Claude Code
- **PreToolUse** — before Claude reads/writes a file
- **PostToolUse** — after Claude reads/writes a file
- **Stop** — when Claude finishes responding

**Example:** A hook that warns you if Claude writes `console.log` in your code.

---

## 5. MCP Servers

**What:** External tools that give Claude new capabilities (web search, databases, APIs).
**Where:** `~/.claude/.mcp.json`
**Example:** Exa MCP gives Claude neural web search. GitHub MCP lets it create PRs.

MCP = Model Context Protocol. Each server is a small process that Claude talks
to for specific operations.

---

## 6. Rules

**What:** Always-on instructions that shape Claude's behavior.
**Where:** `~/.claude/rules/*.md`
**Example:** "Always use parameterized SQL" or "Search with mgrep before grep".

Rules are loaded every session. They're simpler than skills — just behavioral
guidelines.

---

## 7. CLAUDE.md

**What:** Your master instruction file. Claude reads this at the start of every session.
**Where:** `~/.claude/CLAUDE.md` (global) or `<project>/CLAUDE.md` (per-project)

Think of it as your collaboration contract with Claude.

---

## How They Work Together

```
You type a message
    ↓
CLAUDE.md + Rules load (always)
    ↓
Skills activate if context matches
    ↓
Hooks fire at trigger points
    ↓
Claude may spawn Agents for specialized tasks
    ↓
MCP Servers provide external capabilities
    ↓
Commands run when you type /something
```

## Further Reading

After setup, these guides go deeper:
- **ECC Shortform Guide:** `~/.claude/plugins/marketplaces/everything-claude-code/the-shortform-guide.md`
- **ECC Longform Guide:** `~/.claude/plugins/marketplaces/everything-claude-code/the-longform-guide.md`
- **Superpowers README:** `~/.claude/plugins/marketplaces/superpowers-dev/README.md`
- **Skill Writing Research:** `~/.claude/references/skill-writing-research.md`
