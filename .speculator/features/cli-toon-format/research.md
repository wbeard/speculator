# Research: CLI TOON Format Output

## Existing Patterns

**Current JSON Output Pattern:**
- All CLI commands use `JSON.stringify(result, null, 2)` for successful outputs
- Error handling uses `JSON.stringify({ error: error.message })` which needs to change to plain text
- Output goes to `console.log()` for success, `console.error()` for errors

**Files with JSON.stringify calls:**
- `src/commands/task.js` - 14 occurrences (7 success, 7 error)
- `src/commands/tasks.js` - 4 occurrences (2 success, 2 error)
- `src/commands/feature.js` - 3 occurrences (2 success, 1 error)
- `src/commands/features.js` - 1 occurrence (1 success)

**Data Structure Patterns:**

1. **Single Task Objects** (from `getTask`, `addTask`, `claimTask`, etc.):
   - Flat objects with fields: `id`, `feature_id`, `parent_id`, `title`, `description`, `status`, `assigned_to`, `blocked_reason`, `created_at`, `updated_at`
   - Some include arrays: `depends_on: []`, `blocking: []`
   - Perfect for TOON single object format

2. **Task Arrays** (from `getReadyTasks`, `importTasks`):
   - Uniform arrays of task objects with same structure
   - **Ideal for TOON tabular format** - this is TOON's sweet spot
   - Example: `spec tasks ready` returns array of tasks

3. **Feature Objects** (from `getFeature`, `createFeature`):
   - Feature metadata + nested `task_counts` object + `tasks` array (tree structure)
   - `tasks` array contains nested objects with `children` arrays (tree structure)
   - May need special handling for nested structures

4. **Feature Arrays** (from `listFeatures`):
   - Uniform arrays of feature objects with `task_counts` nested object
   - Good candidate for TOON tabular format

5. **Simple Success Objects** (from `task depend`):
   - `{ success: true, task_id: id, depends_on: options.on }`
   - Simple object, easy to convert

## Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| `@toon-format/toon` | Latest | TOON encoding/decoding library |
| `commander` | ^12.0.0 | CLI framework (existing) |
| `better-sqlite3` | ^11.0.0 | Database (existing) |

**TOON Library API:**
Based on documentation, the library provides:
- `encode(data)` - Convert JavaScript object/array to TOON string
- `decode(toon)` - Convert TOON string back to JavaScript object/array
- Lossless round-trip: `decode(encode(x)) === x` (after normalization)

## Technical Constraints

- **Node.js version**: >=18.0.0 (per package.json engines)
- **ES Modules**: Project uses `"type": "module"`, so import syntax required
- **Error output**: Must be plain text (not JSON or TOON) per spec clarification
- **Data structure depth**: We control the data, so can ensure TOON-compatible structures
- **Array uniformity**: Task arrays are uniform (same structure), perfect for TOON tabular format
- **Nested structures**: Feature objects with task trees may need attention, but depth is controlled

## Data Structure Analysis

**Best Candidates for TOON Tabular Format:**
- ✅ `spec tasks ready` - Returns uniform array of task objects
- ✅ `spec tasks import` - Returns uniform array of created task objects
- ✅ `spec features` - Returns uniform array of feature objects (with nested `task_counts`)

**Single Object Outputs (TOON object format):**
- ✅ `spec task show <id>` - Single task object
- ✅ `spec task add` - Single task object
- ✅ `spec task claim` - Single task object
- ✅ `spec task complete` - Single task object
- ✅ `spec task block` - Single task object
- ✅ `spec task unblock` - Single task object
- ✅ `spec task release` - Single task object
- ✅ `spec task depend` - Simple success object
- ✅ `spec feature create` - Single feature object
- ✅ `spec feature show <id>` - Feature object with nested structures

**Potential Complexity:**
- `spec feature show` returns a feature with:
  - Nested `task_counts` object (simple, TOON handles this)
  - `tasks` array containing tree structures with `children` arrays
  - This nested tree structure may not benefit as much from TOON, but should still work

## Risks & Blockers

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TOON library not available or incompatible | Low | Library is published on npm, check compatibility before implementation |
| Nested tree structures in `getFeature` may not compress well | Medium | Acceptable - we control the structure, and single feature show is less common than task lists |
| Agents expecting JSON format | Low | We control all agent interactions, can update documentation |
| Error handling breaking if not converted to plain text | High | Must ensure all error paths use plain text, not JSON.stringify |
| TOON encoding fails on edge cases | Low | Test with actual data structures, library should handle standard JSON-compatible data |

## Recommendations

1. **Installation**: Add `@toon-format/toon` to package.json dependencies
2. **Create utility function**: Create a helper in `src/utils/` to handle TOON encoding (and potentially error formatting)
3. **Replace JSON.stringify systematically**:
   - Replace all `console.log(JSON.stringify(result, null, 2))` with TOON encoding
   - Replace all `console.error(JSON.stringify({ error: ... }))` with plain text: `console.error(error.message)`
4. **Test cases**: Test with actual CLI commands to ensure TOON output is valid and decodable
5. **Documentation**: Update any docs that reference JSON output format
6. **Error handling**: Create a consistent pattern for error output (plain text to stderr)

**Implementation Approach:**
- Create `src/utils/toon.js` with `formatOutput(data)` function that wraps TOON encoding
- This allows for consistent formatting and potential future customization
- Update all command files to use the utility instead of JSON.stringify

**Key Insight:**
The `spec tasks ready` command is the highest-value conversion - it returns uniform arrays of task objects, which is exactly what TOON's tabular format optimizes for. This will provide the most token savings for the most common agent operation.

