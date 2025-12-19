# Feature: Unified Agent Init

## Context & Goal

**Why are we building this?**
The `spec init` command currently only supports Claude Code. We want to extend it to support Cursor (and both agents together), with all agents using the same CLI-based task management workflow.

Both Claude Code and Cursor can execute shell commands. The difference is how we teach them:
- **Claude Code**: Skills (`.claude/skills/`) provide structured guidance
- **Cursor**: Rules with `alwaysApply: true` (`.cursor/rules/`) provide persistent context

**User Story**
As a developer using speculator, I want the `spec init` command to configure my chosen agent(s) with the appropriate files, so that I can use the full CLI-based workflow regardless of which agent I'm using.

## Requirements

### Agent Selection

| Selection | Task Storage | Teaching Mechanism |
|-----------|--------------|-------------------|
| Claude Code | SQLite + CLI | Skill |
| Cursor | SQLite + CLI | Rule (alwaysApply) |
| Both | SQLite + CLI | Skill + Rule |

All agents use the same task management approach. Multi-agent concurrency is always supported.

### Template Architecture

Templates stored once, copied to appropriate targets. Agent differences:
- **Claude Code**: Markdown with YAML frontmatter containing `description`
- **Cursor**: Plain markdown, no frontmatter

#### Template Directory Structure

```
templates/
├── commands/
│   ├── feature.md
│   ├── fix.md
│   ├── research.md
│   ├── plan.md
│   ├── tasks.md
│   ├── implement.md
│   ├── clarify.md
│   └── next.md
├── skills/
│   └── speculator-orchestration/
│       └── SKILL.md
├── rules/
│   ├── speculator.mdc       # Cursor rule (alwaysApply: true)
│   └── CLAUDE.md            # Claude Code memory
└── shared/
    └── speculator/
        ├── features/
        ├── templates/
        └── hooks/
```

### Copy Logic During Init

**Claude Code:**
- Copy `commands/*.md` → `.claude/commands/`
- Add frontmatter to each file during copy
- Copy `skills/speculator-orchestration/` → `.claude/skills/speculator-orchestration/`
- Copy `rules/CLAUDE.md` → `./CLAUDE.md`

**Cursor:**
- Copy `commands/*.md` → `.cursor/commands/`
- No frontmatter needed
- Copy `rules/speculator.mdc` → `.cursor/rules/speculator.mdc`

**Both:**
- Do both of the above

### Frontmatter Injection

When copying to `.claude/commands/`, prepend:
```yaml
---
description: <extracted from H1 of the file>
---
```

### Cursor Rule Content

The `speculator.mdc` rule should:
- Have `alwaysApply: true` in its frontmatter
- Contain the same core principles as `CLAUDE.md`
- Document the `spec` CLI commands for task management
- Instruct the agent to claim tasks before working, complete when done, etc.

### Success Messages

**Claude Code:**
```
✨ Speculator initialized for Claude Code!

Commands added to .claude/commands/
Skill installed to .claude/skills/speculator-orchestration/

Get started by running /spec.new in Claude Code.
```

**Cursor:**
```
✨ Speculator initialized for Cursor!

Commands added to .cursor/commands/
Rule added to .cursor/rules/speculator.mdc

Get started by running /feature in Cursor.
```

**Both:**
```
✨ Speculator initialized for Claude Code and Cursor!

Commands added to .claude/commands/ and .cursor/commands/
Skill installed to .claude/skills/
Rule added to .cursor/rules/

Get started by running /spec.new (Claude Code) or /feature (Cursor).
```

## Acceptance Criteria

- [ ] `spec init` prompts for agent selection (Claude Code, Cursor, Both)
- [ ] `spec init --agent claude-code` works non-interactively
- [ ] `spec init --agent cursor` works non-interactively
- [ ] `spec init --agent both` works non-interactively
- [ ] Claude Code gets commands with frontmatter + skill
- [ ] Cursor gets commands without frontmatter + rule
- [ ] Both agents use the same CLI-based task management
- [ ] Success message reflects the selected configuration

## Out of Scope

- Markdown-based task tracking (removed - all agents use CLI)
- Command variants (removed - single set of commands)
- CLAUDE.md variants (removed - single version)

## Open Questions

*None currently.*

## Constraints

- **Backward compatibility**: `spec init --agent claude-code` must produce the same result as before
