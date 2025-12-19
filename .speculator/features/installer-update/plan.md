# Implementation Plan: Installer Update (CLI Architecture)

**Status:** READY

## Open Questions

*None - all requirements are clear.*

## Migration & Cleanup

*Remove MCP server, extract reusable code*

- [ ] Delete `speculator-tasks/` directory entirely
- [ ] Move `.claude/skills/speculator-orchestration/` → `templates/skills/speculator-orchestration/`
- [ ] Delete `.claude/skills/` after move

## Architecture

Replace MCP server with CLI tool. Agents invoke commands via Bash instead of MCP tools.

```
┌─────────────────────────────────────────────────────────────┐
│                     @wbeard/speculator                      │
├─────────────────────────────────────────────────────────────┤
│  bin/                                                       │
│  ├── create.js      # Existing installer                    │
│  └── spec.js        # NEW: CLI entry point                  │
│                                                             │
│  src/               # NEW: CLI implementation               │
│  ├── db.ts          # Database (from speculator-tasks)      │
│  ├── types.ts       # Types (from speculator-tasks)         │
│  ├── operations/    # Business logic (from speculator-tasks)│
│  │   ├── tasks.ts                                           │
│  │   └── features.ts                                        │
│  └── commands/      # CLI command handlers                  │
│      ├── task.ts    # spec task <action>                    │
│      ├── tasks.ts   # spec tasks ready/import               │
│      ├── feature.ts # spec feature create/show              │
│      └── features.ts# spec features                         │
│                                                             │
│  templates/                                                 │
│  └── skills/speculator-orchestration/  # Skill (updated)    │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **CLI Entry Point** (`bin/spec.js`):
   - Uses `commander` for argument parsing
   - Initializes database at `.speculator/tasks.db`
   - Routes to command handlers
   - Outputs JSON for agent parsing

2. **Operations Layer** (`src/operations/`):
   - Pure business logic extracted from speculator-tasks
   - No MCP or CLI dependencies
   - Functions like `getReadyTasks()`, `claimTask()`, etc.

3. **Command Handlers** (`src/commands/`):
   - Parse CLI arguments
   - Call operations
   - Format output as JSON

4. **Updated Skill** (`templates/skills/`):
   - All 7 files updated to use CLI syntax
   - Agents run `spec` commands via Bash tool

5. **Installer** (`bin/create.js`):
   - New prompt for multi-agent skill (Claude only)
   - Copies skill to `.claude/skills/`
   - No MCP config needed

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `bin/spec.js` | CLI entry point |
| `src/db.ts` | Database init and schema |
| `src/types.ts` | TypeScript types |
| `src/operations/tasks.ts` | Task operations |
| `src/operations/features.ts` | Feature operations |
| `src/commands/task.ts` | `spec task` commands |
| `src/commands/tasks.ts` | `spec tasks` commands |
| `src/commands/feature.ts` | `spec feature` commands |
| `src/commands/features.ts` | `spec features` command |
| `templates/skills/speculator-orchestration/SKILL.md` | Updated skill |
| `templates/skills/speculator-orchestration/workflows/*.md` | Updated workflows |
| `templates/skills/speculator-orchestration/patterns/*.md` | Updated patterns |
| `templates/skills/speculator-orchestration/examples/*.md` | Updated examples |

### Modified Files

| Path | Changes |
|------|---------|
| `package.json` | Add `"spec"` to bin, add commander/better-sqlite3/uuid deps, add src to files |
| `bin/create.js` | Add prompt for skill, copy skill to .claude/skills/ |

### Deleted Files

| Path | Reason |
|------|--------|
| `speculator-tasks/` | Replaced by CLI |
| `.claude/skills/speculator-orchestration/` | Moved to templates |

## CLI Commands Reference

```bash
# Features
spec feature create <name> [--description <desc>]
spec feature show <id>
spec features [--status active|completed|archived]

# Single task operations
spec task add --feature <id> --title <title> [--description <desc>] [--parent <id>]
spec task show <id>
spec task claim <id> --agent <agent-id>
spec task complete <id>
spec task block <id> --reason <reason>
spec task unblock <id>
spec task release <id>
spec task depend <id> --on <other-id>

# Task queries
spec tasks ready [--feature <id>]
spec tasks import --feature <id> < tasks.json
```

## Testing Strategy

- [ ] CLI: `spec feature create "Test"` creates feature
- [ ] CLI: `spec tasks ready` returns empty array initially
- [ ] CLI: `spec task add` / `claim` / `complete` workflow works
- [ ] CLI: Circular dependency detection works
- [ ] Installer: Basic setup (no skill) still works
- [ ] Installer: With skill option copies to `.claude/skills/`
- [ ] Skill: All examples use correct CLI syntax
