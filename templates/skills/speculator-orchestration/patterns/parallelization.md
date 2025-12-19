# Parallelization Patterns

## Task Categories

### Safe to Parallelize

These tasks can run concurrently with minimal risk:

- **Isolated features** - New features in separate directories
- **Independent tests** - Test files that don't share fixtures
- **Documentation** - README, docs, comments
- **Styling** - CSS/style changes to different components

### Parallelize with Caution

These may conflict - check before claiming:

- **Same module, different files** - Imports may conflict
- **Shared test utilities** - Test helpers, fixtures
- **Type definitions** - Interfaces used across features
- **Configuration files** - May need sequential edits

### Always Serialize

These should never run in parallel:

- **Same file** - Guaranteed merge conflicts
- **Database migrations** - Order matters
- **Package.json / lockfiles** - Version conflicts
- **CI/CD configuration** - Build order dependencies

## File Conflict Heuristics

| Your Task | Other In-Progress | Conflict Risk |
|-----------|------------------|---------------|
| `src/features/auth/*` | `src/features/billing/*` | Low |
| `src/features/auth/*` | `src/features/auth/*` | High |
| `src/components/Button.tsx` | `src/components/Input.tsx` | Low |
| `src/types/user.ts` | Any file importing `user.ts` | Medium |
| `schema.prisma` | Any database task | High |
| `package.json` | Any task adding deps | High |

## Conflict Handling

### Before Claiming

1. Check `spec tasks ready` for in-progress tasks
2. Compare file paths you'll touch vs. files they're touching
3. If overlap is high, wait or claim a different task

### During Work

If you discover a conflict mid-task:

1. **Stop immediately** - Don't make it worse
2. **Block your task** - With clear reason referencing the conflict
3. **Notify** - Other agent may need to know

### After Conflict

If merge conflicts occur:

1. The agent who completes second resolves conflicts
2. Use `spec task block` if you can't resolve
3. Consider decomposing to avoid future conflicts

## Example: Evaluating Parallelization

```
# Current in-progress tasks:
Agent B: "Add UserService" - touching src/services/user.ts, src/types/user.ts

# You want to claim:
"Add AuthService" - will touch src/services/auth.ts, src/types/user.ts

# Analysis:
- src/services/auth.ts - No conflict (different file)
- src/types/user.ts - CONFLICT (both touching this file)

# Decision:
Block or wait. The shared types file will conflict.
```
