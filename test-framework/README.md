# Persona Test Framework

Automated testing for the Claude Code onboarding kit. Tests whether the onboarding
system produces quality configurations for different user engagement levels.

## What This Does

Two fictional personas ("Hyperactive Atila" and "Lazy Atila") run through the
onboarding process. Both are hairstylists exploring mathematical frameworks for
haircutting, but one provides extensive detail while the other gives almost nothing.

The framework measures whether the system compensates for sparse input by doing
its own research and producing a quality setup regardless.

## Quick Start

Run the full comparison (both personas, scored, with report):

```bash
bash test-framework/orchestrator/run-comparison.sh
```

Or run a single persona:

```bash
bash test-framework/orchestrator/run-persona.sh hyperactive-atila
bash test-framework/orchestrator/run-persona.sh lazy-atila
```

## Results

After a run, find results in `test-framework/results/`:

- `hyperactive-atila/` — full output directory for the hyperactive persona
- `lazy-atila/` — full output directory for the lazy persona
- `scores-hyperactive-atila.json` — dimension scores
- `scores-lazy-atila.json` — dimension scores
- `comparison-report.md` — side-by-side analysis with compensation ratio

## What Gets Scored (5 Dimensions)

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| CLAUDE.md Richness | 25% | Does the generated CLAUDE.md contain persona background, goals, methodology? |
| Research Profile Completeness | 20% | How many profile fields are filled? How specific is the content? |
| Rules Appropriateness | 20% | Are rules customized from templates? Any new rules created? |
| Hook Configuration | 15% | Valid settings.json? Hooks configured? No placeholder values? |
| Research Depth | 20% | Research notes? External citations? Domain-specific terms? Custom skills? |

## Key Metric: Compensation Ratio

```
compensation_score = (lazy_quality / hyperactive_quality) * 100
```

- **Above 75%** = system compensates well for sparse input
- **50-75%** = moderate compensation, room for improvement
- **Below 50%** = too dependent on user input

## Requirements

- `claude` CLI installed and authenticated
- Node.js 18+
- Bash shell

## File Structure

```
test-framework/
  personas/           # Persona definitions and expected artifacts
  fixtures/           # Writing samples, links, and other input material
  orchestrator/       # Shell scripts that drive the test runs
  scorer/             # Node.js scoring engine with per-dimension scorers
  reporter/           # Report generation
  results/            # Output (gitignored)
```
