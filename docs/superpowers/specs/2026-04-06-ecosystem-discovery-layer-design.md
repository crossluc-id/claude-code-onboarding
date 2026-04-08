# Ecosystem Discovery Layer

## Purpose

Add an active discovery system to the personal workspace infrastructure that enables Claude (and users) to find, evaluate, and recommend plugins, skills, MCP servers, and learning resources from the Claude Code ecosystem. The system serves two triggers: proactive scanning during onboarding flows, and on-demand search when the user asks about available tools.

## Problem

The workspace has deep internal routing (`skill-routing.json`, `agent-routing.json`) but no outward-facing discovery layer. There is no curated reference of what exists in the broader ecosystem, no way for the advisor to recommend external plugins/skills, and no self-service directory for users to explore. When onboarding someone or suggesting tools, Claude has no map of the ecosystem to draw from.

## Design Decisions

- **Personal workspace, not plugin-distributed.** This lives in `~/.claude/lookup/` and `/workspace/contexts/`, not inside a plugin. It references the user's specific marketplace repos and local paths.
- **Dual-purpose file.** The ecosystem map is structured so agents can parse it for recommendations AND humans can read it as a directory.
- **Active discovery, not static-only.** The advisor uses seed URLs to fetch and scan external repos at runtime, not just read a frozen list.
- **No new agents.** Discovery guidance is woven into the existing advisor context. The advisor already has the right mindset ("notice gaps, suggest opportunities") — it just needs a map of where to look.
- **Lookup directory placement.** The ecosystem map goes in `~/.claude/lookup/` alongside `skill-routing.json` and `agent-routing.json`. This follows the existing pattern: `contexts/` = how to think, `lookup/` = where to find things.

## Deliverables

### 1. Ecosystem Discovery Map

**File:** `~/.claude/lookup/ecosystem-discovery.json`

A structured JSON file with five categories of ecosystem references. Each entry provides enough context for both agent recommendation and human browsing.

#### Schema

```json
{
  "version": "1.0.0",
  "last_updated": "2026-04-06",
  "description": "Claude Code ecosystem discovery map — seed URLs, plugin marketplaces, curated highlights, and learning resources",
  "relationship_to_native_state": "This file is a SUPERSET of the native plugin system. It covers things the native system does not track: MCP servers, curated skill highlights, learning resources, and community examples. For plugin_marketplaces, this file adds context (descriptions, offers, owner) on top of what known_marketplaces.json tracks. The advisor should cross-reference both: ecosystem-discovery.json for what exists, known_marketplaces.json and installed_plugins.json for what is currently installed.",
  "categories": {
    "plugin_marketplaces": [],
    "curated_highlights": [],
    "mcp_servers": [],
    "learning_resources": [],
    "community_examples": []
  }
}
```

#### Entry Schema (plugin_marketplaces)

```json
{
  "name": "everything-claude-code",
  "url": "https://github.com/affaan-m/everything-claude-code",
  "description": "Battle-tested configs: 14+ agents, 56+ skills, 33+ commands",
  "owner": "Affaan Mustafa",
  "offers": ["skills", "agents", "commands"],
  "install": "claude plugin install everything-claude-code@everything-claude-code"
}
```

#### Entry Schema (curated_highlights)

```json
{
  "name": "superpowers:test-driven-development",
  "source": "superpowers-dev",
  "url": "https://github.com/obra/superpowers",
  "description": "TDD workflow enforcement — RED/GREEN/REFACTOR with test-first methodology",
  "good_for": "Learning the TDD skill pattern, seeing how workflow skills enforce discipline",
  "category_tag": "testing"
}
```

#### Entry Schema (mcp_servers)

```json
{
  "name": "Supabase",
  "url": "https://mcp.supabase.com/mcp",
  "type": "remote",
  "description": "PostgreSQL optimization and best practices from Supabase",
  "enables": "Database query optimization, schema design review, performance tuning",
  "access": "Add to .mcp.json as remote MCP server, authenticate via OAuth",
  "docs": "https://supabase.com/docs"
}
```

#### Entry Schema (learning_resources)

