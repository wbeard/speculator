# Implementation Plan: speculator-orchestration Skill

**Status:** READY

## Open Questions

*All blocking questions resolved during research phase:*

- ~~Installation location~~ → Project-level `.claude/skills/`
- ~~MCP server reference~~ → Reference by name "speculator-tasks"
- ~~Troubleshooting section~~ → Defer to later iteration

## Migration & Cleanup

*No existing code to remove - this is a new skill.*

- [ ] Create `.claude/skills/` directory (does not exist yet)

## Architecture

A Claude Skill with a focused main file (SKILL.md) and supporting documentation organized into workflows, patterns, and examples. The skill auto-triggers when agents need task coordination guidance.

### Key Components

```
.claude/skills/speculator-orchestration/
├── SKILL.md                          # Entry point: core principle + quick reference
├── workflows/
│   ├── claiming.md                   # 5-step claiming process
│   ├── completing.md                 # Completion criteria + checklist
│   └── blocking.md                   # When/how to block tasks
├── patterns/
│   ├── parallelization.md            # File conflict heuristics
│   └── decomposition.md              # Breaking tasks into subtasks
└── examples/
    └── multi-agent-session.md        # Two-agent coordination scenario
```

### Design Decisions

1. **Progressive disclosure**: SKILL.md is concise (~200 lines), links to detailed docs
2. **No tool restrictions**: Skill needs full tool access for file checking, MCP calls
3. **Trigger-optimized description**: Includes key phrases for automatic discovery
4. **Consistent formatting**: Follows existing slash command patterns (steps, important notes)

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `.claude/skills/speculator-orchestration/SKILL.md` | Main skill file with frontmatter, core principle, quick reference |
| `.claude/skills/speculator-orchestration/workflows/claiming.md` | 5-step process: Survey → Evaluate → Claim → Implement → Handle |
| `.claude/skills/speculator-orchestration/workflows/completing.md` | When IS/IS NOT complete, post-completion checklist |
| `.claude/skills/speculator-orchestration/workflows/blocking.md` | When to block, when NOT to block, good/bad examples |
| `.claude/skills/speculator-orchestration/patterns/parallelization.md` | Safe/caution/serialize categories, conflict heuristics table |
| `.claude/skills/speculator-orchestration/patterns/decomposition.md` | When to decompose, Component/Feature/Fix patterns |
| `.claude/skills/speculator-orchestration/examples/multi-agent-session.md` | Agent A + B concurrent scenario |

### Modified Files

*None - all new files.*

## Content Source

The user provided complete content for all files in the original `/spec.new` request. Implementation will use that content directly, with minor formatting adjustments to match Claude Skill conventions.

### SKILL.md Structure

```markdown
---
name: speculator-orchestration
description: Multi-agent task orchestration using speculator-tasks MCP server.
  Guides agents on claiming tasks, parallel execution, blocking, and coordination.
  Use when working with multiple agents, claiming tasks, or managing parallel work.
---

# Speculator Orchestration

## Core Principle
**Claim before you code.**

## Quick Reference
- get_ready_tasks → find available work
- claim_task → atomically claim
- complete_task → mark done
- block_task → record blocker

## Workflows
[Links to workflow files]

## Patterns
[Links to pattern files]
```

### Key Content Highlights

| File | Key Content |
|------|-------------|
| `claiming.md` | Survey → Evaluate conflicts → Claim → Implement → Handle outcomes |
| `completing.md` | IS complete vs IS NOT complete criteria, post-completion steps |
| `blocking.md` | External/requirement/technical blockers, good/bad reason examples |
| `parallelization.md` | File conflict heuristics table, conflict handling |
| `decomposition.md` | >30min threshold, Component/Feature/Fix patterns, anti-patterns |
| `multi-agent-session.md` | Agent A/B scenario with concurrent claiming, blocking, dependencies |

## Testing Strategy

- [ ] **Discovery test**: Start new Claude session, ask about multi-agent coordination, verify skill triggers
- [ ] **Reference accuracy**: Verify all MCP tool names and parameters match speculator-tasks implementation
- [ ] **Link validation**: Verify all relative links in SKILL.md resolve correctly
- [ ] **Workflow completeness**: Walk through each workflow with real MCP tools
- [ ] **Pattern applicability**: Verify parallelization heuristics match real codebase scenarios
