# Implementation Plan: CLI Task Management

**Status:** READY

## Open Questions

None - all questions resolved.

## Migration & Cleanup

*No code conflicts - only slash command templates need updating*

- [ ] Remove `active-tasks.md` references from `/spec.tasks` template
- [ ] Remove `active-tasks.md` references from `/spec.implement` template

## Architecture

Replace markdown-based task tracking with CLI-driven database operations. The slash commands will orchestrate the existing `spec` CLI commands to manage task state in SQLite.

### Key Components

```
/spec.tasks (template)
    │
    ├── Read plan.md → Parse tasks with destruction-first ordering
    ├── Ensure feature exists in database
    ├── spec tasks import --feature <name> → Create tasks with dependencies
    └── spec feature show <name> → Display created tasks

/spec.implement (template)
    │
    ├── Generate agent ID (once per session)
    ├── Identify feature name (from context or ask user)
    └── Loop:
        ├── spec tasks ready --feature <name> → Get available tasks
        ├── spec task claim <id> --agent <agent-id> → Claim atomically
        ├── Execute task (write code, run commands, etc.)
        └── spec task complete <id> | spec task block <id> --reason <reason>
```

### Feature Identification by Name

All `--feature` flags now accept the feature **name** (unique slug like `cli-task-management`) instead of UUID:

```bash
# Before (UUID required)
spec tasks ready --feature 552703a0-bb9c-4e7b-85f5-ec679469b4a9

# After (name accepted)
spec tasks ready --feature cli-task-management
```

This is easier for LLMs to reference (they can read the directory name) and faster for humans to type.

## File Changes

### New Files

None - all CLI commands already exist.

### Modified Files

| Path | Changes |
|------|---------|
| `src/operations/features.js` | Add `findFeatureByName()` function |
| `src/commands/features.js` | Update to support name lookup in list |
| `src/commands/tasks.js` | Update `--feature` to accept name, resolve to ID internally |
| `src/commands/task.js` | Update `--feature` in `task add` to accept name |
| `templates/commands/spec.tasks.md` | Replace markdown file writing with `spec tasks import` |
| `templates/commands/spec.implement.md` | Replace markdown parsing with CLI orchestration loop |

## Implementation Phases

### Phase 1: Add Feature Lookup by Name

Add `findFeatureByName()` to resolve feature name to ID:

```javascript
// src/operations/features.js
export function findFeatureByName(name) {
  const db = getDb();
  return db.prepare('SELECT * FROM features WHERE name = ?').get(name);
}
```

### Phase 2: Update CLI Commands to Accept Feature Name

Update these commands to accept `--feature <name>` and resolve internally:
- `spec tasks ready --feature <name>`
- `spec tasks import --feature <name>`
- `spec task add --feature <name>`
- `spec feature show <name>` (already works with ID, add name support)

### Phase 3: Update /spec.tasks Template

New workflow:
1. Read `plan.md` from feature directory
2. Parse tasks using destruction-first ordering (cleanup → build)
3. Ensure feature exists: `spec feature create <name>` (idempotent)
4. Build JSON array of tasks with `depends_on_indices`
5. Pipe to `spec tasks import --feature <name>`
6. Display summary using `spec feature show <name>`

### Phase 4: Update /spec.implement Template

New workflow:
1. Identify feature name (detect from context or ask)
2. Generate agent ID: `agent-$(uuidgen | cut -c1-8)`
3. Enter execution loop:
   - `spec tasks ready --feature <name>` → get available tasks
   - If no tasks, check if all done or all blocked
   - Pick first task, `spec task claim <id> --agent <agent-id>`
   - Execute the task
   - `spec task complete <id>` or `spec task block <id> --reason <reason>`
   - Continue to next task
4. Stop when: all done, blocked, or context limit

## Testing Strategy

- [ ] Test `spec tasks ready --feature <name>` returns correct tasks
- [ ] Test `spec tasks import --feature <name>` creates tasks
- [ ] Test `spec feature show <name>` works with name
- [ ] Test `/spec.tasks` creates tasks in database
- [ ] Test `/spec.implement` claims, completes, and blocks tasks
- [ ] Test multi-agent scenario: two agents don't claim same task
