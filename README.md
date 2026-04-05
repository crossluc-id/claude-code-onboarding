# Claude Code Onboarding Kit

Welcome! This folder will help you set up Claude Code from scratch with a
powerful, research-oriented configuration. Drop this entire folder into a
Claude Code session and tell it: **"Follow the SETUP-GUIDE.md to configure
my environment."**

## What's Inside

| File | Purpose |
|------|---------|
| **SETUP-GUIDE.md** | Step-by-step walkthrough from install to fully configured |
| **CLAUDE.md** | Your global collaboration rules (goes to `~/.claude/CLAUDE.md`) |
| **settings-template.json** | Pre-configured settings with hooks and permissions |
| **mcp-template.json** | MCP server configurations for research tools |
| **rules/** | Universal best-practice rules for Claude's behavior |
| **hooks/** | Automation scripts that run during your sessions |
| **lib/** | Shared utility libraries for hooks and scripts |
| **contexts/** | Mode-switching contexts (e.g., research mode) |
| **references/** | Guides on writing skills, commands, and agents |
| **CONCEPTS.md** | Quick explainer: what are skills, commands, agents, hooks? |
| **RESEARCH-PROFILE.md** | Starter profile for research-focused work |
| **writing-style/** | Writing style abstraction: 22 registers, 10 dimensions, interview + synthesizer |
| **test-framework/** | Automated persona testing: 2 simulated users, quality scoring, comparison reports |

## How To Use

1. Install Claude Code (see SETUP-GUIDE.md Step 1)
2. Open a terminal, run `claude`
3. Paste: "Read /path/to/this/folder/SETUP-GUIDE.md and follow it step by step"
4. Claude will walk you through everything

## Need Help?

- Claude Code docs: https://docs.anthropic.com/en/docs/claude-code
- ECC guides: after plugin install, check `~/.claude/plugins/marketplaces/everything-claude-code/the-shortform-guide.md`
- Superpowers: https://github.com/nichochar/superpowers
- Report issues: https://github.com/anthropics/claude-code/issues
