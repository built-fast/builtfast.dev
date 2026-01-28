---
published: false
layout: post
title: "Automating feature development with Linear and Claude Code"
date: "Tue Oct 21 10:00:00 -0400 2025"
categories: [devops]
tags: [claude-code, linear, automation, ai]
author: Josh Priddle
tagline: "Linear issues go in. Working code comes out. Automating feature development with Claude Code's custom commands."
---

Linear issues go in. Working code comes out. Here's how we built a workflow
that automates a significant portion of feature development using Claude Code's
custom commands and agents.

## The problem

Every developer knows the dance: read the Linear issue, look at the mockups,
switch to the codebase, start implementing, switch back to check requirements,
realize you missed something in the mockup, switch back again. Context
switching kills productivity.

What if you could bring the entire issue—description, acceptance criteria, and
mockup images—directly into your AI coding assistant?

## The solution: /linear:fetch

We built a custom Claude Code command that fetches Linear issues and downloads
all associated images locally. Claude Code can then read both the issue text
and *see* the mockups directly.

### How it works

Fetch a single issue:

```bash
claude '/linear:fetch DEV-123'
```

Or multiple issues in parallel:

```bash
claude '/linear:fetch DEV-123 DEV-124 DEV-125'
```

The command:

1. Calls Linear's API via MCP to get issue details
2. Downloads all attached images (mockups, screenshots, diagrams)
3. Creates a markdown file with the issue content and local image references

### What you get

The output is a markdown file with YAML frontmatter:

```markdown
---
title: "DEV-222: Add password reset flow"
status: In Progress
assignee: Josh Priddle
team: Development
project: User Authentication
labels: Feature
created: 2025-09-03T21:20:51.833Z
updated: 2025-09-09T17:36:34.109Z
git-branch: feature/dev-222-password-reset
linear-url: https://linear.app/builtfast/issue/DEV-222/...
tags:
  - linear/dev-222
---

## Description

As a user, I want to reset my password so I can regain access to my account.

## Acceptance Criteria

- [ ] User can request password reset from login page
- [ ] System sends email with secure reset link
- [ ] Link expires after 24 hours
- [ ] User can set new password meeting security requirements

## Mockups

![Password reset form](./DEV-222-img1.png)
![Email template](./DEV-222-img2.png)
```

The critical piece: **images are downloaded locally** with paths Claude Code
can read. When Claude analyzes the issue, it sees the actual mockup images.

## Why screenshots matter

Claude Code is multimodal. When you fetch an issue with mockups attached,
Claude can:

- See the exact UI layout the designer intended
- Match colors, spacing, and typography from the design
- Understand component hierarchy from the visual structure
- Identify form fields, buttons, and interactions

No more describing the mockup in words. No more "make it look like the Figma."
Claude sees what you see.

## Well-written issues make this work

The automation works when issues follow a consistent structure. We use
acceptance criteria (AC) format:

```markdown
AC:
- Must validate email format before submission
- Must show loading state during API call
- If email not found in system:
    - Show generic success message (security)
    - Do not reveal whether email exists
- Must rate limit to 3 requests per hour per IP
- Should log all reset attempts for audit trail
```

Each bullet becomes a verifiable requirement. Claude can:

1. Read the requirement
2. Implement the code
3. Write tests that verify the requirement
4. Check off the acceptance criteria

Nested bullets handle conditional logic. "If X, then Y" becomes testable
branches.

## The full workflow

### Step 1: Create well-structured issues

Use `/linear:create` to create issues with proper AC format:

```bash
claude '/linear:create "As a user I want password reset so I can regain account access"'
```

Claude prompts you for acceptance criteria and formats the issue properly.

### Step 2: Attach mockups in Linear

Upload screenshots, Figma exports, or diagrams directly to the Linear issue.
These become part of the issue context.

### Step 3: Fetch the issue

```bash
claude '/linear:fetch DEV-222'
```

Issue markdown and images land in your project directory.

### Step 4: Plan the implementation

Tell Claude to analyze the fetched issue:

```
Analyze DEV-222.md and create an implementation plan
```

The feature-implementation-planner agent:

- Extracts requirements from acceptance criteria
- Identifies database changes, API endpoints, UI components
- Breaks work into phases
- Flags risks and dependencies

### Step 5: Implement

With the plan approved, Claude implements each component:

- Creates migrations and models
- Builds API endpoints with proper validation
- Implements UI matching the mockups
- Writes comprehensive tests

### Step 6: Verify

The code-quality-checker agent runs PHPStan, Pint, ESLint, and your test
suite. The laravel-test-writer agent creates tests for each acceptance
criterion.

## What makes this work

### 1. Structured data

YAML frontmatter gives Claude metadata: branch names, status, assignee. This
context helps Claude make better decisions about commit messages, PR
descriptions, and documentation.

### 2. Local image references

By downloading images locally, Claude can actually *see* them. Remote URLs in
markdown often don't render for AI tools. Local files work reliably.

### 3. Acceptance criteria as checkboxes

Each AC item becomes a verifiable requirement. Tests can target specific
criteria. Progress is measurable.

### 4. Parallel processing

Multiple issues? The command spawns parallel agents. Five issues download as
fast as one.

## What we've seen

For routine features with clear acceptance criteria and mockups, Claude handles
most of the implementation:

- Boilerplate code (migrations, models, controllers)
- CRUD operations
- Form validation
- Basic UI matching mockups
- Test coverage for happy paths and edge cases

Humans still review, handle edge cases Claude misses, and make architectural
decisions. The tedious middle is automated.

## The commands

**Fetch issues:**

```bash
claude '/linear:fetch DEV-123'
claude '/linear:fetch DEV-123 DEV-124 DEV-125'
claude '/linear:fetch https://linear.app/team/issue/DEV-123'
```

**Create issues:**

```bash
claude '/linear:create "As a [role] I want [feature] so I can [benefit]"'
claude '/linear:create "Add dark mode toggle" --team=Design'
```

## Implementation details

The `/linear:fetch` command uses:

- **Linear MCP server** for API access
- **wget** for parallel image downloads
- **Task agents** for concurrent issue processing
- **Write tool** for creating markdown files

The command definition lives in `.claude/commands/linear/fetch.md` and
integrates with Claude Code's tool permission system.

## Getting started

1. Install the Linear MCP server for Claude Code
2. Create the command file at `.claude/commands/linear/fetch.md`
3. Configure allowed tools: `Task, Bash(wget:*), mcp__linear-server__get_issue, Write(*.md)`
4. Start fetching issues

The investment in structured issues pays dividends. Every well-written AC
bullet, every attached mockup, every clear requirement—it all compounds into
faster, more accurate implementation.
