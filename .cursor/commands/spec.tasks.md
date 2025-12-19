# Task Breakdown

Break the plan into executable tasks stored in the database.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-tasks/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred from conversation, ask: "Which feature are you breaking down?"
   - Read `plan.md` from the feature directory
   - Note the feature name (directory slug, e.g., `user-auth`)

2. **Create Task List**
   - Use **destruction-first ordering**:
     - **Phase 1 (Cleanup):** Tasks from "Migration & Cleanup" section
       - Delete deprecated files
       - Remove old code
       - Refactor conflicting patterns
     - **Phase 2 (Build):** Grouped construction tasks
       - Group related items (component + styles + types together)
       - Order by dependency (foundations first)

3. **Ensure Feature Exists**
   - Create the feature in the database if it doesn't exist:
     ```bash
     spec feature create "<feature-name>" -d "<description>"
     ```

4. **Import Tasks**
   - Build a JSON array of tasks with dependencies
   - Import using `spec tasks import`:
     ```bash
     echo '[
       {"title": "Delete deprecated auth helper"},
       {"title": "Create LoginForm component", "depends_on_indices": [0]},
       {"title": "Add form validation", "depends_on_indices": [1]},
       {"title": "Connect to auth API", "depends_on_indices": [2]}
     ]' | spec tasks import --feature <feature-name>
     ```
   - Use `depends_on_indices` to reference earlier tasks (0-indexed)

5. **Present Tasks**
   - Show the created tasks:
     ```bash
     spec feature show <feature-name>
     ```
   - Confirm the order makes sense

## Post-Hooks

Check for post-hooks before suggesting next step:
- List files: `ls .speculator/hooks/post-tasks/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Suggest Next Step

- "Run `/spec.implement` to start executing tasks."
