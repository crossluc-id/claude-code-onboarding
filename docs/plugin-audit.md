# Claude Code Plugin Audit

**Date**: 2026-04-05
**Scope**: All plugins installed at `~/.claude/plugins/cache/`

---

## Executive Summary

| Plugin | Version | Skills | Commands | Agents | Hooks | Notes |
|--------|---------|--------|----------|--------|-------|-------|
| **everything-claude-code (ECC)** | 1.8.0 | 108 | 57 | 25 | 1 config | Mega-plugin: lang patterns, workflows, AI ops, business |
| **superpowers** | 5.0.4 | 14 | 3 (deprecated) | 1 | 1 config | Core workflow disciplines (plan, TDD, review) |
| **claude-mem** | 10.5.6 | 4 | 0 | 0 | 1 config | Persistent memory, plan/execute, AST search |
| **commit-commands** | 78497c5 | 0 | 3 | 0 | 0 | Git commit, push, PR, branch cleanup |
| **code-review** | 78497c5 | 0 | 1 | 0 | 0 | PR code review |
| **mgrep** | 0.0.0 | 1 | 0 | 0 | hooks | Replaces built-in Grep/Glob/WebSearch |
| **context7** | 78497c5 | 0 | 0 | 0 | 0 | MCP server for live library docs |
| **voicemode** | 8.5.1p1 | 0 | 0 | 0 | 0 | MCP server for TTS/STT voice interaction |
| **railway-skills** | - | 0 | 0 | 0 | 0 | Empty cache |
| **supabase-agent-skills** | - | 0 | 0 | 0 | 0 | Empty cache |
| Official: claude-md-management, code-simplifier, feature-dev, figma, github, hookify, security-guidance, supabase | various | 0 | 0 | 0 | 0 | Empty caches / MCP-only |

**Totals**: ~127 skills, ~64 commands, ~26 agents across all plugins.

---

## Tier 1: Essential Tools (Use in Almost Every Project)

These are the tools worth building muscle memory for. They apply regardless of language or project type.

### Skills

| Name | Source | Category | What It Does | When to Use |
|------|--------|----------|--------------|-------------|
| **tdd-workflow** | ECC | Testing | Enforces write-tests-first TDD with 80%+ coverage across unit, integration, and E2E | Any new feature or bug fix |
| **verification-loop** | ECC | Quality | Comprehensive pre-commit/pre-PR verification: build, lint, typecheck, tests, security | Before claiming work is done |
| **security-review** | ECC | Security | OWASP-aligned checklist for auth, input handling, secrets, API endpoints | Any code touching user input or auth |
| **coding-standards** | ECC | Quality | Universal TS/JS/React/Node best practices and patterns | All TypeScript/JavaScript work |
| **api-design** | ECC | Backend | REST API patterns: naming, status codes, pagination, error responses, versioning | Designing or reviewing APIs |
| **search-first** | ECC | Workflow | Research-before-coding: search for existing tools/libraries before writing custom code | Starting any new implementation |
| **strategic-compact** | ECC | Workflow | Suggests manual context compaction at logical intervals to preserve task context | Long sessions |
| **test-driven-development** | Superpowers | Testing | TDD discipline: write test first, watch fail, implement, refactor | Every feature/bugfix |
| **verification-before-completion** | Superpowers | Quality | Requires running verification and confirming output before claiming success | Before marking work done |
| **systematic-debugging** | Superpowers | Debugging | Structured debugging: reproduce, hypothesize, verify before fixing | Any bug or test failure |
| **writing-plans** | Superpowers | Planning | Create implementation plans from specs before touching code | Multi-step tasks |
| **executing-plans** | Superpowers | Planning | Execute written plans with review checkpoints between steps | After plan is written |
| **brainstorming** | Superpowers | Planning | Explore intent, requirements, and design before implementation | Any creative/feature work |
| **mem-search** | claude-mem | Memory | Search persistent cross-session memory for past solutions | "Did we solve this before?" |
| **mgrep** | mgrep | Search | Replaces built-in search. `mgrep "query"` for local, `mgrep --web` for internet | Every search operation |

