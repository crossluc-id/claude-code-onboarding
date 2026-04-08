# Ecosystem Discovery Layer Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an active ecosystem discovery system in the personal workspace that enables Claude and users to find, evaluate, and recommend plugins, skills, MCP servers, and learning resources.

**Architecture:** A single JSON reference file (`ecosystem-discovery.json`) in the lookup directory provides seed URLs and metadata for the entire Claude Code ecosystem. The existing advisor context is extended with discovery guidance (triggers, method, anti-patterns). The index.yaml navigation map points to the new file.

**Tech Stack:** JSON, Markdown, YAML — content authoring only, no code.

---

### Task 1: Create ecosystem-discovery.json

**Files:**
- Create: `~/.claude/lookup/ecosystem-discovery.json`

This is the largest task — populating all 51 entries across 5 categories with exact URLs, descriptions, and install commands gathered from the marketplace metadata files.

- [ ] **Step 1: Create the file with schema envelope and plugin_marketplaces category**

```json
{
  "version": "1.0.0",
  "last_updated": "2026-04-06",
  "description": "Claude Code ecosystem discovery map — seed URLs, plugin marketplaces, curated highlights, and learning resources",
  "relationship_to_native_state": "This file is a SUPERSET of the native plugin system. It covers things the native system does not track: MCP servers, curated skill highlights, learning resources, and community examples. For plugin_marketplaces, this file adds context (descriptions, offers, owner) on top of what known_marketplaces.json tracks. The advisor should cross-reference both: ecosystem-discovery.json for what exists, known_marketplaces.json and installed_plugins.json for what is currently installed.",
  "categories": {
    "plugin_marketplaces": [
      {
        "name": "claude-plugins-official",
        "url": "https://github.com/anthropics/claude-plugins-official",
        "description": "Anthropic's official plugin directory — 20+ internal plugins (LSPs, dev tools, workflow) and 15+ external partner plugins (Stripe, Supabase, GitHub, Figma, etc.)",
        "owner": "Anthropic",
        "offers": ["skills", "agents", "commands", "mcp_servers"],
        "install": "Plugins from this marketplace are installable via: claude plugin install <plugin-name>"
      },
      {
        "name": "compound-engineering",
        "marketplace_key": "every-marketplace",
        "url": "https://github.com/EveryInc/compound-engineering-plugin",
        "description": "AI-powered development tools that get smarter with every use — planning, code review, document review, onboarding, architecture analysis, and multi-platform conversion",
        "owner": "Kieran Klaassen (Every)",
        "offers": ["skills", "agents", "commands"],
        "install": "claude plugin install compound-engineering@every-marketplace"
      },
      {
        "name": "everything-claude-code",
        "url": "https://github.com/affaan-m/everything-claude-code",
        "description": "Battle-tested configs from an Anthropic hackathon winner — 14+ agents, 56+ skills, 33+ commands, and production-ready hooks for TDD, security, code review, and continuous learning",
        "owner": "Affaan Mustafa",
        "offers": ["skills", "agents", "commands", "hooks"],
        "install": "claude plugin install everything-claude-code@everything-claude-code"
      },
      {
        "name": "superpowers",
        "marketplace_key": "superpowers-dev",
        "url": "https://github.com/obra/superpowers",
        "description": "Core skills library — TDD, systematic debugging, brainstorming, writing plans, verification, code review, and collaboration patterns",
        "owner": "Jesse Vincent",
        "offers": ["skills"],
        "install": "claude plugin install superpowers@superpowers-dev"
      },
      {
        "name": "postgres-best-practices",
        "marketplace_key": "supabase-agent-skills",
        "url": "https://github.com/supabase/agent-skills",
        "description": "Postgres performance optimization and best practices from Supabase",
        "owner": "Supabase",
        "offers": ["skills"],
        "install": "claude plugin install postgres-best-practices@supabase-agent-skills"
      },
      {
        "name": "voicemode",
        "url": "https://github.com/mbailey/voicemode",
        "description": "Voice conversations with Claude Code — local STT/TTS, remote voice via mobile/web, DJ mode for background music, soundfonts",
        "owner": "Mike Bailey (VoiceMode)",
        "offers": ["skills", "mcp_servers"],
        "install": "claude plugin install voicemode@voicemode"
      },
      {
        "name": "mgrep",
        "marketplace_key": "Mixedbread-Grep",
        "url": "https://github.com/mixedbread-ai/mgrep",
        "description": "Semantic search CLI — replaces built-in Grep/Glob with AI-powered local file search, also supports web search",
        "owner": "Mixedbread (Joel Dierkes)",
        "offers": ["skills"],
        "install": "claude plugin install mgrep@Mixedbread-Grep"
      },
      {
        "name": "railway",
        "marketplace_key": "railway-skills",
        "url": "https://github.com/railwayapp/railway-skills",
        "description": "Railway infrastructure management — manage projects, services, deployments from Claude Code",
        "owner": "Railway",
        "offers": ["skills"],
        "install": "claude plugin install railway@railway-skills",
        "docs": "https://docs.railway.com/ai/claude-code-plugin"
      },
      {
        "name": "claude-mem",
        "marketplace_key": "thedotmack",
        "url": "https://github.com/thedotmack/claude-mem",
        "description": "Persistent memory system — context compression and cross-session recall with semantic search",
        "owner": "Alex Newman",
        "offers": ["skills", "mcp_servers"],
        "install": "claude plugin install claude-mem@thedotmack",
        "docs": "https://docs.claude-mem.ai"
      }
    ],
    "curated_highlights": [],
    "mcp_servers": [],
    "learning_resources": [],
    "community_examples": []
  }
}
```

