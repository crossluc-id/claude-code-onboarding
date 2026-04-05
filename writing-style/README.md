# Writing Style Abstraction System

A universal register taxonomy and style synthesis engine for Claude Code. Replaces project-specific writer abstractions with a configurable system that any user can personalize through an interview process.

## What This Does

Instead of hardcoding "write like X" into prompts, this system:

1. **Defines 22 writing registers** across 5 families (Knowledge, Professional, Creative, Persuasive, Digital)
2. **Calibrates 10 style dimensions** on 1-5 scales (formality, warmth, pace, etc.)
3. **Runs a 14-question interview** to discover your natural writing style
4. **Synthesizes a style config** that Claude loads during writing tasks

The result: Claude writes in *your* voice, not a generic one, and shifts register appropriately for different contexts (blog post vs. academic paper vs. social media).

## Quick Start

### Option A: Use a Preset

```bash
node synthesizer.js --preset interdisciplinary-researcher
```

Available presets:
- `interdisciplinary-researcher` — cross-domain bridging, warm, pedagogical
- `academic-writer` — formal, evidence-based, hedged, structured
- `workshop-facilitator` — invitational, warm, question-driven, action-oriented
- `content-creator` — conversational, hook-driven, platform-aware

### Option B: Run the Interview

Create an answers file (see format below), then:

```bash
node synthesizer.js my-answers.json > my-style.json
```

Or pipe from stdin:

```bash
cat my-answers.json | node synthesizer.js - > my-style.json
```

## Interview Format

Create a JSON file with your answers:

```json
{
  "q1": "I love how Oliver Sacks writes — he makes neuroscience feel like storytelling without losing the science.",
  "q2": "I use analogies a lot. I'll say 'think of it like...' and map concepts from one field to another.",
  "q3": "Here's a paragraph from my recent blog post...",
  "q4": "Corporate jargon makes me cringe. 'Leverage synergies' — instant turn-off.",
  "q5": 1,
  "q6": 1,
  "q7": 2,
  "q8": 2,
  "q9": ["accessible", "rigorous"],
  "q10": 3,
  "q11": "I write for: (1) academic peers — more formal, citation-heavy; (2) workshop participants — warm, invitational; (3) social media — punchy, personal",
  "q12": 3,
  "q13": { "teach": 0.4, "express": 0.3, "persuade": 0.2, "document": 0.1 },
  "q14": "Maria Popova — the way she bridges literature, science, and philosophy"
}
```

### Answer Types

| Question | Type | Format |
|----------|------|--------|
| q1-q4 | Open text | String |
| q5-q8, q10, q12 | Spectrum | Number 1-5 (or "left"/"right"/"center") |
| q9 | Multiple choice | Array of 2 from: rigorous, accessible, beautiful, practical, provocative |
| q11 | Audiences | String (or object: `{ "audience_name": "description" }`) |
| q13 | Proportions | Object `{ "teach": 0.4, ... }` or string "40% teach, 30% express..." |
| q14 | Writer reference | String |

You can also include:
- `writing_samples`: Array of file paths to your writing for analysis
- `selected_preset`: Preset name to load directly (skips synthesis)

## File Structure

```
writing-style/
  registers.json         # 22 registers with descriptions, features, and linguistic markers
  dimensions.json        # 10 style dimensions with 1-5 scales
  interview.yaml         # 14-question interview flow with scoring guidance
  synthesizer.js         # Blending engine: answers -> style config (pure JS, no deps)
  presets/
    interdisciplinary-researcher.json
    academic-writer.json
    workshop-facilitator.json
    content-creator.json
  contexts/
    writing-style.md     # Context file Claude loads during writing tasks
```

## How the Synthesizer Works

The synthesizer is pure JavaScript heuristics — no LLM calls, no external dependencies.

### Keyword Mapping
Open-text answers are scanned for keywords associated with each register. Keywords have three weight tiers (strong=3, moderate=2, weak=1). The register with the highest cumulative weight becomes the primary.

### Spectrum Calibration
Spectrum answers (1-5) directly adjust dimension values. Each question maps to specific dimensions with defined influence weights.

### Writer Reference Lookup
Q14 answers are matched against a built-in database of known writers/publications. A match applies that writer's register signature and dimension profile as a blending influence.

### "Not" Constraint Generation
For every dimension where the final value is >= 3.5 or <= 2.5, a constraint is auto-generated from templates. Format: "[positive quality] but not [excess]".

### Register Selection
1. **Primary**: Highest-weighted non-anti register
2. **Secondary**: Next 1-2 highest, preferring different families
3. **Accent**: Moderate-weight registers that add texture
4. **Anti**: Explicitly rejected or strongly negative-weighted registers

## Using the Style Config

### With Claude Code

Copy the generated style config to your project or `~/.claude/` directory. The `contexts/writing-style.md` file tells Claude how to interpret and apply the config.

To activate during a session, load the writing-style context or reference the config directly:
- "Write this blog post using my style config at writing-style/presets/interdisciplinary-researcher.json"
- "Apply the writing-style context and draft a workshop description"

### Customizing a Preset

Start from a preset and modify:

1. Load the preset: `node synthesizer.js --preset academic-writer > my-style.json`
2. Edit `my-style.json` — adjust dimensions, add context switches, modify constraints
3. Use the customized config in your writing tasks

### Creating New Presets

Run the full interview, save the output, and place it in `presets/`. Name it descriptively.

## Register Families

| Family | Registers | Use When |
|--------|-----------|----------|
| **A: Knowledge** | Academic, Pedagogical, Technical, Popularizing | Teaching, explaining, documenting knowledge |
| **B: Professional** | Corporate, Consultative, Journalistic, Legal | Business, advisory, reporting contexts |
| **C: Creative** | Literary, Narrative, Design-Critical, Lyrical | Artistic, expressive, aesthetic writing |
| **D: Persuasive** | Advocacy, Facilitative, Conversational, Mentoring | Convincing, supporting, connecting |
| **E: Digital** | Social, Caption, Newsletter, Oral, Docs, Interdisciplinary | Platform-specific and hybrid formats |

## Programmatic Use

```javascript
const { StyleSynthesizer } = require('./synthesizer');

const synth = new StyleSynthesizer();
const config = synth.synthesize({
  q1: "I love clear, warm writing that doesn't talk down to people.",
  q9: ["accessible", "practical"],
  q13: { teach: 0.6, document: 0.4 }
});

console.log(config.primary_register);     // e.g., "pedagogical"
console.log(config.dimensions.warmth);     // e.g., 4
console.log(config.not_constraints);       // e.g., ["warm but not gushing..."]
```
