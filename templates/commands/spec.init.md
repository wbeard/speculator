# Initialize Speculator

Initialize Speculator in the current project.

## Steps

1. **Run Initialization**
   - Execute: `spec init --agent claude-code`
   - This installs:
     - Shared templates (`.speculator/` directory)
     - Claude Code slash commands (`.claude/commands/`)
     - Multi-agent orchestration skill (`.claude/skills/`)

2. **Optional: Include Rules**
   - To also install `CLAUDE.md` with project rules:
   - Execute: `spec init --agent claude-code --rules`

## Agent Options

| Agent | Command |
|-------|---------|
| Claude Code | `spec init --agent claude-code` |
| Cursor | `spec init --agent cursor` |

## What Gets Installed

- `.speculator/` - Feature workspace templates
- `.claude/commands/` or `.cursor/commands/` - Workflow slash commands
- `.claude/skills/speculator-orchestration/` - Multi-agent skill (Claude Code only)
- `CLAUDE.md` or `.cursor/rules/speculator.mdc` - Rules file (with `--rules` flag)

## Next Steps

After initialization, start with `/spec.new` to create your first feature, or `/spec.next` to check status.