Write this to `~/.claude/lookup/ecosystem-discovery.json`.

- [ ] **Step 2: Validate the JSON parses correctly**

Run: `cat ~/.claude/lookup/ecosystem-discovery.json | jq '.categories.plugin_marketplaces | length'`
Expected: `9`

- [ ] **Step 3: Add curated_highlights category**

Edit the file to populate `curated_highlights` with these 10 entries:

```json
"curated_highlights": [
  {
    "name": "superpowers:test-driven-development",
    "source": "superpowers-dev",
    "url": "https://github.com/obra/superpowers",
    "description": "TDD workflow enforcement — RED/GREEN/REFACTOR with test-first methodology",
    "good_for": "Learning how workflow skills enforce discipline through structured phases",
    "category_tag": "testing"
  },
  {
    "name": "superpowers:systematic-debugging",
    "source": "superpowers-dev",
    "url": "https://github.com/obra/superpowers",
    "description": "Scientific debugging method — hypothesize, test, narrow, fix",
    "good_for": "Example of a rigid skill that enforces a specific methodology",
    "category_tag": "debugging"
  },
  {
    "name": "superpowers:brainstorming",
    "source": "superpowers-dev",
    "url": "https://github.com/obra/superpowers",
    "description": "Collaborative idea-to-spec design with review loops and visual companion",
    "good_for": "Example of a multi-phase skill with sub-agent dispatch and user interaction",
    "category_tag": "planning"
  },
  {
    "name": "everything-claude-code:backend-patterns",
    "source": "everything-claude-code",
    "url": "https://github.com/affaan-m/everything-claude-code",
    "description": "Backend architecture patterns — API design, database optimization, server-side best practices for Node.js, Express, and more",
    "good_for": "Reference patterns for API and backend design decisions",
    "category_tag": "backend"
  },
  {
    "name": "everything-claude-code:frontend-patterns",
    "source": "everything-claude-code",
    "url": "https://github.com/affaan-m/everything-claude-code",
    "description": "Frontend patterns for React, Next.js, state management, performance, and UI best practices",
    "good_for": "Reference patterns for frontend architecture decisions",
    "category_tag": "frontend"
  },
  {
    "name": "everything-claude-code:security-review",
    "source": "everything-claude-code",
    "url": "https://github.com/affaan-m/everything-claude-code",
    "description": "OWASP-aware security vulnerability detection — secrets, SSRF, injection, unsafe crypto",
    "good_for": "Example of a proactive agent-backed skill for security scanning",
    "category_tag": "security"
  },
  {
    "name": "everything-claude-code:docker-patterns",
    "source": "everything-claude-code",
    "url": "https://github.com/affaan-m/everything-claude-code",
    "description": "Docker and Docker Compose patterns — local dev, container security, networking, multi-stage builds",
    "good_for": "Reference for containerization decisions and Docker best practices",
    "category_tag": "devops"
  },
  {
    "name": "compound-engineering:onboarding",
    "source": "every-marketplace",
    "url": "https://github.com/EveryInc/compound-engineering-plugin",
    "description": "Generate ONBOARDING.md from repo crawl — hybrid script-first architecture with inventory script + model synthesis",
    "good_for": "Example of script-first skill pattern and structured document generation",
    "category_tag": "documentation"
  },
  {
    "name": "compound-engineering:ce-plan",
    "source": "every-marketplace",
    "url": "https://github.com/EveryInc/compound-engineering-plugin",
    "description": "Research-then-write implementation planning with sub-agent dispatch for research and review",
    "good_for": "Example of multi-agent orchestration in a planning workflow",
    "category_tag": "planning"
  },
  {
    "name": "voicemode:converse",
    "source": "voicemode",
    "url": "https://github.com/mbailey/voicemode",
    "description": "Voice interaction pattern — speak-and-listen with parallel tool calls for zero dead air",
    "good_for": "Example of MCP-based skill with real-time interaction and service management",
    "category_tag": "interaction"
  }
]
```

