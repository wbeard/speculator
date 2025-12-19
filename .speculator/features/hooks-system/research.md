# Research: Hooks System

## Existing Patterns

### Command Template Structure

Commands are markdown files in `templates/commands/` with a consistent structure:
- H1 title describing the command
- `## Steps` section with numbered steps
- Each step has a bold title and sub-bullets for details
- Final step suggests the next command in the workflow

Example pattern from `spec.plan.md`:
```markdown
# Implementation Plan

Create an implementation plan bridging current state to requirements.

## Steps

1. **Identify Feature**
   - If the active feature cannot be inferred...

...

6. **Suggest Next Step**
   - "Run `/spec.tasks` to break this into executable tasks."
```

**Key observation:** Commands don't currently have any pre/post hook logic. Each command is self-contained markdown that an LLM interprets and executes.

### Init Command (`src/commands/init.js`)

The init command:
1. Copies shared templates from `templates/shared/speculator/` to `.speculator/`
2. Installs agent-specific commands to `.claude/commands/` or `.cursor/commands/`
3. Optionally installs rules file
4. For Claude Code, also installs the orchestration skill

Key functions in `src/utils/templates.js`:
- `copyDir(src, dest)` - recursively copies directory
- `copyFile(src, dest)` - copies single file
- `writeFile(dest, content)` - writes file with content
- `installCommands(destDir, addFrontmatter)` - copies command templates with optional YAML frontmatter

**What needs to change:**
- Add creation of `.speculator/hooks/` directory (empty) in init
- Update success message to mention hooks

### Template Directory Structure

```
templates/
├── commands/           # Slash command markdown files
│   ├── meta.json       # Command descriptions for frontmatter
│   ├── spec.new.md
│   ├── spec.plan.md
│   └── ...
├── shared/
│   └── speculator/     # Copied to .speculator/
│       ├── features/   # Feature workspaces
│       └── templates/  # Template files
├── claude-code/
│   └── CLAUDE.md
├── cursor/
│   └── rules/
└── skills/
    └── speculator-orchestration/
```

**Where hooks templates will go:**
```
templates/
└── hooks/              # NEW - hook template library
    ├── README.md
    ├── adr/
    ├── tech-debt/
    └── todos/
```

### package.json Configuration

```json
{
  "files": [
    "bin",
    "src",
    "templates"   // Already includes all of templates/
  ]
}
```

**No change needed** - `templates` is already in the files array, so `templates/hooks/` will be automatically included in the published package.

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| better-sqlite3 | ^11.0.0 | Task database |
| commander | ^12.0.0 | CLI framework |
| kleur | ^4.1.5 | Terminal colors |
| prompts | ^2.4.2 | Interactive prompts |
| uuid | ^10.0.0 | Unique IDs |

**No new dependencies needed** for hooks system - it's entirely filesystem-based and interpreted by the LLM.

## Technical Constraints

### Hook Execution Model

Hooks are markdown files that the LLM reads and interprets. The execution model is:
1. Commands check for hooks in filesystem
2. If hooks exist, LLM reads and executes them as instructions
3. Hooks run "in parallel" from the LLM's perspective (all hooks in a directory are read and executed together)
4. Hook failures are warnings, not errors

This is not programmatic parallel execution - it's the LLM interpreting multiple instruction files at once.

### Hook Discovery

Commands need to check for hooks at two points:
```markdown
## Pre-Hooks (add at start of command)

Check for hooks:
- `ls .speculator/hooks/pre-<command>/*.md 2>/dev/null`
- If found, read and execute all `.md` files

## Post-Hooks (add at end of command, before "Suggest Next Step")

Check for hooks:
- `ls .speculator/hooks/post-<command>/*.md 2>/dev/null`
- If found, read and execute all `.md` files
```

### Command Names Mapping

Commands use the format `spec.<action>`, so hook directories use the action name:
- `/spec.new` → `pre-new/`, `post-new/`
- `/spec.plan` → `pre-plan/`, `post-plan/`
- `/spec.implement` → `pre-implement/`, `post-implement/`

Hook directory names match command names exactly for consistency.

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Users forget to copy hooks | Medium | Clear documentation in hook templates README |
| Hook instructions too vague for LLM | Low | Provide well-structured example hooks |
| Hooks create files in wrong locations | Low | Specify exact paths in hook instructions |
| LLM fails to find hook directory | Low | Use simple ls command pattern |

## Recommendations

### Implementation Approach

1. **Update all command templates** to add pre/post hook sections
   - Add hook checking boilerplate to each command
   - Keep it simple: check directory, read files, execute instructions

2. **Update init command** to create `.speculator/hooks/` directory
   - Just create the empty directory
   - No subdirectories by default

3. **Create hook templates** at `templates/hooks/`
   - Each hook should be a complete, self-contained instruction set
   - Include clear criteria for when to act vs. skip
   - Specify exact output file paths and formats

4. **Use command names** for hook directories
   - `pre-new/`, `post-new/` (matches `/spec.new`)
   - `pre-plan/`, `post-plan/` (matches `/spec.plan`)
   - Consistent naming with command names

### Hook Template Pattern

Each hook file should follow this structure:
```markdown
# <Action Title>

<Brief description of when this hook runs>

## When to Act

<Clear criteria for when to take action>

## Actions

<Step-by-step instructions for what to do>

## Template

<Any templates for generated content>

## If Nothing to Do

<What to output when no action needed>
```

### Files to Modify

1. `templates/commands/*.md` - Add hook sections to all 8 commands
2. `src/commands/init.js` - Create hooks directory
3. `templates/hooks/` - Create new directory with templates (7 files)
