# Implementation Plan

Create an implementation plan bridging current state to requirements.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-plan/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred from conversation, ask: "Which feature are you planning?"
   - Read `spec.md` and `research.md` from the feature directory

2. **Check for Prior Work**
   - Check if the feature exists and has any completed tasks:
     ```bash
     spec feature show <feature-name>
     ```
   - If the feature exists with completed tasks, note what was already done
   - If the feature doesn't exist yet, proceed with planning

3. **Analyze Conflicts**
   - Does existing code conflict with the spec?
   - If yes: Plan a "Migration & Cleanup" section listing what to remove/change first

4. **Create Plan**
   - Create `.speculator/features/<feature>/plan.md` using the template from `.speculator/templates/implementation-plan.md`
   - Include:
     - Architecture overview
     - File changes (new and modified)
     - Migration & cleanup steps (if any)
     - Testing strategy

5. **Confidence Gate**
   - If ambiguities remain that block implementation:
     - STOP and tell user to run `/spec.clarify` first
   - Otherwise, present the plan for review

## Post-Hooks

Check for post-hooks before suggesting next step:
- List files: `ls .speculator/hooks/post-plan/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Suggest Next Step

- "Run `/spec.tasks` to break this into executable tasks."