### Commands

| Name | Source | Category | What It Does | When to Use |
|------|--------|----------|--------------|-------------|
| **/plan** | ECC | Planning | Restate requirements, assess risks, create step-by-step plan. Waits for CONFIRM before coding | Start of any non-trivial task |
| **/tdd** | ECC | Testing | Scaffold interfaces, generate tests FIRST, then implement minimal code to pass | Feature implementation |
| **/verify** | ECC | Quality | Run comprehensive verification: build, typecheck, lint, tests, security | Before commit/PR |
| **/code-review** | ECC | Quality | Security and quality review of uncommitted changes | After writing code |
| **/build-fix** | ECC | Build | Incrementally fix build/type errors with minimal safe changes | When build breaks |
| **/test-coverage** | ECC | Testing | Analyze coverage, identify gaps, generate tests to reach 80%+ | After initial tests pass |
| **/refactor-clean** | ECC | Quality | Detect and safely remove dead code with test verification at each step | Cleanup sprints |
| **/learn** | ECC | Learning | Extract reusable patterns from current session into skills | After solving hard problems |
| **/commit** | commit-commands | Git | Create a conventional git commit with staged changes | After verified code is ready |
| **/commit-push-pr** | commit-commands | Git | Commit, push to remote, and open a PR in one command | Ship completed work |
| **/code-review** | code-review | Git | Review a pull request | Incoming PRs |

### Agents

| Name | Source | Category | What It Does | When to Use |
|------|--------|----------|--------------|-------------|
| **code-reviewer** | ECC | Quality | Expert code review for quality, security, maintainability | After any code change |
| **build-error-resolver** | ECC | Build | Build/TypeScript error resolution with minimal diffs | When build fails |
| **security-reviewer** | ECC | Security | Flags secrets, SSRF, injection, unsafe crypto, OWASP Top 10 | After writing sensitive code |
| **planner** | ECC | Planning | Complex feature planning and architectural changes | Large features/refactors |
| **tdd-guide** | ECC | Testing | TDD methodology enforcement with 80%+ coverage | Feature development |
| **architect** | ECC | Architecture | System design, scalability, technical decision-making | Architectural decisions |
| **code-reviewer** | Superpowers | Quality | Reviews completed steps against original plan and standards | After each plan step |

---

## Tier 2: Valuable for Specific Project Types

### Web Development (React/Next.js/Frontend)

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **frontend-patterns** | ECC | Skill | React, Next.js, state management, performance, UI best practices |
| **nextjs-turbopack** | ECC | Skill | Next.js 16+ and Turbopack incremental bundling patterns |
| **e2e-testing** | ECC | Skill | Playwright E2E: Page Object Model, CI/CD, artifact management |
| **frontend-slides** | ECC | Skill | Create animation-rich HTML presentations or convert PPT to web |
| **liquid-glass-design** | ECC | Skill | iOS 26 Liquid Glass design system for SwiftUI/UIKit |
| **/e2e** | ECC | Command | Generate and run Playwright E2E tests with screenshots/video |
| **/multi-frontend** | ECC | Command | Gemini-led frontend development workflow with quality gates |
| **e2e-runner** | ECC | Agent | E2E testing with Vercel Agent Browser / Playwright fallback |

### Backend (Node.js/Python/Go/Rust/Java)

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **backend-patterns** | ECC | Skill | Node.js/Express/Next.js API routes architecture |
| **bun-runtime** | ECC | Skill | Bun as runtime, package manager, bundler, test runner |
| **python-patterns** | ECC | Skill | Pythonic idioms, PEP 8, type hints, best practices |
| **golang-patterns** | ECC | Skill | Idiomatic Go patterns and conventions |
| **rust-patterns** | ECC | Skill | Idiomatic Rust: ownership, error handling, traits, concurrency |
| **kotlin-patterns** | ECC | Skill | Kotlin with coroutines, null safety, DSL builders |
| **springboot-patterns** | ECC | Skill | Spring Boot REST API, layered services, caching, async |
| **django-patterns** | ECC | Skill | Django REST API, ORM, caching, signals, middleware |
| **laravel-patterns** | ECC | Skill | Laravel routing, Eloquent, service layers, queues |
| **/multi-backend** | ECC | Command | Codex-led backend development workflow |
| **python-reviewer** | ECC | Agent | PEP 8, type hints, security, Pythonic idioms review |
| **go-reviewer** | ECC | Agent | Idiomatic Go, concurrency safety, error handling review |
| **rust-reviewer** | ECC | Agent | Ownership, lifetimes, unsafe usage review |
| **java-reviewer** | ECC | Agent | Spring Boot layered architecture, JPA, security review |

