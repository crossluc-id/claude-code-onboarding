# Active Hooks

## Global (~/.claude/settings.json)

### SessionStart
- `cleanup-claude-mem-files.sh` — cleans stale auto-generated CLAUDE.md files from claude-mem
- `advisor-nudge.sh` — once per session, prompts the agent to observe the project with fresh eyes and suggest opportunities

### PreToolUse
- `suggest-compact.sh` — suggests manual `/compact` at configurable tool-call threshold (default 50, reminds every 25 after)
- `block-junk-docs.js` — prevents creation of random .md/.txt files (allows README, CLAUDE, AGENTS, CONTRIBUTING, SKILL, MEMORY)
- `validate-artifact.js` — validates skills, commands, and agents in real-time (blocks broken frontmatter, warns on quality issues)

### PostToolUse
- `warn-console-log.js` — warns about `console.log` in JS/TS files after edit

## Adding Project-Level Hooks

For project-specific hooks, add them to `<project>/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "your-script-here.sh" }]
      }
    ]
  }
}
```
