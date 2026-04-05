# Cross-Caller Consistency Rule

## The Rule

When modifying ANY function's behavior, input construction, or calling pattern:

1. **Find ALL callers** of that function across the entire codebase
2. **Check each caller** for the same pattern being fixed/changed
3. **Apply the fix consistently** to every caller, not just the one you're working on
4. **Verify scripts/ too** — batch scripts often duplicate caller patterns

## Why

Fixing one caller but missing others creates silent inconsistencies.
The fix appears to work in the file you're looking at, but 3+ other files
still have the broken pattern — and you won't notice until much later.

## How to Apply

Before committing any change to a shared function or pattern:

```
1. Identify the function/pattern being changed
2. Search: grep -r "functionName\|patternName" src/ scripts/
3. List all callers in the commit message or PR description
4. Confirm each caller has been checked and either:
   - Fixed (if the same issue exists)
   - Marked as intentionally different (with comment explaining why)
```
