# Claude Code Setup Guide

A step-by-step walkthrough from zero to fully configured.

---

## Step 1: Install Claude Code

### Prerequisites
- **Node.js 18+** — check with `node --version`. Install from https://nodejs.org if needed.
- **Git** — check with `git --version`. Install from https://git-scm.com if needed.
- **A terminal** — Terminal.app (Mac), iTerm2, or any terminal you're comfortable with.

### Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### First Launch

```bash
claude
```

Claude will ask you to log in with your Anthropic account. Follow the prompts.
Once logged in, you'll see a terminal prompt where you can type messages.

**Tip:** Type `/help` at any time to see available commands.

---

## Step 2: Create the Configuration Directory

Claude Code stores its configuration in `~/.claude/`. Let's set it up:

```bash
mkdir -p ~/.claude/{rules,hooks,lib,contexts,references,skills,commands,agents}
```

This creates the folder structure for all the building blocks
(see CONCEPTS.md for what each one does).

---

## Step 3: Copy Configuration Files

Copy these files from this onboarding kit to your `~/.claude/` directory:

```bash
# Global collaboration rules
cp CLAUDE.md ~/.claude/CLAUDE.md

# Settings (hooks, permissions, plugins)
cp settings-template.json ~/.claude/settings.json

# MCP server configuration
cp mcp-template.json ~/.claude/.mcp.json

# Rules
cp rules/*.md ~/.claude/rules/

# Hooks (shell scripts + JS validators)
cp hooks/*.sh ~/.claude/hooks/
cp hooks/*.js ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh

# Libraries
cp lib/*.js ~/.claude/lib/

# Contexts
cp contexts/*.md ~/.claude/contexts/

# References
cp references/*.md ~/.claude/references/
```

---

## Step 4: Set Up Environment Variables

