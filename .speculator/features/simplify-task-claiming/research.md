# Research: Simplify Task Claiming

## Existing Patterns

### Current Implementation

The task claiming flow involves:

1. **CLI Layer** (`src/commands/task.js:53-64`)
   - `spec task claim <id> --agent <agent-id>` - agent flag is `requiredOption`
   - Calls `claimTask(id, options.agent)`

2. **Operations Layer** (`src/operations/tasks.js:91-117`)
   - `claimTask(taskId, agentId)` - accepts agentId as required param
   - Validates task exists and is `todo`
   - Updates: `status = 'in_progress'`, `assigned_to = agentId`

3. **Database Schema** (`src/db.js:24`)
   - `assigned_to TEXT` - already nullable, no NOT NULL constraint
   - No default value defined in schema

### Pattern Observation

Other commands follow a simpler pattern:
- `spec task complete <id>` - no extra params
- `spec task release <id>` - no extra params
- `spec task unblock <id>` - no extra params

Only `claim` and `block` require additional information. For `block`, the reason is genuinely useful. For `claim`, the agent ID is less critical.

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| commander | ^12.0.0 | CLI parsing - supports `.option()` for optional flags |
| better-sqlite3 | ^11.0.0 | Database - `assigned_to` column already nullable |

## Technical Constraints

- **Backward compatibility**: Existing scripts using `--agent` must continue to work
- **Database compatibility**: No schema changes needed - `assigned_to` is already nullable
- **Documentation sync**: Two copies of skill docs exist (templates/ and .claude/) - both must be updated

## Files Requiring Changes

| File | Change |
|------|--------|
| `src/commands/task.js` | Change `requiredOption` to `option` on line 55 |
| `src/operations/tasks.js` | Handle `agentId` being undefined/null on line 91 |
| `templates/skills/speculator-orchestration/SKILL.md` | Update command syntax |
| `templates/skills/speculator-orchestration/workflows/claiming.md` | Update examples |
| `templates/skills/speculator-orchestration/examples/multi-agent-session.md` | Update examples |
| `.claude/skills/speculator-orchestration/` (3 files) | Mirror changes from templates |

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking existing scripts | Low | Keep `--agent` as optional flag (backward compatible) |
| Confusion about task ownership | Low | `in_progress` status is sufficient for coordination |
| Duplicate skill docs out of sync | Medium | Update both locations or consolidate |

## Open Questions - Resolved

**Q: Should `assigned_to` be `null` or `"anonymous"` when not provided?**

**A: Use `null`.**
- Cleaner - no magic strings
- Already nullable in schema
- Easier to query (IS NULL vs = 'anonymous')
- No behavior depends on the value

## Recommendations

1. **Minimal change** - Only modify the `requiredOption` → `option` and handle null in `claimTask()`
2. **Preserve backward compatibility** - `--agent` continues to work for users who want it
3. **Update docs** - Show new simpler syntax as primary, old syntax as optional
4. **No schema changes** - `assigned_to` already handles null correctly
