# Implementation Plan: Unified Agent Init

## Architecture Overview

This feature extends `spec init` to support Cursor with full CLI-based task management, matching Claude Code's capabilities. The key insight is that both agents can use the same workflow—only the "teaching mechanism" differs (skill vs. rule).

```
┌─────────────────────────────────────────────────────────────┐
│                      spec init                               │
├─────────────────────────────────────────────────────────────┤
│  Agent Selection: claude-code | cursor | both                │
├──────────────────┬──────────────────┬───────────────────────┤
│   Claude Code    │      Cursor      │        Both           │
├──────────────────┼──────────────────┼───────────────────────┤
│ .claude/commands │ .cursor/commands │ Both command dirs     │
│ + frontmatter    │ - frontmatter    │                       │
├──────────────────┼──────────────────┼───────────────────────┤
│ .claude/skills/  │ .cursor/rules/   │ Skill + Rule          │
│ orchestration    │ speculator.mdc   │                       │
├──────────────────┼──────────────────┼───────────────────────┤
│ CLAUDE.md        │       —          │ CLAUDE.md             │
└──────────────────┴──────────────────┴───────────────────────┘
```

## File Changes

### Modified Files

| File | Change |
|------|--------|
| `src/commands/init.js` | Add "both" option, remove `--rules` flag, always install rules, update success messages |
| `templates/cursor/rules/speculator.mdc` | Add CLI task management instructions |

### No New Files

All required template files already exist.

## Detailed Changes

### 1. Update `src/commands/init.js`

**Agent validation:**
```javascript
// Before
if (agent && !['claude-code', 'cursor'].includes(agent)) {

// After
if (agent && !['claude-code', 'cursor', 'both'].includes(agent)) {
```

**Interactive prompt:**
```javascript
choices: [
  { title: 'Claude Code', value: 'claude-code' },
  { title: 'Cursor', value: 'cursor' },
  { title: 'Both', value: 'both' }
],
```

**Install logic:**
```javascript
const installClaude = agent === 'claude-code' || agent === 'both';
const installCursor = agent === 'cursor' || agent === 'both';

// Remove includeRules check - always install
```

**Always install rules:**
- Claude Code: Always copy `CLAUDE.md` (remove `--rules` condition)
- Cursor: Always copy `speculator.mdc` (remove `--rules` condition)

**Update success messages:**
- Show agent-specific message based on what was installed

### 2. Enhance `templates/cursor/rules/speculator.mdc`

Add a "Task Management" section with CLI instructions:

```markdown
## Task Management

Tasks are stored in `.speculator/tasks.db` and managed via the `spec` CLI.

### Core Principle

**Claim before you code.** Never start work on a task without claiming it first.

### Commands

| Command | Purpose |
|---------|---------|
| `spec tasks ready --feature <name>` | Find available tasks |
| `spec task claim <id>` | Claim a task (marks as in_progress) |
| `spec task complete <id>` | Mark a task as done |
| `spec task block <id> --reason "<reason>"` | Record a blocker |
| `spec task release <id>` | Return a task to the pool |

### The Loop

1. `spec tasks ready` → find available work
2. `spec task claim <id>` → claim it
3. Implement → do the work
4. `spec task complete <id>` → mark done
5. Repeat
```

### 3. Remove `--rules` Flag

- Remove the `--rules` option from command definition
- Remove all `includeRules` conditional logic
- Always install CLAUDE.md for Claude Code
- Always install rule for Cursor

## Testing Strategy

### Manual Testing

1. **Claude Code only:**
   ```bash
   rm -rf .claude .speculator CLAUDE.md
   ./bin/spec.js init --agent claude-code
   ```
   Verify: `.claude/commands/`, `.claude/skills/`, `CLAUDE.md`

2. **Cursor only:**
   ```bash
   rm -rf .cursor .speculator
   ./bin/spec.js init --agent cursor
   ```
   Verify: `.cursor/commands/`, `.cursor/rules/speculator.mdc`

3. **Both:**
   ```bash
   rm -rf .claude .cursor .speculator CLAUDE.md
   ./bin/spec.js init --agent both
   ```
   Verify: All of the above

4. **Interactive mode:**
   ```bash
   rm -rf .claude .cursor .speculator CLAUDE.md
   ./bin/spec.js init
   ```
   Verify: Prompt shows three options, selection works

## Migration & Cleanup

**Remove `--rules` flag:**
- Delete option definition
- Remove `includeRules` variable
- Remove conditional checks around rule installation

This is a breaking change for anyone using `--rules`, but since rules are now always installed, the flag is redundant.

## Success Criteria

- [ ] `spec init --agent claude-code` works (backward compatible)
- [ ] `spec init --agent cursor` installs rule with CLI instructions
- [ ] `spec init --agent both` installs everything
- [ ] Interactive prompt shows all three options
- [ ] `--rules` flag is removed
- [ ] Success messages are agent-specific
