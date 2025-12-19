# Active Tasks: speculator-orchestration Skill

## Phase 1: Setup

- [x] Create `.claude/skills/speculator-orchestration/` directory structure
- [x] Create `workflows/`, `patterns/`, `examples/` subdirectories

## Phase 2: Core Skill File

- [x] Create `SKILL.md` with frontmatter (name, description)
- [x] Add core principle section ("Claim before you code")
- [x] Add quick reference for MCP tools (get_ready_tasks, claim_task, complete_task, block_task, etc.)
- [x] Add links to workflow and pattern documents

## Phase 3: Workflow Documentation

- [x] Create `workflows/claiming.md`
  - 5-step process: Survey → Evaluate → Claim → Implement → Handle
  - File conflict heuristics
- [x] Create `workflows/completing.md`
  - When IS complete vs IS NOT complete
  - Post-completion checklist
- [x] Create `workflows/blocking.md`
  - When to block (external, requirement, technical)
  - When NOT to block
  - Good vs bad block reason examples

## Phase 4: Pattern Documentation

- [x] Create `patterns/parallelization.md`
  - Safe/caution/serialize categories
  - File conflict heuristics table
  - Conflict handling guidance
- [x] Create `patterns/decomposition.md`
  - When to decompose (>30 min, multiple files)
  - Component/Feature/Fix patterns
  - Anti-patterns (over-decomposition)

## Phase 5: Examples

- [x] Create `examples/multi-agent-session.md`
  - Agent A + Agent B concurrent scenario
  - Demonstrates claiming, blocking, unblocking, dependency creation

## Phase 6: Validation

- [x] Verify all relative links in SKILL.md resolve correctly
- [x] Verify MCP tool names match speculator-tasks implementation
- [ ] Test skill discovery in new Claude session
