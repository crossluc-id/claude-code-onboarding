# Active Hooks

## Global (~/.claude/settings.json)

### SessionStart
- `cleanup-claude-mem-files.sh` — cleans stale auto-generated CLAUDE.md files from claude-mem

### PreToolUse
- `suggest-compact.sh` — suggests manual `/compact` at configurable tool-call threshold (default 50, reminds every 25 after)
- md/txt file blocker — prevents creation of random .md/.txt files (allows README, CLAUDE, AGENTS, CONTRIBUTING, SKILL, MEMORY)

### PostToolUse
- console.log warner — warns about `console.log` in JS/TS files after edit

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