- [ ] **Step 4: Add mcp_servers category**

Edit the file to populate `mcp_servers` with these 14 entries:

```json
"mcp_servers": [
  {
    "name": "Figma",
    "url": "https://mcp.figma.com/mcp",
    "type": "remote",
    "description": "Design file access — read Figma files, components, and design tokens",
    "enables": "Design-to-code workflows, component inspection, design system integration",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth",
    "docs": "https://developers.figma.com/docs/figma-mcp-server/"
  },
  {
    "name": "Stripe",
    "url": "https://mcp.stripe.com",
    "type": "remote",
    "description": "Payment platform API integration — create products, manage subscriptions, handle webhooks",
    "enables": "Payment processing, billing integration, financial data access",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Supabase",
    "url": "https://mcp.supabase.com/mcp",
    "type": "remote",
    "description": "PostgreSQL optimization and best practices from Supabase",
    "enables": "Database query optimization, schema design review, performance tuning",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth",
    "docs": "https://supabase.com/docs"
  },
  {
    "name": "GitHub Copilot",
    "url": "https://api.githubcopilot.com/mcp/",
    "type": "remote",
    "description": "GitHub API access via Copilot MCP — issues, PRs, actions, repos",
    "enables": "GitHub workflow automation, PR management, issue tracking",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Linear",
    "url": "https://mcp.linear.app/mcp",
    "type": "remote",
    "description": "Linear issue tracking integration — create, update, and query issues and projects",
    "enables": "Issue management, sprint planning, project tracking from Claude Code",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Slack",
    "url": "https://mcp.slack.com/mcp",
    "type": "remote",
    "description": "Slack workspace integration — send messages, read channels, manage threads",
    "enables": "Team communication, notification workflows, channel management",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Asana",
    "url": "https://mcp.asana.com/sse",
    "type": "remote",
    "description": "Asana project management — tasks, projects, and workflow automation",
    "enables": "Task management, project tracking, team coordination",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "GitLab",
    "url": "https://gitlab.com/api/v4/mcp",
    "type": "remote",
    "description": "GitLab API integration — repos, merge requests, CI/CD pipelines",
    "enables": "GitLab workflow automation, MR management, pipeline control",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Vercel",
    "url": "https://mcp.vercel.com",
    "type": "remote",
    "description": "Vercel deployment platform — deployments, domains, environment management",
    "enables": "Deploy previews, production deployments, domain configuration",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Context7",
    "url": "https://mcp.context7.com/mcp",
    "type": "remote",
    "description": "Live library documentation lookup — fetch current docs for any library or framework",
    "enables": "Up-to-date API syntax, configuration, version migration, library-specific debugging",
    "access": "Already available via plugin. Alternatively: npx -y @upstash/context7-mcp as stdio server"
  },
  {
    "name": "ClickHouse",
    "url": "https://mcp.clickhouse.cloud/mcp",
    "type": "remote",
    "description": "ClickHouse analytics database — query optimization, schema design for OLAP workloads",
    "enables": "Analytics queries, time-series data, high-performance aggregations",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Cloudflare",
    "url": "https://mcp.cloudflare.com",
    "type": "remote",
    "description": "Cloudflare platform — Workers, Pages, DNS, R2 storage, D1 database, observability",
    "enables": "Edge deployment, CDN management, serverless functions, DNS configuration",
    "access": "Add as remote MCP server in .mcp.json, authenticate via OAuth"
  },
  {
    "name": "Firebase",
    "command": "npx firebase-tools@latest mcp",
    "type": "stdio",
    "description": "Google Firebase — Firestore, Auth, Hosting, Cloud Functions, Storage",
    "enables": "Firebase service management, Firestore queries, auth configuration",
    "access": "Add as stdio MCP server in .mcp.json with command: npx firebase-tools@latest mcp"
  },
  {
    "name": "Playwright",
    "command": "npx @playwright/mcp@latest",
    "type": "stdio",
    "description": "Browser automation — E2E testing, visual verification, screenshots, page interaction",
    "enables": "Automated browser testing, screenshot capture, form filling, page scraping",
    "access": "Add as stdio MCP server in .mcp.json with command: npx @playwright/mcp@latest"
  }
]
```

