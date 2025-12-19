# Feature: Init Command Refactor

## Context & Goal

**Why are we building this?**
Consolidate the initialization experience by replacing the standalone `create-speculator` utility with a unified `/spec.init` command. This provides a consistent interface whether users initialize via slash command or CLI, and enables smarter defaults based on the execution context.

**User Story**
As a developer, I want a single `spec init` / `/spec.init` command to initialize Speculator in my project, so that I have one consistent entry point regardless of whether I'm using Claude Code, Cursor, or the CLI directly.

## Requirements

- [ ] Remove `create-speculator` binary from package.json
- [ ] Create new `spec init` CLI subcommand
- [ ] Create new `/spec.init` slash command template
- [ ] Support `--agent` option with values: `claude-code`, `cursor` (default: auto-detect from execution context)
- [ ] Support `--rules` flag to update CLAUDE.md (for Claude Code) or add cursor rule (for Cursor) - default: false
- [ ] Auto-install multi-agent orchestration skill when agent is `claude-code`
- [ ] Context-aware defaults: detect if running as Claude Code slash command vs Cursor vs CLI
- [ ] Preserve all existing installation functionality (templates, commands, shared files)
- [ ] Clean up `bin/create.js` file

## Acceptance Criteria

- [ ] `spec init` from CLI prompts for agent if not provided
- [ ] `/spec.init` in Claude Code defaults to `--agent claude-code`
- [ ] `/spec.init` in Cursor defaults to `--agent cursor`
- [ ] `spec init --agent claude-code` installs orchestration skill automatically
- [ ] `spec init --agent cursor` does NOT install orchestration skill
- [ ] `spec init --rules` installs CLAUDE.md or cursor rule based on agent
- [ ] Idempotent: re-running `spec init` overwrites existing files (same as current create-speculator behavior)
- [ ] Error states handled gracefully (missing templates, permission errors)

## Out of Scope

- Migration from existing `create-speculator` installations (they already work)
- Support for other agents beyond Claude Code and Cursor
- Interactive TUI beyond basic prompts

## Open Questions

None - all questions resolved.
