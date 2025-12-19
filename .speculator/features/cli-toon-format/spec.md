# Feature: CLI TOON Format Output

## Context & Goal

**Why are we building this?**
The CLI currently outputs JSON payloads to agents using `JSON.stringify()`, which is verbose and token-expensive. TOON (Token-Oriented Object Notation) format provides a more compact, human-readable encoding that minimizes tokens while maintaining structure. This is especially beneficial for uniform arrays of objects (like task lists), where TOON can achieve CSV-like compactness while preserving explicit structure that helps LLMs parse and validate data reliably.

**User Story**
As an AI agent using the spec CLI, I want JSON payloads formatted as TOON, so that I consume fewer tokens and can more efficiently parse structured data from commands like `spec tasks ready` and `spec task show`.

## Requirements

- [ ] Install TOON format library (`@toon-format/toon`)
- [ ] Replace `JSON.stringify()` calls with TOON encoding in all CLI command outputs
- [ ] Convert error messages to plain text (not structured JSON or TOON)
- [ ] Update any documentation that references JSON output format
- [ ] Test that TOON output can be decoded back to equivalent JSON

## Acceptance Criteria

- [ ] All CLI commands that return data (not just errors) output TOON format
- [ ] TOON output is valid and can be decoded back to JSON losslessly
- [ ] Array outputs (like `spec tasks ready`) use TOON's tabular format for compactness
- [ ] Single object outputs (like `spec task show`) use appropriate TOON format
- [ ] Error handling still works correctly
- [ ] Agent workflows using the CLI continue to function with TOON format

## Out of Scope

- Converting input formats (stdin JSON parsing remains as-is)
- Format flags or configuration options - TOON is the opinionated default
- Human-readable table output formats
- Converting internal data structures to TOON (only CLI output)
- Handling deeply nested structures (we control the data structure depth)

## Implementation Notes

- **Error handling**: Error messages should be plain text, not structured JSON or TOON format
- **No format options**: This is an opinionated change - TOON becomes the default output format
- **Data structure control**: We control the returned data structures, so we can ensure they're suitable for TOON format