Some tools need API keys. Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Required for Exa neural search (get key at https://exa.ai)
export EXA_API_KEY="your-exa-api-key-here"

# Required for GitHub MCP (get token at https://github.com/settings/tokens)
# Needs: repo, read:org, read:user scopes
export GITHUB_TOKEN="your-github-token-here"
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

**What these do:**
- **EXA_API_KEY** — Powers deep web research. Exa is a neural search engine
  that finds relevant content much better than Google for research tasks.
  Free tier available at https://exa.ai.
- **GITHUB_TOKEN** — Lets Claude interact with GitHub (create repos, PRs,
  search code). Get a personal access token from GitHub Settings > Developer
  Settings > Personal Access Tokens.

---

## Step 5: Install Plugins

Plugins add pre-built skills, agents, and commands. Open Claude Code and run:

```
/install-plugin superpowers@superpowers-dev
/install-plugin everything-claude-code@everything-claude-code
/install-plugin commit-commands@claude-plugins-official
/install-plugin code-review@claude-plugins-official
/install-plugin mgrep@Mixedbread-Grep
/install-plugin claude-mem@thedotmack
/install-plugin compound-engineering@every-marketplace
/install-plugin context7@claude-plugins-official
/install-plugin github@claude-plugins-official
```

**What each plugin does:**

| Plugin | Purpose | Why You Need It |
|--------|---------|-----------------|
| **superpowers** | Structured workflows (brainstorming, planning, debugging) | Helps you think before you act |
| **everything-claude-code (ECC)** | 110+ skills, 25+ agents for development | Massive toolkit for any task |
| **commit-commands** | Git commit helpers | Clean version control |
| **code-review** | Automated code review | Catches issues early |
| **mgrep** | Semantic code search | Finds things faster than grep |
| **claude-mem** | Persistent memory across sessions | Claude remembers your past work |
| **compound-engineering** | Brainstorm → Plan → Work → Review loop | Structured project execution |
| **context7** | Live library documentation | Always up-to-date API docs |
| **github** | GitHub integration | PRs, issues, code search |

### Optional: Voice Mode

If you want to talk to Claude instead of typing:

```
/install-plugin voicemode@voicemode
/voicemode:install
```

### Optional: Skill Creator

To create your own custom skills from patterns you discover:

```
/install-plugin skill-creator@claude-plugins-official
```

---

## Step 6: Install CLI Tools

Some plugins need command-line tools installed:

```bash
# Semantic search (replaces grep with AI-powered search)
npm install -g @mixedbread/mgrep

# Browser automation (for web research and screenshots)
npm install -g agent-browser && agent-browser install

# Claude-mem worker service (for persistent memory)
# Follow instructions at: https://github.com/thedotmack/claude-mem
```

---

## Step 7: Verify Everything Works

Open Claude Code and check:

```
claude
```

Then try these:

1. **"What plugins do you have?"** — Should list all installed plugins
2. **"Search the web for mathematical frameworks in hairstyling"** — Tests Exa/mgrep
3. **"/help"** — Shows available commands
4. **"What skills are available?"** — Lists loaded skills

If something doesn't work, check:
- API keys are set: `echo $EXA_API_KEY` and `echo $GITHUB_TOKEN`
- Plugins installed: look in `~/.claude/plugins/`
- MCP servers: `claude --mcp-debug` to diagnose

---

## Step 8: Create Your First Project

```bash
mkdir -p ~/research/math-hairstyling
cd ~/research/math-hairstyling
git init

# Create a project-specific CLAUDE.md
cat > CLAUDE.md << 'EOF'
# Math Hairstyling Framework

## Project Context
This project explores mathematical frameworks for hairstyling and haircutting.

## Research Goals
- Cross-reference with existing mathematical models
- Explore publication formats
- Design workshop curriculum
- Build web presence

## Working Method
- Research deeply before drawing conclusions
- Document findings with citations
- Present options when decisions arise
EOF

claude
```

Now Claude knows about your project every time you work in this folder.

### Customize Your Research Profile

This onboarding kit includes a **RESEARCH-PROFILE.md** template. Open it, fill
in your details (background, goals, current focus), and save it into your
project folder as part of your CLAUDE.md — or keep it as a separate file
Claude can reference.

This helps Claude understand your expertise level, what you're working on,
and how you prefer to collaborate. The more specific you are, the better
Claude's suggestions will be.

---

## Step 9: Explore What You Can Do

### Research Workflows

Tell Claude:
- *"Research existing mathematical models applied to haircutting or styling. Use deep web search."*
- *"Help me brainstorm what format would work best for publishing this framework."*
- *"Create a research plan for comparing my framework against [X]."*

### Skill Creation

Once you've done research and found useful patterns:
- *"Extract what we learned into a reusable skill"* (uses `/learn:learn`)
- *"Create a custom skill for [specific research methodology]"* (uses skill-creator)

### Content Creation

- *"Help me outline a workshop series based on this framework"*
- *"Draft an article explaining [concept] for a non-technical audience"*
- *"What kind of website would best showcase this work?"*

### Key Commands to Know

| Command | What It Does |
|---------|-------------|
| `/help` | Show all available commands |
| `/compact` | Free up context space (use between task phases) |
| `/learn:learn` | Extract reusable patterns from current session |
| `/learn:sessions` | View and manage past sessions |
| `/continuity` | Track multi-step tasks that survive context resets |
| `/git:commit` | Create a clean git commit |
| `/git:commit-push-pr` | Commit, push, and open a PR in one step |
| `/meta:generate_command` | Create your own custom command |
| `/meta:skill-create` | Extract coding patterns into skills |

---

## Step 10: Customize Skills for Your Work

After using Claude for a while, ask it to help you create custom skills
tailored to your research. For example:

- A "literature review" skill that follows a specific methodology
- A "framework comparison" skill for cross-referencing mathematical models
- A "workshop design" skill for structuring educational content
- A "content adaptation" skill for converting research into different formats

Claude can create these for you. Just describe what you want and reference
the skill-writing guide at `~/.claude/references/skill-writing-research.md`.

---

## Summary: What You Now Have

After completing this guide, your setup includes:

- **Global rules** that ensure Claude works carefully and research-first
- **9 plugins** providing 130+ skills, 25+ agents, and dozens of commands
- **Semantic search** (mgrep) for finding information fast
- **Persistent memory** (claude-mem) so Claude remembers across sessions
- **Deep web research** (Exa) for academic and technical searches
- **GitHub integration** for version control and collaboration
- **Browser automation** for web research and screenshots
- **Context management** hooks that prevent losing work during long sessions
- **A project folder** ready for your mathematical hairstyling research

Welcome to Claude Code!
