# Research: speculator-tasks MCP Server

## Existing Patterns

*How does the codebase currently handle similar functionality?*

- **No existing MCP servers** - This is a new package, not modifying existing code
- **Parent project structure**: `@wbeard/speculator` is an ESM package (`"type": "module"`) with Node.js >=18 requirement
- **Existing CLI pattern**: `bin/create.js` uses ESM imports, prompts, and kleur for CLI
- **Feature artifacts**: Stored in `.speculator/features/<name>/` with markdown files
- **The new MCP server will be a separate npm package** living in `speculator-tasks/` directory

## Dependencies

*What libraries, APIs, or services are involved?*

| Dependency | Version | Purpose |
|------------|---------|---------|
| @modelcontextprotocol/sdk | ^1.x | MCP server framework - tools, resources, stdio transport |
| better-sqlite3 | ^11.x | Synchronous SQLite database operations |
| @types/better-sqlite3 | ^7.6.x | TypeScript definitions for better-sqlite3 |
| zod | ^3.25+ | Schema validation (peer dep of MCP SDK) |
| uuid | ^9.x or ^10.x | Generate UUIDs for feature/task IDs |
| typescript | ^5.x | TypeScript compiler |

## Technical Constraints

### MCP SDK Patterns (from [typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk))

**Server Setup:**
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "speculator-tasks",
  version: "1.0.0",
});

// Register tool with Zod schema
server.tool("tool_name", "Description", z.object({
  param: z.string().describe("Parameter description")
}), async (params) => {
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

// Connect via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Resource Registration:**
```typescript
server.resource("resource_uri", "Description", async () => {
  return { contents: [{ uri: "resource://...", text: "data" }] };
});
```

### better-sqlite3 Patterns (from [better-sqlite3 docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md))

**Database Setup:**
```typescript
import Database from 'better-sqlite3';

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');  // Important for performance
```

**Queries:**
```typescript
// Prepared statements
const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
const task = stmt.get(taskId);  // Single row
const tasks = stmt.all();        // All rows

// Insert/Update
const insert = db.prepare('INSERT INTO tasks (id, title) VALUES (?, ?)');
const info = insert.run(id, title);  // info.changes = rows affected
```

**Atomic Transactions:**
```typescript
const claimTask = db.transaction((taskId, agentId) => {
  const result = db.prepare(`
    UPDATE tasks
    SET status = 'in_progress', assigned_to = ?, started_at = datetime('now')
    WHERE id = ? AND status = 'todo' AND blocked = 0
  `).run(agentId, taskId);

  if (result.changes === 0) {
    return { success: false };
  }

  return { success: true, task: db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) };
});
```

**Critical**: Transactions are synchronous. Do NOT use async functions within `db.transaction()`.

### Circular Dependency Detection

For `add_dependency`, need to check for cycles in the dependency graph:

```typescript
function wouldCreateCycle(taskId: string, dependsOnId: string): boolean {
  // BFS/DFS from dependsOnId to see if we can reach taskId
  const visited = new Set<string>();
  const queue = [dependsOnId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === taskId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    // Get dependencies of current
    const deps = db.prepare(
      'SELECT depends_on_id FROM task_dependencies WHERE task_id = ?'
    ).all(current);

    queue.push(...deps.map(d => d.depends_on_id));
  }

  return false;
}
```

### Package Distribution

For `npx` execution:
- Set `"bin"` field in package.json pointing to compiled JS entry point
- Entry point needs shebang: `#!/usr/bin/env node`
- Build TypeScript to `dist/` directory
- Set `"main"` and `"types"` appropriately

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| better-sqlite3 native compilation issues | Medium | Include prebuild binaries via npm; document Node version requirements |
| MCP SDK API changes | Low | Pin to specific version; SDK is relatively stable |
| Concurrent claim race conditions | Low | SQLite handles this with row-level locking in transactions |
| Large task trees slow `get_feature` | Low | Add LIMIT/pagination if needed; indexes already specified |
| Circular dependency check performance | Low | For typical task counts (<1000), BFS is fast enough |

## Recommendations

1. **Use ESM throughout** - Match parent project's `"type": "module"` pattern
2. **WAL mode for SQLite** - Essential for concurrent read performance
3. **Zod for all tool inputs** - Required by MCP SDK, provides runtime validation
4. **Return JSON strings in tool responses** - MCP tools return text content; serialize complex data as JSON
5. **Use `db.transaction()` for atomic operations** - Especially `claim_task` which must be atomic
6. **Separate package directory** - Create `speculator-tasks/` as standalone npm package
7. **Comprehensive TypeScript types** - Define types.ts with Feature, Task, TaskDependency interfaces
8. **CLI argument parsing** - Use `process.argv[2]` for database path (simple enough to not need a library)

## Sources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [@modelcontextprotocol/sdk on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [better-sqlite3 on GitHub](https://github.com/WiseLibs/better-sqlite3)
- [better-sqlite3 API docs](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [@types/better-sqlite3 on npm](https://www.npmjs.com/package/@types/better-sqlite3)
