# Research: Installer Update (CLI Architecture)

## Existing Patterns

### Code to Reuse from speculator-tasks

The following can be extracted and reused in the CLI:

**`db.ts` (61 lines):**
- `initDb(dbPath)` - Initialize SQLite with schema
- `getDb()` - Get database instance
- Schema: features, tasks, task_dependencies tables
- Indexes for common queries

**`tools/tasks.ts` (415 lines):**
- `wouldCreateCycle()` - Circular dependency detection
- Core operations: add_task, claim_task, complete_task, block_task, unblock_task, release_task, get_task, add_dependency, get_ready_tasks
- All business logic is framework-agnostic (just uses getDb())

**`tools/features.ts` (173 lines):**
- `buildTaskTree()` - Convert flat tasks to nested tree
- Core operations: create_feature, list_features, get_feature
- Task counts aggregation

**`types.ts`:**
- Type definitions for Feature, Task, TaskWithChildren, etc.

### Current Skill Files

Skill at `.claude/skills/speculator-orchestration/` uses MCP tool syntax:
```
get_ready_tasks(feature_id: "...")
claim_task(task_id: "...", agent_id: "...")
```

**Files to update (7 total):**
- SKILL.md - Quick reference table, orchestration loop
- workflows/claiming.md - Example session
- workflows/completing.md - Completion commands
- workflows/blocking.md - Block/unblock commands
- patterns/parallelization.md - Minor reference updates
- patterns/decomposition.md - Task creation examples
- examples/multi-agent-session.md - Full session example

## Dependencies

### Current (speculator-tasks)

| Dependency | Purpose | Keep for CLI? |
|------------|---------|---------------|
| @modelcontextprotocol/sdk | MCP server | **No** - remove |
| better-sqlite3 | SQLite database | **Yes** |
| uuid | Generate IDs | **Yes** |
| zod | Input validation | **Yes** (for CLI args) |

### CLI Framework Options

| Option | Pros | Cons |
|--------|------|------|
| **commander** | Popular, mature, good docs | Heavier |
| **yargs** | Powerful, good for complex CLIs | Complex |
| **cac** | Lightweight, TypeScript-first | Less known |
| **No framework** | Zero deps, full control | More code |

**Recommendation:** Use `commander` - it's battle-tested and the existing repo already uses prompts/kleur patterns.

### New Dependencies for CLI

| Dependency | Version | Purpose |
|------------|---------|---------|
| commander | ^12.0.0 | CLI argument parsing |
| better-sqlite3 | ^11.0.0 | SQLite (keep) |
| uuid | ^10.0.0 | ID generation (keep) |

## Technical Constraints

- **Global install required:** CLI must work when installed globally via `npm install -g`
- **Database path:** CLI needs to find `.speculator/tasks.db` relative to cwd
- **Output format:** JSON for machine parsing, but could add `--format table` later
- **Agent ID:** For `claim`, agent needs to identify itself (could use hostname or explicit flag)

## CLI Command Design

```bash
# Feature commands
spec feature create <name> [--description <desc>]
spec feature show <id>
spec features [--status <status>]

# Task commands (singular for single task operations)
spec task add --feature <id> --title <title> [--description <desc>] [--parent <id>]
spec task show <id>
spec task claim <id> --agent <agent-id>
spec task complete <id>
spec task block <id> --reason <reason>
spec task unblock <id>
spec task release <id>
spec task depend <id> --on <other-id>

# Tasks commands (plural for queries)
spec tasks ready [--feature <id>]
spec tasks import --feature <id> < tasks.json
```

## Package Structure Options

**Option A: Separate package**
```
packages/spec-cli/
├── package.json      # name: "spec-cli", bin: { "spec": ... }
├── src/
│   ├── index.ts
│   ├── db.ts         # Copy from speculator-tasks
│   ├── commands/
│   └── types.ts
```

**Option B: Add to main package**
```
bin/
├── create.js         # Existing installer
├── spec.js           # New CLI entry point
src/
├── db.ts
├── commands/
└── types.ts
```

**Recommendation:** Option B - simpler, single package to install.

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| better-sqlite3 native build | Medium | Same as before - clear error messages |
| Global vs local install confusion | Medium | Document in README, check for .speculator/ |
| CLI name collision (`spec`) | Low | Could use `speculator` if needed |
| Breaking skill documentation | High | Update all 7 skill files |

## Recommendations

1. **Add CLI to main package** - Use `bin/spec.js` entry point, add `"spec": "./bin/spec.js"` to package.json bin

2. **Reuse business logic** - Extract db.ts and operation functions from speculator-tasks, remove MCP wrapper

3. **Use commander** - Simple, well-documented CLI framework

4. **Update skill files** - Convert all MCP tool references to CLI commands:
   ```
   # Before
   get_ready_tasks(feature_id: "...")

   # After
   spec tasks ready --feature ...
   ```

5. **Delete speculator-tasks/** - After extracting reusable code

6. **Output JSON** - CLI should output JSON for easy parsing by agents
