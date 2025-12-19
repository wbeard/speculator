# Decomposition Patterns

## When to Decompose

Break a task into subtasks when:

- **Large scope** - Task will take more than 30 minutes
- **Multiple files** - Task touches 5+ files across directories
- **Natural boundaries** - Clear subtasks emerge (backend, frontend, tests)
- **Parallelization opportunity** - Subtasks could run concurrently

## When NOT to Decompose

Keep tasks atomic when:

- **Tightly coupled** - Changes must happen together
- **Quick to complete** - Under 15 minutes
- **Single file** - All changes in one place
- **Risky to split** - Partial completion would break things

## Decomposition Patterns

### Component Pattern

For new features with clear layers:

```
Parent: "Add user profile feature"
├── Subtask: "Add User model and migration"
├── Subtask: "Add UserService with CRUD operations"
├── Subtask: "Add UserController with routes"
├── Subtask: "Add profile UI components"
└── Subtask: "Add user profile tests"
```

### Feature Pattern

For cross-cutting features:

```
Parent: "Add caching layer"
├── Subtask: "Add cache interface and Redis implementation"
├── Subtask: "Add cache to UserService"
├── Subtask: "Add cache to ProductService"
└── Subtask: "Add cache invalidation on writes"
```

### Fix Pattern

For complex bug fixes:

```
Parent: "Fix race condition in checkout"
├── Subtask: "Add reproduction test"
├── Subtask: "Add mutex to inventory check"
├── Subtask: "Update checkout flow to use mutex"
└── Subtask: "Verify fix with load test"
```

## Creating Subtasks

```bash
# Create subtask under a parent
spec task add --feature feat-123 --parent task-456 --title "Add UserService with CRUD operations" --description "Create service layer for user operations"
```

## Setting Dependencies

If subtasks must be done in order:

```bash
spec task depend task-controller --on task-service
```

## Anti-Patterns

### Over-Decomposition

**Bad:**
```
"Add Button component"
├── "Create Button.tsx file"
├── "Add Button props interface"
├── "Add Button render method"
├── "Add Button styles"
└── "Export Button from index"
```

This is a 5-minute task. Don't decompose.

### Under-Decomposition

**Bad:**
```
"Build entire user management system"
```

This is weeks of work. Decompose into features, then tasks.

### Wrong Boundaries

**Bad:**
```
"Add user feature"
├── "Morning work on user feature"
├── "Afternoon work on user feature"
```

Decompose by functionality, not time.
