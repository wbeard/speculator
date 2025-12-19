# Flag Technical Debt

This hook runs after `/spec.plan` completes. Review the implementation plan for intentional technical debt that should be tracked.

## Indicators of Tech Debt

Scan the plan for these patterns:

- **Temporary language** - "for now", "temporarily", "later", "eventually"
- **Workarounds** - "workaround", "hack", "shortcut"
- **Deferred quality** - "skip tests", "no validation", "hardcoded"
- **Known limitations** - "doesn't handle", "won't support", "out of scope"
- **Future work markers** - "TODO", "FIXME", "revisit"

## If Debt Found

1. Create the backlog directory if needed:
   ```bash
   mkdir -p .speculator/backlog
   ```

2. Append to `.speculator/backlog/tech-debt.md`:

```markdown
## <Today's Date> - <Feature Name>

### <Debt Item Title>

- **What:** <Specific description of the shortcut or limitation>
- **Why deferred:** <Reason for not doing it properly now>
- **Impact:** low | medium | high
- **Suggested resolution:** <How to fix this properly later>
```

3. Report each item found: "Flagged tech debt: <title>"

## Impact Guidelines

- **Low** - Cosmetic issues, minor code smells, "nice to have" improvements
- **Medium** - Missing edge case handling, incomplete validation, test gaps
- **High** - Security shortcuts, data integrity risks, scalability blockers

## If No Debt Found

If the plan doesn't contain intentional shortcuts, no action needed. Don't create an empty file or report anything.
