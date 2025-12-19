# Implementation Plan: CLI TOON Format Output

**Status:** READY

## Open Questions

*None - all questions resolved during spec clarification and research.*

## Migration & Cleanup

*No migration needed - this is a backward-compatible change that only affects output format.*

## Architecture

This is a straightforward refactor that replaces JSON output with TOON format. The change touches two layers:

1. **Utility Layer** - New `src/utils/toon.js` module for TOON encoding
2. **CLI Layer** - Update all command files to use TOON encoding instead of JSON.stringify

The architecture follows a simple pattern:
- All successful command outputs use TOON encoding via a utility function
- All error outputs use plain text (not JSON or TOON)
- The TOON library handles all encoding logic automatically

### Key Components

```
CLI Commands (task.js, tasks.js, feature.js, features.js)
     │
     │ formatOutput(data) ──► TOON encoding
     │ console.error(message) ──► Plain text
     ▼
TOON Utility (src/utils/toon.js)
     │
     │ encode(data) from @toon-format/toon
     ▼
TOON Library (@toon-format/toon)
```

**Data Flow:**
1. Operations layer returns JavaScript objects/arrays (unchanged)
2. Command layer calls `formatOutput(result)` instead of `JSON.stringify(result, null, 2)`
3. Utility function uses TOON library to encode data
4. Output goes to `console.log()` (stdout) for success, `console.error()` (stderr) for errors

## File Changes

### New Files

| Path | Purpose |
|------|---------|
| `src/utils/toon.js` | Utility module for TOON encoding - wraps `@toon-format/toon` encode function |

### Modified Files

| Path | Changes |
|------|---------|
| `package.json` | Add `@toon-format/toon` to dependencies |
| `src/commands/task.js` | Replace 7 `JSON.stringify(result, null, 2)` with `formatOutput(result)`, replace 7 `JSON.stringify({ error: ... })` with plain text `error.message` |
| `src/commands/tasks.js` | Replace 2 `JSON.stringify(result, null, 2)` with `formatOutput(result)`, replace 2 `JSON.stringify({ error: ... })` with plain text `error.message` |
| `src/commands/feature.js` | Replace 2 `JSON.stringify(result, null, 2)` with `formatOutput(result)`, replace 1 `JSON.stringify({ error: ... })` with plain text error message |
| `src/commands/features.js` | Replace 1 `JSON.stringify(result, null, 2)` with `formatOutput(result)` |

**Error Handling Pattern:**
- Before: `console.error(JSON.stringify({ error: error.message }))`
- After: `console.error(error.message)`

**Success Output Pattern:**
- Before: `console.log(JSON.stringify(result, null, 2))`
- After: `console.log(formatOutput(result))`

## Implementation Phases

### Phase 1: Setup
1. Install TOON library: `npm install @toon-format/toon`
2. Create `src/utils/toon.js` with `formatOutput(data)` function
3. Export function for use in command files

### Phase 2: Update Commands
1. Update `src/commands/task.js` - all 14 occurrences
2. Update `src/commands/tasks.js` - all 4 occurrences
3. Update `src/commands/feature.js` - all 3 occurrences
4. Update `src/commands/features.js` - 1 occurrence

### Phase 3: Testing
1. Test each command to ensure TOON output is valid
2. Verify TOON output can be decoded back to equivalent JSON
3. Test error handling (plain text output)
4. Verify agent workflows still function correctly

## Testing Strategy

- [ ] **Unit Tests**: Test `formatOutput()` utility with various data structures:
  - Single objects (task, feature)
  - Uniform arrays (task lists, feature lists)
  - Nested structures (feature with task tree)
  - Edge cases (empty arrays, null values)

- [ ] **Integration Tests**: Test actual CLI commands:
  - `spec tasks ready` - should output TOON tabular format
  - `spec task show <id>` - should output TOON object format
  - `spec task add` - should output TOON object format
  - `spec features` - should output TOON tabular format
  - `spec feature show <id>` - should output TOON with nested structures
  - Error cases - should output plain text to stderr

- [ ] **Round-trip Validation**: Use TOON decode to verify lossless conversion:
  - Encode data with `formatOutput()`
  - Decode with `@toon-format/toon` decode
  - Compare with original data structure

- [ ] **Agent Workflow Test**: Verify that agent commands in orchestration skill still work:
  - `spec tasks ready` output is parseable
  - `spec task claim` output is parseable
  - Error messages are readable (plain text)

## Implementation Details

### TOON Utility Function

```javascript
// src/utils/toon.js
import { encode } from '@toon-format/toon';

/**
 * Format data as TOON for CLI output
 * @param {any} data - JavaScript object or array to encode
 * @returns {string} TOON-formatted string
 */
export function formatOutput(data) {
  return encode(data);
}
```

### Error Handling Pattern

All error handling should follow this pattern:
```javascript
try {
  const result = someOperation();
  console.log(formatOutput(result));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
```

### Import Pattern

All command files should import the utility:
```javascript
import { formatOutput } from '../utils/toon.js';
```

## Notes

- **No breaking changes**: This only affects output format, not input or API
- **TOON library handles complexity**: The library automatically chooses the best format (tabular for arrays, object format for single objects)
- **Error messages**: Must be plain text per spec - no structured format
- **Testing priority**: Focus on `spec tasks ready` as it's the highest-value conversion (most token savings)

