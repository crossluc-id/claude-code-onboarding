# Concepts Reference

This is the "what is what" document. It explains each piece of the system so you can understand what you're working with. It assumes you've already completed [GETTING-STARTED.md](../../GETTING-STARTED.md) and have a working setup.

When you want to understand *why* the system works the way it does, see [method.md](method.md). When you're ready for deeper learning, see [learning-path.md](learning-path.md).

---

## 1. The Big Picture

```
  You          Zed           Terminal       Claude Code      Your Project
  (intent) --> (see/edit) --> (talk)    --> (think/build) --> (result)
```

Everything flows through conversation. You describe what you want in plain language. Claude Code figures out how to build it -- reading your project, writing files, running commands, connecting to services as needed. The result appears in Zed, where you can see it, touch it, and refine it. Then you talk to Claude again. This loop -- describe, build, refine -- is how everything gets made.

---

## 2. Your Editor: Zed

Zed is a modern code editor built for speed and AI collaboration. It's where you see and interact with every file Claude creates or modifies. Think of it as your window into the project -- Claude works underneath, but Zed is where you watch it happen and make your own changes.

**Why Zed:** It's fast, has a clean interface that doesn't overwhelm you with options, includes a built-in terminal panel (so you don't need a separate app), and has native support for working alongside AI.

**Essential shortcuts:**

| Shortcut | What It Does |
|----------|-------------|
| Cmd+Shift+P | Open the command palette -- search for any action |
| Cmd+P | Quick-open a file by name |
| Cmd+S | Save the current file |
| Cmd+, | Open Zed settings |
| Cmd+\` | Toggle the terminal panel |

You don't need to memorize these. The command palette (Cmd+Shift+P) lets you search for anything.

More at [zed.dev](https://zed.dev).

---

## 3. Your AI Collaborator: Claude Code

Claude Code is an AI agent that runs in your terminal. It's not a chat window on a website -- it lives inside your computer and works directly with your files.

**What it can do:**

- Read your entire project and understand how the pieces connect
- Write and edit files across your project
- Run commands (build tools, tests, scripts)
- Search the web for information
- Connect to external services (design tools, databases, APIs)

**How it's different from ChatGPT and similar tools:** Those work in a browser chat bubble -- you paste code in, get code back, paste it into your project. Claude Code skips all that. It reads your files directly, writes changes in place, and runs commands on your machine. The conversation happens alongside the work, not separate from it.

**The key insight:** Claude Code gets better the more you configure it and work with it. Out of the box, it's a capable general-purpose assistant. With your configuration layer -- rules, contexts, skills, memory -- it becomes a collaborator that understands your preferences, your domain, and your way of working. Every session teaches it something.

---

## 4. The Configuration Layer (~/.claude/)

The `~/.claude/` directory is Claude's home base -- where it keeps its rules, knowledge, and capabilities. You set this up during GETTING-STARTED.md. Here's what each part does:

| Directory | What's In It | Analogy |
|-----------|-------------|---------|
| `rules/` | Behavioral guidelines -- how Claude should approach work, what standards to follow, what patterns to use | A style guide you hand a new team member on their first day |
| `contexts/` | Thinking modes -- different lenses Claude can adopt depending on what you need | Different hats: advisor (strategic), developer (building), researcher (exploring), reviewer (quality-checking) |
| `lookup/` | Reference maps -- structured directories that help Claude find the right tool, agent, or approach for a given situation | Phone books: Claude doesn't memorize every option, it looks them up |
| `agents/` | Specialized roles -- pre-configured personas Claude can step into for specific types of work | Expert consultants you bring in: one for debugging, one for planning, one for code review |
| `skills/` | Workflow knowledge -- step-by-step procedures for complex processes | Recipes: detailed instructions for things like test-driven development, brainstorming sessions, or shipping a feature |

These files are plain text (mostly Markdown). You can open them in Zed, read them, and edit them. Nothing is hidden or locked away. As you work with Claude, this layer grows -- new rules get added, skills accumulate, lookup maps expand. The system adapts to you.

---

## 5. Plugins

Plugins are packages of skills, agents, and commands created by the community. They extend what Claude can do without you having to write anything yourself.

**Installing a plugin:**

```
claude plugin install <name>@<marketplace>
```

**Discovering plugins:** Ask Claude directly -- "What plugins might help with my project?" -- or browse the ecosystem discovery map (see Section 7 below).

**The four core plugins** (installed during setup):

| Plugin | What It Gives You |
|--------|------------------|
| `superpowers@superpowers-dev` | Core workflow skills -- brainstorming, test-driven development, debugging, and planning methodologies |
| `everything-claude-code@everything-claude-code` | A comprehensive library of agents, skills, and patterns across many languages and domains |
| `compound-engineering@every-marketplace` | Planning frameworks, code review processes, and onboarding workflows |
| `claude-mem@thedotmack` | Persistent memory across sessions -- Claude remembers what it learned about you and your projects |

These work together. Superpowers gives Claude structured ways to approach work. Everything Claude Code gives it a deep toolkit. Compound Engineering gives it a philosophy of making each task improve the next one. And claude-mem gives it continuity between sessions so the learning compounds over time.

---

## 6. MCP Servers

MCP stands for Model Context Protocol. In plain terms: MCP servers are connections between Claude and external services. Think of them like plugging peripherals into your computer -- each one gives Claude access to something new.

**Examples:**

- **Figma** -- Claude can read your design files and build from them
- **GitHub** -- Claude can create pull requests, manage issues, and work with repositories
- **Stripe** -- Claude can interact with payment systems
- **PostgreSQL** -- Claude can query and manage databases

**How to add them:** MCP servers are configured in a `.mcp.json` file in your project or home directory. When you need one, Claude can help you set it up.

**You don't need any to start.** MCP servers become useful as your projects grow and need to connect to specific services. Add them when you need them, not before.

---

## 7. The Ecosystem Discovery Map

Your setup includes a file called `ecosystem-discovery.json` -- a curated directory of tools, plugins, servers, tutorials, and community examples organized across five categories:

1. **Plugin marketplaces** -- where to find plugins from different sources
2. **Curated highlights** -- standout tools and skills worth knowing about
3. **MCP servers** -- available service connections
4. **Learning resources** -- tutorials, guides, and documentation
5. **Community examples** -- real-world configurations and setups from other users and organizations

**How to browse it:** The simplest way is to ask Claude. Say something like "What tools are available for working with databases?" or "Show me what's in the ecosystem discovery map." Claude reads the file, understands the categories, and gives you relevant recommendations based on what you're working on.

You can also open the file directly in Zed (`~/.claude/lookup/ecosystem-discovery.json`) and read through it. It's structured JSON, but readable.

**How it stays current:** The discovery map is a curated starting point, not an exhaustive list. Claude's advisor mode can search beyond the map using web search, so even if something isn't listed, Claude can find it. As new tools emerge and the ecosystem evolves, the map gets updated -- but Claude's ability to search means you're never limited to what's on the list.

This document intentionally does not reproduce the map's contents here. The map is a living file; this document teaches you how to use it.

---

## 8. How It All Fits Together

Here's what a typical day looks like once everything is set up.

You open Zed. Your project is in the sidebar. You open the terminal panel and type `claude`. Claude starts up, loads your rules and configuration, and remembers context from previous sessions (thanks to claude-mem).

You say: "I want to add a contact form to the website." Claude checks its skills for a relevant workflow, picks an approach, and starts working. It reads your existing code to understand the project's structure, writes the new files, and tells you what it did. You see the changes appear in Zed.

You notice the form doesn't match the style of the rest of the site. You say: "Can you make it match the design of the about page?" Claude reads both files, identifies the patterns, and adjusts. You refresh the browser and it looks right.

Later, you want to connect the form to an email service. Claude checks its ecosystem knowledge, suggests an MCP server for the email provider, and helps you configure it. Now the form works end-to-end.

At the end of the session, Claude has learned things: your project uses a specific CSS pattern, you prefer minimal design, the email service is configured a certain way. Next time, it starts from that understanding. The session after that, it knows even more. And the one after that.

**This is the compounding effect.** Every session teaches Claude more about how you work. Configuration evolves. Skills accumulate. The lookup maps grow. The system doesn't just do what you ask -- it gets better at anticipating what you need. Early on, you explain more. Over time, Claude picks up your patterns, your preferences, your standards. The ratio shifts: less explaining, more building.

The investment you made during setup -- the rules, the contexts, the plugins -- is the foundation. Everything you build on top of it makes the foundation stronger.
