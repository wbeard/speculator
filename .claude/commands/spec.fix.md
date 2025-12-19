---
description: Create a bug fix feature from reproduction steps
---

# Bug Fix Specification

Create a bug fix feature from reproduction steps.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-fix/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Gather Bug Details**
   - Ask: "Describe the bug:"
     - What steps reproduce it?
     - What happens? (actual behavior)
     - What should happen? (expected behavior)
   - Wait for user response

2. **Create Workspace**
   - Generate slug: `fix-<description-slug>`
   - Create directory: `.speculator/features/fix-<slug>/`

3. **Draft Specification**
   - Create `spec.md` with:
     - **Context:** "Fix incorrect behavior in [area]"
     - **User Story:** "As a user, when I [repro], I expect [expected], but [actual] happens."
     - **Requirements:** Derived from expected behavior
     - **Acceptance Criteria:** Repro steps produce expected result

4. **Present for Review**
   - Show the drafted spec to the user

## Post-Hooks

Check for post-hooks before suggesting next step:
- List files: `ls .speculator/hooks/post-fix/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Suggest Next Step

- "Run `/spec.research` to investigate the root cause."
