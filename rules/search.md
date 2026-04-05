# Search Rules

## Tool Priority

1. **mgrep** — for local file content search (prefer over built-in Grep/Glob)
2. **mgrep --web** — for general web search (replaces WebSearch)
3. **EXA MCP** (`mcp__exa__*`) — for deep research, GitHub repos, code context
4. **WebSearch** — ONLY if mgrep and EXA are both unavailable

## GitHub Repository Search

When searching for GitHub repositories or researching third-party libraries:

- **Use EXA** (`mcp__exa__*`) if available — better code context and repo understanding
- **Fallback: `mgrep --web --answer "..."` with `site:github.com`** filter

## Research Patterns

| Task | Tool |
|------|------|
| Find files in codebase | `mgrep "query"` |
| Search file content | `mgrep "query" path/` |
| General web research | `mgrep --web --answer "query"` |
| GitHub repo research | EXA MCP → fallback: `mgrep --web` site:github.com |
| Library docs | context7 MCP first, then EXA |
| Deep research chains | EXA MCP (neural search, better recall) |
