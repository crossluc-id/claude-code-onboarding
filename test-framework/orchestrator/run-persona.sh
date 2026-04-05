#!/bin/bash
set -euo pipefail

# run-persona.sh — Runs one persona through the onboarding interaction script end-to-end.
# Usage: bash test-framework/orchestrator/run-persona.sh <persona-slug>
#
# Sends each turn from the interaction-script.yaml to `claude -p` using --bare
# for clean-room testing. Uses --resume for multi-turn sessions.
# Overrides HOME to isolate the test from the host environment.
#
# Requires: claude CLI, node (for YAML parsing)

PERSONA_SLUG="${1:?Usage: run-persona.sh <persona-slug>}"
FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ONBOARDING_DIR="$(cd "$FRAMEWORK_DIR/.." && pwd)"

echo "============================================"
echo "  Persona Test: ${PERSONA_SLUG}"
echo "============================================"
echo ""

# --- Setup isolated environment ---
source "${FRAMEWORK_DIR}/orchestrator/setup-environment.sh" "${PERSONA_SLUG}"

PERSONA_DIR="${FRAMEWORK_DIR}/personas/${PERSONA_SLUG}"
SCRIPT_FILE="${PERSONA_DIR}/interaction-script.yaml"
LOG_FILE="${TEST_HOME}/run.log"
SESSION_ID=""

if [ ! -f "${SCRIPT_FILE}" ]; then
  echo "[error] Interaction script not found: ${SCRIPT_FILE}"
  exit 1
fi

# --- Parse YAML interaction script ---
# We use a lightweight Node.js inline script to parse YAML turns,
# since we cannot depend on external YAML tools.
# Output: one JSON object per line, each containing {id, message, resume, expect_session_id}

TURNS_JSON=$(node -e "
const fs = require('fs');
const yaml = fs.readFileSync('${SCRIPT_FILE}', 'utf8');

// Minimal YAML parser for our specific format
// Extracts turns array with id, message, resume, expect_session_id
const turns = [];
let currentTurn = null;
let inMessage = false;
let messageIndent = 0;
let messageLines = [];

const lines = yaml.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (inMessage) {
    // Check if we've left the message block by indentation:
    // YAML block scalars are indented; a line at or below the key's indent level ends the block.
    // We detect end-of-block by seeing a non-empty line at low indentation that matches a known key.
    const indent = line.search(/\S/);
    const isBlockEnd = indent >= 0 && indent <= 4 &&
      (trimmed.startsWith('- id:') || trimmed.startsWith('resume:') ||
       trimmed.startsWith('expect_session_id:') || trimmed.startsWith('inject_files:'));
    if (isBlockEnd) {
      inMessage = false;
      if (currentTurn) currentTurn.message = messageLines.join('\n').trim();
      messageLines = [];
    } else {
      // Strip leading indentation relative to the message block
      const stripped = line.replace(/^ {0,6}/, '');
      messageLines.push(stripped);
      continue;
    }
  }

  if (trimmed.startsWith('- id:')) {
    if (currentTurn) {
      if (messageLines.length > 0) {
        currentTurn.message = messageLines.join('\n').trim();
        messageLines = [];
      }
      turns.push(currentTurn);
    }
    currentTurn = {
      id: trimmed.replace('- id:', '').trim(),
      message: '',
      resume: false,
      expect_session_id: false
    };
  } else if (trimmed.startsWith('resume:') && currentTurn) {
    currentTurn.resume = trimmed.includes('true');
  } else if (trimmed.startsWith('expect_session_id:') && currentTurn) {
    currentTurn.expect_session_id = trimmed.includes('true');
  } else if (trimmed.startsWith('message: |') && currentTurn) {
    inMessage = true;
    messageLines = [];
  }
}
if (currentTurn) {
  if (messageLines.length > 0) {
    currentTurn.message = messageLines.join('\n').trim();
  }
  turns.push(currentTurn);
}

turns.forEach(t => console.log(JSON.stringify(t)));
")

# --- Process [INJECT: path] markers ---
# Uses Node.js for safe multi-line string replacement (awk -v destroys newlines)
inject_files() {
  local msg="$1"
  local framework_dir="$FRAMEWORK_DIR"
  node -e "
    const fs = require('fs');
    const frameworkDir = process.argv[1];
    let msg = fs.readFileSync('/dev/stdin', 'utf8');
    const re = /\[INJECT:\s*([^\]]+)\]/g;
    let match;
    while ((match = re.exec(msg)) !== null) {
      const injectPath = match[1].trim();
      const fullPath = require('path').join(frameworkDir, injectPath);
      let replacement;
      try {
        replacement = fs.readFileSync(fullPath, 'utf8');
      } catch {
        replacement = '[FILE NOT FOUND: ' + injectPath + ']';
        process.stderr.write('[warn] Inject file not found: ' + fullPath + '\n');
      }
      msg = msg.replace(match[0], replacement);
      re.lastIndex = 0; // Reset after replacement changes string length
    }
    process.stdout.write(msg);
  " "$framework_dir" <<< "$msg"
}

