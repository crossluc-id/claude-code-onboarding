# Skill & Agent Writing Craft — Research Findings

> **Purpose**: How to write effective Claude Code skills, agents, and commands
> **Last Updated**: 2026-02-04
> **Status**: Active

---

## The Effectiveness Hierarchy

After analyzing 30+ skills across superpowers, meta-cc, chores, and existing agents:

### Tier 1: Behavioral Gating (Most Effective)
- Iron Laws with absolute prohibitions
- Gate Functions (mandatory verification steps)
- Anti-rationalization tables from empirical testing
- Red Flag self-check lists
- *Example*: Superpowers `verification-before-completion`, `test-driven-development`

### Tier 2: Procedural Scaffolding (Very Effective)
- Step-by-step processes with verification gates
- Decision flowcharts for non-obvious choices
- Feedback loops (validate → fix → re-validate)
- TodoWrite integration for commitment tracking

### Tier 3: Structured Reference (Effective)
- Quick Start with time estimates
- Categorized patterns with concrete examples
- Before/After comparisons
- Quantified metrics and validation evidence

### Tier 4: Personality + Enumeration (Least Effective)
- "You are an expert..." framing
- Bulleted lists of responsibilities
- Generic quality principles
- No behavioral constraints

---

## The Eight Principles

### 1. Constrain Behavior, Don't Describe Personality
Tell Claude what gate it must pass, not what expert it is.

### 2. Test Before Writing (Meta-TDD)
Run Claude without the skill → capture rationalizations → write skill to address failures → verify → iterate.

### 3. Descriptions Are Triggers, Not Summaries
Keep to "Use when [conditions]." Claude shortcuts workflow summaries.

### 4. Every Discipline Needs a Rationalization Table
Pre-empt excuses Claude will generate to skip steps.

### 5. One Excellent Example Beats Five Mediocre Ones
Token budget is finite. One real, well-commented example teaches more than five templates.

### 6. Progressive Disclosure Is Not Optional
Keep SKILL.md under 500 lines. Put heavy reference in separate files.

### 7. Quantify Everything
"15-30 minutes vs 2-3 hours" beats "much faster."

### 8. The Moral Frame Works (For Discipline Skills)
Framing violations as dishonesty rather than inefficiency produces measurably higher compliance.

---

## Source Analysis

### Superpowers (Gold Standard)
- Authority and moral weight in voice
- Anti-rationalization tables are signature innovation
- Description CSO: descriptions contain only triggers, never workflow summaries
- Red Flags as self-check thinking patterns
- Iron Law pattern: single absolute rule in monospaced block
- Progressive disclosure via cross-references (name, not @-link)
- Flowcharts only for non-obvious decision trees

### Meta-CC (Engineering Approach)
- Academic and evidence-based voice
- Rich YAML frontmatter with metrics
- Dual-layer value functions (V_instance + V_meta)
- Time-boxed Quick Starts
- Transferability as first-class concern
- Weakness: descriptions too long (300+ words), dilutes effectiveness

### Typical Custom Agents (Standard Approach)
- Persona-first with "You are an expert..."
- Example-driven descriptions work well
- Do/Don't symmetry with code examples
- Weakness: no rationalization prevention, no iron laws, generic personality framing

---

## Key Superpowers Patterns

### Anti-Rationalization Table
```markdown
| Excuse | Reality |
|--------|---------|
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Partial check is enough" | Partial proves nothing |
```

### Iron Law
```markdown
## The Iron Law
NEVER claim work is complete without running the verification command.
```

### Gate Function
```markdown
## The Gate
BEFORE claiming any status:
1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command
3. READ: Full output, check exit code
4. VERIFY: Does output confirm the claim?
5. ONLY THEN: Make the claim
```

### Red Flags
```markdown
## Red Flags — STOP
These thoughts mean you're about to fail:
- "This is too simple to verify"
- "I already know the answer"
- "Let me skip this one step"
```

---

*Based on analysis of 30+ production skills across multiple Claude Code plugin ecosystems.*
