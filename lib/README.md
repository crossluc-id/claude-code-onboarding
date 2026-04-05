# Shared Libraries

These utility files power hooks and scripts. They're used by the hook system
and can be imported when you build your own custom hooks.

| File | What It Does |
|------|-------------|
| **utils.js** | Cross-platform file ops, git helpers, date/time, hook I/O |
| **package-manager.js** | Auto-detects npm/pnpm/yarn/bun and returns correct commands |
| **session-manager.js** | Session CRUD — create, read, list, delete .tmp session files |
| **session-aliases.js** | Named aliases for sessions (e.g., "auth-debug" instead of file IDs) |

## Usage

Hooks in `~/.claude/hooks/` import these via relative path:
```javascript
// From a hook in ~/.claude/hooks/
const { readFile, writeFile, getClaudeDir } = require('../lib/utils.js');
```

Or using an absolute path from anywhere:
```javascript
const path = require('path');
const libDir = path.join(require('os').homedir(), '.claude', 'lib');
const { readFile } = require(path.join(libDir, 'utils.js'));
```

You don't need to modify these unless you're building custom hooks.
