#!/usr/bin/env node

/**
 * generate-report.js — Reads score files for both personas and writes a
 * markdown comparison report with side-by-side table and compensation ratio.
 *
 * Usage:
 *   node generate-report.js --hyperactive <scores.json> --lazy <scores.json> --output <report.md>
 */

const fs = require('fs');
const path = require('path');

// --- Parse CLI arguments ---
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^--/, '');
  args[key] = process.argv[i + 1];
}

const hyperactivePath = args['hyperactive'];
const lazyPath = args['lazy'];
const outputPath = args['output'];

if (!hyperactivePath || !lazyPath || !outputPath) {
  console.error('Usage: node generate-report.js --hyperactive <path> --lazy <path> --output <path>');
  process.exit(1);
}

const hyperactive = JSON.parse(fs.readFileSync(hyperactivePath, 'utf8'));
const lazy = JSON.parse(fs.readFileSync(lazyPath, 'utf8'));

// --- Compute compensation ratio ---
const compensationRatio = hyperactive.final_score > 0
  ? (lazy.final_score / hyperactive.final_score) * 100
  : 0;

const compensationLabel = compensationRatio >= 75
  ? 'GOOD — System compensates well for sparse input'
  : compensationRatio >= 50
    ? 'MODERATE — Some compensation, room for improvement'
    : 'POOR — Too dependent on user input';

// --- Dimension names for display ---
const dimensionLabels = {
  claude_md_richness: 'CLAUDE.md Richness',
  research_profile_completeness: 'Research Profile Completeness',
  rules_appropriateness: 'Rules Appropriateness',
  hook_completeness: 'Hook Configuration',
  research_depth: 'Research Depth'
};

// --- Generate report ---
const lines = [];

lines.push('# Persona Comparison Report');
lines.push('');
lines.push(`**Generated:** ${new Date().toISOString()}`);
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push('| Metric | Hyperactive Atila | Lazy Atila |');
lines.push('|--------|-------------------|------------|');
lines.push(`| **Engagement Level** | High | Low |`);
lines.push(`| **Final Score** | **${hyperactive.final_score}** / 10 | **${lazy.final_score}** / 10 |`);
lines.push(`| **Weighted Total** | ${hyperactive.weighted_total} | ${lazy.weighted_total} |`);
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Compensation Ratio');
lines.push('');
lines.push(`**${compensationRatio.toFixed(1)}%** — ${compensationLabel}`);
lines.push('');
lines.push('```');
lines.push(`compensation_score = (lazy_quality / hyperactive_quality) * 100`);
lines.push(`                   = (${lazy.final_score} / ${hyperactive.final_score}) * 100`);
lines.push(`                   = ${compensationRatio.toFixed(1)}%`);
lines.push('```');
lines.push('');
lines.push('Interpretation:');
lines.push('- Above 75% = system compensates well for sparse input');
lines.push('- 50-75% = moderate compensation, room for improvement');
lines.push('- Below 50% = too dependent on user input');
lines.push('');
lines.push('---');
lines.push('');
lines.push('## Dimension Breakdown');
lines.push('');
lines.push('| Dimension | Weight | Hyperactive | Lazy | Delta |');
lines.push('|-----------|--------|-------------|------|-------|');

const allDimensions = Object.keys(dimensionLabels);
for (const key of allDimensions) {
  const label = dimensionLabels[key];
  const hDim = hyperactive.dimensions[key] || { score: 0, max: 10 };
  const lDim = lazy.dimensions[key] || { score: 0, max: 10 };
  const weight = hDim.weight || lDim.weight || 0;
  const delta = hDim.score - lDim.score;
  const deltaFmt = Number.isInteger(delta) ? String(delta) : delta.toFixed(1);
  const deltaStr = delta > 0 ? `+${deltaFmt}` : delta === 0 ? '0' : deltaFmt;

  lines.push(`| ${label} | ${(weight * 100).toFixed(0)}% | ${hDim.score}/${hDim.max} | ${lDim.score}/${lDim.max} | ${deltaStr} |`);
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('## Detailed Dimension Analysis');
lines.push('');

for (const key of allDimensions) {
  const label = dimensionLabels[key];
  const hDim = hyperactive.dimensions[key] || { score: 0, max: 10, details: {} };
  const lDim = lazy.dimensions[key] || { score: 0, max: 10, details: {} };

  lines.push(`### ${label}`);
  lines.push('');
  lines.push(`| Check | Hyperactive | Lazy |`);
  lines.push(`|-------|-------------|------|`);

  // Merge all detail keys from both
  const allKeys = new Set([
    ...Object.keys(hDim.details || {}),
    ...Object.keys(lDim.details || {})
  ]);

  for (const dk of allKeys) {
    // Skip complex objects, just show booleans and simple values
    const hVal = formatDetailValue(hDim.details[dk]);
    const lVal = formatDetailValue(lDim.details[dk]);
    if (hVal !== null || lVal !== null) {
      const displayKey = dk.replace(/_/g, ' ');
      lines.push(`| ${displayKey} | ${hVal || '-'} | ${lVal || '-'} |`);
    }
  }

  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('## Recommendations');
lines.push('');

if (compensationRatio < 50) {
  lines.push('The system is heavily dependent on user input. Consider:');
  lines.push('');
  lines.push('1. **Autonomous research** — When the user provides minimal background, the system should proactively research their domain');
  lines.push('2. **Smart defaults** — Generate richer CLAUDE.md content from minimal signals');
  lines.push('3. **Guided prompting** — Ask targeted questions when initial input is sparse');
  lines.push('4. **Template enrichment** — Default rules should include more domain-adaptive patterns');
} else if (compensationRatio < 75) {
  lines.push('The system partially compensates for sparse input. To improve:');
  lines.push('');
  lines.push('1. **Research depth** — Ensure the system researches autonomously even with minimal user input');
  lines.push('2. **Profile inference** — Infer unstated preferences from the context given');
  lines.push('3. **Rule generation** — Create custom rules based on inferred domain, not just user statements');
} else {
  lines.push('The system compensates well for sparse input. The lazy persona');
  lines.push('received quality configuration despite providing minimal detail.');
}

lines.push('');
lines.push('---');
lines.push('');
lines.push('*Report generated by the persona test framework.*');
lines.push('');

// --- Write report ---
const report = lines.join('\n');
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, report);
console.log(`[reporter] Comparison report written to: ${outputPath}`);
console.log(`[reporter] Compensation ratio: ${compensationRatio.toFixed(1)}% — ${compensationLabel}`);

/**
 * Format a detail value for display in the markdown table.
 * Returns null for complex objects that shouldn't be shown inline.
 */
function formatDetailValue(val) {
  if (val === undefined || val === null) return null;
  if (typeof val === 'boolean') return val ? 'yes' : 'no';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') {
    if (val.length > 60) return val.substring(0, 57) + '...';
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '(none)';
    if (val.length <= 3) return val.join(', ');
    return `${val.slice(0, 3).join(', ')} (+${val.length - 3} more)`;
  }
  // Skip objects
  return null;
}