### Database

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **postgres-patterns** | ECC | Skill | PostgreSQL query optimization, schema design, indexing, Supabase patterns |
| **database-migrations** | ECC | Skill | Migration best practices for Postgres/MySQL across ORMs (Prisma, Drizzle, Django) |
| **clickhouse-io** | ECC | Skill | ClickHouse analytics and data engineering patterns |
| **database-reviewer** | ECC | Agent | PostgreSQL specialist for query optimization, schema design, security |

### Testing (Language-Specific)

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **python-testing** | ECC | Skill | pytest, fixtures, mocking, parametrization, coverage |
| **golang-testing** | ECC | Skill | Table-driven tests, subtests, benchmarks, fuzzing |
| **rust-testing** | ECC | Skill | Unit/integration tests, async testing, property-based testing |
| **kotlin-testing** | ECC | Skill | Kotest, MockK, coroutine testing, Kover coverage |
| **cpp-testing** | ECC | Skill | GoogleTest, CTest, sanitizers, coverage |
| **perl-testing** | ECC | Skill | Test2::V0, prove runner, Devel::Cover |
| **/go-test** | ECC | Command | TDD workflow for Go with 80%+ coverage |
| **/rust-test** | ECC | Command | TDD workflow for Rust with cargo-llvm-cov |
| **/cpp-test** | ECC | Command | TDD workflow for C++ with GoogleTest |
| **/kotlin-test** | ECC | Command | TDD workflow for Kotlin with Kotest/Kover |

### Security (Language-Specific)

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **security-scan** | ECC | Skill | Scan `.claude/` config for vulnerabilities (AgentShield) |
| **django-security** | ECC | Skill | Django auth, CSRF, SQL injection, XSS, deployment security |
| **laravel-security** | ECC | Skill | Laravel auth, validation, CSRF, mass assignment, rate limiting |
| **springboot-security** | ECC | Skill | Spring Security authn/authz, CSRF, secrets, rate limiting |
| **perl-security** | ECC | Skill | Taint mode, DBI parameterized queries, web security |

### DevOps / Deployment

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **deployment-patterns** | ECC | Skill | CI/CD pipelines, Docker, health checks, rollback strategies |
| **docker-patterns** | ECC | Skill | Docker Compose, container security, networking, volumes |
| **/pm2** | ECC | Command | Auto-analyze project and generate PM2 service configs |

