# Getting Started

## What You're Setting Up

You're about to set up something genuinely new -- a creative collaborator that lives on your computer and gets better the more you work with it.

Here's what the pieces are:

- **Claude Code** is an AI that lives in your computer's terminal. You talk to it by typing, and it builds things with you through conversation -- websites, documents, systems, whatever you need.
- **Zed** is a modern code editor. It's where you see, read, and touch the files Claude creates. Think of it as your window into the project.
- **This workspace** is a pre-configured environment with tools, skills, and knowledge that makes Claude significantly more capable than a fresh install. It's the difference between hiring someone on their first day and hiring someone who's already been briefed on your work.

How they work together: you talk to Claude in the terminal (or Zed's built-in terminal panel), Claude writes code and creates files, and you see everything appear in Zed in real time.


## What You Need

- A Mac running a recent version of macOS
- An internet connection
- An Anthropic account with a Claude Pro subscription ($20/month) -- sign up at https://claude.ai if you don't have one
- About 90 minutes of uninterrupted time (60 for setup, 30 for your first project -- or split across two sessions)
- No prior coding experience required


## Step 1: Install Zed

1. Go to https://zed.dev and click Download.
2. Open the downloaded `.dmg` file.
3. Drag Zed into your Applications folder.
4. Launch Zed from Applications (or Spotlight: press Cmd+Space, type "Zed").

Take a moment to look around. Zed has three main areas:

- **Sidebar** (left) -- your project's files and folders
- **Editor** (center) -- where file contents appear when you open them
- **Terminal panel** (bottom) -- where you'll talk to Claude. If you don't see it yet, that's fine -- we'll open it in the next step.

Why Zed: it's fast, clean, built for AI collaboration, and not bloated with features you don't need.


## Step 2: Open the Terminal

A terminal is a text-based interface where you type commands and the computer responds. That's it -- nothing mysterious.

You have two ways to open one:

- **In Zed:** Go to the menu: Terminal > New Terminal. Or press Cmd+Shift+P to open the command palette, type "terminal", and select "workspace: new terminal".
- **Standalone:** Press Cmd+Space to open Spotlight, type "Terminal", and open Terminal.app.

Either works. Zed's built-in terminal is more convenient since everything stays in one window.

You'll see a prompt -- usually ending in `$` or `%` -- and a blinking cursor. Try typing this and pressing Enter:

```
echo "hello"
```

The computer responds with `hello`. That's a terminal interaction. You just ran a command.

One reassurance: you can't break anything by typing commands. If something goes wrong or looks confusing, close the terminal window and open a new one. Fresh start.


## Step 3: Install the Foundations

Two things need to be installed before Claude Code: Homebrew (a package manager -- like an app store for terminal tools) and Node.js (a runtime that Claude Code needs to work).

### Install Homebrew

Paste this into your terminal and press Enter:

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Important:** On a fresh Mac, this triggers an "Install Command Line Tools" popup from Apple. This is normal and necessary. Click "Install", enter your Mac password if asked, and wait. This part can take 5-15 minutes. Don't close the terminal while it's working.

If Homebrew is already installed, the script will tell you. That's fine -- move on.

### Install Node.js

Once Homebrew finishes:

```
brew install node
```

Verify it worked:

```
node --version
```

You should see `v18` or higher (something like `v22.4.0`). If you see a version number, you're good.


## Step 4: Install Claude Code

Now install Claude Code itself:

```
npm install -g @anthropic-ai/claude-code
```

This installs Claude Code globally on your machine. When it finishes, launch it:

```
claude
```

On first launch, Claude opens a browser window to authenticate with your Anthropic account. Sign in with the same account that has your Claude Pro subscription. Once authenticated, you're back in the terminal and Claude greets you.

Try typing a message -- anything. Claude responds. This is the core of the whole system. Everything else builds on this.

Type `/exit` to leave Claude for now. We have some configuration to do first.


## Step 5: Orient Zed for Working with Claude Code

Open Zed and get familiar with the working layout:

- **File sidebar** (left) -- shows your project's files
- **Editor pane** (center) -- where you read and edit files
- **Terminal panel** (bottom) -- where you run Claude Code

Open the terminal panel in Zed: Terminal > New Terminal from the menu. This is where you'll run Claude Code from -- you don't need a separate Terminal.app.

When Claude creates or edits files, they appear in Zed automatically. Zed is your window into the project. Claude runs in the terminal below.

**Optional (for later):** Zed has its own built-in AI features -- inline editing, text threads -- that complement Claude Code. These require a separate API key from Anthropic, which is different from your Claude Pro subscription. You can set this up later in Zed Settings (Cmd+,) under the AI section. For now, Claude Code in the terminal is your primary AI collaborator.


## Step 6: Set Up Your Configuration

This is where the workspace becomes powerful. You're going to set up Claude's home directory -- `~/.claude/` -- with rules, knowledge, and capabilities. Think of it as setting up a new team member's desk before they start work.

Claude Code created `~/.claude/` when you first launched it in Step 4. Now you're adding to it.

### Create the directory structure

```
mkdir -p ~/.claude/rules
mkdir -p ~/.claude/contexts
mkdir -p ~/.claude/lookup
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
```

### Copy baseline rules

Rules shape how Claude approaches work -- like giving a collaborator a style guide. Copy these from the workspace:

```
cp -n rules/agents.md ~/.claude/rules/
cp -n rules/brainstorming-compact.md ~/.claude/rules/
cp -n rules/cross-caller-consistency.md ~/.claude/rules/
cp -n rules/hooks.md ~/.claude/rules/
cp -n rules/schema.md ~/.claude/rules/
cp -n rules/search.md ~/.claude/rules/
cp -n rules/voice-readout.md ~/.claude/rules/
```

The `-n` flag means "don't overwrite" -- if you already have any of these files, your versions are preserved.

### Copy contexts

Contexts are thinking modes -- different hats Claude can wear: advisor, developer, researcher, reviewer.

```
mkdir -p ~/.claude/contexts
cp -n contexts/advisor.md ~/.claude/contexts/
cp -n contexts/dev.md ~/.claude/contexts/
cp -n contexts/research.md ~/.claude/contexts/
cp -n contexts/review.md ~/.claude/contexts/
```

### Copy lookup files

Lookup files are reference maps that help Claude find the right tool for the job.

```
mkdir -p ~/.claude/lookup
cp -n lookup/ecosystem-discovery.json ~/.claude/lookup/
cp -n lookup/skill-routing.json ~/.claude/lookup/
cp -n lookup/agent-routing.json ~/.claude/lookup/
cp -n lookup/automation-decision.json ~/.claude/lookup/
cp -n lookup/project-context.json ~/.claude/lookup/
```

### Install core plugins

Open a terminal and run these four commands:

```
claude plugin install superpowers@superpowers-dev
```
Core workflow skills -- brainstorming, test-driven development, debugging, planning.

```
claude plugin install everything-claude-code@everything-claude-code
```
Comprehensive agent and skill library covering dozens of languages, frameworks, and workflows.

```
claude plugin install compound-engineering@every-marketplace
```
Onboarding, code review, and planning tools.

```
claude plugin install claude-mem@thedotmack
```
Persistent memory across sessions -- Claude remembers what you've worked on together and learns from it over time.


## Step 7: Your First Project

Configuration is done. Time to build something. Pick whichever path appeals to you.

### Path A: Build Your Website

Create a new folder, open it in Zed, and start Claude:

```
mkdir ~/my-website
cd ~/my-website
claude
```

Then tell Claude about yourself:

> I'd like to create a personal website. I'm [describe yourself and your work]. Can you help me build something that represents what I do?

What happens next: Claude asks you questions, creates files, and you see them appear in Zed's sidebar. To preview, open the HTML file in your browser (right-click the file in Finder, or Claude can tell you how).

Iterate naturally: "Can you change the color scheme?" "Add a section about my workshops." "Make it feel more minimal."

This path gives you a tangible result, and Claude learns about you and your work in the process.

### Path B: Explore an Idea

You can also just start talking to Claude about something you're thinking about. An idea for a project, a system you want to build, a problem you want to solve.

```
mkdir ~/exploration
cd ~/exploration
claude
```

Then try something like:

> I'm thinking about building a knowledge system for [your field]. I don't know exactly what form it should take -- maybe an app, maybe a workshop series, maybe a curriculum. Can we explore this together?

Claude asks questions, proposes approaches, maybe starts prototyping. This is closer to how you'll actually use the system day to day.

**Suggested stopping point:** After 15-20 minutes of exploration, ask Claude: "Can you summarize what we've discussed and save it as a document?" This gives you a tangible artifact -- a starting point you can return to.


## Step 8: Explore the Ecosystem

Now that you have a working setup, discover what's available. In your Claude session, try asking:

> What plugins and tools are available that might be useful for my work?

Claude reads the ecosystem discovery map (that's one of the lookup files you copied earlier) and recommends tools based on what you've told it about yourself. Try installing one that sounds useful -- Claude walks you through it.

This is the discovery layer. Claude knows about dozens of tools across five categories. As you work together, it learns what you need and suggests what might help.


## What's Next

You have a working system. Here's where to go from here:

- **[Concepts Reference](docs/onboarding/concepts.md)** -- When you want to understand what each piece does and how they fit together.
- **[Method and Philosophy](docs/onboarding/method.md)** -- When you want to understand the philosophy behind the system and why it learns from you.
- **[Learning Path](docs/onboarding/learning-path.md)** -- When you're ready to go deeper with curated tutorials and resources.

You'll also receive the practice layer -- a system for exploring and building around your specific domain. Claude will guide you through that when you're ready.
