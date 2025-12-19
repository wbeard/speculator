# Blocking Tasks

## When to Block

Block a task when you cannot proceed due to:

### External Blockers
- API/service is down
- Waiting for external approval
- Missing credentials or access

### Requirement Blockers
- Requirements are ambiguous
- Need clarification from user
- Conflicting requirements discovered

### Technical Blockers
- Dependency task needs to be done first (use `spec task depend` instead)
- Critical bug found that must be fixed first
- Missing infrastructure or tooling

## When NOT to Block

Do not block for:

| Situation | Instead |
|-----------|---------|
| Task is hard | Keep working |
| Need to research | Research, then continue |
| Taking longer than expected | Keep going |
| Unsure of approach | Make a decision and proceed |
| Want to work on something else | Complete or release task |

## Blocking a Task

```bash
spec task block <task-id> --reason "Waiting for S3 bucket creation by DevOps"
```

### Good Block Reasons

- "Waiting for API credentials from user"
- "Requires migration task-456 to be completed first"
- "UserService.ts has merge conflicts from task-789"
- "Need clarification: should validation be sync or async?"

### Bad Block Reasons

- "This is complicated" (not a blocker)
- "Need to think about it" (not a blocker)
- "Taking too long" (not a blocker)
- "Blocked" (not specific enough)

## Unblocking

When the blocker is resolved:

```bash
spec task unblock <task-id>
```

The task returns to `todo` status and appears in `spec tasks ready`.

## Blocking vs. Dependencies

| Situation | Use |
|-----------|-----|
| Task B needs Task A's output | `spec task depend <task-b-id> --on <task-a-id>` |
| Task blocked by external factor | `spec task block <task-id> --reason <reason>` |
| Task blocked by another task already in progress | `spec task block` with reference to other task |

## Example Flow

```bash
# Agent discovers a blocker
$ spec task block task-123 --reason "S3 bucket 'uploads' doesn't exist - needs infrastructure setup"
{ "id": "task-123", "status": "blocked", "blocked_reason": "S3 bucket 'uploads' doesn't exist..." }

# Later, after infra is ready
$ spec task unblock task-123
{ "id": "task-123", "status": "todo", ... }

# Task now appears in ready tasks
$ spec tasks ready
[ { "id": "task-123", ... } ]
```
