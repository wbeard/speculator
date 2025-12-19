# Create ADR if Needed

This hook runs after `/spec.plan` completes. Evaluate whether the implementation plan involves architectural decisions that should be documented.

## When to Create an ADR

Review the plan just created. Create an ADR if the plan involves ANY of these:

- **New external dependencies** - Adding libraries, services, or APIs
- **Database schema changes** - New tables, columns, or relationships
- **Integration patterns** - How systems communicate (REST, GraphQL, events, etc.)
- **Security decisions** - Authentication, authorization, data protection
- **Performance trade-offs** - Caching strategies, optimization choices
- **Technology selection** - Choosing between alternatives (e.g., Redis vs Memcached)

## If ADR is Needed

1. Check for existing ADRs to determine the next number:
   ```bash
   ls .speculator/adrs/*.md 2>/dev/null | wc -l
   ```

2. Create the ADR directory if it doesn't exist:
   ```bash
   mkdir -p .speculator/adrs
   ```

3. Create `.speculator/adrs/NNNN-<decision-title>.md` using this template:

```markdown
# NNNN: <Decision Title>

## Status

Proposed

## Context

<What situation prompted this decision? What problem are we solving?>

## Decision

<What is the change being proposed? Be specific about the approach chosen.>

## Alternatives Considered

<What other options were evaluated? Why were they rejected?>

## Consequences

<What are the trade-offs? Include both benefits and drawbacks.>

---
*Created: <today's date>*
*Feature: <current feature name>*
```

4. Fill in Context and Decision based on the plan content.

5. Report: "Created ADR NNNN: <title>"

## If No ADR Needed

If the plan doesn't involve architectural decisions, simply note:

"No architectural decisions requiring documentation."
