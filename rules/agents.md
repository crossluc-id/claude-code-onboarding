# Agents & Workflow

## Priority

1. Skills first (superpowers, installed plugins)
2. Specialized agents (from plugins like ECC, compound-engineering)
3. Generic exploration (ONLY when no specialist exists)

## Triggers

| Situation | Action |
|-----------|--------|
| Feature request | brainstorm → plan → implement (test-first) |
| Code written | at least one code review pass |
| Bug/failure | root-cause analysis before fix |
| Build error | targeted build debugging flow |
| New feature or bugfix | TDD: RED → GREEN → REFACTOR |
| Auth/input/secrets | security-focused review path |
| Database work | schema/query-focused review path |
| Before done | verification: tests pass, types check |

## Parallel Execution

- 2-3 agents max concurrent, each with ONE clear scope
- NEVER parallelize tasks touching same files

## Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Branch naming: `<type>/<short-description>`
- PRs: analyze full commit history, include test plan
