# @wbeard/speculator

Spec-driven workflow commands for AI coding agents. Works with [Cursor](https://cursor.sh) and [Claude Code](https://claude.ai/code).

## Installation

```bash
npx @wbeard/speculator
```

The installer will prompt you to select:

1. **Which agent(s)** — Cursor, Claude Code, or both
2. **Include rules/memory files** — Optional system prompts (default: no)

## The Concept

Speculator enforces a **Research-Plan-Implement (RPI)** workflow. The core idea: *think before you code*.

```
/spec.new or /spec.fix
         │
         ▼
   /spec.research
         │
         ▼
     /spec.plan
         │
         ▼
    /spec.tasks
         │
         ▼
  /spec.implement ◄──► /spec.clarify
```

Each feature gets its own workspace in `.speculator/features/<name>/` with artifacts that build on each other:

| Artifact | Created by | Purpose |
|----------|------------|---------|
| `spec.md` | `/spec.new` | Requirements and acceptance criteria |
| `research.md` | `/spec.research` | Codebase patterns, dependencies, constraints |
| `plan.md` | `/spec.plan` | Architecture and file changes |

This structure ensures the AI understands context before writing code, reducing hallucinations and rework.

## Commands

| Command | Description |
|---------|-------------|
| `/spec.new` | Start a new feature — creates workspace and drafts spec |
| `/spec.fix` | Start a bug fix — creates spec from reproduction steps |
| `/spec.next` | Check status — shows progress and suggests next step |
| `/spec.research` | Investigate codebase — documents patterns and constraints |
| `/spec.plan` | Design implementation — architecture and file changes |
| `/spec.tasks` | Break down plan — creates executable checklist |
| `/spec.implement` | Execute tasks — runs through checklist continuously |
| `/spec.clarify` | Update requirements — assesses downstream impact |

## Workflows

### New Feature

```
You: /spec.new
AI:  What feature would you like to build?
You: Add dark mode toggle to settings

AI:  [Creates .speculator/features/dark-mode-toggle/spec.md]
     Run /spec.research to gather context.

You: /spec.research
AI:  [Searches codebase, documents patterns in research.md]
     Run /spec.plan to create the implementation plan.

You: /spec.plan
AI:  [Creates plan.md with architecture and file changes]
     Run /spec.tasks to break this into executable tasks.

You: /spec.tasks
AI:  [Creates tasks]
     Run /spec.implement to start executing tasks.

You: /spec.implement
AI:  [Executes tasks one by one until complete]
```

### Bug Fix

```
You: /spec.fix
AI:  Describe the bug — what are the reproduction steps?
You: Click save button, nothing happens, expected: form submits

AI:  [Creates .speculator/features/fix-save-button/spec.md]
     Run /spec.research to investigate the root cause.
```

### Mid-Implementation Changes

```
You: /spec.clarify
AI:  What needs to be updated?
You: Actually, we need OAuth instead of email/password

AI:  [Updates spec.md]
     This is a high-impact change. Run /spec.research to re-validate.
```

## What Gets Installed

### Always Installed

```
.speculator/
├── features/           # Your feature workspaces go here
└── templates/
    ├── feature-spec.md
    ├── research-brief.md
    └── implementation-plan.md
```

### For Cursor

```
.cursor/
└── commands/
    ├── spec.new.md
    ├── spec.fix.md
    ├── spec.research.md
    ├── spec.plan.md
    ├── spec.tasks.md
    ├── spec.implement.md
    └── spec.clarify.md
```

### For Claude Code

```
.claude/
└── commands/
    └── [same files with YAML frontmatter]
```

### Optional: Rules Files

If you choose to include rules, you'll also get:

- **Cursor**: `.cursor/rules/speculator.mdc`
- **Claude Code**: `CLAUDE.md` in project root

These contain system prompts that reinforce the RPI workflow. Skip them if you have existing rules you don't want to override.

## Requirements

- Node.js 18 or later

## License

MIT
