#!/bin/bash
set -euo pipefail

# run-comparison.sh — Runs both personas through the onboarding system, scores
# them, and generates a side-by-side comparison report.
#
# Usage: bash test-framework/orchestrator/run-comparison.sh
#
# This is the main entry point. It runs:
#   1. Hyperactive Atila (high engagement)
#   2. Lazy Atila (low engagement)
#   3. Scoring for both
#   4. Comparison report with compensation ratio

FRAMEWORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESULTS_DIR="${FRAMEWORK_DIR}/results"

echo "========================================================"
echo "  Claude Code Onboarding — Persona Comparison Test"
echo "========================================================"
echo ""
echo "  This will run two personas through the onboarding system"
echo "  and compare the quality of the resulting configurations."
echo ""
echo "  Personas:"
echo "    1. hyperactive-atila (high engagement, rich input)"
echo "    2. lazy-atila (low engagement, minimal input)"
echo ""
echo "  Results will be saved to: ${RESULTS_DIR}/"
echo ""
echo "========================================================"
echo ""

# Clean previous results
if [ -d "$RESULTS_DIR" ]; then
  echo "[cleanup] Removing previous results..."
  rm -rf "$RESULTS_DIR"
fi
mkdir -p "$RESULTS_DIR"

# --- Run Persona 1: Hyperactive Atila ---
echo ""
echo "========================================================"
echo "  Phase 1/3: Running Hyperactive Atila"
echo "========================================================"
echo ""

bash "${FRAMEWORK_DIR}/orchestrator/run-persona.sh" hyperactive-atila

# --- Run Persona 2: Lazy Atila ---
echo ""
echo "========================================================"
echo "  Phase 2/3: Running Lazy Atila"
echo "========================================================"
echo ""

bash "${FRAMEWORK_DIR}/orchestrator/run-persona.sh" lazy-atila

# --- Generate Comparison Report ---
echo ""
echo "========================================================"
echo "  Phase 3/3: Generating Comparison Report"
echo "========================================================"
echo ""

HYPERACTIVE_SCORES="${RESULTS_DIR}/scores-hyperactive-atila.json"
LAZY_SCORES="${RESULTS_DIR}/scores-lazy-atila.json"
REPORT_FILE="${RESULTS_DIR}/comparison-report.md"

if [ ! -f "$HYPERACTIVE_SCORES" ]; then
  echo "[error] Missing scores: ${HYPERACTIVE_SCORES}"
  exit 1
fi

if [ ! -f "$LAZY_SCORES" ]; then
  echo "[error] Missing scores: ${LAZY_SCORES}"
  exit 1
fi

node "${FRAMEWORK_DIR}/reporter/generate-report.js" \
  --hyperactive "${HYPERACTIVE_SCORES}" \
  --lazy "${LAZY_SCORES}" \
  --output "${REPORT_FILE}"

echo ""
echo "========================================================"
echo "  Comparison Complete"
echo "========================================================"
echo ""
echo "  Results directory: ${RESULTS_DIR}/"
echo "  Comparison report: ${REPORT_FILE}"
echo ""
echo "  To view the report:"
echo "    cat ${REPORT_FILE}"
echo ""

# Print a quick summary from the report
if [ -f "$REPORT_FILE" ]; then
  echo "--- Quick Summary ---"
  echo ""
  # Extract the compensation ratio line
  grep -A 2 "Compensation Ratio" "$REPORT_FILE" | head -5 || true
  echo ""
fi
