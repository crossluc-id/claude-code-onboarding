# Compact Handoff — 2026-04-08

## Current: Human Onboarding Layer — EXECUTE

Spec approved and review-fixed. Ready for autonomous execution.

### Spec
`docs/superpowers/specs/2026-04-07-human-onboarding-layer-design.md`

### Deliverables (4 documents)
1. **`/workspace/GETTING-STARTED.md`** — Main guide: install Zed, terminal basics, install Claude Code, configure ~/.claude/, first project (website or idea exploration), ecosystem discovery
2. **`/workspace/docs/onboarding/concepts.md`** — Reference: what plugins/skills/agents/MCP servers/contexts/lookups are, in plain language
3. **`/workspace/docs/onboarding/method.md`** — Philosophy: adaptive feedback loop, advisor principles, compound engineering, Sub/Loom intro
4. **`/workspace/docs/onboarding/learning-path.md`** — Curated external resources organized by week

### Key constraints
- macOS only, Claude Pro ($20/mo), Zed editor
- Audience: intelligent non-developers, needs terminal basics explained
- Warm, direct tone — like a friend explaining in person
- Configuration (Step 6) BEFORE first project (Step 7)
- Core plugins: superpowers, ECC, compound-engineering, claude-mem
- Two first-project paths: website creation OR idea exploration
- method.md: outcome-oriented language, no implementation jargon (no "hooks", "PreToolUse")
- No duplication of ecosystem-discovery.json content
- See "Implementation Notes for Executor" section in spec for full constraints

### Source files executor needs
- Ecosystem map: `/workspace/lookup/ecosystem-discovery.json`
- Advisor context: `/workspace/contexts/advisor.md`
- Rules: `/workspace/rules/` (7 files)
- Contexts: `/workspace/contexts/` (4 files)
- Lookups: `/workspace/lookup/` (5 files)

### Next action
Use GSD (e.g., `/gsd:quick` or `/gsd:fast`) to execute all 4 documents autonomously from the spec.
