# Implementation Plan: Hooks System

**Status:** READY

## Open Questions

*None - all requirements are clear.*

## Migration & Cleanup

*No existing code conflicts with this feature.*

## Architecture

The hooks system is a filesystem-based extension mechanism. Hooks are markdown files containing LLM instructions that run before or after slash commands.

### Key Components

1. **Hook Discovery** - Commands check `.speculator/hooks/{pre|post}-{command}/` for `.md` files
2. **Hook Execution** - LLM reads and executes all hooks in a directory (parallel interpretation)
3. **Hook Templates** - Example hooks shipped with the package that users can copy
4. **Init Integration** - Creates empty hooks directory on project initialization

### Execution Flow

```
Command invoked
    ↓
Check pre-hooks → Read & execute all .md files in pre-{command}/
    ↓
Execute main command logic
    ↓
Check post-hooks → Read & execute all .md files in post-{command}/
    ↓
Suggest next step
```

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `templates/hooks/README.md` | Overview of hooks system, installation instructions |
| `templates/hooks/adr/README.md` | ADR hook documentation |
| `templates/hooks/adr/post-plan-create-adr.md` | Hook to create ADRs after planning |
| `templates/hooks/tech-debt/README.md` | Tech debt hook documentation |
| `templates/hooks/tech-debt/post-plan-flag-debt.md` | Hook to flag tech debt after planning |
| `templates/hooks/todos/README.md` | TODO capture hook documentation |
| `templates/hooks/todos/post-implement-capture-todos.md` | Hook to capture TODOs after implementing |

### Modified Files

| Path | Changes |
|------|---------|
| `src/commands/init.js` | Add creation of `.speculator/hooks/` directory, update success message |
| `templates/commands/spec.new.md` | Add pre/post hook sections |
| `templates/commands/spec.fix.md` | Add pre/post hook sections |
| `templates/commands/spec.research.md` | Add pre/post hook sections |
| `templates/commands/spec.plan.md` | Add pre/post hook sections |
| `templates/commands/spec.tasks.md` | Add pre/post hook sections |
| `templates/commands/spec.implement.md` | Add pre/post hook sections |
| `templates/commands/spec.clarify.md` | Add pre/post hook sections |
| `templates/commands/spec.next.md` | Add pre/post hook sections |

## Implementation Order

### Phase 1: Hook Templates (7 files)

Create the hook template library that ships with the package.

1. `templates/hooks/README.md` - Root documentation
2. `templates/hooks/adr/README.md` - ADR category docs
3. `templates/hooks/adr/post-plan-create-adr.md` - ADR creation hook
4. `templates/hooks/tech-debt/README.md` - Tech debt category docs
5. `templates/hooks/tech-debt/post-plan-flag-debt.md` - Tech debt flagging hook
6. `templates/hooks/todos/README.md` - TODO category docs
7. `templates/hooks/todos/post-implement-capture-todos.md` - TODO capture hook

### Phase 2: Init Command Update (1 file)

Update the CLI to create the hooks directory.

8. `src/commands/init.js` - Create hooks directory + update message

### Phase 3: Command Template Updates (8 files)

Add hook checking to all command templates.

9. `templates/commands/spec.new.md`
10. `templates/commands/spec.fix.md`
11. `templates/commands/spec.research.md`
12. `templates/commands/spec.plan.md`
13. `templates/commands/spec.tasks.md`
14. `templates/commands/spec.implement.md`
15. `templates/commands/spec.clarify.md`
16. `templates/commands/spec.next.md`

## Hook Section Pattern

Each command will add this pattern:

```markdown
## Pre-Hooks

Check for pre-hooks before proceeding:
- List files: `ls .speculator/hooks/pre-{command}/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn: "⚠ Hook failed: {path} - {reason}" and continue

## Steps
... existing steps ...

## Post-Hooks

Before suggesting the next step, check for post-hooks:
- List files: `ls .speculator/hooks/post-{command}/*.md 2>/dev/null`
- If hooks exist, read and execute each one
- If a hook fails, warn: "⚠ Hook failed: {path} - {reason}" and continue
```

## Testing Strategy

- [ ] Run `spec init` and verify `.speculator/hooks/` directory is created
- [ ] Copy a hook template to `.speculator/hooks/post-plan/` and run `/spec.plan`
- [ ] Verify the hook executes after the plan is created
- [ ] Test with multiple hooks in same directory to verify parallel execution
- [ ] Test hook failure scenario (malformed hook) to verify warning behavior
