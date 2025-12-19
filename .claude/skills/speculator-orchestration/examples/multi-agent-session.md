# Multi-Agent Session Example

This example shows two agents (A and B) working concurrently on the same feature.

## Setup

Feature: `feat-user-auth` - Add user authentication
Tasks:
1. `task-1`: Add User model
2. `task-2`: Add AuthService (depends on task-1)
3. `task-3`: Add AuthController (depends on task-2)
4. `task-4`: Add auth tests
5. `task-5`: Add login UI
6. `task-6`: Add logout UI

## Session Timeline

### T0: Both Agents Start

**Agent A:**
```bash
$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-1", "title": "Add User model" },
  { "id": "task-4", "title": "Add auth tests" },
  { "id": "task-5", "title": "Add login UI" },
  { "id": "task-6", "title": "Add logout UI" }
]

$ spec task claim task-1
{ "id": "task-1", "status": "in_progress", ... }
```

**Agent B (same time):**
```bash
$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-1", "title": "Add User model" },  # Still shows - not yet claimed
  { "id": "task-4", "title": "Add auth tests" },
  { "id": "task-5", "title": "Add login UI" },
  { "id": "task-6", "title": "Add logout UI" }
]

$ spec task claim task-1
{ "error": "Task task-1 is not available (status: in_progress)" }

# Move on to different task
$ spec task claim task-5
{ "id": "task-5", "status": "in_progress", ... }
```

### T1: Agent A Completes, Agent B Discovers Blocker

**Agent A:**
```bash
# Finishes User model
$ spec task complete task-1
{ "id": "task-1", "status": "done", ... }

# Get next task - task-2 now available!
$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-2", "title": "Add AuthService" },  # Now ready
  { "id": "task-4", "title": "Add auth tests" },
  { "id": "task-6", "title": "Add logout UI" }
]

$ spec task claim task-2
{ "id": "task-2", "status": "in_progress", ... }
```

**Agent B:**
```bash
# Working on login UI, discovers it needs AuthService
$ spec task block task-5 --reason "Login UI needs AuthService.login() - waiting for task-2"
{ "id": "task-5", "status": "blocked", "blocked_reason": "Login UI needs AuthService.login() - waiting for task-2", ... }

# Get different task
$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-4", "title": "Add auth tests" },
  { "id": "task-6", "title": "Add logout UI" }
]

$ spec task claim task-6
{ "id": "task-6", "status": "in_progress", ... }
```

### T2: Agent A Completes, Unblocks Agent B's Task

**Agent A:**
```bash
# Finishes AuthService
$ spec task complete task-2
{ "id": "task-2", "status": "done", ... }

# Notify that task-5 can be unblocked
$ spec task unblock task-5
{ "id": "task-5", "status": "todo", ... }

$ spec task claim task-3
{ "id": "task-3", "status": "in_progress", ... }
```

**Agent B:**
```bash
# Finishes logout UI
$ spec task complete task-6
{ "id": "task-6", "status": "done", ... }

$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-4", "title": "Add auth tests" },
  { "id": "task-5", "title": "Add login UI" }  # Now unblocked!
]

$ spec task claim task-5
{ "id": "task-5", "status": "in_progress", ... }
```

### T3: Final State

**Agent A:** Completes `task-3` (AuthController)
**Agent B:** Completes `task-5` (Login UI)

```bash
$ spec tasks ready --feature feat-user-auth
[
  { "id": "task-4", "title": "Add auth tests" }
]
```

Only the tests remain. Either agent can claim it.

## Key Takeaways

1. **Atomic claims prevent duplicates** - Agent B's claim on task-1 failed gracefully
2. **Move on when blocked** - Agent B found other work when login UI was blocked
3. **Unblock proactively** - Agent A unblocked task-5 after completing its dependency
4. **Dependencies unlock automatically** - task-2 became ready when task-1 completed
5. **Parallel progress** - Both agents made progress throughout
