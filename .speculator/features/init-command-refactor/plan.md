# Implementation Plan: Init Command Refactor

**Status:** READY

## Open Questions

None - all questions resolved.

## Migration & Cleanup

*Existing code to remove or refactor before building new functionality*

- [ ] Remove `create-speculator` entry from `package.json` bin field
- [ ] Delete `bin/create.js` after logic is migrated

## Architecture

Replace the standalone `create-speculator` CLI with a `spec init` subcommand integrated into the main `spec` CLI. The init command will:

1. Accept `--agent` flag (`claude-code` | `cursor`) with smart defaults
2. Accept `--rules` flag to optionally install agent-specific rules
3. Copy templates to the target project
4. Auto-install orchestration skill for Claude Code users

### Key Components

```
spec init
├── --agent <type>     # claude-code | cursor (default: prompt if interactive)
├── --rules            # Install CLAUDE.md or cursor rule
└── [no db needed]     # Skip database initialization
```

**Execution Flow:**
1. Parse CLI options
2. If `--agent` not provided and running interactively, prompt user
3. Copy shared templates (`.speculator/` directory)
4. Install agent-specific commands (Claude or Cursor format)
5. If `--rules` flag, install CLAUDE.md or cursor rule
6. If Claude Code agent, auto-install orchestration skill
7. Print success message with available commands

### Conditional Database Initialization

The main `spec` CLI currently calls `initDb()` at startup. This must be conditional:
- `spec init` - NO database needed
- All other commands - Database required

Solution: Move `initDb()` call to individual command handlers that need it, or check subcommand before initializing.

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `src/commands/init.js` | Init command implementation with `registerInitCommands()` |
| `src/utils/templates.js` | Extract template copying utilities from create.js |
| `templates/commands/spec.init.md` | Slash command template for `/spec.init` |

### Modified Files

| Path | Changes |
|------|---------|
| `bin/spec.js` | Import init commands, conditionally init database |
| `package.json` | Remove `create-speculator` from bin field |
| `templates/commands/meta.json` | Add `spec.init` description |

### Deleted Files

| Path | Reason |
|------|--------|
| `bin/create.js` | Logic migrated to `src/commands/init.js` |

## Implementation Phases

### Phase 1: Extract Utilities
- Create `src/utils/templates.js` with `copyDir()`, `copyFile()`, `writeFile()`, `installCommands()`
- These are currently in `bin/create.js` and will be reused

### Phase 2: Create Init Command
- Create `src/commands/init.js` with full init logic
- Options: `--agent`, `--rules`
- Interactive prompt fallback when `--agent` not provided

### Phase 3: Integrate with CLI
- Update `bin/spec.js` to register init commands
- Make database initialization conditional (skip for `init`)

### Phase 4: Create Slash Command
- Create `templates/commands/spec.init.md`
- Update `templates/commands/meta.json`

### Phase 5: Cleanup
- Remove `create-speculator` from `package.json` bin
- Delete `bin/create.js`

## Testing Strategy

- [ ] `spec init --agent claude-code` installs Claude commands + skill
- [ ] `spec init --agent cursor` installs Cursor commands (no skill)
- [ ] `spec init --agent claude-code --rules` also installs CLAUDE.md
- [ ] `spec init --agent cursor --rules` also installs cursor rule
- [ ] `spec init` (no args) prompts for agent selection
- [ ] Re-running `spec init` overwrites existing files (idempotent)
- [ ] Other commands (`spec task`, `spec feature`) still work after refactor