### AI/Agent Engineering

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **claude-api** | ECC | Skill | Anthropic Claude API: Messages, streaming, tools, batches, Agent SDK |
| **agentic-engineering** | ECC | Skill | Eval-first execution, decomposition, cost-aware model routing |
| **autonomous-loops** | ECC | Skill | Patterns for autonomous Claude Code loops with quality gates |
| **agent-harness-construction** | ECC | Skill | Design AI agent action spaces, tool definitions, observation formatting |
| **cost-aware-llm-pipeline** | ECC | Skill | LLM API cost optimization: model routing, budget tracking, caching |
| **mcp-server-patterns** | ECC | Skill | Build MCP servers with Node/TypeScript SDK |
| **eval-harness** | ECC | Skill | Evaluation framework for Claude Code sessions (EDD) |
| **continuous-learning-v2** | ECC | Skill | Instinct-based learning with confidence scoring, evolving into skills |
| **claude-devfleet** | ECC | Skill | Orchestrate multi-agent coding via DevFleet |
| **dmux-workflows** | ECC | Skill | Multi-agent orchestration using dmux tmux pane manager |
| **/loop-start** | ECC | Command | Start managed autonomous loop patterns with safety defaults |
| **/model-route** | ECC | Command | Recommend best model tier by task complexity and budget |
| **/claw** | ECC | Command | NanoClaw v2 persistent REPL with model routing, branching |
| **/devfleet** | ECC | Command | Orchestrate parallel agents via DevFleet |
| **/orchestrate** | ECC | Command | Sequential and tmux/worktree orchestration for multi-agent workflows |
| **loop-operator** | ECC | Agent | Operate and monitor autonomous agent loops |
| **harness-optimizer** | ECC | Agent | Analyze and improve local agent harness configuration |
| **dispatching-parallel-agents** | Superpowers | Skill | Run 2+ independent tasks without shared state in parallel |
| **subagent-driven-development** | Superpowers | Skill | Execute plan tasks via subagents with code review between tasks |
| **make-plan** | claude-mem | Skill | Create phased implementation plans with doc discovery |
| **do** | claude-mem | Skill | Execute phased plans using subagents |

### Research / Content

| Name | Source | Type | What It Does |
|------|--------|------|--------------|
| **deep-research** | ECC | Skill | Multi-source research with firecrawl/exa, cited reports |
| **exa-search** | ECC | Skill | Neural search via Exa for web, code, company research |
| **documentation-lookup** | ECC | Skill | Fetch current library docs via Context7 instead of training data |
| **market-research** | ECC | Skill | Competitive analysis, investor due diligence, industry intelligence |
| **article-writing** | ECC | Skill | Long-form content with voice consistency and structure |
| **content-engine** | ECC | Skill | Multi-platform content: X, LinkedIn, TikTok, YouTube, newsletters |
| **data-scraper-agent** | ECC | Skill | Automated AI data collection from public sources on GitHub Actions |
| **/docs** | ECC | Command | Look up current library documentation via Context7 |
| **smart-explore** | claude-mem | Skill | Token-optimized code search using tree-sitter AST parsing |
| **docs-lookup** | ECC | Agent | Fetch current docs via Context7 MCP for library/API questions |

---

## Tier 3: Specialized (Niche but Good When Needed)

### Mobile Development
- **android-clean-architecture** (ECC) -- Clean Architecture for Android/KMP
- **swiftui-patterns** (ECC) -- SwiftUI state management, navigation, performance
- **swift-concurrency-6-2** (ECC) -- Swift 6.2 concurrency with @concurrent
- **swift-actor-persistence** (ECC) -- Thread-safe persistence with Swift actors
- **swift-protocol-di-testing** (ECC) -- Protocol-based DI for testable Swift code
- **compose-multiplatform-patterns** (ECC) -- Compose for KMP: state, navigation, theming
- **kotlin-coroutines-flows** (ECC) -- Coroutines and Flow for Android/KMP
- **kotlin-exposed-patterns** (ECC) -- JetBrains Exposed ORM patterns
- **kotlin-ktor-patterns** (ECC) -- Ktor server: routing, auth, Koin DI, WebSockets
- **foundation-models-on-device** (ECC) -- Apple FoundationModels for on-device LLM (iOS 26+)

### Language-Specific Standards / Reviews
- **cpp-coding-standards** (ECC) -- C++ Core Guidelines enforcement
- **java-coding-standards** (ECC) -- Java coding standards for Spring Boot
- **perl-patterns** (ECC) -- Modern Perl 5.36+ idioms
- **/cpp-review**, **/cpp-build**, **/kotlin-review**, **/kotlin-build**, **/go-review**, **/go-build**, **/rust-review**, **/rust-build**, **/python-review** (ECC) -- Language-specific review and build-fix commands
- **cpp-reviewer**, **cpp-build-resolver**, **kotlin-reviewer**, **kotlin-build-resolver**, **go-build-resolver**, **rust-build-resolver**, **java-build-resolver** (ECC) -- Language-specific agents

