# Research: Unified Agent Init

## Current State

### Init Command (`src/commands/init.js`)

The init command already supports both agents:
- `--agent claude-code` or `--agent cursor` (non-interactive)
- Interactive prompt if no agent specified
- `--rules` flag to optionally install CLAUDE.md or cursor rule

Current behavior:

| Agent | Commands | Skill | Rule | CLAUDE.md |
|-------|----------|-------|------|-----------|
| claude-code | `.claude/commands/` (with frontmatter) | Yes | No | With `--rules` |
| cursor | `.cursor/commands/` (no frontmatter) | No | With `--rules` | No |

### Template Utilities (`src/utils/templates.js`)

- `installCommands(destDir, addFrontmatter)` - handles frontmatter injection
- Uses `meta.json` for command descriptions
- `copyDir()`, `copyFile()` - simple file operations

### Template Structure

```
templates/
├── commands/           # Shared command files
│   ├── meta.json       # Descriptions for frontmatter
│   ├── spec.new.md
│   ├── spec.fix.md
│   ├── spec.research.md
│   ├── spec.plan.md
│   ├── spec.tasks.md
│   ├── spec.implement.md
│   ├── spec.clarify.md
│   └── spec.next.md
├── skills/
│   └── speculator-orchestration/   # Claude Code skill
├── cursor/
│   └── rules/
│       └── speculator.mdc          # Already exists with alwaysApply: true
└── claude-code/
    └── CLAUDE.md
```

### Gap Analysis

**Cursor rule (`speculator.mdc`) is missing CLI instructions.**

The current rule only has workflow commands (`/spec.new`, etc.) but no guidance on:
- Using `spec` CLI for task management
- Claiming tasks before working
- The orchestration loop

Claude Code gets this via the `speculator-orchestration` skill. Cursor needs the same information embedded in the rule.

## Required Changes

### 1. Add "Both" Agent Option

The init command needs a third option:
- `--agent both` (non-interactive)
- "Both" choice in interactive prompt

### 2. Update Cursor Rule with CLI Instructions

The `speculator.mdc` file needs to include:
- Task management CLI commands (`spec task claim`, etc.)
- The orchestration loop
- "Claim before you code" principle

### 3. Update Success Messages

Display agent-specific success message showing what was installed.

### 4. Remove `--rules` Flag Complexity

Currently `--rules` is optional for both. Simplify:
- Claude Code: Always install CLAUDE.md
- Cursor: Always install rule
- No more `--rules` flag needed

## Technical Notes

### Frontmatter Injection

Already works via `installCommands()`:
```javascript
if (addFrontmatter) {
  content = `---\ndescription: ${description}\n---\n\n${content}`;
}
```

### Cursor Rule Frontmatter

The `.mdc` format uses:
```yaml
---
description: Speculator - spec-driven development workflow
globs: "**/*"
alwaysApply: true
---
```

### No Schema Changes

SQLite schema unchanged. All agents use the same CLI.

## Risks

| Risk | Mitigation |
|------|------------|
| Cursor agent ignores CLI instructions | Start with `alwaysApply: true`; iterate on rule wording if needed |
| Rule becomes too long | Keep focused on essentials; reference external docs if needed |
| Breaking existing Claude Code users | Preserve current behavior for `--agent claude-code` |

## Summary

The change is straightforward:
1. Add "both" option to agent selection
2. Enhance cursor rule with CLI instructions
3. Simplify by always installing rules/CLAUDE.md
4. Update success messages
