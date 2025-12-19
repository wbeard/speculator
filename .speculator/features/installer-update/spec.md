# Feature Specification: Installer Update

## Summary

Update the `bin/create.js` installer and skill to use a new `spec` CLI tool for multi-agent task orchestration, replacing the MCP server approach.

## Architecture Change

**Previous approach (removed):**
- MCP server (`speculator-tasks/`) with tools like `get_ready_tasks`, `claim_task`
- Required MCP config in agent settings
- Native SQLite addon with build step

**New approach:**
- Global CLI executable `spec` on PATH
- Same SQLite database (`.speculator/tasks.db`)
- Skill instructs agents to run CLI commands via Bash
- No MCP configuration needed

## Problem

The current installer does not:
- Install the speculator-orchestration skill for Claude Code
- Provide multi-agent orchestration capability

## Requirements

### 1. Create `spec` CLI Tool

A globally-installable CLI that translates MCP tool names to commands:

| MCP Tool (removed) | CLI Command |
|--------------------|-------------|
| `get_ready_tasks` | `spec tasks ready` |
| `claim_task` | `spec task claim <id> --agent <agent-id>` |
| `complete_task` | `spec task complete <id>` |
| `block_task` | `spec task block <id> --reason <reason>` |
| `unblock_task` | `spec task unblock <id>` |
| `release_task` | `spec task release <id>` |
| `add_task` | `spec task add --feature <id> --title <title>` |
| `add_dependency` | `spec task depend <id> --on <other-id>` |
| `get_task` | `spec task show <id>` |
| `create_feature` | `spec feature create <name>` |
| `list_features` | `spec features` |
| `get_feature` | `spec feature show <id>` |
| `import_tasks` | `spec tasks import --feature <id> < tasks.json` |

Database: Same SQLite at `.speculator/tasks.db`

### 2. Update speculator-orchestration Skill

Update skill documentation to reference CLI commands instead of MCP tools:

**Before (MCP):**
```
Use: get_ready_tasks({ feature_id: "feat-123" })
```

**After (CLI):**
```bash
spec tasks ready --feature feat-123
```

### 3. Install Skill (Claude Code only)

When installing for Claude Code, copy the skill from:
```
templates/skills/speculator-orchestration/
```
to:
```
.claude/skills/speculator-orchestration/
```

### 4. Simplified Installation Flow

```
Current flow:
1. Which agent(s)? [Cursor / Claude Code / Both]
2. Include rules files? [Yes / No]

New flow:
1. Which agent(s)? [Cursor / Claude Code / Both]
2. Include rules files? [Yes / No]
3. Include multi-agent orchestration skill? [Yes / No] (Claude only)
```

No MCP config generation needed - agents use Bash to run CLI commands.

### 5. Delete speculator-tasks/

Remove the MCP server implementation entirely.

## Implementation Details

### Template Structure

```
templates/
├── skills/
│   └── speculator-orchestration/     # Move from .claude/skills/, update for CLI
│       ├── SKILL.md
│       ├── workflows/
│       ├── patterns/
│       └── examples/
└── (no mcp-config/ needed)
```

### CLI Package Structure

```
packages/spec-cli/           # or just enhance bin/create.js?
├── package.json
├── bin/spec.js
└── src/
    ├── db.ts                # Reuse from speculator-tasks
    ├── commands/
    │   ├── tasks.ts
    │   ├── task.ts
    │   ├── feature.ts
    │   └── features.ts
    └── index.ts
```

### Installer Changes

- Add prompt for multi-agent skill (Claude only)
- Copy skill to `.claude/skills/` if opted in
- Remove all MCP config logic
- Update success message

## Success Criteria

- [ ] `spec` CLI installed globally and functional
- [ ] Skill documentation uses CLI commands
- [ ] Skill copied correctly for Claude Code
- [ ] Installer works for basic setup (without multi-agent)
- [ ] speculator-tasks/ directory deleted

## Out of Scope

- Windows path handling (assume POSIX for now)
- MCP server (removed entirely)