- [ ] **Step 5: Add learning_resources category**

```json
"learning_resources": [
  {
    "name": "ECC Onboarding Walkthrough (Affaan Mustafa)",
    "url": "https://x.com/affaanmustafa/status/2014040193557471352",
    "description": "X thread walking through Everything Claude Code setup and usage — excellent for presenting to someone onboarding into the ecosystem",
    "covers": "ECC installation, key skills, agent setup, practical workflow examples",
    "action": "Present to new users as the first onboarding resource",
    "subcategory": "onboarding"
  },
  {
    "name": "ECC Mintlify Quick Start",
    "url": "https://mintlify.com/affaan-m/everything-claude-code/quickstart",
    "description": "Structured quick-start documentation for Everything Claude Code with full docs index",
    "covers": "Step-by-step setup, configuration, skill discovery",
    "action": "Read for structured ECC setup guidance; see also llms.txt at https://affaan-m-everything-claude-code.mintlify.app/llms.txt",
    "subcategory": "onboarding"
  },
  {
    "name": "Compound Engineering Guide",
    "url": "https://every.to/guides/compound-engineering",
    "description": "The Plan→Work→Review→Compound philosophy — each unit of engineering work should make subsequent units easier, not harder",
    "covers": "Compound development loop, adoption stages (0-5), agent-native architecture, 50/50 features-vs-system-improvements allocation",
    "action": "Read to understand the compound engineering philosophy that drives the compound-engineering plugin",
    "subcategory": "onboarding"
  },
  {
    "name": "Claude Code Plugin Docs",
    "url": "https://code.claude.com/docs/en/plugins",
    "description": "Official documentation for Claude Code plugin system",
    "covers": "Plugin structure, installation, marketplace submission, skill authoring",
    "action": "Read to understand how plugins, skills, and agents are structured",
    "subcategory": "onboarding"
  },
  {
    "name": "Plugin Directory Submission",
    "url": "https://clau.de/plugin-directory-submission",
    "description": "Submit a plugin to the official Claude Code plugin directory",
    "covers": "Submission process, requirements, review criteria",
    "action": "Use when ready to publish a plugin to the official marketplace",
    "subcategory": "onboarding"
  },
  {
    "name": "Marketplace Schema",
    "url": "https://anthropic.com/claude-code/marketplace.schema.json",
    "description": "JSON schema for Claude Code marketplace metadata files",
    "covers": "Required fields, plugin entry format, marketplace.json structure",
    "action": "Reference when building or validating marketplace.json files",
    "subcategory": "onboarding"
  },
  {
    "name": "Superpowers: Skills Improvements from User Feedback",
    "url": "https://github.com/obra/superpowers/blob/main/docs/plans/2025-11-28-skills-improvements-from-user-feedback.md",
    "description": "Evidence-based skill design — 8 systematic problems discovered through real usage, with gate functions and intent verification philosophy",
    "covers": "Verification means confirming intent achievement not just operation success, skills must be actively enforced not passively available, context bloat prevention",
    "action": "Study to understand how to inscribe methodology into skill files — the thinking behind skill design",
    "subcategory": "philosophy"
  },
  {
    "name": "Superpowers: Visual Brainstorming Refactor",
    "url": "https://github.com/obra/superpowers/blob/main/docs/superpowers/plans/2026-02-19-visual-brainstorming-refactor.md",
    "description": "Non-blocking browser-terminal architecture — decoupled channels, event-driven communication, minimal client responsibility",
    "covers": "Async interaction patterns for agentic systems, browser as display / terminal as conversation channel, event file coordination",
    "action": "Study to understand architecture patterns for interactive skill design",
    "subcategory": "philosophy"
  },
  {
    "name": "Superpowers: Document Review System",
    "url": "https://github.com/obra/superpowers/blob/main/docs/superpowers/plans/2026-01-22-document-review-system.md",
    "description": "Iterative validation loops with advisory oversight — review as integral workflow step, not afterthought",
    "covers": "Distributed responsibility (author fixes, not reviewer), chunk-based granularity, human escalation thresholds, structured feedback criteria",
    "action": "Study to understand how to build review systems that improve documents through refinement cycles",
    "subcategory": "philosophy"
  },
  {
    "name": "PostHog MCP Docs",
    "url": "https://posthog.com/docs/model-context-protocol",
    "description": "PostHog's documentation for their MCP integration",
    "covers": "Example of how a SaaS platform documents MCP server usage",
    "action": "Study as a reference for MCP integration documentation patterns",
    "subcategory": "platform_examples"
  },
  {
    "name": "Railway Plugin Docs",
    "url": "https://docs.railway.com/ai/claude-code-plugin",
    "description": "Railway's documentation for their Claude Code plugin",
    "covers": "Infrastructure plugin pattern, deployment management skills",
    "action": "Study as a reference for infrastructure-focused plugin design",
    "subcategory": "platform_examples"
  },
  {
    "name": "Figma MCP Server Docs",
    "url": "https://developers.figma.com/docs/figma-mcp-server/",
    "description": "Figma's documentation for their MCP server integration",
    "covers": "Design tool MCP pattern, OAuth flow, file access API",
    "action": "Study as a reference for design tool MCP integration",
    "subcategory": "platform_examples"
  }
]
```

