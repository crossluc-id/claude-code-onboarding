#!/bin/bash
set -euo pipefail

# teardown-environment.sh — Archives test results and cleans up the isolated environment.
# Usage: teardown-environment.sh <persona-slug> <test-home-dir>

PERSONA_SLUG="${1:?Usage: teardown-environment.sh <persona-slug> <test-home-dir>}"
TEST_HOME="${2:?Usage: teardown-environment.sh <persona-slug> <test-home-dir>}"
FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_DIR="${FRAMEWORK_DIR}/results"

echo "[teardown] Archiving results for: ${PERSONA_SLUG}"

# Create results directory for this persona
PERSONA_RESULTS="${RESULTS_DIR}/${PERSONA_SLUG}"
mkdir -p "${PERSONA_RESULTS}"

# Archive the generated configuration files
if [ -d "${TEST_HOME}/.claude" ]; then
  echo "[teardown] Copying .claude/ configuration..."
  cp -r "${TEST_HOME}/.claude" "${PERSONA_RESULTS}/dot-claude"
fi

# Archive the project directory
if [ -d "${TEST_HOME}/research/math-hairstyling" ]; then
  echo "[teardown] Copying project directory..."
  cp -r "${TEST_HOME}/research/math-hairstyling" "${PERSONA_RESULTS}/project"
fi

# Archive session transcripts if they exist
if [ -d "${TEST_HOME}/.claude/sessions" ]; then
  echo "[teardown] Copying session transcripts..."
  cp -r "${TEST_HOME}/.claude/sessions" "${PERSONA_RESULTS}/sessions"
fi

# Copy any log files
if ls "${TEST_HOME}"/*.log 1>/dev/null 2>&1; then
  cp "${TEST_HOME}"/*.log "${PERSONA_RESULTS}/"
fi

# Save a manifest of what was produced
echo "[teardown] Generating file manifest..."
find "${PERSONA_RESULTS}" -type f | sort > "${PERSONA_RESULTS}/manifest.txt"

# Clean up temp directory (with safety guard)
if [[ "$TEST_HOME" == /tmp/claude-test-* ]]; then
  echo "[teardown] Cleaning up: ${TEST_HOME}"
  rm -rf "${TEST_HOME}"
else
  echo "[teardown] Refusing to rm unexpected path: ${TEST_HOME}" >&2
fi

echo "[teardown] Results archived to: ${PERSONA_RESULTS}"
echo "[teardown] File count: $(wc -l < "${PERSONA_RESULTS}/manifest.txt")"
