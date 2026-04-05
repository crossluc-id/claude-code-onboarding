#!/usr/bin/env node

/**
 * score.js — Main scorer for persona test results.
 *
 * Reads the output directory from a persona test run, applies each dimension
 * scorer, and writes a JSON scores file.
 *
 * Usage:
 *   node score.js --persona <slug> --results-dir <path> --persona-dir <path> --output <path>
 */

const fs = require('fs');
const path = require('path');

// --- Parse CLI arguments ---
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^--/, '');
  args[key] = process.argv[i + 1];
}

const personaSlug = args['persona'];
const resultsDir = args['results-dir'];
const personaDir = args['persona-dir'];
const outputPath = args['output'];

if (!personaSlug || !resultsDir || !personaDir || !outputPath) {
  console.error('Usage: node score.js --persona <slug> --results-dir <path> --persona-dir <path> --output <path>');
  process.exit(1);
}

// --- Load rubric ---
const rubricPath = path.join(__dirname, 'rubric.json');
const rubric = JSON.parse(fs.readFileSync(rubricPath, 'utf8'));

// --- Load persona definition ---
const personaPath = path.join(personaDir, 'persona.json');
const persona = JSON.parse(fs.readFileSync(personaPath, 'utf8'));

// --- Load dimension scorers ---
const claudeMdRichness = require('./dimensions/claude-md-richness');
const researchProfile = require('./dimensions/research-profile');
const rulesAppropriateness = require('./dimensions/rules-appropriateness');
const hookCompleteness = require('./dimensions/hook-completeness');
const researchDepth = require('./dimensions/research-depth');

// --- Build environment context ---
// The results directory structure after teardown:
//   results/<persona>/dot-claude/  -> the .claude/ directory
//   results/<persona>/project/     -> the project directory
// But during scoring (before teardown), we score the live TEST_HOME.
// Support both layouts.

function resolveDir(base, subpaths) {
  for (const sub of subpaths) {
    const candidate = path.join(base, sub);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const claudeDir = resolveDir(resultsDir, ['.claude', 'dot-claude']);
const projectDir = resolveDir(resultsDir, ['research/math-hairstyling', 'project']);

const env = {
  resultsDir,
  claudeDir,
  projectDir,
  persona,
  personaSlug,
  rubric
};

console.log(`[scorer] Scoring persona: ${personaSlug}`);
console.log(`[scorer] Claude dir: ${claudeDir || 'NOT FOUND'}`);
console.log(`[scorer] Project dir: ${projectDir || 'NOT FOUND'}`);

// --- Run each dimension ---
const dimensionResults = {};
let weightedTotal = 0;
let weightedMax = 0;

const scorers = [
  { key: 'claude_md_richness', fn: claudeMdRichness },
  { key: 'research_profile_completeness', fn: researchProfile },
  { key: 'rules_appropriateness', fn: rulesAppropriateness },
  { key: 'hook_completeness', fn: hookCompleteness },
  { key: 'research_depth', fn: researchDepth }
];

for (const { key, fn } of scorers) {
  const dimRubric = rubric.dimensions[key];
  const weight = dimRubric.weight;

  let result;
  try {
    result = fn(env, dimRubric);
  } catch (err) {
    console.error(`[scorer] Error in dimension ${key}: ${err.message}`);
    result = { score: 0, max: dimRubric.max_score, details: { error: err.message } };
  }

  const normalized = Math.min(result.score, dimRubric.max_score);
  dimensionResults[key] = {
    score: normalized,
    max: dimRubric.max_score,
    weight: weight,
    weighted_score: normalized * weight,
    details: result.details || {}
  };

  weightedTotal += normalized * weight;
  weightedMax += dimRubric.max_score * weight;
}

// --- Compute final score ---
const finalScore = weightedMax > 0 ? (weightedTotal / weightedMax) * 10 : 0;

const output = {
  persona: personaSlug,
  engagement_level: persona.engagement_level,
  timestamp: new Date().toISOString(),
  final_score: Math.round(finalScore * 100) / 100,
  max_score: 10,
  weighted_total: Math.round(weightedTotal * 100) / 100,
  dimensions: dimensionResults
};

// --- Write output ---
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');

console.log(`[scorer] Final score: ${output.final_score} / 10`);
console.log(`[scorer] Dimension breakdown:`);
for (const [key, dim] of Object.entries(dimensionResults)) {
  console.log(`  ${key}: ${dim.score}/${dim.max} (weight: ${dim.weight})`);
}
