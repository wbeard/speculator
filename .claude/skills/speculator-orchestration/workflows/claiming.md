# Claiming Tasks

## The 5-Step Claiming Process

### 1. Survey Available Work

```bash
spec tasks ready --feature <feature-id>
```

This returns tasks that are:
- Status: `todo`
- Not blocked
- All dependencies completed

### 2. Evaluate for Conflicts

Before claiming, check if another agent is working on related files:

| Task Type | Conflict Risk | Action |
|-----------|---------------|--------|
| Different directories | Low | Safe to claim |
| Same directory, different files | Medium | Check file patterns |
| Same file | High | Wait or coordinate |
| Shared config/schema files | High | Serialize work |

**Quick heuristics:**
- Tests in isolation → Safe
- New feature in new directory → Safe
- Modifying shared types/interfaces → Caution
- Database migrations → Always serialize

### 3. Claim Atomically

```bash
spec task claim <task-id>
```

**Important:** The claim is atomic. If it succeeds, the task is marked `in_progress` and no other agent can claim it. If it fails (returns error), another agent claimed it first.

### 4. Implement

Once claimed:
- Do the work
- Don't start other tasks until complete
- If blocked, use `spec task block` with a clear reason

### 5. Handle Outcomes

| Outcome | Command |
|---------|---------|
| Success | `spec task complete <task-id>` |
| Blocked | `spec task block <task-id> --reason <reason>` |
| Can't finish | `spec task release <task-id>` |

## Claim Failures

If `spec task claim` fails:

1. **Don't retry the same task** - Another agent has it
2. **Move on** - Get a different ready task
3. **Check later** - The task may be released or completed

## Example Session

```bash
$ spec tasks ready --feature feat-123
[
  { "id": "task-1", "title": "Add UserService" },
  { "id": "task-2", "title": "Add UserController" },
  { "id": "task-3", "title": "Add user tests" }
]

$ spec task claim task-1
{ "id": "task-1", "status": "in_progress", ... }

# Work on task-1...

$ spec task complete task-1
{ "id": "task-1", "status": "done", ... }

$ spec tasks ready --feature feat-123
# task-2 now available (was waiting on task-1)
```
