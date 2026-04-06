#!/bin/bash
# Advisor Nudge — SessionStart hook
#
# Lightweight prompt that reminds the agent to observe the project with
# fresh eyes. Doesn't scan files or run checks — just sets the mindset.
#
# The actual intelligence comes from the agent's own reasoning about
# what it finds, informed by contexts/advisor.md when loaded.
#
# Fires once per session, writes a nudge to stderr that surfaces in context.

SESSION_ID="${CLAUDE_SESSION_ID:-default}"
NUDGE_FILE="/tmp/claude-advisor-nudge-${SESSION_ID}"

# Only nudge once per session
if [ -f "$NUDGE_FILE" ]; then
  exit 0
fi

touch "$NUDGE_FILE"

# Brief nudge — not a checklist, just a prompt to observe
cat >&2 << 'EOF'
[Advisor] Fresh session. Before diving in, take a moment to notice:
What exists in this project that could be connected, synthesized, or built upon?
If something comes to mind, mention it — one idea, framed as an opportunity.
EOF