# --- System prompt for onboarding persona ---
SYSTEM_PROMPT="You are running an onboarding session for Claude Code. The user is setting up Claude Code for the first time using the onboarding kit. Help them configure their environment, set up their research profile, customize rules, and install plugins. Follow the SETUP-GUIDE.md steps. When the user provides their profile, writing samples, or preferences, incorporate them into the configuration files. Create appropriate CLAUDE.md, rules, hooks, and skills based on what the user tells you about themselves and their work."

# --- Run each turn ---
# Use process substitution to avoid subshell (SESSION_ID must propagate across turns)
TURN_NUM=0
while IFS= read -r turn_json; do
  TURN_NUM=$((TURN_NUM + 1))

  # Extract all fields in a single node call
  read -r TURN_ID RESUME EXPECT_SID <<< "$(node -e "
    const t = JSON.parse(process.argv[1]);
    process.stdout.write(t.id + ' ' + t.resume + ' ' + t.expect_session_id);
  " "$turn_json")"
  RAW_MSG=$(node -e "
    const t = JSON.parse(process.argv[1]);
    process.stdout.write(t.message);
  " "$turn_json")

  # Inject file contents
  MSG=$(inject_files "$RAW_MSG")

  echo ""
  echo "--- Turn ${TURN_NUM}: ${TURN_ID} ---"
  echo "[sending] $(printf '%s' "$MSG" | head -1)..."

  # Build command as array (no eval, no injection risk)
  cmd=(claude -p --bare --output-format json --append-system-prompt "$SYSTEM_PROMPT")

  if [ "$RESUME" = "true" ] && [ -n "$SESSION_ID" ]; then
    cmd+=(--resume "$SESSION_ID")
  fi

  # Write message to temp file to avoid shell escaping issues
  MSG_FILE=$(mktemp "${TEST_HOME}/msg-XXXXXX.txt")
  printf '%s\n' "$MSG" > "$MSG_FILE"

  # Execute with HOME override for isolation
  RESPONSE_FILE="${TEST_HOME}/response-${TURN_ID}.json"

  set +e
  HOME="${TEST_HOME}" "${cmd[@]}" < "$MSG_FILE" > "$RESPONSE_FILE" 2>>"$LOG_FILE"
  EXIT_CODE=$?
  set -e

  if [ $EXIT_CODE -ne 0 ]; then
    echo "[error] claude exited with code ${EXIT_CODE} on turn ${TURN_ID}"
    echo "[error] See log: ${LOG_FILE}"
    cat "$RESPONSE_FILE" >> "$LOG_FILE" 2>/dev/null || true
    rm -f "$MSG_FILE"
    continue
  fi

  # Extract session_id from first turn
  if [ "$EXPECT_SID" = "true" ]; then
    SESSION_ID=$(node -e "
      try {
        const r = JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'));
        process.stdout.write(r.session_id || '');
      } catch(e) { process.stdout.write(''); }
    " "$RESPONSE_FILE")
    if [ -n "$SESSION_ID" ]; then
      echo "[session] Got session_id: ${SESSION_ID}"
    else
      echo "[warn] No session_id returned; subsequent turns won't use --resume"
    fi
  fi

  echo "[done] Response saved to: ${RESPONSE_FILE}"
  rm -f "$MSG_FILE"

done < <(printf '%s\n' "$TURNS_JSON")

echo ""
echo "============================================"
echo "  Persona run complete: ${PERSONA_SLUG}"
echo "============================================"

# --- Score the results ---
echo ""
echo "[scoring] Running scorer..."
SCORES_FILE="${FRAMEWORK_DIR}/results/scores-${PERSONA_SLUG}.json"
mkdir -p "${FRAMEWORK_DIR}/results"
node "${FRAMEWORK_DIR}/scorer/score.js" \
  --persona "${PERSONA_SLUG}" \
  --results-dir "${TEST_HOME}" \
  --persona-dir "${PERSONA_DIR}" \
  --output "${SCORES_FILE}"

echo "[scoring] Scores written to: ${SCORES_FILE}"

# --- Teardown ---
source "${FRAMEWORK_DIR}/orchestrator/teardown-environment.sh" "${PERSONA_SLUG}" "${TEST_HOME}"

echo ""
echo "Done. Results in: ${FRAMEWORK_DIR}/results/${PERSONA_SLUG}/"
