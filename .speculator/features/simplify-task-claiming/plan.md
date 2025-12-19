# Implementation Plan: Simplify Task Claiming

**Status:** READY

## Open Questions

*None - all questions resolved during research.*

## Migration & Cleanup

*No migration needed - this is a backward-compatible change.*

## Architecture

This is a simple refactor that makes the `--agent` flag optional while preserving all existing behavior. The change touches two layers:

1. **CLI Layer** - Change flag from required to optional
2. **Operations Layer** - Handle null/undefined agent ID gracefully

No database changes required since `assigned_to` is already nullable.

### Key Components

```
CLI (task.js)                    Operations (tasks.js)
     │                                   │
     │ .option() instead of              │ Handle agentId || null
     │ .requiredOption()                 │
     ▼                                   ▼
spec task claim <id>        ──►    claimTask(id, null)
spec task claim <id> -a X   ──►    claimTask(id, "X")
```

## File Changes

### New Files

*None*

### Modified Files

| Path | Changes |
|------|---------|
| `src/commands/task.js` | Line 55: `.requiredOption('-a, --agent <agent-id>'...)` → `.option('-a, --agent [agent-id]'...)` |
| `src/operations/tasks.js` | Line 107: Use `agentId \|\| null` to handle undefined |
| `templates/skills/speculator-orchestration/SKILL.md` | Update command table: remove `--agent` from required syntax, show as optional |
| `templates/skills/speculator-orchestration/workflows/claiming.md` | Update examples to show simpler syntax |
| `templates/skills/speculator-orchestration/examples/multi-agent-session.md` | Update all `spec task claim` examples |
| `.claude/skills/speculator-orchestration/SKILL.md` | Mirror changes from templates |
| `.claude/skills/speculator-orchestration/workflows/claiming.md` | Mirror changes from templates |
| `.claude/skills/speculator-orchestration/examples/multi-agent-session.md` | Mirror changes from templates |

## Implementation Phases

### Phase 1: Core Code Changes
1. Update `src/commands/task.js` - make `--agent` optional
2. Update `src/operations/tasks.js` - handle null agent ID

### Phase 2: Documentation Updates (templates/)
3. Update `templates/skills/speculator-orchestration/SKILL.md`
4. Update `templates/skills/speculator-orchestration/workflows/claiming.md`
5. Update `templates/skills/speculator-orchestration/examples/multi-agent-session.md`

### Phase 3: Documentation Sync (.claude/)
6. Copy updated docs to `.claude/skills/speculator-orchestration/`

## Testing Strategy

- [ ] Manual test: `spec task claim <id>` without `--agent` flag works
- [ ] Manual test: `spec task claim <id> --agent foo` still works (backward compat)
- [ ] Manual test: Claimed task shows `status: "in_progress"` and `assigned_to: null`
- [ ] Manual test: Claiming already in-progress task fails with error
- [ ] Manual test: `spec task complete <id>` works on anonymously claimed task
- [ ] Manual test: `spec task release <id>` works on anonymously claimed task