### Framework-Specific TDD / Verification
- **django-tdd** (ECC) -- Django testing with pytest-django, factory_boy
- **laravel-tdd** (ECC) -- Laravel TDD with PHPUnit/Pest, factories
- **springboot-tdd** (ECC) -- Spring Boot TDD with JUnit 5, Testcontainers
- **django-verification** (ECC) -- Django pre-release verification loop
- **laravel-verification** (ECC) -- Laravel pre-release verification loop
- **springboot-verification** (ECC) -- Spring Boot pre-release verification loop

### Session Management
- **/save-session** (ECC) -- Save session state for future resumption
- **/resume-session** (ECC) -- Load and resume a saved session
- **/sessions** (ECC) -- Manage session history and metadata
- **/checkpoint** (ECC) -- Create workflow checkpoints with git stash/commit

### Agent Orchestration / Configuration
- **/skill-create** (ECC) -- Extract coding patterns from git history into SKILL.md
- **/skill-health** (ECC) -- Skill portfolio health dashboard with analytics
- **/harness-audit** (ECC) -- Repository harness audit with scorecard
- **/configure-ecc** (ECC) -- Interactive ECC skill/rule installer
- **team-builder** (ECC) -- Interactive agent picker for parallel teams
- **enterprise-agent-ops** (ECC) -- Long-lived agent workloads with observability
- **writing-skills** (Superpowers) -- Guide for creating and verifying new skills
- **using-superpowers** (Superpowers) -- Bootstrapping skill usage at session start
- **skill-stocktake** (ECC) -- Audit skills/commands quality via subagent evaluation

### Media / Content
- **video-editing** (ECC) -- AI video editing: FFmpeg, Remotion, ElevenLabs, fal.ai
- **videodb** (ECC) -- Video database operations and search
- **fal-ai-media** (ECC) -- Unified media generation: image, video, audio via fal.ai
- **crosspost** (ECC) -- Multi-platform content distribution (X, LinkedIn, Threads, Bluesky)
- **x-api** (ECC) -- X/Twitter API integration for posting, timelines, analytics

---

## Tier 4: Rare / Domain-Specific

These are narrow industry verticals or uncommon use cases.

### Industry Verticals (Supply Chain / Logistics / Finance)
- **carrier-relationship-management** (ECC) -- Freight carrier management
- **customs-trade-compliance** (ECC) -- Import/export compliance
- **energy-procurement** (ECC) -- Energy sourcing and contracts
- **inventory-demand-planning** (ECC) -- Supply chain demand planning
- **logistics-exception-management** (ECC) -- Shipping exception handling
- **production-scheduling** (ECC) -- Manufacturing scheduling
- **quality-nonconformance** (ECC) -- Quality defect management
- **returns-reverse-logistics** (ECC) -- Returns processing

### Business / Fundraising
- **investor-materials** (ECC) -- Pitch decks, one-pagers, financial models
- **investor-outreach** (ECC) -- Cold emails, intro blurbs for fundraising
- **chief-of-staff** (ECC) -- Email/Slack/LINE triage and draft replies

### Specialized Patterns
- **regex-vs-llm-structured-text** (ECC) -- Decision framework: regex vs LLM for parsing
- **content-hash-cache-pattern** (ECC) -- SHA-256 content hashing for caching
- **iterative-retrieval** (ECC) -- Progressive context retrieval for subagents
- **ai-first-engineering** (ECC) -- Operating model for AI-heavy teams
- **ai-regression-testing** (ECC) -- Regression testing strategies for AI-assisted dev
- **ralphinho-rfc-pipeline** (ECC) -- RFC-driven multi-agent DAG execution
- **plankton-code-quality** (ECC) -- Write-time code quality via hooks (Plankton)
- **project-guidelines-example** (ECC) -- Example project skill template
- **nanoclaw-repl** (ECC) -- NanoClaw v2 REPL operations
- **continuous-learning** (ECC) -- v1 pattern extraction (superseded by v2)
- **visa-doc-translate** (ECC) -- Translate visa documents to bilingual PDF
- **nutrient-document-processing** (ECC) -- PDF/DOCX processing via Nutrient DWS API
- **prompt-optimizer** (ECC) -- Analyze and optimize prompts with ECC component matching

