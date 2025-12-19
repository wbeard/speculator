# Implementation Plan: speculator-tasks MCP Server

**Status:** READY

## Open Questions

*None - all requirements are specified in the spec and technical patterns documented in research.*

## Migration & Cleanup

*Not applicable - this is a new standalone package with no existing code to modify.*

## Architecture

The MCP server follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                     MCP Client (Claude/Cursor)                  │
└─────────────────────────────────────────────────────────────────┘
                              │ stdio
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     index.ts (Entry Point)                      │
│  - McpServer setup                                              │
│  - StdioServerTransport                                         │
│  - Database path from argv                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  tools/*.ts     │ │  resources.ts   │ │     db.ts       │
│  - features.ts  │ │  - task://...   │ │  - init schema  │
│  - tasks.ts     │ │    resources    │ │  - getDb()      │
│  - bulk.ts      │ │                 │ │  - queries      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SQLite Database (better-sqlite3)              │
│  - features table                                               │
│  - tasks table                                                  │
│  - task_dependencies table                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Entry Point (index.ts)** - Creates MCP server, registers all tools/resources, connects via stdio transport

2. **Database Layer (db.ts)** - Initializes SQLite with WAL mode, creates schema if not exists, exports `getDb()` singleton

3. **Feature Tools (tools/features.ts)** - `create_feature`, `list_features`, `get_feature` with nested task tree building

4. **Task Tools (tools/tasks.ts)** - Core task operations with atomic `claim_task` via `db.transaction()`

5. **Bulk Tools (tools/bulk.ts)** - `import_tasks` for efficient multi-task creation with index-based references

6. **Resources (resources.ts)** - Read-only MCP resources for `task://features`, `task://feature/{id}`, `task://ready`

7. **Types (types.ts)** - TypeScript interfaces for Feature, Task, TaskDependency, and tool response types

### Concurrency Model

SQLite with WAL mode + `db.transaction()` for atomic operations:
- `claim_task` uses a transaction that checks status and assigns in one atomic operation
- If two agents try to claim the same task, only one succeeds (row-level locking)
- All reads are non-blocking due to WAL mode

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `speculator-tasks/package.json` | npm package manifest with bin entry, dependencies, ESM config |
| `speculator-tasks/tsconfig.json` | TypeScript config targeting ES2022, ESM output |
| `speculator-tasks/src/index.ts` | MCP server entry point with shebang |
| `speculator-tasks/src/db.ts` | Database initialization, schema creation, singleton access |
| `speculator-tasks/src/types.ts` | TypeScript interfaces for all data structures |
| `speculator-tasks/src/tools/features.ts` | Feature management tools (3 tools) |
| `speculator-tasks/src/tools/tasks.ts` | Task management tools (8 tools) |
| `speculator-tasks/src/tools/bulk.ts` | Bulk import tool (1 tool) |
| `speculator-tasks/src/resources.ts` | MCP resource handlers (3 resources) |
| `speculator-tasks/README.md` | Documentation with usage examples |

### Modified Files

*None - this is a new standalone package.*

## Implementation Order

The implementation follows a dependency-driven order:

1. **Phase 1: Project Setup**
   - Create package.json with dependencies and bin entry
   - Create tsconfig.json for ESM TypeScript
   - Create types.ts with all interfaces

2. **Phase 2: Database Layer**
   - Implement db.ts with schema creation
   - Tables: features, tasks, task_dependencies
   - Indexes for performance

3. **Phase 3: Feature Tools**
   - `create_feature` - UUID generation, insert
   - `list_features` - Query with optional status filter, task counts
   - `get_feature` - Build nested task tree via recursive CTE or in-memory

4. **Phase 4: Task Tools**
   - `add_task` - Create task with optional parent_id
   - `add_dependency` - Insert with circular dependency check (BFS)
   - `get_ready_tasks` - Complex query: todo, unblocked, deps complete
   - `claim_task` - Atomic transaction pattern
   - `complete_task`, `block_task`, `unblock_task`, `release_task`, `get_task`

5. **Phase 5: Bulk Operations**
   - `import_tasks` - Parse index-based references, create in transaction

6. **Phase 6: Resources**
   - Register MCP resources using `server.resource()`

7. **Phase 7: Entry Point**
   - Wire everything together in index.ts
   - Add shebang for npx execution

8. **Phase 8: Build & Test**
   - Compile TypeScript
   - Test with Claude Code MCP config

## Testing Strategy

Since this is an MCP server without a traditional test framework:

- [ ] **Manual Integration Testing** - Configure in Claude Code and exercise all tools
- [ ] **Claim Race Test** - Use two parallel agents to verify atomic claiming
- [ ] **Dependency Check** - Create circular dependency and verify rejection
- [ ] **Schema Verification** - Run with fresh DB, verify tables created
- [ ] **Ready Tasks Query** - Create tasks with various states and verify `get_ready_tasks` filtering

## Dependencies to Install

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.12.0",
    "better-sqlite3": "^11.0.0",
    "uuid": "^10.0.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.12",
    "@types/uuid": "^10.0.0",
    "typescript": "^5.7.0"
  }
}
```
