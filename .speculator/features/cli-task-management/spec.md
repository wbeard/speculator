# Feature: CLI Task Management

## Context & Goal

**Why are we building this?**
Currently, `/spec.tasks` writes tasks to a markdown file (`active-tasks.md`) and `/spec.implement` reads/updates that file. This works for single-agent use, but prevents multi-agent coordination since markdown files can't provide atomic operations. The multi-agent orchestration skill already documents the ideal workflow using CLI commands (`spec task claim`, `spec task complete`, etc.), but this isn't the default behavior.

By making CLI task management the default, we get:
1. **Atomic operations** - SQLite transactions guarantee fresh data on every query
2. **Centralized state** - SQLite database is the source of truth
3. **Consistent workflow** - Same commands work for single and multi-agent scenarios
4. **Status visibility** - `spec tasks ready` shows exactly what's available

**User Story**
As a developer using Speculator, I want `/spec.tasks` and `/spec.implement` to use CLI commands for task management, so that my workflow supports both single-agent and multi-agent scenarios without changing behavior.

## Requirements

- [ ] Update `/spec.tasks` to create tasks via `spec task add` instead of writing markdown
- [ ] Update `/spec.implement` to use `spec tasks ready`, `spec task claim`, `spec task complete`, `spec task block` instead of reading/updating markdown
- [ ] Auto-generate agent ID for claiming tasks (e.g., `agent-$(uuidgen | cut -c1-8)`)
- [ ] Feature discovery: detect from context or ask user which feature they're working on
- [ ] Support task dependencies via `spec task depend`
- [ ] Preserve destruction-first ordering logic in task creation
- [ ] Remove `active-tasks.md` support entirely - no reading, writing, or fallback
- [ ] Update `--feature` flag to accept feature name (not UUID) across all commands

## Acceptance Criteria

- [ ] `/spec.tasks` creates tasks in the database via CLI commands
- [ ] `/spec.implement` claims tasks atomically before working on them
- [ ] `/spec.implement` marks tasks complete via CLI after finishing
- [ ] `/spec.implement` handles blockers via `spec task block`
- [ ] Single-agent workflow feels unchanged from user perspective
- [ ] Multi-agent workflows work out of the box (agents don't duplicate work)
- [ ] Feature-task relationship is maintained (tasks belong to features)
- [ ] `spec tasks ready --feature <name>` shows correct available tasks (using feature name, not UUID)
- [ ] No references to `active-tasks.md` remain in slash commands

## Out of Scope

- Changing the database schema (existing task/feature tables are sufficient)
- Adding new CLI commands (existing commands cover all needs)
- Changing the research/plan workflow (only tasks and implement affected)
- UI/visualization of task status (use existing `spec feature show`)

## Open Questions

None - all questions resolved.

## Decisions Made

1. **Agent IDs**: Auto-generate session ID (e.g., `agent-abc12345`) - no explicit flag needed
2. **Feature discovery**: Detect from context or ask user - no persistent context file
3. **active-tasks.md**: Remove entirely - SQLite is the only source of truth
4. **Data freshness**: Rely on SQLite's transactional guarantees - queries always return current state
5. **Feature identification**: Use feature name (unique slug) instead of UUID for `--feature` flag - easier for LLM to reference and faster to type
