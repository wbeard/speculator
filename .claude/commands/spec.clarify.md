---
description: Update the spec when requirements change, assess downstream impact
---

# Clarify

Update the spec when requirements change, assess downstream impact.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-clarify/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred from conversation, ask: "Which feature needs clarification?"

2. **Gather Changes**
   - Ask: "What needs to be updated or clarified?"
   - Wait for user response

3. **Update Specification**
   - Modify `spec.md` with the changes
   - Track what changed (for impact analysis)

4. **Impact Analysis**
   - **High impact changes** (any of these):
     - Database schema changes
     - New API endpoints
     - Architecture changes
     - Security model changes
   - **Low impact changes** (all of these):
     - Colors, copy, minor UI tweaks
     - Internal implementation details
     - Non-breaking additions

## Post-Hooks

Check for post-hooks before recommending next step:
- List files: `ls .speculator/hooks/post-clarify/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Recommend Next Step

- **High impact:**
  - "Spec updated. This change may invalidate previous research. Run `/spec.research` to re-validate."
- **Low impact:**
  - "Spec updated. Plan is likely still valid. Run `/spec.plan` to refresh if needed."
