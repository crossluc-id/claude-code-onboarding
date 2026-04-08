# Human Onboarding Layer

## Purpose

Create a progressive documentation system that takes a new collaborator from zero technical background to a working Claude Code setup, understanding of the ecosystem, and readiness to explore ideas with Claude as a creative collaborator. This is the human counterpart to the machine onboarding layer (ecosystem-discovery.json, advisor context, routing files).

## Problem

The workspace has comprehensive machine-facing onboarding: ecosystem discovery maps, advisor contexts, skill routing, agent routing. But a human receiving this workspace has no entry point. They don't know what Claude Code is, what a terminal is, where files go, or how the pieces connect. The learning resources exist (curated in ecosystem-discovery.json) but aren't woven into a guided path. A new collaborator — especially one without a development background — would be lost.

## Target Audience

- **Primary:** Creative professionals, researchers, and knowledge workers who are intelligent but have little or no terminal/development experience
- **Platform:** macOS
- **Subscription:** Claude Pro ($20/mo)
- **Editor:** Zed (primary), with Claude Code in the terminal
- **Goal:** Not just "install tools" but prepare to use Claude as a creative collaborator for open-ended exploration (e.g., building a knowledge system, an app, a workshop series, a website)

## Design Decisions

- **Four documents, progressive depth.** A main guide (GETTING-STARTED.md), a concepts reference, a methodology document, and a curated learning path. Each builds on the previous but can stand alone.
- **Workspace root placement for entry point.** GETTING-STARTED.md lives at `/workspace/` root so it's the first thing a collaborator sees. Supporting docs live in `docs/onboarding/`.
- **macOS-only for now.** The primary audience uses Mac. Cross-platform coverage adds complexity without immediate value.
- **Zed as the editor.** Zed has native Claude integration, is fast, and is accessible to non-developers. The guide treats Zed as the primary interface, with the terminal as the layer underneath.
- **Configuration before first project.** After installation, the guide walks through setting up `~/.claude/` — rules, contexts, lookup files — before attempting a first project. This ensures Claude has the right foundation from the start.
- **Two first-project paths.** (a) Create a personal website — practical, visual result, teaches Claude about the user's work in the process. (b) Tell Claude about an idea and explore together — more open-ended, closer to the actual use case. The guide presents both and lets the reader choose.
- **No duplication of ecosystem-discovery.json.** The concepts doc teaches how to read and use the ecosystem map, not restate it.
- **Warm, direct tone throughout.** Assumes intelligence, not technical knowledge. Like a knowledgeable friend explaining in person.

## Deliverables

### 1. GETTING-STARTED.md (Main Guide)

**File:** `/workspace/GETTING-STARTED.md`

The entry point. Takes the reader from "I just received this" to "I have a working system and I've built something with it."

#### Sections