- [ ] **Step 6: Add community_examples category**

```json
"community_examples": [
  {
    "name": "HuggingFace Skills",
    "url": "https://github.com/huggingface/skills.git",
    "description": "AI/ML focused skills from HuggingFace",
    "good_for": "Example of how a major AI platform builds Claude Code skills",
    "offers": ["skills"]
  },
  {
    "name": "Sentry Plugin",
    "url": "https://github.com/getsentry/sentry-for-claude.git",
    "description": "Sentry error monitoring integration — error tracking, performance monitoring, release health",
    "good_for": "Example of observability platform integration with error context",
    "offers": ["skills", "mcp_servers"]
  },
  {
    "name": "Postman Plugin",
    "url": "https://github.com/Postman-Devrel/postman-claude-code-plugin.git",
    "description": "Postman API lifecycle management — collections, environments, testing",
    "good_for": "Example of API testing platform integration",
    "offers": ["skills"],
    "docs": "https://learning.postman.com/docs/developer/postman-mcp-server/"
  },
  {
    "name": "AWS Labs Agents",
    "url": "https://github.com/awslabs/agent-plugins.git",
    "description": "AWS serverless, deployment, migration, and geospatial services — multiple plugins in one repo",
    "good_for": "Example of multi-plugin repo structure for cloud infrastructure",
    "offers": ["skills", "agents"]
  },
  {
    "name": "Stripe AI Plugin",
    "url": "https://github.com/stripe/ai/tree/main/providers/claude/plugin",
    "description": "Stripe payment processing integration",
    "good_for": "Example of how a major fintech platform structures their Claude Code plugin",
    "offers": ["skills", "mcp_servers"]
  },
  {
    "name": "PagerDuty Plugin",
    "url": "https://github.com/PagerDuty/claude-code-plugins.git",
    "description": "PagerDuty incident management — on-call schedules, incident response, escalation",
    "good_for": "Example of incident management integration pattern",
    "offers": ["skills"]
  },
  {
    "name": "Sanity Agent Toolkit",
    "url": "https://github.com/sanity-io/agent-toolkit.git",
    "description": "Sanity CMS integration — content management, schema introspection, document queries",
    "good_for": "Example of headless CMS integration and content platform skills",
    "offers": ["skills"]
  },
  {
    "name": "Sourcegraph Plugin",
    "url": "https://github.com/sourcegraph-community/sourcegraph-claudecode-plugin.git",
    "description": "Code search across codebases — cross-repo search, code intelligence, references",
    "good_for": "Example of code intelligence platform integration",
    "offers": ["skills"]
  },
  {
    "name": "Qodo Skills",
    "url": "https://github.com/qodo-ai/qodo-skills.git",
    "description": "AI agent capabilities for code quality and testing",
    "good_for": "Example of AI-native code quality skills",
    "offers": ["skills"]
  },
  {
    "name": "Semgrep Marketplace",
    "url": "https://github.com/semgrep/mcp-marketplace.git",
    "description": "Security scanning and vulnerability detection via Semgrep",
    "good_for": "Example of security scanning tool integration as MCP marketplace",
    "offers": ["skills", "mcp_servers"]
  },
  {
    "name": "Pinecone Plugin",
    "url": "https://github.com/pinecone-io/pinecone-claude-code-plugin.git",
    "description": "Pinecone vector database integration — similarity search, embeddings, index management",
    "good_for": "Example of vector database integration for AI applications",
    "offers": ["skills"]
  },
  {
    "name": "Wix Skills",
    "url": "https://github.com/wix/skills.git",
    "description": "Wix site and app builder integration",
    "good_for": "Example of web platform builder skills",
    "offers": ["skills"]
  }
]
```

