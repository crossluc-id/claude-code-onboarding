# Schema Rules

## Universal Database Safety

- Treat schema as source of truth: confirm table/column names before writing queries.
- Always use parameterized SQL (`$1`, `$2`, ...) and avoid string concatenation.
- Prefer explicit casts when types can be ambiguous (e.g., UUID arrays, JSONB).
- For generated/derived columns, check constraints before writing update logic.
- Validate migration ordering and idempotence before applying to shared environments.

## Query Hygiene

- Verify naming parity between ORM symbols and physical table names.
- Use read-only tooling for discovery and scripted migrations for writes.
- Record schema deltas in a project-local plan or migration notes.