```json
{
  "name": "Claude Code Plugin Docs",
  "url": "https://code.claude.com/docs/en/plugins",
  "description": "Official documentation for Claude Code plugin system",
  "covers": "Plugin structure, installation, marketplace submission, skill authoring"
}
```

#### Entry Schema (community_examples)

```json
{
  "name": "HuggingFace Skills",
  "url": "https://github.com/huggingface/skills.git",
  "description": "AI/ML focused skills from HuggingFace",
  "good_for": "Example of how a major platform builds Claude Code skills",
  "offers": ["skills"]
}
```

#### Categories and Entries

**plugin_marketplaces** (9 entries):
- claude-plugins-official (Anthropic) — 20+ internal plugins, 15+ external partner plugins
- compound-engineering-plugin (EveryInc) — workflow skills, multi-platform converter
- everything-claude-code (Affaan Mustafa) — 14+ agents, 56+ skills, 33+ commands
- superpowers-dev (Jesse Vincent) — TDD, debugging, collaboration, verification skills
- supabase-agent-skills — Postgres optimization skill
- voicemode (Mike Bailey) — voice conversations, DJ mode, show-me
- mixedbread-grep — semantic search CLI
- railway-skills — Railway infrastructure management
- claude-mem (thedotmack) — cross-session persistent memory

**curated_highlights** (10 entries):
Skills that serve as exemplary samples or method directions:
- superpowers:test-driven-development — TDD workflow pattern
- superpowers:systematic-debugging — scientific debugging method
- superpowers:brainstorming — idea-to-spec collaborative design
- ECC backend-patterns — API design and backend architecture
- ECC frontend-patterns — React/Next.js patterns
- ECC security-review — OWASP-aware security scanning
- ECC docker-patterns — containerization patterns
- compound-engineering onboarding — repo crawl to ONBOARDING.md
- compound-engineering ce:plan — research-then-write planning
- voicemode converse — voice interaction pattern

**mcp_servers** (14 entries):
Remote MCP endpoints with what they unlock:
- Figma (mcp.figma.com) — design file access
- Stripe (mcp.stripe.com) — payment API integration
- Supabase (mcp.supabase.com) — database optimization
- GitHub Copilot (api.githubcopilot.com) — GitHub API access
- Linear (mcp.linear.app) — issue tracking
- Slack (mcp.slack.com) — messaging integration
- Asana (mcp.asana.com) — project management
- GitLab (gitlab.com) — GitLab API access
- Vercel (mcp.vercel.com) — deployment platform
- Context7 (mcp.context7.com) — live library docs
- ClickHouse (mcp.clickhouse.cloud) — analytics database
- Cloudflare — builds, bindings, docs, observability
- Firebase (npx firebase-tools) — Firebase services
- Playwright (npx @playwright/mcp) — browser automation

**learning_resources** (12 entries):

Onboarding and getting started:
- Affaan Mustafa's ECC Walkthrough (X thread) — onboarding walkthrough for Everything Claude Code, excellent for presenting to new users
- ECC Mintlify Quick Start — structured quick-start documentation for ECC setup
- Compound Engineering Guide (Every.to) — the Plan→Work→Review→Compound philosophy and adoption stages
- Claude Code Plugin Docs — official plugin system documentation
- Plugin Directory Submission — how to submit plugins to the official marketplace
- Marketplace Schema — JSON schema for marketplace metadata

Philosophy and methodology (how to inscribe thinking into code):
- Superpowers: Skills Improvements from User Feedback — evidence-based skill design: gate functions, intent verification over operation success, active enforcement
- Superpowers: Visual Brainstorming Refactor — non-blocking browser-terminal architecture, async interaction patterns, decoupled channels
- Superpowers: Document Review System — iterative validation loops, advisory oversight, agent-driven review as integral workflow step

Platform integration examples:
- PostHog MCP Docs — example of partner MCP integration documentation
- Railway Plugin Docs — example of infrastructure plugin documentation
- Figma MCP Server Docs — example of design tool MCP integration

