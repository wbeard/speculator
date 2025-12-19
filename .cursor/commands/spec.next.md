# Next Step

Analyze the current feature state and suggest what to do next.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-next/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Check for Active Feature**
   - Look in `.speculator/features/` for feature directories
   - If no features exist, respond:
     - "No active features found. Run `/spec.new` to start a new feature or `/spec.fix` for a bug fix."
   - If multiple features exist, ask which one to check (or infer from recent conversation)

2. **Analyze Feature State**
   - Check which artifacts exist in the feature directory:
     - `spec.md` — specification drafted
     - `research.md` — research completed
     - `plan.md` — implementation planned

3. **Determine Next Step**

   | State | Suggestion |
   |-------|------------|
   | No `spec.md` | "Feature workspace exists but has no spec. Run `/spec.new` to draft one." |
   | Only `spec.md` | "Spec exists. Run `/spec.research` to gather context, or `/spec.clarify` if the spec needs changes." |
   | `spec.md` + `research.md` | "Research complete. Run `/spec.plan` to create the implementation plan." |
   | `spec.md` + `research.md` + `plan.md` | "Plan ready. Run `/spec.tasks` to break it into executable tasks." |
   | All artifacts, tasks incomplete | "Tasks created. Run `/spec.implement` to execute them." |
   | All artifacts, all tasks complete | "Implementation complete! All tasks are done." |

4. **Show Status Summary**
   - Display which artifacts exist (checkmarks for completed stages)
   - Show the suggested next command prominently

## Post-Hooks

Check for post-hooks after showing status:
- List files: `ls .speculator/hooks/post-next/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Example Output

```
Feature: dark-mode-toggle

Status:
  [x] spec.md
  [x] research.md
  [ ] plan.md

Next: Run `/spec.plan` to create the implementation plan.
```
