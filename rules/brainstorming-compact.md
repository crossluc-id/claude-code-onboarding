# Brainstorming → Planning: Autonomous Compact

After completing the superpowers:brainstorming workflow (spec review loop passed, user approves spec), ALWAYS execute these steps before invoking superpowers:writing-plans:

1. Write a compact handoff to `docs/superpowers/compact-handoff.md`:
   - Feature name and key design decisions
   - Spec file path
   - Next action: invoke writing-plans with spec path and arguments

2. Run `/compact` with a focused transition summary:
   ```
   /compact Spec approved at <spec-path>. Next: invoke superpowers:writing-plans for <feature-name>.
   ```

3. After compact, invoke superpowers:writing-plans with the spec path

This step is autonomous — do not ask for permission. The spec is on disk, the handoff preserves context, and writing-plans benefits from fresh context without brainstorming exploration noise.
