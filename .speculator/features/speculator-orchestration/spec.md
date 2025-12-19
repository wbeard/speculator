# Feature: speculator-orchestration Skill

## Context & Goal

**Why are we building this?**
Even with the speculator-tasks MCP server providing task primitives (claim, complete, block), agents need guidance on how to use these tools effectively in a multi-agent context. This skill bridges the gap between having task coordination tools and knowing how to use them well.

**User Story**
As an AI agent working in a multi-agent system, I want clear guidance on task orchestration workflows, so that I can coordinate work with other agents without conflicts or duplicate effort.

## Requirements

### Core Skill File
- [ ] Create SKILL.md with frontmatter (name, description)
- [ ] Document the "claim before you code" principle
- [ ] Provide quick reference for all MCP tools (get_ready_tasks, claim_task, complete_task, block_task)
- [ ] Link to detailed workflow and pattern documents

### Workflow Documentation
- [ ] `workflows/claiming.md` - Step-by-step claiming process
- [ ] `workflows/completing.md` - When and how to complete tasks
- [ ] `workflows/blocking.md` - When to block vs. other options

### Pattern Documentation
- [ ] `patterns/parallelization.md` - File conflict heuristics, when to parallelize
- [ ] `patterns/decomposition.md` - Breaking large tasks into subtasks

### Examples
- [ ] `examples/multi-agent-session.md` - Realistic coordination scenario showing two agents working concurrently

## Skill Structure

```
speculator-orchestration/
├── SKILL.md              # Main skill file with instructions
├── workflows/
│   ├── claiming.md       # How to find and claim work
│   ├── completing.md     # How to mark work done
│   └── blocking.md       # When and how to block tasks
├── patterns/
│   ├── parallelization.md    # When work can be parallel
│   └── decomposition.md      # Breaking tasks into subtasks
└── examples/
    └── multi-agent-session.md  # Example coordination scenario
```

## Acceptance Criteria

- [ ] SKILL.md properly triggers when agents need task coordination guidance
- [ ] Workflows provide clear, actionable steps
- [ ] Parallelization guidance helps agents avoid file conflicts
- [ ] Decomposition patterns are practical and reusable
- [ ] Example demonstrates realistic multi-agent interaction
- [ ] All MCP tools are documented with usage examples

## Out of Scope

- Modifying the speculator-tasks MCP server itself
- Automated conflict resolution (skill provides guidance, not automation)
- Integration with specific version control workflows
- Performance monitoring or metrics collection

## Open Questions

- Where should the skill be installed? (user's `.claude/skills/` vs. project-level)
- Should the skill reference the speculator-tasks MCP server by name, or be more generic?
- Should we include a "troubleshooting" section for common issues?

## Content Summary

The user provided detailed content for each file:

### SKILL.md
- Core principle: "Claim before you code"
- Quick reference for MCP tools
- Links to workflows and patterns
- Parallelization and decomposition guidance

### workflows/claiming.md
- 5-step process: Survey -> Evaluate -> Claim -> Implement -> Handle Outcomes
- Conflict detection heuristics

### workflows/completing.md
- Clear criteria for when a task IS and IS NOT complete
- Post-completion checklist

### workflows/blocking.md
- When to block (external, requirement, technical blockers)
- When NOT to block (difficulty, uncertainty, time)
- Good vs. bad block reason examples

### patterns/parallelization.md
- Safe vs. caution vs. always-serialize categories
- File conflict heuristics table
- Conflict handling guidance

### patterns/decomposition.md
- When to decompose (>30 min, multiple files, natural subtasks)
- Component, Feature, and Fix patterns
- Warning against over-decomposition

### examples/multi-agent-session.md
- Two-agent scenario with concurrent work
- Demonstrates claiming, blocking, unblocking, dependency creation
