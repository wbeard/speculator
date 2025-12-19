# Completing Tasks

## When a Task IS Complete

A task is complete when:

- **The stated goal is achieved** - The task description is satisfied
- **Code compiles/passes lint** - No build errors introduced
- **Tests pass** - Existing tests still work
- **No loose ends** - No TODO comments that require immediate attention

## When a Task IS NOT Complete

Do not mark complete if:

- **Partial implementation** - Only some of the requirements met
- **Broken tests** - Tests were passing before, now failing
- **Blocking others** - Task is done but introduced issues for dependent tasks
- **Missing verification** - Haven't confirmed the change works

## Completing a Task

```bash
spec task complete <task-id>
```

This:
1. Sets status to `done`
2. Unblocks tasks that depend on this one
3. Makes dependent tasks available in `spec tasks ready`

## Post-Completion Checklist

After marking complete:

1. **Check for unblocked tasks** - Your completion may enable other work
2. **Notify if relevant** - If another agent was waiting, they can now proceed
3. **Move on** - Get the next ready task

## Partial Completion

If you completed part of a task but not all:

1. **Don't mark complete** - It's not done
2. **Consider decomposition** - Break into subtasks
3. **Block if stuck** - Use `spec task block` with specific reason
4. **Release if needed** - Use `spec task release` if someone else should take over

## Example

```bash
# Task: "Add user validation"
# You've added validation but tests are failing

# WRONG:
$ spec task complete task-123  # Task isn't done!

# RIGHT:
$ spec task block task-123 --reason "Validation added but test assertUserValid is failing - need to update test fixtures"

# OR if you can fix it:
# Fix the tests, then:
$ spec task complete task-123
```