### Deprecated / Low-Value Commands
- **/brainstorm** (Superpowers) -- Deprecated, use brainstorming skill
- **/write-plan** (Superpowers) -- Deprecated, use writing-plans skill
- **/execute-plan** (Superpowers) -- Deprecated, use executing-plans skill

### Remaining ECC Commands (Specialized)
- **/aside** -- Answer a side question without losing task context
- **/learn-eval** -- Extract patterns with self-evaluation before saving
- **/evolve** -- Analyze instincts and suggest evolved structures
- **/instinct-status** -- Show learned instincts with confidence
- **/instinct-export** -- Export instincts to file
- **/instinct-import** -- Import instincts from file/URL
- **/promote** -- Promote project-scoped instincts to global
- **/projects** -- List known projects and instinct statistics
- **/setup-pm** -- Configure preferred package manager
- **/multi-plan** -- Multi-model collaborative planning (Codex + Gemini)
- **/multi-execute** -- Multi-model collaborative execution
- **/multi-workflow** -- Full multi-model dev workflow with routing
- **/prompt-optimize** -- Analyze and optimize a prompt (advisory only)
- **/update-codemaps** -- Generate token-lean architecture documentation
- **/update-docs** -- Sync documentation with codebase
- **/quality-gate** -- Run quality pipeline on file or project
- **/loop-status** -- Inspect active loop state and progress
- **/gradle-build** -- Fix Gradle build errors for Android/KMP

### Remaining ECC Agents (Specialized)
- **doc-updater** -- Documentation and codemap specialist
- **refactor-cleaner** -- Dead code cleanup with knip/depcheck/ts-prune

---

## Overlap Map

Several plugins provide similar functionality. Here is where they compete or complement:

| Capability | Plugin A | Plugin B | Plugin C | Recommendation |
|-----------|----------|----------|----------|----------------|
| **Code review** | ECC `/code-review` command + `code-reviewer` agent | code-review plugin `/code-review` command | Superpowers `code-reviewer` agent | Use **ECC agent** for post-edit review, **code-review plugin** for PR review |
| **TDD workflow** | ECC `/tdd` command + `tdd-workflow` skill + `tdd-guide` agent | Superpowers `test-driven-development` skill | - | Superpowers fires automatically via skill matching; ECC `/tdd` is explicit invocation. **Both complement**. |
| **Planning** | ECC `/plan` + `planner` agent + `blueprint` skill | Superpowers `writing-plans` + `executing-plans` skills | claude-mem `make-plan` + `do` skills | Use **Superpowers** for single-session plans. Use **ECC blueprint** for multi-session/multi-agent plans. Use **claude-mem** when you want memory-aware plan+execute. |
| **Verification** | ECC `/verify` + `verification-loop` skill | Superpowers `verification-before-completion` skill | - | **Both fire together**. ECC has the concrete commands; Superpowers enforces the discipline. |
| **Git commit** | commit-commands `/commit` and `/commit-push-pr` | ECC has no dedicated commit command | - | **commit-commands** is the clear owner |
| **Documentation lookup** | ECC `documentation-lookup` skill + `/docs` command + `docs-lookup` agent | context7 MCP server | - | **ECC wraps context7**. Use ECC `/docs` which delegates to context7 MCP underneath. |
| **Search** | mgrep skill (replaces Grep/Glob/WebSearch) | ECC `exa-search` + `deep-research` skills | - | **mgrep** for local + quick web. **ECC exa-search** for deep neural web research. |
| **Build error fixing** | ECC `/build-fix` command + language-specific build-resolver agents | Superpowers (no equivalent) | - | **ECC** is the clear owner |
| **Debugging** | Superpowers `systematic-debugging` skill | ECC (no dedicated debugging skill) | - | **Superpowers** is the clear owner |
| **Parallel agents** | ECC `claude-devfleet`, `dmux-workflows`, `team-builder`, `/orchestrate`, `/devfleet` | Superpowers `dispatching-parallel-agents`, `subagent-driven-development` | claude-mem `do` | **Superpowers** for in-session subagents. **ECC DevFleet** for multi-worktree orchestration. |
| **Session persistence** | ECC `/save-session`, `/resume-session` | claude-mem `mem-search` (cross-session memory) | - | **Complementary**: ECC saves full session snapshots; claude-mem provides searchable memory |
| **Multi-model (Codex/Gemini)** | ECC `/multi-plan`, `/multi-execute`, `/multi-workflow`, `/multi-frontend`, `/multi-backend` | - | - | **ECC only**. Unique capability. |

