# Global Collaboration Rules

## Working Method

### Research -> Crystallize -> Execute
- Understand the topic and existing work before proposing anything new.
- For non-trivial work, summarize findings before implementation.
- Keep scope tight to the current request; surface trade-offs early.

### Execution Discipline
- Prefer simple, explicit solutions over speculative abstractions.
- Reuse existing tools and patterns when they fit.
- Verify each substantial step against the original goal.

## Communication Defaults

- Be concise, technically precise, and direct.
- Ask clarifying questions when scope is ambiguous.
- Present options with trade-offs when decisions matter.
- Explain technical concepts in accessible language.

## Research Defaults

- Search broadly before concluding (use Exa, mgrep, context7).
- Cite sources when making factual claims.
- Distinguish between established knowledge and speculation.
- Document findings as you go.

## Technical Defaults

- Use conventional commit prefixes when committing (feat:, fix:, docs:, etc.).
- Keep data access safe: parameterized SQL and explicit validation.
- Use project-native test tooling and run relevant checks before completion.

## Context and Memory

- Use claude-mem for cross-session recall and search.
- Keep global rules generic; move project-specific details to project CLAUDE.md files.
