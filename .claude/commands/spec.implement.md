---
description: Execute tasks in a recursive loop
---

# Implementation

Execute tasks in an orchestration loop using CLI commands.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-implement/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred from conversation, ask: "Which feature are you implementing?"
   - Note the feature name (directory slug, e.g., `user-auth`)

2. **Generate Agent ID**
   - Create a unique agent ID for this session (used for claiming tasks)
   - Example: `agent-abc12345` (any unique identifier works)

3. **Execution Loop**
   - Get available tasks:
     ```bash
     spec tasks ready --feature <feature-name>
     ```
   - If tasks available:
     - Pick the first task from the list
     - Claim it atomically:
       ```bash
       spec task claim <task-id> --agent <agent-id>
       ```
     - If claim fails, another agent took it - get next task
     - Execute the task (write code, delete files, run commands, etc.)
     - **Run post-implement hooks** after completing each task:
       - List files: `ls .speculator/hooks/post-implement/*.md 2>/dev/null`
       - If hooks exist, read and execute each one
       - If a hook fails, warn and continue
     - Mark complete or block:
       ```bash
       spec task complete <task-id>
       # OR if blocked:
       spec task block <task-id> --reason "<specific reason>"
       ```
     - **Immediately continue to the next task**

4. **Stop Conditions**
   - **All tasks complete** (no ready tasks, none blocked):
     - "Implementation complete! Consider running tests."
   - **Token/context limit reached:**
     - "Type 'continue' to proceed with remaining tasks."
   - **Blocker found:**
     - Block the task with a clear reason
     - Suggest running `/spec.clarify` to resolve

## Important

- **Claim before you code** - Always claim a task before starting work
- Do NOT stop between tasks unless blocked
- Do NOT ask for permission to continue to the next task
- Execute continuously until a stop condition is met
- If a claim fails, move on to the next available task

## Quick Reference

| Action | Command |
|--------|---------|
| Get available tasks | `spec tasks ready --feature <name>` |
| Claim a task | `spec task claim <id> --agent <agent-id>` |
| Complete a task | `spec task complete <id>` |
| Block a task | `spec task block <id> --reason "<reason>"` |
| Release a task | `spec task release <id>` |
| Check feature status | `spec feature show <name>` |
