# Claude Code Onboarding Kit

Welcome! This folder will help you set up Claude Code from scratch with a
powerful, research-oriented configuration.

## Choose Your Path

- **New to terminals and code?** Start with **GETTING-STARTED.md** — a gentle,
  plain-language walkthrough. This is the recommended starting point.
- **Comfortable in a terminal?** Use **SETUP-GUIDE.md** — the full power-user
  setup (a superset: more plugins, optional API keys, project scaffolding).

Either way, drop this whole folder into a Claude Code session and say:
**"Read GETTING-STARTED.md and walk me through it step by step"** (swap in
SETUP-GUIDE.md if you chose the technical path).

## What's Inside

| File | Purpose |
|------|---------|
| **GETTING-STARTED.md** | Gentle, non-technical walkthrough — the recommended starting point |
| **SETUP-GUIDE.md** | Full technical walkthrough — power-user superset (more plugins, optional API keys) |
| **CLAUDE.md** | Your global collaboration rules (goes to `~/.claude/CLAUDE.md`) |
| **settings-template.json** | Pre-configured settings with hooks and permissions |
| **mcp-template.json** | MCP server configurations for research tools |
| **rules/** | Universal best-practice rules for Claude's behavior |
| **hooks/** | Automation scripts that run during your sessions |
| **lib/** | Shared utility libraries for hooks and scripts |
| **contexts/** | Mode-switching contexts (research mode, advisor mode) |
| **commands/** | Custom commands (`/what-next` — fresh-eyes project suggestions) |
| **references/** | Guides on writing skills, commands, and agents |
| **docs/** | Plugin audit and reference materials |
| **CONCEPTS.md** | Quick explainer: what are skills, commands, agents, hooks? |
| **RESEARCH-PROFILE.md** | Starter profile for research-focused work |

## How To Use

1. Pick your path above (most people: **GETTING-STARTED.md**).
2. Install Claude Code (see your chosen guide's install step).
3. Open a terminal and run `claude`.
4. Paste: "Read /path/to/this/folder/GETTING-STARTED.md and follow it step by step"
   (swap in SETUP-GUIDE.md if you chose the technical path).
5. Claude will walk you through everything.

## Need Help?

- Claude Code docs: https://docs.claude.com/en/docs/claude-code
- ECC guides: after plugin install, check `~/.claude/plugins/marketplaces/ecc/the-shortform-guide.md`
- Superpowers: https://github.com/obra/superpowers
- Report issues: https://github.com/anthropics/claude-code/issues
