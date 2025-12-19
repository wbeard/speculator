# 0001: Adopt TOON Format for CLI Output

## Status

Proposed

## Context

The spec CLI currently outputs JSON payloads to AI agents using `JSON.stringify()`, which is verbose and token-expensive. For uniform arrays of objects (like task lists returned by `spec tasks ready`), JSON repeats every field name for every record, consuming significant tokens. As agents frequently query the CLI for task lists and task details, this token overhead accumulates and increases costs.

We need a more compact, human-readable encoding that minimizes tokens while maintaining structure and parseability for LLMs.

## Decision

Adopt TOON (Token-Oriented Object Notation) format as the default output format for all CLI command responses. This includes:

1. **Install `@toon-format/toon` library** as a dependency
2. **Replace all `JSON.stringify()` calls** with TOON encoding via a utility function
3. **Convert error messages to plain text** (not structured JSON or TOON)
4. **Make TOON the opinionated default** - no format flags or configuration options

The TOON format will be used for:
- Single object outputs (tasks, features)
- Uniform array outputs (task lists, feature lists)
- Nested structures (features with task trees)

Error outputs will remain plain text for clarity and simplicity.

## Alternatives Considered

1. **Keep JSON format** - Rejected: Too token-expensive, especially for uniform arrays
2. **Add format flag (`--format json|toon`)** - Rejected: We want an opinionated default, agents don't need format choice
3. **Use YAML** - Rejected: Still verbose for arrays, doesn't provide TOON's tabular format benefits
4. **Use CSV for arrays only** - Rejected: Loses structure, requires separate handling for objects vs arrays
5. **Custom compact format** - Rejected: TOON is a well-specified, tested format with library support

## Consequences

**Benefits:**
- **Significant token savings** (30-60% reduction) especially for uniform arrays like `spec tasks ready`
- **Better LLM parsing** - Explicit array lengths and field headers help validation
- **Maintains structure** - Lossless round-trip conversion with JSON
- **Human-readable** - More compact than JSON while remaining readable
- **Library support** - Well-maintained npm package with simple API

**Drawbacks:**
- **New dependency** - Adds `@toon-format/toon` to package.json
- **Format change** - All CLI output changes format (but we control all consumers)
- **Less familiar** - TOON is newer than JSON, but documentation is available
- **Nested structures** - May not compress as well as uniform arrays, but acceptable

**Mitigation:**
- We control all agent interactions, so format change is manageable
- TOON library handles encoding complexity automatically
- Error messages remain plain text for clarity
- Testing will verify lossless round-trip conversion

---
*Created: 2025-12-19*
*Feature: cli-toon-format*

