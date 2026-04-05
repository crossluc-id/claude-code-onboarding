# Shared Libraries

These utility files power hooks and scripts. They're used by the hook system
and can be imported when you build your own custom hooks.

| File | What It Does |
|------|-------------|
| **utils.js** | Cross-platform file ops, git helpers, date/time, hook I/O |
| **package-manager.js** | Auto-detects npm/pnpm/yarn/bun and returns correct commands |
| **session-manager.js** | Session CRUD — create, read, list, delete session files |
| **session-aliases.js** | Named aliases for sessions (e.g., "auth-debug" instead of file IDs) |

## Usage

These are imported by hooks like:
```javascript
const path = require('path');
const { readFile, writeFile, getClaudeDir } = require(path.join(require('os').homedir(), '.claude/lib/utils.js'));
```

You don't need to modify these unless you're building custom hooks.
