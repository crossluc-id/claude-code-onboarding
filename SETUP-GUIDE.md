# Claude Code Setup Guide

A step-by-step walkthrough from zero to fully configured.

> **Which guide am I in?** This is the **technical / power-user** track. If you're
> new to terminals, **GETTING-STARTED.md** is the gentler path — come back here
> when you want the full setup (more plugins, optional API keys, project scaffolding).

---

## Step 1: Install Claude Code

### Prerequisites
- **Git** — check with `git --version`. Install from https://git-scm.com if needed.
- **A terminal** — Terminal.app (Mac), iTerm2, or any terminal you're comfortable with.
- **Node.js 18+** — recommended. The CLI no longer requires it, but several MCP servers and CLI tools (mgrep, agent-browser, claude-mem) run on Node. Check with `node --version`; install from https://nodejs.org if needed.

### Install Claude Code

The recommended way is the native installer (auto-updates, no Node required for the CLI itself):

```bash
# macOS / Linux / WSL
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell
# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
```

Also available: `brew install --cask claude-code` (macOS) or `winget install Anthropic.ClaudeCode` (Windows).

**Advanced / alternative:** if you prefer npm, `npm install -g @anthropic-ai/claude-code` still works (needs Node.js 18+).

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

# Hooks
cp hooks/*.sh hooks/*.js ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh

# Libraries
cp lib/*.js ~/.claude/lib/

# Contexts
cp contexts/*.md ~/.claude/contexts/

# References
cp references/*.md ~/.claude/references/
```

---

## Step 4: Set Up Environment Variables (Optional)

**You can skip this whole step — Claude Code works fully without any API keys.**
These only unlock extra research power, and you can add them later. To add one,
put it in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Optional — Exa neural search (deep web research). Free tier at https://exa.ai
export EXA_API_KEY="your-exa-api-key-here"

# Optional — only if you use the gh CLI or a token-based GitHub setup.
# The github plugin (Step 5) authenticates via OAuth and does NOT need this.
# export GITHUB_TOKEN="your-github-token-here"   # scopes: repo, read:org, read:user
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

**What these do:**
- **EXA_API_KEY** — Optional. Powers deep web research. Exa is a neural search
  engine that finds relevant content much better than Google for research tasks.
  Without it, Claude still searches the web via mgrep and the fetch MCP.
  Free tier available at https://exa.ai.
- **GITHUB_TOKEN** — Optional. The `github` plugin now signs in with GitHub via
  OAuth, so you no longer need a personal access token for normal use. Set one
  only if you rely on the `gh` CLI or want token-based auth.

---

## Step 5: Install Plugins

Plugins add pre-built skills, agents, and commands. Claude Code 2.x manages them
with the `/plugin` command — the old `/install-plugin` command no longer exists.

#### 5a. Add the community marketplaces (one time)

The official Anthropic marketplace (`claude-plugins-official`) is built in. A few
recommended plugins live in community marketplaces you register once:

```
/plugin marketplace add affaan-m/everything-claude-code
/plugin marketplace add mixedbread-ai/mgrep
/plugin marketplace add thedotmack/claude-mem
/plugin marketplace add EveryInc/compound-engineering-plugin
```

> Tip: run `/plugin` with no arguments any time to open the interactive browser
> (Discover / Installed / Marketplaces tabs) instead of typing commands.

#### 5b. Install the plugins

```
/plugin install superpowers@claude-plugins-official
/plugin install ecc@ecc
/plugin install commit-commands@claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin install context7@claude-plugins-official
/plugin install github@claude-plugins-official
/plugin install mgrep@Mixedbread-Grep
/plugin install claude-mem@thedotmack
/plugin install compound-engineering@compound-engineering-plugin
```

> **What changed since early 2026:** the command is now `/plugin install` (not
> `/install-plugin`); the ECC marketplace was shortened from
> `everything-claude-code@everything-claude-code` to **`ecc@ecc`**;
> compound-engineering's marketplace is **`compound-engineering-plugin`**; and
> superpowers is now on the official marketplace, so no extra marketplace-add is
> needed for it. Note too that a marketplace's name doesn't always match its repo:
> you `add mixedbread-ai/mgrep` but `install mgrep@Mixedbread-Grep` — the part after
> `@` is the marketplace's internal name, not the GitHub repo.

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
/plugin marketplace add mbailey/voicemode
/plugin install voicemode@voicemode
/voicemode:install
```

### Optional: Skill Creator

To create your own custom skills from patterns you discover:

```
/plugin install skill-creator@claude-plugins-official
```

---

## Step 6: Install CLI Tools

Some plugins need command-line tools installed:

```bash
# Semantic search (replaces grep with AI-powered search).
# The mgrep CLI can also register its own plugin/marketplace for you:
npm install -g @mixedbread/mgrep && mgrep install-claude-code

# Browser automation (for web research and screenshots)
npm install -g agent-browser && agent-browser install

# Claude-mem persistent memory — install the worker + hooks (not just the SDK):
npx claude-mem install
# Note: a bare `npm install -g claude-mem` installs the SDK only, without hooks.
```

---

## Step 7: Verify Everything Works

Open Claude Code and check:

```
claude
```

Then try these:

1. **"What plugins do you have?"** — Should list all installed plugins
2. **"Search the web for a recent paper on a topic you care about"** — Tests web search (works via mgrep even without an Exa key)
3. **"/help"** — Shows available commands
4. **"What skills are available?"** — Lists loaded skills

If something doesn't work, check:
- API key is set: `[[ -n "$EXA_API_KEY" ]] && echo "SET"`
- Plugins installed: run `/plugin` (Installed tab) or look in `~/.claude/plugins/`
- MCP servers: run `/mcp` inside Claude Code, or launch with `claude --debug` to diagnose

---

## Step 8: Create Your First Project

```bash
mkdir -p ~/research/my-first-project
cd ~/research/my-first-project
git init

# Create a project-specific CLAUDE.md (edit it to match your own topic)
cat > CLAUDE.md << 'EOF'
# My First Project

## Project Context
Describe in a sentence or two what this project is about.

## Research Goals
- (List what you want to explore or achieve)
- Cross-reference with existing work
- Explore publication or output formats

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

### Choosing a Model

Switch models any time with `/model`. As of mid-2026 the lineup is:

| Model | Alias | Best for |
|-------|-------|----------|
| **Fable 5** | `fable` | Newest flagship — hardest reasoning and design tasks |
| **Opus 4.8** | `opus` | Deep reasoning, complex multi-step work |
| **Sonnet 4.6** | `sonnet` | Fast, capable daily driver for most coding/research |
| **Haiku 4.5** | `haiku` | Quick, cheap, lightweight tasks |

You don't have to pick perfectly — start on the default for your plan and switch
up to `opus`/`fable` when a task is genuinely hard. `/model` shows what's available
to your account. (Tip: `/fast` toggles faster Opus output on supported models.)

### Key Commands to Know

| Command | What It Does |
|---------|-------------|
| `/help` | Show all available commands |
| `/model` | Switch the active model (Fable 5 / Opus / Sonnet / Haiku) |
| `/plugin` | Browse, install, enable, or update plugins |
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
- **9 plugins** providing 300+ skills, 65+ agents, and dozens of commands
  (ECC 2.0 alone ships ~271 skills and ~67 agents)
- **Semantic search** (mgrep) for finding information fast
- **Persistent memory** (claude-mem) so Claude remembers across sessions
- **Deep web research** (Exa) for academic and technical searches
- **GitHub integration** for version control and collaboration
- **Browser automation** for web research and screenshots
- **Context management** hooks that prevent losing work during long sessions
- **A project folder** ready for your first research project

Welcome to Claude Code!
