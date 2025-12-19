---
description: Start a new feature workspace and draft requirements
---

# Feature Specification

Start a new feature workspace and draft requirements.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-new/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - Ask: "What feature would you like to build?"
   - Wait for user response

2. **Create Workspace**
   - Generate a kebab-case slug from the feature description
   - Create directory: `.speculator/features/<slug>/`

3. **Draft Specification**
   - Create `spec.md` using the template from `.speculator/templates/feature-spec.md`
   - Fill in what's known from the user's description
   - Mark unknowns as TBD

4. **Present for Review**
   - Show the drafted spec to the user
   - Ask for feedback or corrections

## Post-Hooks

Check for post-hooks before suggesting next step:
- List files: `ls .speculator/hooks/post-new/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Suggest Next Step

- "Run `/spec.research` to gather context, or `/spec.clarify` if the spec needs changes."
