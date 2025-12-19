# Implementation Progress: CLI TOON Format Output

## Overview

Converting CLI output from JSON to TOON format to reduce token usage for AI agents. This is a straightforward refactor that replaces `JSON.stringify()` calls with TOON encoding while maintaining all existing functionality.

## Key Implementation Notes

### Architecture Decisions

1. **Utility Function Approach**: Created `src/utils/toon.js` to centralize TOON encoding logic. This provides:
   - Single point of change if encoding logic needs adjustment
   - Consistent formatting across all commands
   - Easy testing of encoding behavior

2. **Error Handling**: All errors output as plain text (not JSON or TOON) per spec requirements. Pattern:
   ```javascript
   console.error(error.message);  // Plain text, not structured
   ```

3. **Success Output**: All successful outputs use TOON format via utility:
   ```javascript
   console.log(formatOutput(result));  // TOON encoded
   ```

### File Update Strategy

**Command Files to Update:**
- `src/commands/task.js` - 14 occurrences (7 success, 7 error)
- `src/commands/tasks.js` - 4 occurrences (2 success, 2 error)
- `src/commands/feature.js` - 3 occurrences (2 success, 1 error)
- `src/commands/features.js` - 1 occurrence (1 success)

**Pattern to Replace:**
- Success: `JSON.stringify(result, null, 2)` → `formatOutput(result)`
- Error: `JSON.stringify({ error: ... })` → `error.message` (plain text)

### TOON Format Benefits

**Best Use Cases:**
- **Uniform arrays** (like `spec tasks ready`) - TOON's tabular format provides maximum token savings (30-60% reduction)
- **Single objects** - TOON object format is more compact than JSON
- **Nested structures** - TOON handles these, though compression may be less dramatic

**Key Insight**: The `spec tasks ready` command is the highest-value conversion since it's the most frequently used by agents and returns uniform arrays of task objects.

### Testing Considerations

1. **Round-trip Validation**: Verify that `decode(encode(data))` equals original data
2. **Command Output**: Test each CLI command to ensure TOON output is valid
3. **Error Handling**: Verify errors output as plain text to stderr
4. **Agent Compatibility**: Ensure agent workflows can still parse TOON output

### Implementation Order

1. **Setup Phase**: Install library, create utility module
2. **Update Phase**: Update all command files (can be done in parallel after utility exists)
3. **Testing Phase**: Comprehensive testing after all updates complete

### Important Reminders

- **No breaking changes**: This only affects output format, not input or API
- **TOON library handles complexity**: Automatically chooses best format (tabular vs object)
- **Error messages**: Must be plain text per spec - no structured format
- **No format flags**: TOON is the opinionated default - no configuration needed

## Current Status

- ✅ Spec defined and clarified
- ✅ Research completed
- ✅ Implementation plan created
- ✅ ADR 0001 created (adopt TOON format)
- ✅ Tasks broken down and imported
- ⏳ Implementation in progress

## Next Steps

1. Install `@toon-format/toon` dependency
2. Create `src/utils/toon.js` utility module
3. Update command files systematically
4. Test and validate TOON output