**community_examples** (12 entries):
Partner repos worth studying for patterns and approaches. These are distinct from plugin_marketplaces: marketplaces are repos you install FROM, community_examples are repos you study for PATTERNS (how a major platform structures skills, how an integration is designed). Some are installable, but their primary value here is as reference implementations:
- HuggingFace skills — AI/ML focused skills
- Sentry plugin — error tracking integration
- Postman plugin — API testing
- AWS Labs agents — cloud infrastructure agents
- Stripe AI plugin — payment platform skills
- PagerDuty plugin — incident management
- Sanity agent toolkit — CMS integration
- Sourcegraph plugin — code intelligence
- Qodo skills — code quality
- Semgrep marketplace — security scanning
- Pinecone plugin — vector database
- Wix skills — web platform integration

### 2. Advisor Context Update

**File:** `/workspace/contexts/advisor.md`

Add an **"Ecosystem Discovery"** section to the existing advisor context. This section tells the advisor:

#### When to discover (triggers)

- **During onboarding:** When introducing the system to a new user or when the `/onboarding` skill runs, proactively scan key ecosystem sources. Check what's installed vs what's available. Identify gaps relevant to the project at hand.
- **On-demand:** When the user asks "what plugins exist for X?", "is there a skill for Y?", "how do I do Z?" and the answer involves external tools.

#### How to discover (method)

1. Read `~/.claude/lookup/ecosystem-discovery.json` for the seed map
2. Check what's already installed (from `index.yaml` plugins section and `~/.claude/settings.json`)
3. For local matches, present with details and install commands
4. For broader searches, use the search fallback chain defined in `~/.claude/rules/search.md`:
   - EXA MCP (`mcp__exa__*`) if available — best for GitHub repo search and code context
   - `mgrep --web` as fallback — general web search with `site:github.com` filter
   - WebFetch as last resort — scan marketplace READMEs and plugin manifests directly
   - Parse `marketplace.json` and `plugin.json` files from fetched repos
5. Cross-reference `known_marketplaces.json` and `installed_plugins.json` to distinguish what's installed vs available
6. Present findings as opportunities, not checklists (consistent with advisor philosophy)

#### What NOT to do (anti-patterns)

- Do not dump the full ecosystem map as a list — present the one most relevant option, or a focused group for on-demand queries
- Do not recommend what's already installed without noting it
- Do not present speculative URLs — if a fetch fails, skip that entry rather than guessing
- Do not interrupt focused work with ecosystem suggestions — only discover when onboarding or explicitly asked

#### How to present (format)

- Frame as opportunity: "There's a Supabase plugin that could help with your database patterns"
- Include: what it does, where it lives, how to install
- One recommendation at a time during proactive discovery
- Grouped results for on-demand searches
- Always note what's already installed vs what's available

### 3. Index.yaml Update

**File:** `/workspace/index.yaml`

Add one entry to the `lookup.files` section:

```yaml
- ecosystem-discovery.json: "Plugin marketplaces, MCP servers, curated skill highlights, learning resources — for active discovery"
```

Add `discovery` to the `routing.patterns` section, using the same tool-chain style as existing entries:

```yaml
routing:
  patterns:
    discovery: "ecosystem-discovery.json → advisor → EXA/mgrep/WebFetch → recommend"
```

## Scope Boundaries

- Does NOT create a new agent — discovery is a capability of the existing advisor
- Does NOT modify any plugin source code
- Does NOT auto-install plugins — presents recommendations with install commands
- Does NOT cache fetched results persistently — each discovery session is fresh
- Does NOT modify skill-routing.json or agent-routing.json — those handle internal routing, this handles external discovery
- Local marketplace paths are specific to this workspace setup and not portable

## Success Criteria

1. A user can open `ecosystem-discovery.json` and browse the full ecosystem as a directory
2. The advisor can read the file and recommend relevant plugins/skills during onboarding
3. When asked "what plugins exist for database work?", the advisor searches the ecosystem map and fetches current info from relevant repos
4. The file is structured enough for agents to parse programmatically and readable enough for humans to scan
5. Actionable entries (marketplaces, MCP servers) include install/enable instructions; reference entries (learning resources, community examples) include a clear action (read, study, browse)
