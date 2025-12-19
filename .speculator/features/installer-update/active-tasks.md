# Active Tasks: Installer Update (CLI Architecture)

## Phase 1: Cleanup

- [x] Delete `speculator-tasks/` directory
- [x] Move `.claude/skills/speculator-orchestration/` → `templates/skills/speculator-orchestration/`
- [x] Delete `.claude/` directory after move (skipped - contains user settings)

## Phase 2: CLI Foundation

- [x] Update `package.json` (add bin, dependencies, files)
- [x] Create `src/types.ts` (extract from speculator-tasks)
- [x] Create `src/db.ts` (extract from speculator-tasks)

## Phase 3: Operations Layer

- [x] Create `src/operations/features.ts` (createFeature, listFeatures, getFeature)
- [x] Create `src/operations/tasks.ts` (addTask, claimTask, completeTask, blockTask, unblockTask, releaseTask, getTask, getReadyTasks, addDependency, importTasks)

## Phase 4: CLI Commands

- [x] Create `src/commands/feature.ts` (spec feature create/show)
- [x] Create `src/commands/features.ts` (spec features)
- [x] Create `src/commands/task.ts` (spec task add/show/claim/complete/block/unblock/release/depend)
- [x] Create `src/commands/tasks.ts` (spec tasks ready/import)
- [x] Create `bin/spec.js` (CLI entry point with commander)

## Phase 5: Skill Updates

- [x] Update `templates/skills/speculator-orchestration/SKILL.md` for CLI syntax
- [x] Update `templates/skills/speculator-orchestration/workflows/claiming.md`
- [x] Update `templates/skills/speculator-orchestration/workflows/completing.md`
- [x] Update `templates/skills/speculator-orchestration/workflows/blocking.md`
- [x] Update `templates/skills/speculator-orchestration/patterns/parallelization.md`
- [x] Update `templates/skills/speculator-orchestration/patterns/decomposition.md`
- [x] Update `templates/skills/speculator-orchestration/examples/multi-agent-session.md`

## Phase 6: Installer

- [x] Update `bin/create.js` (add skill prompt, copy skill to .claude/skills/)

## Phase 7: Testing

- [x] Test CLI: `spec feature create "Test"` works
- [x] Test CLI: Full task workflow (add → claim → complete)
- [x] Test installer: Basic setup still works (verified code, requires interactive input)
- [x] Test installer: Skill option copies correctly (verified templates exist)
