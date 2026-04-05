#!/bin/bash
set -euo pipefail

# setup-environment.sh — Creates an isolated temp directory for a persona test run.
# Usage: source setup-environment.sh <persona-slug>
# Sets: TEST_HOME, TEST_PROJECT_DIR, TEST_CLAUDE_DIR

PERSONA_SLUG="${1:?Usage: setup-environment.sh <persona-slug>}"
FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ONBOARDING_DIR="$(cd "$FRAMEWORK_DIR/.." && pwd)"

# Create isolated home directory
TEST_HOME="$(mktemp -d "/tmp/claude-test-${PERSONA_SLUG}-XXXXXX")"
TEST_CLAUDE_DIR="${TEST_HOME}/.claude"
TEST_PROJECT_DIR="${TEST_HOME}/research/math-hairstyling"

echo "[setup] Creating isolated environment at: ${TEST_HOME}"

# Create directory structure matching what the onboarding setup guide expects
mkdir -p "${TEST_CLAUDE_DIR}"/{rules,hooks,lib,contexts,references,skills,commands,agents}
mkdir -p "${TEST_PROJECT_DIR}"

# Copy onboarding kit files into the isolated environment
# (These are the files the system would normally process during onboarding)
cp "${ONBOARDING_DIR}/CLAUDE.md" "${TEST_CLAUDE_DIR}/CLAUDE.md"
cp "${ONBOARDING_DIR}/settings-template.json" "${TEST_CLAUDE_DIR}/settings.json"
cp "${ONBOARDING_DIR}/mcp-template.json" "${TEST_CLAUDE_DIR}/.mcp.json"

# Copy rules
if [ -d "${ONBOARDING_DIR}/rules" ]; then
  cp "${ONBOARDING_DIR}"/rules/*.md "${TEST_CLAUDE_DIR}/rules/" 2>/dev/null || true
fi

# Copy hooks
if [ -d "${ONBOARDING_DIR}/hooks" ]; then
  cp "${ONBOARDING_DIR}"/hooks/*.sh "${TEST_CLAUDE_DIR}/hooks/" 2>/dev/null || true
  cp "${ONBOARDING_DIR}"/hooks/*.js "${TEST_CLAUDE_DIR}/hooks/" 2>/dev/null || true
  chmod +x "${TEST_CLAUDE_DIR}"/hooks/*.sh 2>/dev/null || true
fi

# Copy libraries
if [ -d "${ONBOARDING_DIR}/lib" ]; then
  cp "${ONBOARDING_DIR}"/lib/*.js "${TEST_CLAUDE_DIR}/lib/" 2>/dev/null || true
fi

# Copy contexts
if [ -d "${ONBOARDING_DIR}/contexts" ]; then
  cp "${ONBOARDING_DIR}"/contexts/*.md "${TEST_CLAUDE_DIR}/contexts/" 2>/dev/null || true
fi

# Copy references
if [ -d "${ONBOARDING_DIR}/references" ]; then
  cp "${ONBOARDING_DIR}"/references/*.md "${TEST_CLAUDE_DIR}/references/" 2>/dev/null || true
fi

# Copy the persona's project CLAUDE.md into the project directory
PERSONA_DIR="${FRAMEWORK_DIR}/personas/${PERSONA_SLUG}"
if [ -f "${PERSONA_DIR}/project-claude-md.md" ]; then
  cp "${PERSONA_DIR}/project-claude-md.md" "${TEST_PROJECT_DIR}/CLAUDE.md"
fi

echo "[setup] Isolated environment ready:"
echo "  TEST_HOME=${TEST_HOME}"
echo "  TEST_CLAUDE_DIR=${TEST_CLAUDE_DIR}"
echo "  TEST_PROJECT_DIR=${TEST_PROJECT_DIR}"

# Export for use by calling script
export TEST_HOME
export TEST_CLAUDE_DIR
export TEST_PROJECT_DIR
