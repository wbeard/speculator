# Research

Gather context and validate assumptions before planning.

## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-research/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred from conversation, ask: "Which feature are you researching?"
   - Read `.speculator/features/<feature>/spec.md`

2. **Investigate Codebase**
   - Search for existing patterns related to the feature
   - Check dependencies in package.json (or equivalent)
   - Look up external docs for unfamiliar libraries/APIs
   - Note existing code that needs modification

3. **Document Findings**
   - Create `.speculator/features/<feature>/research.md` using the template from `.speculator/templates/research-brief.md`
   - Fill in:
     - Existing patterns found
     - Dependencies involved
     - Technical constraints
     - Risks and blockers

4. **Summarize**
   - Present key findings to the user
   - Note any blockers that need resolution

## Post-Hooks

Check for post-hooks before suggesting next step:
- List files: `ls .speculator/hooks/post-research/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn and continue

## Suggest Next Step

- "Run `/spec.plan` to create the implementation plan."
