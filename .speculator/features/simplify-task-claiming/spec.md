# Feature: Simplify Task Claiming

## Context & Goal

**Why are we building this?**
The current task claiming mechanism requires agents to provide an agent ID (`-a <agent-id>`) when claiming a task. This is unnecessary friction—the purpose of claiming is to prevent duplicate work by marking a task as "in progress." Who specifically claimed it is irrelevant for coordination; what matters is that it's no longer available for others to pick up.

**User Story**
As an AI agent, I want to claim tasks with a simple `spec task claim <id>` command (no agent ID required), so that I can quickly mark work as in-progress without the overhead of naming myself.

## Requirements

### CLI Changes
- [ ] Make the `--agent` flag optional on `spec task claim`
- [ ] When agent ID is not provided, still mark task as `in_progress`
- [ ] Keep the flag available for cases where tracking the claimant is useful (optional metadata)

### Database/Schema
- [x] The `assigned_to` field already exists and is nullable (no schema changes needed)
- [x] Existing databases remain compatible - no migration required
- [ ] When agent ID not provided, store `null` in `assigned_to`

### Documentation Updates
- [ ] Update skill documentation (`speculator-orchestration`) to reflect simpler claim syntax
- [ ] Update examples showing the new simpler workflow

## Acceptance Criteria

- [ ] `spec task claim <id>` works without any additional flags
- [ ] Task transitions from `todo` to `in_progress` on successful claim
- [ ] Claiming an already in-progress task still fails (prevents duplicate work)
- [ ] Optional `--agent` flag still works for agents that want to self-identify
- [ ] Existing functionality (complete, release, block) remains unchanged

## Out of Scope

- Removing the `assigned_to` column entirely (maintain backward compatibility)
- Changing how other task operations work
- Adding any new task states

## Open Questions

*All resolved.*

## Constraints

- **Backward compatibility required**: No database schema changes. Existing installations must continue to work without migration.
