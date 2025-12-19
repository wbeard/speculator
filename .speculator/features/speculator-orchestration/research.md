# Research: speculator-orchestration Skill

## Existing Patterns

### Claude Skills Structure (from official docs)

Skills are stored as directories with a required `SKILL.md` file:

```
.claude/skills/skill-name/
├── SKILL.md              # Required - main skill file with frontmatter
├── reference.md          # Optional - additional documentation
├── examples.md           # Optional - usage examples
└── scripts/              # Optional - utility scripts
```

**Frontmatter format:**
```yaml
---
name: skill-name          # Required, lowercase + hyphens, max 64 chars
description: Brief...     # Required, max 1024 chars - WHAT it does + WHEN to use
allowed-tools: Read, Grep # Optional - restrict tool access
---
```

**Key insight:** The `description` field is critical for skill discovery. Claude uses it to decide when to invoke the skill. Must include both WHAT and WHEN.

### Skills vs. Slash Commands

| Aspect | Slash Commands | Skills |
|--------|---------------|--------|
| Invocation | Explicit `/command` | Automatic (context-based) |
| Structure | Single .md file | Directory with SKILL.md |
| Complexity | Simple prompts | Complex workflows |
| Location | `.claude/commands/` | `.claude/skills/` |

The existing speculator project uses **slash commands** in `.claude/commands/` for the RPI workflow (`/spec.new`, `/spec.plan`, etc.). The orchestration skill should be a **skill** (auto-triggered) rather than a command.

### Existing Command Patterns

The existing slash commands follow a consistent pattern:
- YAML frontmatter with `description`
- Clear step-by-step instructions
- Stop conditions and important notes

Example from `spec.implement.md`:
```markdown
---
description: Execute tasks in a recursive loop
---

# Implementation

## Steps
1. **Identify Feature** ...
2. **Execution Loop** ...
3. **Stop Conditions** ...

## Important
- Do NOT stop between tasks unless blocked
```

## Dependencies

### speculator-tasks MCP Server Tools

The skill needs to document these MCP tools accurately:

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `create_feature` | Create a new feature | `name`, `description?` |
| `list_features` | List features with task counts | `status?` (active/completed/archived) |
| `get_feature` | Get feature with nested task tree | `feature_id` |
| `add_task` | Create task or subtask | `feature_id`, `title`, `description?`, `parent_id?` |
| `add_dependency` | Add task dependency | `task_id`, `depends_on_id` |
| `get_ready_tasks` | Find claimable tasks | `feature_id?` |
| `claim_task` | Atomically claim a task | `task_id`, `agent_id` |
| `complete_task` | Mark task done | `task_id` |
| `block_task` | Block with reason | `task_id`, `reason` |
| `unblock_task` | Remove block | `task_id` |
| `release_task` | Return to todo | `task_id` |
| `get_task` | Get task with dependencies | `task_id` |
| `import_tasks` | Bulk create tasks | `feature_id`, `tasks[]` |

### MCP Resources

| Resource | Purpose |
|----------|---------|
| `task://features` | List active features with counts |
| `task://feature/{id}` | Feature detail with task tree |
| `task://ready` | All ready tasks across features |

## Technical Constraints

1. **Skill file location:** Must be `.claude/skills/speculator-orchestration/SKILL.md`

2. **Description specificity:** Must explicitly mention "multi-agent", "task orchestration", "claiming tasks", "parallel execution" for proper discovery

3. **Supporting file references:** Use relative paths from SKILL.md
   - `See [workflows/claiming.md](workflows/claiming.md)`

4. **No tool restrictions needed:** The skill should have access to all tools since it may need to read code, check file states, etc.

5. **Progressive disclosure:** Claude reads supporting files only when needed. SKILL.md should contain the core workflow, with detailed patterns in separate files.

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Skill not triggering automatically | Medium | Write very specific description with trigger words |
| Conflicting with existing RPI commands | Low | Skill complements commands, doesn't replace them |
| Content too long for context | Low | Keep SKILL.md concise, use supporting files |
| MCP server name changes | Low | Reference tools generically where possible |

## Recommendations

1. **Use Skills, not Commands:** The orchestration guidance should auto-trigger when agents are coordinating, not require explicit invocation.

2. **Project-level installation:** Place in `.claude/skills/` (not user-level) so it's version-controlled with the codebase.

3. **Keep SKILL.md focused:** Core principle + quick reference only. Put detailed workflows/patterns in supporting files.

4. **Specific description:** Include these trigger phrases:
   - "multi-agent task orchestration"
   - "speculator-tasks MCP server"
   - "claiming tasks"
   - "parallel agent coordination"
   - "task dependencies"

5. **Match existing patterns:** Follow the concise, step-based format used in existing slash commands.

## Answers to Open Questions

1. **Installation location:** Project-level `.claude/skills/speculator-orchestration/` - this is part of the speculator system and should be versioned with it.

2. **MCP server reference:** Reference by name ("speculator-tasks") since this skill is tightly coupled to that specific server.

3. **Troubleshooting section:** Not in initial version. Can add later if common issues emerge during testing.
