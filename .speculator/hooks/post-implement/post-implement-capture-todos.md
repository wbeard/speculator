# Capture Deferred TODOs

This hook runs after each task is completed in `/spec.implement`. Check if any work was intentionally deferred during the task.

## What to Look For

Review the code changes just made for:

- **Code comments** - TODO, FIXME, HACK, XXX markers added
- **Skipped edge cases** - Error paths not handled, validation missing
- **Missing tests** - Code added without corresponding tests
- **Hardcoded values** - Magic numbers, configuration that should be externalized
- **Incomplete features** - Partial implementations marked for later

## If Deferred Work Found

1. Create the backlog directory if needed:
   ```bash
   mkdir -p .speculator/backlog
   ```

2. Append to `.speculator/backlog/todos.md`:

```markdown
## <Today's Date> - <Task Title>

- [ ] <TODO description>
  - **Context:** <Why was this deferred?>
  - **Priority:** low | medium | high
  - **Location:** <File path or component if relevant>
```

3. Report: "Captured TODO: <description>"

## Priority Guidelines

- **Low** - Nice-to-have improvements, minor polish
- **Medium** - Should be done before shipping, but not blocking
- **High** - Blocking issue that needs resolution soon

## If Nothing Deferred

If the task was completed fully with no deferred work, no action needed. Don't create an empty entry.
