# Active Tasks: Init Command Refactor

## Phase 1: Extract Utilities

- [x] Create `src/utils/templates.js` with helper functions extracted from `bin/create.js`:
  - `copyDir(src, dest)`
  - `copyFile(src, dest)`
  - `writeFile(dest, content)`
  - `installCommands(destDir, addFrontmatter)`

## Phase 2: Create Init Command

- [x] Create `src/commands/init.js` with `registerInitCommands(program)`:
  - Add `spec init` command
  - Add `--agent <type>` option (choices: `claude-code`, `cursor`)
  - Add `--rules` flag option
  - Implement interactive prompt when `--agent` not provided
  - Copy shared templates (`.speculator/` directory)
  - Install agent-specific commands (with/without frontmatter)
  - Install rules if `--rules` flag provided
  - Auto-install orchestration skill for `claude-code` agent
  - Print success message with available commands

## Phase 3: Integrate with CLI

- [x] Update `bin/spec.js`:
  - Import `registerInitCommands` from `src/commands/init.js`
  - Register init commands with program
  - Make `initDb()` conditional (skip for `init` subcommand)

## Phase 4: Create Slash Command

- [x] Create `templates/commands/spec.init.md` slash command template
- [x] Update `templates/commands/meta.json` to add `spec.init` description

## Phase 5: Cleanup

- [x] Update `package.json`: remove `create-speculator` from bin field
- [x] Delete `bin/create.js`

## Phase 6: Testing

- [x] Test `spec init --agent claude-code` (Claude commands + skill)
- [x] Test `spec init --agent cursor` (Cursor commands, no skill)
- [x] Test `spec init --agent claude-code --rules` (includes CLAUDE.md)
- [x] Test `spec init --agent cursor --rules` (includes cursor rule)
- [x] Test `spec init` with no args (interactive prompt) - command exists, prompt verified in code
- [x] Test idempotency (re-run overwrites files)
- [x] Test other commands still work (`spec task`, `spec feature`)
