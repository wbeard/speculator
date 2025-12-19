# Active Tasks: speculator-tasks MCP Server

## Phase 1: Project Setup

- [x] Create `speculator-tasks/` directory structure
- [x] Create `package.json` with ESM config, bin entry, and dependencies
- [x] Create `tsconfig.json` for ES2022/ESM output
- [x] Create `src/types.ts` with Feature, Task, TaskDependency interfaces

## Phase 2: Database Layer

- [x] Create `src/db.ts` with schema initialization
  - features table (id, name, description, status, timestamps)
  - tasks table (id, feature_id, parent_id, title, description, status, blocked, blocked_reason, assigned_to, timestamps)
  - task_dependencies table (task_id, depends_on_id)
  - Indexes on feature_id, parent_id, status, blocked
- [x] Implement `getDb()` singleton with WAL mode

## Phase 3: Feature Tools

- [x] Create `src/tools/features.ts`
- [x] Implement `create_feature` tool (UUID generation, insert)
- [x] Implement `list_features` tool (status filter, task counts)
- [x] Implement `get_feature` tool (nested task tree building)

## Phase 4: Task Tools

- [x] Create `src/tools/tasks.ts`
- [x] Implement `add_task` tool (create task/subtask)
- [x] Implement `add_dependency` tool (with circular dependency detection via BFS)
- [x] Implement `get_ready_tasks` tool (todo + unblocked + deps complete)
- [x] Implement `claim_task` tool (atomic transaction)
- [x] Implement `complete_task` tool
- [x] Implement `block_task` tool (with reason)
- [x] Implement `unblock_task` tool
- [x] Implement `release_task` tool (return to todo)
- [x] Implement `get_task` tool (full details with dependencies)

## Phase 5: Bulk Operations

- [x] Create `src/tools/bulk.ts`
- [x] Implement `import_tasks` tool (index-based parent/dependency references)

## Phase 6: MCP Resources

- [x] Create `src/resources.ts`
- [x] Implement `task://features` resource (list active features)
- [x] Implement `task://feature/{id}` resource (feature with task tree)
- [x] Implement `task://ready` resource (all ready tasks)

## Phase 7: Entry Point

- [x] Create `src/index.ts` with shebang
- [x] Initialize McpServer with name and version
- [x] Register all tools from features.ts, tasks.ts, bulk.ts
- [x] Register all resources from resources.ts
- [x] Connect via StdioServerTransport
- [x] Parse database path from process.argv[2]

## Phase 8: Build & Test

- [x] Install dependencies with `npm install`
- [x] Build TypeScript with `npm run build`
- [x] Test server starts with `npx . test.db`
- [ ] Configure in Claude Code and test tools manually
