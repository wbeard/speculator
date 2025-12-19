# Feature: Hooks System

## Context & Goal

**Why are we building this?**
The core speculator workflow (feature → research → plan → tasks → implement) covers the main development loop, but users have adjacent concerns that don't belong in the core commands:
- Creating Architectural Decision Records during planning
- Tracking technical debt when deferring proper implementation
- Capturing todos that don't fit the current workstream
- Notifying external systems
- Custom validation or checks

Rather than building these into core commands, we need an extension mechanism that lets users run custom LLM instructions before or after any slash command.

**User Story**
As a developer using speculator, I want to run custom actions before or after commands, so that I can extend the workflow with project-specific behavior without modifying the core tool.

## Requirements

- [ ] Hooks are markdown files containing LLM instructions
- [ ] Hooks are discovered via filesystem convention: `.speculator/hooks/{pre|post}-{command}/*.md`
- [ ] All hooks in a directory run in parallel (not sequentially)
- [ ] Hook failures warn but don't abort the main command
- [ ] Each slash command checks for and executes pre-hooks before main logic
- [ ] Each slash command checks for and executes post-hooks after main logic
- [ ] `speculator init` creates empty `.speculator/hooks/` directory
- [ ] Hook templates included in package at `templates/hooks/`
- [ ] No default hooks installed (user must opt-in by copying templates)

## Acceptance Criteria

- [ ] Running `/spec.plan` with hooks in `.speculator/hooks/post-plan/` executes those hooks after the plan is created
- [ ] If a hook fails, a warning is shown but the command completes successfully
- [ ] Multiple hooks in the same directory run concurrently
- [ ] Hooks have access to read spec files and conversation context
- [ ] Template hooks for ADR, tech-debt, and todos are available for users to copy

## Out of Scope

- Inter-hook communication or data passing
- Sequential/ordered hook execution
- CLI subcommand for managing hooks (optional, may be added later)
- Hooks that can block or cancel the main command

## Filesystem Convention

```
.speculator/
├── hooks/
│   ├── pre-new/
│   ├── post-new/
│   ├── pre-fix/
│   ├── post-fix/
│   ├── pre-research/
│   ├── post-research/
│   ├── pre-plan/
│   ├── post-plan/
│   ├── pre-tasks/
│   ├── post-tasks/
│   ├── pre-implement/
│   ├── post-implement/
│   ├── pre-clarify/
│   └── post-clarify/
```

## Hook Templates to Include

Directory structure:
```
templates/
└── hooks/
    ├── README.md
    ├── adr/
    │   ├── README.md
    │   └── post-plan-create-adr.md
    ├── tech-debt/
    │   ├── README.md
    │   └── post-plan-flag-debt.md
    └── todos/
        ├── README.md
        └── post-implement-capture-todos.md
```

### 1. Root README (`templates/hooks/README.md`)
- Overview of the hooks system
- List of available template categories
- Instructions for copying hooks to a project
- Brief guide on creating custom hooks

### 2. ADR Template (`templates/hooks/adr/`)

**`README.md`**
- Explains what ADRs are and when to use them
- Instructions for installing the hook

**`post-plan-create-adr.md`**
- Hook that runs after `/plan`
- Evaluates whether the plan involves architectural decisions
- Criteria: new dependencies, schema changes, integration patterns, security choices, performance trade-offs, technology selection
- If yes, creates `.speculator/adrs/NNNN-<title>.md` with standard template (Status, Context, Decision, Consequences)
- Numbers ADRs sequentially (0001, 0002, etc.)
- If no architectural decisions, notes "No architectural decisions requiring documentation"

### 3. Tech Debt Template (`templates/hooks/tech-debt/`)

**`README.md`**
- Explains the purpose of tracking intentional tech debt
- Instructions for installing the hook

**`post-plan-flag-debt.md`**
- Hook that runs after `/plan`
- Scans the plan for indicators of intentional shortcuts
- Looks for: "for now", "temporarily", "workaround", "shortcut", missing error handling, skipped tests
- If found, appends to `.speculator/backlog/tech-debt.md`
- Captures: what, why deferred, impact level, suggested resolution
- If no debt, no action needed

### 4. TODO Capture Template (`templates/hooks/todos/`)

**`README.md`**
- Explains the purpose of capturing deferred work
- Instructions for installing the hook

**`post-implement-capture-todos.md`**
- Hook that runs after `/implement` (after each task completion)
- Checks for work intentionally deferred during implementation
- Looks for: TODO/FIXME/HACK comments added, edge cases skipped, tests not written
- If found, appends to `.speculator/backlog/todos.md`
- Captures: description, context for deferral, priority
- If nothing deferred, no action needed

### Hook Content Requirements

Each hook file should:
1. Have a clear title as H1
2. Explain when/why it runs
3. Define clear criteria for when to take action vs. skip
4. Specify exactly what files to create/modify
5. Include the template or format for any generated content
6. Handle the "nothing to do" case gracefully

### Output Locations

Hooks create files in:
- ADRs: `.speculator/adrs/NNNN-<title>.md`
- Tech Debt: `.speculator/backlog/tech-debt.md`
- TODOs: `.speculator/backlog/todos.md`

These directories may not exist - hooks should create them if needed.

## Available Context by Hook Point

| Hook Point | Available Context |
|------------|-------------------|
| `pre-new` | User's request in conversation |
| `post-new` | `spec.md` created |
| `pre-fix` | User's bug description in conversation |
| `post-fix` | `spec.md` created (bug-fix framing) |
| `pre-research` | `spec.md` |
| `post-research` | `spec.md`, `research.md` |
| `pre-plan` | `spec.md`, `research.md` |
| `post-plan` | `spec.md`, `research.md`, `plan.md` |
| `pre-tasks` | `spec.md`, `research.md`, `plan.md` |
| `post-tasks` | Above + tasks in database |
| `pre-implement` | Above + task about to be claimed |
| `post-implement` | Above + task just completed |
| `pre-clarify` | Current `spec.md`, user's proposed changes |
| `post-clarify` | Updated `spec.md` |

## Success Criteria

### Core Hook System
- [ ] `.speculator/hooks/` directory created by `speculator init`
- [ ] Slash commands check for and run pre-hooks before main logic
- [ ] Slash commands check for and run post-hooks after main logic
- [ ] Hooks in the same directory run in parallel
- [ ] Hook failures warn but don't abort the command

### Hook Templates
- [ ] `templates/hooks/README.md` created with overview
- [ ] `templates/hooks/adr/README.md` created
- [ ] `templates/hooks/adr/post-plan-create-adr.md` created with full hook logic
- [ ] `templates/hooks/tech-debt/README.md` created
- [ ] `templates/hooks/tech-debt/post-plan-flag-debt.md` created with full hook logic
- [ ] `templates/hooks/todos/README.md` created
- [ ] `templates/hooks/todos/post-implement-capture-todos.md` created with full hook logic
- [ ] All hooks handle "nothing to do" case
- [ ] All hooks specify output file locations and formats

### Packaging
- [ ] Templates directory included in package.json files array
- [ ] No default hooks installed (user must opt-in)

## Open Questions

- Should we add a `speculator hooks` CLI subcommand for discoverability? (deferred - users can manually copy files)