---

## Recommended "Active Use" List

The 20 tools/skills to consciously integrate into daily workflow:

### Daily Habits (Every Session)

1. **mgrep** -- Replace all search with `mgrep "query"` (local) and `mgrep --web --answer "query"` (web)
2. **/plan** (ECC) -- Start non-trivial work with a plan. Wait for confirm.
3. **tdd-workflow** (ECC) or **test-driven-development** (Superpowers) -- Write tests first. Always.
4. **verification-before-completion** (Superpowers) -- Never claim done without running checks.
5. **/verify** (ECC) -- Concrete verification: build + typecheck + lint + tests.
6. **/commit** (commit-commands) -- Clean conventional commits.
7. **mem-search** (claude-mem) -- Check if past sessions solved similar problems.

### Per-Feature Workflow

8. **brainstorming** (Superpowers) -- Explore intent before implementation for any feature.
9. **writing-plans** (Superpowers) -- Structured multi-step plans before touching code.
10. **/code-review** (ECC) -- Review your own changes before commit.
11. **security-review** (ECC) -- Any code touching auth, input, secrets, or APIs.
12. **systematic-debugging** (Superpowers) -- Reproduce and hypothesize before fixing.
13. **/test-coverage** (ECC) -- After tests pass, check and fill coverage gaps.

### Project-Type Specific

14. **postgres-patterns** (ECC) -- Any SQL/database work.
15. **bun-runtime** (ECC) -- Bun-based projects (your default tooling).
16. **frontend-patterns** (ECC) -- React/Next.js work.
17. **backend-patterns** (ECC) -- Node.js API work.

### Power Moves (When Applicable)

18. **blueprint** (ECC) -- Multi-session project planning with self-contained context briefs.
19. **deep-research** (ECC) -- Thorough cited research on any topic.
20. **/learn** (ECC) -- Extract patterns after solving hard problems to build institutional knowledge.

---

## Key Observations

1. **ECC is massive but well-organized**: 108 skills break down into ~15 language-specific pattern bundles, ~10 language-specific testing skills, ~8 industry verticals, and ~15 universal workflow skills. Most users only need the universal ones plus their language stack.

2. **Superpowers is the discipline enforcer**: Its 14 skills are all workflow disciplines (plan, TDD, verify, review, debug). They fire automatically via context matching, which makes them more valuable than their small count suggests.

3. **claude-mem is the memory layer**: 4 skills but they provide unique cross-session persistence that no other plugin offers. `mem-search` and `smart-explore` (AST-aware code search) are underutilized.

4. **The official plugins are thin**: commit-commands and code-review are just wrappers around git/gh commands. The rest (figma, github, hookify, etc.) appear to be empty caches or MCP-only configurations.

5. **Multi-model commands are ECC-exclusive**: `/multi-plan`, `/multi-execute`, `/multi-workflow` orchestrate Codex and Gemini alongside Claude. No other plugin does this.

6. **Industry verticals are likely unused**: The 8 supply chain/logistics skills (carrier-relationship-management, customs-trade-compliance, etc.) are highly specialized and unlikely to match your projects.

7. **VoiceMode is MCP-only**: It provides TTS/STT via MCP tools (`converse`, `service`, `connect_status`), not skills or commands. Used via the voice-readout hook.

8. **Context7 is invisible but essential**: It works as an MCP server behind ECC's `documentation-lookup` skill and `/docs` command. You are already using it indirectly.