- [ ] **Step 7: Validate complete file**

Run: `cat ~/.claude/lookup/ecosystem-discovery.json | jq '{plugin_marketplaces: (.categories.plugin_marketplaces | length), curated_highlights: (.categories.curated_highlights | length), mcp_servers: (.categories.mcp_servers | length), learning_resources: (.categories.learning_resources | length), community_examples: (.categories.community_examples | length)}'`

Expected:
```json
{
  "plugin_marketplaces": 9,
  "curated_highlights": 10,
  "mcp_servers": 14,
  "learning_resources": 12,
  "community_examples": 12
}
```

Total: 57 entries.

- [ ] **Step 8: Note — this file is outside the git repo**

`~/.claude/lookup/` is not inside `/workspace` (the git repo). This file is personal workspace infrastructure and is not git-tracked. No commit needed for this task — the file persists in the user's home directory.

---

### Task 2: Update advisor context with discovery guidance

**Files:**
- Modify: `/workspace/contexts/advisor.md`

- [ ] **Step 1: Read current advisor.md to confirm current state**

Read `/workspace/contexts/advisor.md` to verify the current content ends after "What to Avoid" section.

- [ ] **Step 2: Append Ecosystem Discovery section**

Add the following after the existing "What to Avoid" section:

```markdown

## Ecosystem Discovery

The Claude Code ecosystem has plugins, skills, MCP servers, and learning resources
beyond what's installed locally. Use this capability to help users find what they
need — whether during onboarding or when they ask about available tools.

### Seed Map

Read `~/.claude/lookup/ecosystem-discovery.json` for the full ecosystem reference.
This file covers five categories: plugin marketplaces, curated skill highlights,
MCP servers, learning resources, and community examples.

Cross-reference with the native plugin state:
- `known_marketplaces.json` — which marketplaces are registered
- `installed_plugins.json` — which plugins are currently installed
- `~/.claude/.mcp.json` — which MCP servers are active

### When to Discover

- **During onboarding:** When introducing the system to a new user or when the
  `/onboarding` skill runs, proactively scan key ecosystem sources. Check what's
  installed vs what's available. Identify gaps relevant to the project at hand.
- **On-demand:** When the user asks "what plugins exist for X?", "is there a skill
  for Y?", "how do I do Z?" and the answer involves external tools.

### How to Discover

1. Read the seed map for matching entries
2. Check what's already installed vs available
3. For local matches, present with details and install commands
4. For broader searches, follow the search fallback chain in `~/.claude/rules/search.md`:
   EXA MCP → mgrep --web → WebFetch
5. When fetching external repos, look for `marketplace.json` and `plugin.json` for current metadata

### How to Present

- Frame as opportunity: "There's a Supabase plugin that could help with your database patterns"
- Include: what it does, where it lives, how to install
- One recommendation at a time during proactive discovery
- Grouped results for on-demand searches
- Always note what's already installed vs what's available

### What Not to Do

- Do not dump the full ecosystem map as a list
- Do not recommend what's already installed without noting it
- Do not present speculative URLs — if a fetch fails, skip that entry
- Do not interrupt focused work with ecosystem suggestions
```

