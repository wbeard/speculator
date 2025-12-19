# Speculator

Spec-driven workflow commands for AI coding agents. Works with [Cursor](https://cursor.sh) and [Claude Code](https://claude.ai/code).

Stop your AI from diving straight into code. Speculator enforces a **Research-Plan-Implement** workflow that makes your AI think before it types.

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/wbeard/speculator.git
cd speculator
npm install
npm link
```

**Requirements:** Node.js 18 or later

## Initialize in Your Project

Navigate to your project and run:

```bash
spec init
```

You'll be prompted to select which agent(s) to set up:

| Option | What gets installed |
|--------|---------------------|
| Claude Code | `.claude/commands/` + multi-agent orchestration skill |
| Cursor | `.cursor/commands/` |
| Both | All of the above |

### What Gets Created

```
your-project/
├── .speculator/
│   ├── features/        # Your feature workspaces
│   ├── hooks/           # Pre/post command hooks (see Hooks section)
│   └── templates/       # Artifact templates
├── .claude/commands/    # (if Claude Code selected)
├── .cursor/commands/    # (if Cursor selected)
└── CLAUDE.md            # (Claude Code only) Project instructions
```

You can also skip the prompts:

```bash
spec init --agent claude-code
spec init --agent cursor
spec init --agent both
```

---

## The Concept

Speculator enforces a **Research-Plan-Implement (RPI)** workflow:

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

---

## Commands

| Command | Description |
|---------|-------------|
| `/spec.new` | Start a new feature — creates workspace and drafts spec |
| `/spec.fix` | Start a bug fix — creates spec from reproduction steps |
| `/spec.next` | Check status — shows progress and suggests next step |
| `/spec.research` | Investigate codebase — documents patterns and constraints |
| `/spec.plan` | Design implementation — architecture and file changes |
| `/spec.tasks` | Break down plan — creates executable task list |
| `/spec.implement` | Execute tasks — works through the list continuously |
| `/spec.clarify` | Update requirements — assesses downstream impact |

---

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
AI:  [Creates tasks in database with dependencies]
     Run /spec.implement to start executing tasks.

You: /spec.implement
AI:  [Claims and executes tasks one by one until complete]
```

### Bug Fix

```
You: /spec.fix
AI:  Describe the bug — what are the reproduction steps?
You: Click save button, nothing happens, expected: form submits

AI:  [Creates .speculator/features/fix-save-button/spec.md]
     Run /spec.research to investigate the root cause.
```

### Mid-Implementation Changes with `/spec.clarify`

Requirements change. It happens. Use `/spec.clarify` to update the spec and assess impact:

```
You: /spec.clarify
AI:  What needs to be updated?
You: Actually, we need OAuth instead of email/password

AI:  [Updates spec.md with new requirements]

     Impact Analysis:
     - Database schema changes: YES (new oauth_tokens table)
     - API endpoints: YES (new /auth/callback route)
     - Architecture changes: YES (OAuth flow replaces password auth)

     This is a HIGH IMPACT change.
     Recommendation: Run /spec.research to re-validate assumptions.
```

The AI categorizes changes by impact:

**High Impact** (re-run research):
- Database schema changes
- New API endpoints
- Architecture changes
- Security model changes

**Low Impact** (refresh plan if needed):
- UI tweaks, colors, copy
- Internal implementation details
- Non-breaking additions

---

## Hooks

Hooks let you run custom logic before or after any command. They're markdown files containing instructions for the AI.

### How Hooks Work

Hooks are discovered by convention:

```
.speculator/hooks/
├── pre-new/           # Runs before /spec.new
├── post-new/          # Runs after /spec.new
├── pre-research/
├── post-research/
├── pre-plan/
├── post-plan/
├── pre-tasks/
├── post-tasks/
├── pre-implement/     # Runs before each task
├── post-implement/    # Runs after each task completes
├── pre-clarify/
└── post-clarify/
```

Any `.md` file in these directories will be read and executed by the AI at the appropriate time.

### Writing a Hook

Hooks are simple markdown files with instructions. Here's the structure:

```markdown
# Hook Title

Brief description of when/why this runs.

## When to Act

Criteria for when to take action vs. skip.

## Actions

Step-by-step instructions for the AI.

## If Nothing to Do

What to output when no action needed.
```

### Example: Create ADRs After Planning

This hook creates Architectural Decision Records when your plan involves significant decisions.

**File:** `.speculator/hooks/post-plan/create-adr.md`

```markdown
# Create ADR if Needed

This hook runs after /spec.plan completes.

## When to Create an ADR

Create an ADR if the plan involves:
- New external dependencies
- Database schema changes
- Security decisions
- Technology selection

## Actions

1. Check for existing ADRs: `ls .speculator/adrs/*.md 2>/dev/null | wc -l`
2. Create `.speculator/adrs/NNNN-<decision-title>.md`
3. Fill in Context and Decision from plan content

## If No ADR Needed

Note: "No architectural decisions requiring documentation."
```

### Example: Capture TODOs After Implementation

Track deferred work as tasks complete.

**File:** `.speculator/hooks/post-implement/capture-todos.md`

```markdown
# Capture Deferred TODOs

This hook runs after each task completes.

## What to Look For

- TODO/FIXME/HACK/XXX comments added
- Skipped edge cases
- Missing tests
- Hardcoded values

## Actions

Append to `.speculator/backlog/todos.md`:

- [ ] <description>
  - **Context:** Why deferred
  - **Priority:** low | medium | high
  - **Location:** File path

## If Nothing Deferred

No action needed.
```

### Pre vs Post Hooks

| Hook Type | When it runs | Common uses |
|-----------|--------------|-------------|
| `pre-*` | Before the command executes | Validation, setup, context gathering |
| `post-*` | After the command completes | Cleanup, documentation, notifications |

### Hook Behavior

- **All hooks in a directory run** — multiple hooks are fine
- **Failures warn but don't abort** — the main command continues
- **Per-task for implement** — `post-implement` runs after *each* task, not just at the end

---

## Task Management CLI

Under the hood, Speculator uses a SQLite database to track tasks. You can interact with it directly:

### Feature Commands

```bash
# List all features
spec features

# Create a feature manually
spec feature create "user-auth" --description "Add user authentication"

# Show feature with task breakdown
spec feature show user-auth
```

### Task Commands

```bash
# See tasks ready for work (unblocked, dependencies met)
spec tasks ready --feature user-auth

# Claim a task (prevents duplicate work in multi-agent scenarios)
spec task claim <task-id> --agent my-agent-id

# Mark task complete
spec task complete <task-id>

# Block a task with a reason
spec task block <task-id> --reason "Waiting for API credentials"

# Unblock a task
spec task unblock <task-id>

# Release a claimed task back to todo
spec task release <task-id>

# Add a new task
spec task add --feature user-auth --title "Add password validation"

# Add a dependency between tasks
spec task depend <task-id> --on <other-task-id>
```

### Bulk Import

Import tasks from JSON:

```bash
echo '[
  {"title": "Create user model"},
  {"title": "Add auth middleware", "depends_on_indices": [0]},
  {"title": "Create login endpoint", "depends_on_indices": [1]}
]' | spec tasks import --feature user-auth
```

---

## Multi-Agent Orchestration

When using Claude Code, Speculator includes a skill for coordinating multiple AI agents working on the same feature.

**Core principle:** *Claim before you code.*

The orchestration loop:

1. `spec tasks ready` — find available work
2. `spec task claim <id>` — atomically claim a task
3. Do the work
4. `spec task complete <id>` — mark done
5. Repeat

### What Can Run in Parallel?

**Safe:**
- Isolated features (separate directories)
- Independent tests
- Documentation
- Different UI components

**Caution:**
- Same module, different files (imports may conflict)
- Shared test utilities
- Type definitions

**Always serialize:**
- Same file
- Database migrations
- package.json / lockfiles

---

## Project Structure

After running `/spec.new` for a feature called "dark-mode":

```
.speculator/
├── features/
│   └── dark-mode/
│       ├── spec.md        # Requirements
│       ├── research.md    # Codebase analysis
│       └── plan.md        # Implementation design
├── hooks/
│   ├── post-plan/
│   │   └── create-adr.md
│   └── post-implement/
│       └── capture-todos.md
├── templates/
│   ├── feature-spec.md
│   ├── research-brief.md
│   └── implementation-plan.md
├── adrs/                  # Architectural Decision Records
│   └── 0001-theme-system.md
└── backlog/
    └── todos.md           # Captured deferred work
```

---

## License

MIT
