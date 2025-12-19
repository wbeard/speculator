# Feature: speculator-tasks MCP Server

## Context & Goal

**Why are we building this?**
When multiple AI agents work on the same codebase, they need coordination to avoid duplicating work. Markdown-based task files lack transactional guarantees, causing race conditions where agents read stale state. This MCP server provides SQLite-backed task orchestration with atomic operations for safe concurrent access.

**User Story**
As an AI agent working in a multi-agent environment, I want to claim tasks atomically and track dependencies, so that I can work in parallel with other agents without duplicating effort or stepping on their work.

## Requirements

### Core Infrastructure
- [ ] Node.js/TypeScript MCP server using @modelcontextprotocol/sdk
- [ ] SQLite database (better-sqlite3) at configurable path
- [ ] Auto-create database with schema if not exists
- [ ] Run as local subprocess via stdio transport

### Database Schema
- [ ] `features` table: id, name, description, status (active/completed/archived), timestamps
- [ ] `tasks` table: id, feature_id, parent_id, title, description, status (todo/in_progress/done), blocked flag, blocked_reason, assigned_to, timestamps
- [ ] `task_dependencies` table: task_id, depends_on_id (composite PK)
- [ ] Appropriate indexes for performance

### Feature Management Tools
- [ ] `create_feature` - Create new feature with UUID
- [ ] `list_features` - List features with optional status filter and task counts
- [ ] `get_feature` - Get feature details with nested task tree

### Task Management Tools
- [ ] `add_task` - Create task or subtask
- [ ] `add_dependency` - Create dependency with circular dependency detection
- [ ] `get_ready_tasks` - Find tasks ready for work (todo, unblocked, dependencies complete)
- [ ] `claim_task` - Atomically claim task for an agent
- [ ] `complete_task` - Mark task done
- [ ] `block_task` - Block task with reason
- [ ] `unblock_task` - Remove block
- [ ] `release_task` - Return in_progress task to todo
- [ ] `get_task` - Get full task details

### Bulk Operations
- [ ] `import_tasks` - Bulk create tasks with index-based parent/dependency references

### MCP Resources
- [ ] `task://features` - List active features
- [ ] `task://feature/{id}` - Feature detail with task tree
- [ ] `task://ready` - All ready tasks

### Distribution
- [ ] npm package installable globally or via npx
- [ ] Works with Claude Code and Cursor MCP configurations

## Acceptance Criteria

- [ ] MCP server starts and creates database if not exists
- [ ] All tools execute correctly with valid inputs
- [ ] `claim_task` is atomic - concurrent claims result in only one success
- [ ] `get_ready_tasks` correctly filters by dependencies and blocked status
- [ ] Circular dependency detection works in `add_dependency`
- [ ] Server works with both Claude Code and Cursor

## Out of Scope

- Web UI for task management
- Remote/network server deployment (stdio only)
- Task priorities or ordering beyond dependencies
- User authentication or permissions
- Task history/audit log

## Open Questions

- None - requirements are fully specified

## Technical Specification

### Package Structure

```
speculator-tasks/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── db.ts             # Database setup and migrations
│   ├── tools/
│   │   ├── features.ts   # Feature management tools
│   │   ├── tasks.ts      # Task management tools
│   │   └── bulk.ts       # Bulk operations
│   ├── resources.ts      # MCP resource handlers
│   └── types.ts          # TypeScript types
└── README.md
```

### Usage

```bash
npx speculator-tasks .speculator/tasks.db
```

### Claude Code Configuration

```json
{
  "mcpServers": {
    "speculator-tasks": {
      "command": "npx",
      "args": ["speculator-tasks", ".speculator/tasks.db"]
    }
  }
}
```
