# Research: Init Command Refactor

## Existing Patterns

*How does the codebase currently handle similar functionality?*

### Current Architecture

**bin/create.js** - Standalone installer (to be replaced)
- Uses `prompts` for interactive agent selection
- Uses `kleur` for colored terminal output
- Copies templates from `templates/` directory
- Helper functions: `copyDir()`, `copyFile()`, `writeFile()`, `installCommands()`
- `installCommands()` adds YAML frontmatter for Claude Code commands

**bin/spec.js** - Main CLI entry point
- Uses `commander` for CLI parsing
- Registers command modules from `src/commands/`
- Pattern: `registerXxxCommands(program)` functions

**src/commands/*.js** - Command registration pattern
- Each file exports a `registerXxxCommands(program)` function
- Commands use subcommand pattern: `spec feature create`, `spec task add`, etc.
- Output is JSON for machine readability

### Template Structure
```
templates/
├── commands/           # Slash command templates (spec.*.md)
│   └── meta.json      # Descriptions for frontmatter
├── shared/speculator/ # Core .speculator directory structure
├── cursor/rules/      # Cursor rule file (speculator.mdc)
├── claude-code/       # CLAUDE.md template
└── skills/            # Multi-agent orchestration skill
```

### Key Differences from Existing Commands

Current CLI commands (`spec task`, `spec feature`) interact with the SQLite database. The new `spec init` command will:
- NOT need database access (no `initDb()` call for this subcommand)
- Copy files/directories (like create.js does now)
- Optionally prompt user for input

## Dependencies

*What libraries, APIs, or services are involved?*

| Dependency | Version | Purpose |
|------------|---------|---------|
| commander | ^12.0.0 | CLI argument parsing - already used in spec.js |
| prompts | ^2.4.2 | Interactive prompts - already used in create.js |
| kleur | ^4.1.5 | Terminal colors - already used in create.js |
| fs (node) | builtin | File system operations |
| path (node) | builtin | Path manipulation |

No new dependencies needed - all required libraries already installed.

## Technical Constraints

- **ES Modules**: Project uses `"type": "module"` - must use `import` syntax
- **Node 18+**: Required by `engines` field in package.json
- **Template paths**: Must resolve correctly when installed globally via npm
- **Idempotent**: Overwrites existing files without prompting

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking change for existing users | Low | Old `create-speculator` command removed, but `spec init` provides same functionality |
| Template path resolution when globally installed | Medium | Use `import.meta.url` pattern (already used in create.js) |
| Database initialization for non-init commands | Low | Only call `initDb()` for commands that need it |

## Recommendations

### Implementation Approach

1. **Create `src/commands/init.js`** following existing pattern:
   - Export `registerInitCommands(program)`
   - Move logic from `bin/create.js` into this module
   - Add `--agent` and `--rules` options

2. **Create `templates/commands/spec.init.md`** slash command:
   - For Claude Code: hint to use `--agent claude-code`
   - For Cursor: hint to use `--agent cursor`

3. **Update `bin/spec.js`**:
   - Import and register init commands
   - Conditionally initialize database (skip for `init` subcommand)

4. **Update `package.json`**:
   - Remove `create-speculator` from `bin`

5. **Delete `bin/create.js`** after migration complete

### Agent Detection Strategy

The slash command itself can pass the agent type as an argument:
- `spec.init.md` for generic use says "run `spec init`"
- Claude Code version (with frontmatter) suggests `spec init --agent claude-code`
- Cursor version suggests `spec init --agent cursor`

Alternative: Check environment variables or working directory for `.claude/` or `.cursor/` presence, but explicit `--agent` flag is cleaner.