- [ ] **Step 3: Verify the file reads correctly**

Read `/workspace/contexts/advisor.md` and confirm the new section is present and well-formatted.

- [ ] **Step 4: Note — commit deferred to Task 4**

This file is git-tracked. It will be committed together with `index.yaml` in Task 4, Step 6.

---

### Task 3: Update index.yaml

**Files:**
- Modify: `/workspace/index.yaml`

- [ ] **Step 1: Add ecosystem-discovery.json to lookup.files**

In the `lookup:` section, insert after the line `- project-context.json: "Project phases, commands, and typical tasks"`:

```yaml
    - ecosystem-discovery.json: "Plugin marketplaces, MCP servers, curated skill highlights, learning resources — for active discovery"
```

- [ ] **Step 2: Add discovery routing pattern**

In the `routing:` section, insert after the line `security: "security-reviewer (auth, input, API endpoints)"`:

```yaml
    discovery: "ecosystem-discovery.json → advisor → EXA/mgrep/WebFetch → recommend"
```

- [ ] **Step 3: Verify YAML is valid**

Run: `python3 -c "import yaml; yaml.safe_load(open('/workspace/index.yaml'))" && echo "valid"`
Expected: `valid`

- [ ] **Step 4: Note — commit deferred to Task 4**

This file is git-tracked. It will be committed together with `advisor.md` in Task 4, Step 6.

---

### Task 4: Validate end-to-end

- [ ] **Step 1: Verify ecosystem-discovery.json is valid JSON with correct entry counts**

Run: `jq '.categories | to_entries | map({key: .key, count: (.value | length)})' ~/.claude/lookup/ecosystem-discovery.json`

Expected: 5 categories with counts 9, 10, 14, 12, 12 (total 57).

- [ ] **Step 2: Verify all URLs in plugin_marketplaces are reachable GitHub repos**

Run: `jq -r '.categories.plugin_marketplaces[].url' ~/.claude/lookup/ecosystem-discovery.json`

Confirm all 9 URLs are valid `https://github.com/...` patterns.

- [ ] **Step 3: Verify advisor.md has the Ecosystem Discovery section**

Run: `grep -c "Ecosystem Discovery" /workspace/contexts/advisor.md`
Expected: At least 1 match.

- [ ] **Step 4: Verify index.yaml references the new file**

Run: `grep "ecosystem-discovery" /workspace/index.yaml`
Expected: 2 matches (one in lookup.files, one in routing.patterns).

- [ ] **Step 5: Confirm the file is human-browsable**

Open `~/.claude/lookup/ecosystem-discovery.json` and verify:
- Categories are clearly labeled
- Each entry has a description readable by a human
- Install commands are present on actionable entries
- `action` fields are present on reference entries (learning_resources)

- [ ] **Step 6: Final commit for git-tracked files**

```bash
git add /workspace/contexts/advisor.md /workspace/index.yaml
git commit -m "feat: ecosystem discovery layer — advisor guidance and index.yaml routing"
```

Note: `ecosystem-discovery.json` lives in `~/.claude/lookup/` (outside the repo) and is not git-tracked. Only `advisor.md` and `index.yaml` are committed.
