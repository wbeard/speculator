# Research: CLI Task Management

## Existing Patterns

### Current Slash Command Behavior

**`/spec.tasks` (templates/commands/spec.tasks.md)**
- Reads `plan.md` from feature directory
- Uses destruction-first ordering (cleanup before build)
- Writes checklist to `active-tasks.md` as markdown
- No database interaction

**`/spec.implement` (templates/commands/spec.implement.md)**
- Reads `active-tasks.md` from feature directory
- Finds first unchecked task (`- [ ]`)
- Executes task, marks complete (`- [x]`)
- Loops until all done or blocked
- No database interaction

### CLI Commands (Already Implemented)

| Command | Implementation | Purpose |
|---------|----------------|---------|
| `spec task add` | `src/commands/task.js:23` | Create task in database |
| `spec task claim` | `src/commands/task.js:51` | Atomically claim for agent |
| `spec task complete` | `src/commands/task.js:64` | Mark task done |
| `spec task block` | `src/commands/task.js:77` | Record blocker |
| `spec task unblock` | `src/commands/task.js:91` | Remove blocker |
| `spec task release` | `src/commands/task.js:104` | Return to todo |
| `spec task depend` | `src/commands/task.js:117` | Add dependency |
| `spec tasks ready` | `src/commands/tasks.js:8` | List available tasks |
| `spec tasks import` | `src/commands/tasks.js:16` | Bulk import from JSON |
| `spec feature create` | `src/commands/feature.js:8` | Create feature |
| `spec feature show` | `src/commands/feature.js:16` | Show feature with tasks |

### Orchestration Skill (Documentation for Multi-Agent)

The skill at `templates/skills/speculator-orchestration/` documents the ideal workflow:

```
1. spec tasks ready → find available work
2. Evaluate conflicts → check for file overlap
3. spec task claim <id> --agent <agent-id> → atomically claim
4. Implement → do the work
5. spec task complete <id> | spec task block <id> → finish or block
6. Repeat
```

This is exactly what `/spec.implement` should do.

### Database Operations (src/operations/tasks.js)

- **Atomic claiming**: `claimTask()` checks status=todo before updating
- **Transaction support**: `importTasks()` uses `db.transaction()`
- **Dependency resolution**: `getReadyTasks()` filters by incomplete dependencies
- **WAL mode enabled**: `db.pragma('journal_mode = WAL')` for concurrent access

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| better-sqlite3 | ^11.0.0 | SQLite database access |
| commander | ^12.0.0 | CLI argument parsing |
| uuid | ^10.0.0 | Generate task/feature IDs |

All dependencies already installed - no changes needed.

## Technical Constraints

### Feature Lookup by Name

The current CLI uses feature IDs (UUIDs), but the workspace uses directory names (kebab-case slugs like `cli-task-management`). Need to add:

- `spec feature find --name <name>` command, OR
- Modify `spec feature create` to accept a custom ID (the slug), OR
- Store the feature ID in the workspace after creation

**Recommendation**: Add a `--name` filter to `spec features` command to find by name.

### Agent ID Generation

The slash command needs to generate an agent ID for single-agent use. Options:
- Generate UUID and store in environment
- Use a short random ID: `agent-$(uuidgen | cut -c1-8)`
- Use session-based ID

**Recommendation**: Generate at start of `/spec.implement` and reuse for session.

### Bulk Task Creation

`/spec.tasks` needs to create multiple tasks with dependencies. Options:
1. Call `spec task add` for each task, then `spec task depend` for dependencies
2. Use `spec tasks import` with JSON from stdin

**Recommendation**: Use `spec tasks import` - it handles dependencies in a transaction and maintains ordering.

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Feature name lookup fails | Medium | Add `--name` filter to `spec features` command |
| Agent ID not persisted across conversation | Low | Generate once, store in context/env |
| Complex dependency parsing from plan.md | Medium | Keep simple: linear order with explicit dependencies |

## Recommendations

### Implementation Approach

1. **Add feature lookup by name**: Extend `spec features` with `--name` filter
2. **Update `/spec.tasks`**:
   - Parse plan.md for tasks (keep destruction-first ordering)
   - Build JSON array with `depends_on_indices` for sequential dependencies
   - Pipe to `spec tasks import --feature <id>`
   - Show task summary from database

3. **Update `/spec.implement`**:
   - Generate agent ID: `agent-$(uuidgen | cut -c1-8)`
   - Loop: `spec tasks ready` → pick first → `spec task claim` → execute → `spec task complete` or `spec task block`
   - Stop conditions: all done, blocked, or context limit

4. **Remove active-tasks.md references**: Update both templates to never read/write this file

### Slash Command Changes Summary

| Command | Current | New |
|---------|---------|-----|
| `/spec.tasks` | Write `active-tasks.md` | Create tasks via `spec tasks import` |
| `/spec.implement` | Read/update `active-tasks.md` | Use `spec tasks ready` + `spec task claim/complete/block` |