**1. What You're Setting Up**
- What Claude Code is: an AI that lives in your computer's terminal and builds things with you through conversation
- What Zed is: a modern code editor — where you see, read, and touch the files Claude creates
- How they work together: you talk to Claude in the terminal (or Zed's built-in terminal), Claude writes code, you see it in Zed
- What this workspace is: a pre-configured environment with tools, skills, and knowledge that makes Claude significantly more capable
- Tone: "You're about to set up something genuinely new — a creative collaborator that gets better the more you work with it"

**2. What You Need**
- A Mac (any recent macOS)
- An internet connection
- An Anthropic account with Claude Pro subscription ($20/month) — link to https://claude.ai to sign up
- About 90 minutes of uninterrupted time (60 for setup, 30 for your first project — or split across two sessions)
- No prior coding experience required

**3. Step 1: Install Zed**
- Download link: https://zed.dev
- Walk through: download, open DMG, drag to Applications, launch
- Brief orientation: what the sidebar is, what the editor pane is, where the terminal panel is
- How to open the terminal in Zed: use the menu (Terminal > New Terminal) or the command palette (Cmd+Shift+P, type "terminal"). Note: verify the current Zed terminal shortcut at implementation time — it has changed across versions. Use menu/palette instructions as the primary method since these are stable and more discoverable for beginners.
- Why Zed: fast, built for AI collaboration, native Claude integration, not bloated

**4. Step 2: Open the Terminal**
- What a terminal is: a text-based interface where you type commands and the computer responds (one sentence, no mystification)
- How to open: two options — (a) Use Zed's built-in terminal (Terminal > New Terminal from the menu, or Cmd+Shift+P then type "terminal"), (b) Open Terminal.app via Spotlight (Cmd+Space, type "Terminal")
- What you'll see: a prompt (usually ending in `$` or `%`), a blinking cursor
- Try it: type `echo "hello"` and press Enter — the computer responds "hello"
- Reassurance: "You can't break anything by typing commands. If something goes wrong, close the terminal and open a new one."

**5. Step 3: Install the Foundations**
- **Install Homebrew** (if not already installed): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` — explain what Homebrew is (a package manager — like an app store for terminal tools). **Important callout:** On a fresh Mac, this will trigger an "Install Command Line Tools" popup. This is normal and necessary — click Install, enter your Mac password if asked, and wait (this can take 5-15 minutes). The guide must explicitly describe this popup so the reader isn't alarmed.
- **Install Node.js**: `brew install node` — explain what Node.js is (a runtime that Claude Code needs to work, one sentence). Node.js v18+ is required.
- **Verify**: `node --version` should show v18 or higher

**6. Step 4: Install Claude Code**
- Command: `npm install -g @anthropic-ai/claude-code`
- What this does: installs Claude Code globally on your machine
- Launch: type `claude` in the terminal
- First launch: authenticate with your Anthropic account (it opens a browser window)
- Verify it works: Claude greets you, you can type a message and get a response
- Explain: this is the core. Everything else builds on this.

**7. Step 5: Orient Zed for Working with Claude Code**

Zed has its own AI features (inline editing, text threads) that complement Claude Code. For now, we set up Zed purely as the editor where you see and work with files that Claude Code creates. Zed's built-in AI features are optional and can be configured later.

- Open Zed and familiarize with the layout: file sidebar (left), editor (center), terminal panel (bottom)
- Open the terminal panel in Zed (Terminal > New Terminal)
- This is where you'll run Claude Code from — you don't need a separate Terminal.app
- Explain: Zed is your window into the project. Claude Code runs in the terminal below. When Claude creates or edits files, they appear in Zed automatically.
- **Optional (for later):** Zed's inline AI features require a separate API key from Anthropic. This is different from your Claude Pro subscription. You can set this up later by going to Zed Settings (Cmd+,) > AI section. For now, Claude Code in the terminal is your primary AI collaborator.

**8. Step 6: Set Up Your Configuration**

This is where the workspace becomes powerful. Walk through setting up `~/.claude/`:

- **What `~/.claude/` is**: Claude's home directory — where it keeps its rules, knowledge, and capabilities. Like setting up a new team member's desk before they start work.
- **Create the directory structure**:
  ```
  ~/.claude/
    rules/        — behavioral guidelines
    contexts/     — thinking modes
    lookup/       — reference maps
    agents/       — specialized roles
    skills/       — workflow knowledge
  ```
- **Copy baseline rules** from the workspace: explain what rules do (they shape how Claude approaches work — like giving a collaborator a style guide)
  - Concrete files to copy from workspace `rules/` to `~/.claude/rules/`: `agents.md`, `hooks.md`, `schema.md`, `search.md`, `workflow.md`, `cross-caller-consistency.md`, `brainstorming-compact.md`
  - Provide exact `cp` commands. Note: if `~/.claude/` already exists (Claude Code creates it on first run), that's fine — you're adding to it.
- **Copy contexts** (thinking modes): `advisor.md`, `dev.md`, `research.md`, `review.md`
  - From workspace `contexts/` to `~/.claude/contexts/` (create directory if needed)
  - Provide exact `mkdir -p ~/.claude/contexts && cp` commands
- **Copy lookup files**: `ecosystem-discovery.json`, `skill-routing.json`, `agent-routing.json`, `automation-decision.json`, `project-context.json`
  - From workspace `lookup/` to `~/.claude/lookup/`
  - Provide exact `mkdir -p ~/.claude/lookup && cp` commands
- **Install core plugins** (provide exact commands the reader types):
  - `claude plugin install superpowers@superpowers-dev` — core workflow skills (brainstorming, TDD, debugging, planning)
  - `claude plugin install everything-claude-code@everything-claude-code` — comprehensive agent/skill library
  - `claude plugin install compound-engineering@every-marketplace` — onboarding, code review, planning
  - `claude plugin install claude-mem@thedotmack` — persistent memory across sessions (needed for the adaptive learning described in method.md)
  - Explain what each gives you, in one sentence
- **Implementation note for executor:** The reader should run these commands inside a Claude Code session or in their terminal. Claude Code creates `~/.claude/` on first run, so Step 4 (Install Claude Code) must come before this step. If `~/.claude/rules/` or other subdirectories already exist, the `cp` commands will add files without overwriting existing ones (use `cp -n` to be safe).

**9. Step 7: Your First Project**

Present two paths:

**Path A: Build Your Website**
- "Would you like to create a personal website? Tell Claude about yourself and what you do. Claude will build it, and in the process, it learns about your work."
- Walk through: create a new folder, open in Zed, open terminal, type `claude`
- Example prompt: "I'd like to create a personal website. I'm [describe yourself and your work]. Can you help me build something that represents what I do?"
- What to expect: Claude asks questions, creates files, you see them appear in Zed
- How to preview: open the HTML file in a browser
- Iterate: "Can you change the color scheme?" "Add a section about my workshops"
- Why this works: you get a tangible result AND Claude learns about you

**Path B: Explore an Idea**
- "You can also just start talking to Claude about something you're thinking about. An idea for a project, a system you want to build, a problem you want to solve."
- Example: "I'm thinking about building a knowledge system for [your field]. I don't know exactly what form it should take — maybe an app, maybe a workshop series, maybe a curriculum. Can we explore this together?"
- What to expect: Claude asks questions, proposes approaches, maybe starts prototyping
- This is closer to how you'll actually use the system
- **Suggested stopping point:** After 15-20 minutes of exploration, ask Claude: "Can you summarize what we've discussed and save it as a document?" This gives you a tangible artifact — a starting point you can return to.

**10. Step 8: Explore the Ecosystem**
- Now that you have a working setup, discover what's available
- In your Claude session: "What plugins and tools are available that might be useful for my work?"
- Claude reads the ecosystem discovery map and recommends based on what you've told it
- Try installing one recommended plugin together
- "This is the discovery layer — Claude knows about dozens of tools across 5 categories. As you work together, it learns what you need and suggests what might help."

**11. What's Next**
- Link to `docs/onboarding/concepts.md` — "When you want to understand what each piece does"
- Link to `docs/onboarding/method.md` — "When you want to understand the philosophy — why the system learns from you"
- Link to `docs/onboarding/learning-path.md` — "When you're ready to go deeper with tutorials and resources"
- Mention: "You'll also receive the practice layer — a system for exploring and building around your specific domain. Claude will guide you through that when you're ready."

### 2. Concepts Reference

**File:** `/workspace/docs/onboarding/concepts.md`

A reference document that explains what each piece of the system does. Not a tutorial — a map.

#### Sections

**1. The Big Picture**
- ASCII diagram showing the flow: You → Zed (see/edit) → Terminal (talk) → Claude Code (think/build) → Your Project (result)
- One paragraph: everything flows through conversation. You describe what you want, Claude figures out how to do it, you see the result, you refine.

**2. Your Editor: Zed**
- What it is and why it was chosen
- Key features: speed, AI integration, terminal panel, clean design
- The essential shortcuts (5 max)
- Link: https://zed.dev

**3. Your AI Collaborator: Claude Code**
- What it is: an AI agent that runs in your terminal
- What it can do: read your entire project, write files, run commands, search the web, connect to services
- How it's different from ChatGPT/etc.: it works directly with your files, not in a chat bubble
- The key insight: Claude Code gets better the more you configure it and work with it

**4. The Configuration Layer (~/.claude/)**

Explain each directory in plain language:

| Directory | What's In It | Analogy |
|-----------|-------------|---------|
| `rules/` | Behavioral guidelines | A style guide for a new team member |
| `contexts/` | Thinking modes | Different hats: advisor, developer, researcher, reviewer |
| `lookup/` | Reference maps | Phone books that help Claude find the right tool |
| `agents/` | Specialized roles | Expert consultants Claude can become for specific tasks |
| `skills/` | Workflow knowledge | Recipes for complex processes (testing, debugging, planning) |

**5. Plugins**
- What they are: packages of skills, agents, and commands from the community
- How to install: `claude plugin install <name>@<marketplace>`
- How to discover: ask Claude, or browse ecosystem-discovery.json
- The four core plugins and what each provides

**6. MCP Servers**
- What they are: connections to external services (like plugging in peripherals)
- Examples: Figma for design files, GitHub for code, Stripe for payments
- How to add: configured in `.mcp.json`
- Not needed to start — add as your projects require them

**7. The Ecosystem Discovery Map**
- What `ecosystem-discovery.json` is: a curated directory of 57+ tools across 5 categories
- The five categories explained (plugin marketplaces, curated highlights, MCP servers, learning resources, community examples)
- How to browse it: ask Claude, or open the file directly
- How it stays current: the advisor can search beyond the map using web search

**8. How It All Fits Together**
- A "day in the life" narrative: wake up, open Zed, start Claude, describe a task. Claude checks its skills, picks an approach, uses agents if needed, connects to services. You guide the conversation, Claude does the building. At the end, you have working code/documents/systems.
- The compounding effect: every session teaches Claude more about how you work. Configuration evolves. Skills accumulate. The system adapts.

### 3. Method and Philosophy

**File:** `/workspace/docs/onboarding/method.md`

Explains why the system works the way it does. The principles behind the adaptive workflow. This is the document for someone who wants to understand the thinking, not just the tools.

#### Sections

**1. The Core Idea**
- This isn't a static tool. It's a system that learns from you and adapts to how you work.
- Every session generates observations. Observations become patterns. Patterns become instincts. Instincts shape behavior. Behavior improves. The loop compounds.
- Analogy: working with a new colleague. At first, you explain everything. Over time, they learn your preferences, anticipate your needs, develop judgment. This system does that, but the "memory" is explicit and inspectable.

**2. The Feedback Loop**

Written in outcome-oriented language — describe what happens from the user's perspective, not the implementation mechanics. Avoid terms like "hooks," "PreToolUse," "PostToolUse" — these are implementation details. Instead:

- ASCII diagram of the cycle:
  ```
  You work with Claude
        |
        v
  Claude notices what happens
  (what you correct, what approaches work,
   what tools you prefer)
        |
        v
  Patterns emerge over time
  (your preferences, your workflows,
   your domain knowledge)
        |
        v
  Claude remembers — with varying confidence
  (tentative early on, well-established after
   seeing the same pattern multiple times)
        |
        v
  Next session: Claude works differently
  (approaches tasks the way you've shown
   it works best)
        |
        v
  You work with Claude (but now it's better)
  ```

**3. The Three Layers**

Use plain language throughout — the audience has no development background:

- **Observation** — As you work with Claude, the system quietly notices what happens. When you correct Claude's approach, it records that. When a particular method works well, it notes that too. At the end of each session, the system reviews what happened and extracts useful patterns.
- **Memory** — The system has three kinds of memory that evolve at different speeds: learned instincts (behavioral patterns that build confidence over time), explicit notes (facts, preferences, project knowledge you or Claude write down), and configuration (rules, contexts, reference maps that shape Claude's baseline behavior). Together, these form Claude's growing understanding of how you work.
- **Suggestion** — Rather than waiting to be asked, Claude proactively observes the state of your project and suggests tools, approaches, or capabilities that might help. It cross-references a map of the broader ecosystem and presents suggestions as opportunities — never as checklists or deficiencies.

**4. The Advisor Philosophy**
- Quote the core principles from advisor.md:
  - "Don't wait to be asked. Observe with fresh eyes and imagine what's possible."
  - "Frame as opportunity, not deficiency."
  - "One suggestion at a time. The best one."
  - "Each suggestion should create compounding value — better now AND better for every future session."
- How this works in practice: examples of the advisor noticing gaps and suggesting tools

**5. Compound Engineering**
- The philosophy: each unit of work should make subsequent work easier
- The cycle: Plan → Work → Review → Compound
- Applied to this system: every configuration choice, every rule, every skill you add makes Claude more capable for the next task
- Investing in the system: early on, you'll spend more time configuring and learning. Over time, the ratio shifts — the system handles more, you configure less. The principle is: when you notice friction, invest in the system. When things flow, focus on what you're building.

**6. Sub and Loom (The Practice Layer)**

Brief introduction — detailed docs come separately:

- **Sub** (intelligence): The system that accumulates knowledge about your practice — patterns, relationships, strategy, context. Database-native. Gets smarter with every interaction.
- **Loom** (action): The system that turns intelligence into concrete outputs — artwork management, writing, auditing, workflow orchestration. File-native. Produces tangible results.
- **The flywheel**: Sub accumulates intelligence → Loom consumes it to produce work → Loom deposits results back → Sub gets smarter → cycle continues
- "You'll receive the practice layer configured for your domain. Claude will guide you through exploring and building with it."

**7. Making It Yours**
- The system is designed to be adapted. Nothing is sacred.
- You can: add rules, create contexts, modify lookup files, install new plugins, configure MCP servers
- You should: let it evolve naturally. Don't try to configure everything upfront. Work with Claude, notice what's missing, add it.
- The meta-principle: the best configuration emerges from use, not from planning

### 4. Learning Path

**File:** `/workspace/docs/onboarding/learning-path.md`

A curated journey through external resources. Not a link dump — each entry explains what it is, why it matters, and when to read it.

#### Structure

**Getting Comfortable (First Week)**

Resources for understanding what you've set up and getting fluent with the basics:

- **Claude Code Official Product Page** — https://www.anthropic.com/product/claude-code — What Claude Code is, who uses it, what it can do. Read first.
- **The Claude Code Handbook (FreeCodeCamp)** — https://www.freecodecamp.org/news/claude-code-handbook/ — Comprehensive beginner guide. Professional introduction to building with AI-assisted development.
- **Programming with Mosh: Claude Code Tutorial** — https://www.youtube.com/watch?v=IuyVVtr1uhY — 58-minute video tutorial. Good if you prefer watching over reading.
- **Zed Editor AI Features Review** — https://claudecodeguides.com/zed-editor-ai-features-review-for-developers-2026/ — How Zed and Claude work together. Setup details, practical examples.
- **Affaan Mustafa's ECC Walkthrough** (X thread) — Overview of the Everything Claude Code system that powers many of the skills in your setup.

**Understanding the Philosophy (Second Week)**

Resources for understanding why the system works the way it does:

- **Compound Engineering Guide** — https://every.to/guides/compound-engineering — The Plan→Work→Review→Compound philosophy. Each unit of work makes the next one easier. Core methodology.
- **Superpowers: Skills Improvements from User Feedback** — https://github.com/obra/superpowers/blob/main/docs/plans/2025-11-28-skills-improvements-from-user-feedback.md — How to design skills that actually enforce methodology. Evidence-based approach.
- **Claude Code Plugin Documentation** — https://code.claude.com/docs/en/plugins — Official docs on plugin structure, installation, and skill authoring.

**Going Deeper (Third Week and Beyond)**

Resources for extending and customizing the system:

- **ECC Mintlify Quick Start** — https://mintlify.com/affaan-m/everything-claude-code/quickstart — Structured setup documentation for the Everything Claude Code system.
- **Superpowers: Visual Brainstorming Refactor** — https://github.com/obra/superpowers/blob/main/docs/superpowers/plans/2026-02-19-visual-brainstorming-refactor.md — Architecture patterns for interactive skill design.
- **Superpowers: Document Review System** — https://github.com/obra/superpowers/blob/main/docs/superpowers/plans/2026-01-22-document-review-system.md — Iterative validation loops and review methodology.
- **Community examples from ecosystem-discovery.json** — Study how HuggingFace, Sentry, AWS Labs, Stripe, and others build plugins and skills.

**Platform Integration Examples**

Reference material for when you start connecting Claude to external services:

- **Figma MCP Server Docs** — https://developers.figma.com/docs/figma-mcp-server/ — How design tools connect to Claude.
- **Railway Plugin Docs** — https://docs.railway.com/ai/claude-code-plugin — How infrastructure tools connect to Claude.
- **PostHog MCP Docs** — https://posthog.com/docs/model-context-protocol — How analytics tools connect to Claude.

Each entry format: **Title** — URL — one sentence on what it is, one sentence on why it matters for you.

## Scope Boundaries

- macOS only. No Windows or Linux instructions.
- Claude Pro subscription only. API key setup not covered.
- Does NOT duplicate ecosystem-discovery.json content — teaches how to use it.
- Does NOT document the artops practice layer in detail — that's a separate deliverable. Method.md introduces Sub/Loom conceptually.
- Does NOT cover advanced configuration (hooks authoring, skill creation, agent development). Points to learning resources for those.
- Does NOT assume any prior development experience. Every terminal concept is explained from scratch.

## File Structure

```
/workspace/
  GETTING-STARTED.md              # Entry point — "start here"
  docs/
    onboarding/
      concepts.md                  # "What is what" reference
      method.md                    # "Why it works" philosophy
      learning-path.md             # "Where to go deeper" curated journey
```

## Success Criteria

1. A new collaborator with no development background can follow GETTING-STARTED.md and have a working Claude Code + Zed setup in under 90 minutes (or across two sessions)
2. After completing the guide, they've built something (a website or explored an idea) and experienced Claude as a collaborator
3. They understand where to find answers (concepts.md) and why the system works (method.md)
4. They have a curated path for continued learning (learning-path.md)
5. The `.claude/` configuration is set up with baseline rules, contexts, lookups, and core plugins before their first project
6. The documents reference each other naturally — each one answers "what should I read next?"
7. Tone is warm, direct, and respects the reader's intelligence while assuming no technical background

## Implementation Notes for Executor

### Items requiring runtime verification
- **Zed terminal shortcut:** Verify current keybinding at implementation time. Use menu/palette as primary instruction.
- **Plugin install syntax:** Verify `claude plugin install <name>@<marketplace>` commands work against current CLI version.
- **URLs:** Verify all external links are reachable. If any return 404, remove or update.
- **Node.js version:** Verify minimum version required by current Claude Code release.
- **Homebrew install command:** Verify current URL against https://brew.sh.

### Items where executor should use judgment
- **Tone calibration:** The spec describes "warm, direct, assumes intelligence." Read the existing workspace docs (advisor.md, CLAUDE.md) for tone reference.
- **Example prompts:** The first-project examples should feel natural, not scripted. Adjust wording to match the document's voice.
- **Section length:** Each section in GETTING-STARTED.md should be as short as possible while being complete. If a step can be explained in 3 sentences, don't use 10.

### Hard constraints — do not deviate
- **Four-document structure:** GETTING-STARTED.md + concepts.md + method.md + learning-path.md. No more, no less.
- **File locations:** GETTING-STARTED.md at workspace root. Others in `docs/onboarding/`.
- **No duplication of ecosystem-discovery.json:** Teach how to use it, don't restate its contents.
- **macOS only:** Do not add Windows or Linux instructions.
- **Configuration before first project:** Step 6 (configuration) must come before Step 7 (first project).
- **claude-mem in core plugin list:** Required for the adaptive learning workflow described in method.md.

### Document boundary rules
- **GETTING-STARTED.md** does NOT explain concepts in depth — it links to concepts.md for that.
- **concepts.md** does NOT teach setup — it assumes the reader completed GETTING-STARTED.md.
- **method.md** does NOT repeat what's in concepts.md — it explains the philosophy behind the system.
- **learning-path.md** does NOT duplicate content from the other three — it links to external resources only.
