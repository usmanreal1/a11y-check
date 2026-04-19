# CLAUDE.md — Agent Instructions for a11y-check

## Project Overview
`a11y-check` is a static accessibility analyzer for React JSX/TSX files. It catches WCAG violations at the source-code level before a browser is involved — designed to be used proactively by developers, not reactively after audits.

---

## Code Style & Writing Pattern

### General
- TypeScript strict mode is on — no `any`, no type assertions unless unavoidable
- Named exports only — no default exports
- Pure functions wherever possible — no hidden side effects
- Early returns over nested `if` blocks
- `for...of` over `.forEach` — allows `break`/`continue`, easier to read

### Naming
- Functions: `verbNoun` — `parseFile`, `runAllRules`, `resolveFiles`
- Types/Interfaces: `PascalCase` — `ParsedFile`, `Issue`, `FileResult`
- Rule files: `camelCase` matching the rule name — `altText.ts`, `buttonLabel.ts`
- Test files: mirror the source file — `src/rules/altText.ts` → `tests/rules/altText.test.ts`

### Rules
Every rule lives in `src/rules/<ruleName>.ts` and must:
- Export a single function: `<ruleName>Rule(parsed: ParsedFile): Issue[]`
- Be registered in `src/rules/index.ts` inside `runAllRules`
- Include `rule`, `severity`, `message`, `suggestion`, `wcag`, `line`, `column`, and `filePath` on every `Issue`

### Imports
- Node built-ins first, then third-party, then internal — separated by blank lines
- Use `import type` for type-only imports

---

## Testing

### Every function gets a test
- Every exported function must have a corresponding test file
- Test file location mirrors the source: `src/x/y.ts` → `tests/x/y.test.ts`
- Use Node's built-in `node:test` and `node:assert/strict` — no external test framework

### Test runner
```bash
npm test
```
Runs via `node --import tsx --test tests/rules/altText.test.ts`. Add new test files to the `test` script in `package.json`.

### For every rule, tests must cover
1. Valid input — no false positives
2. Each violation the rule detects — one test per distinct error case
3. Edge cases — bare attributes, dynamic expressions, nested elements
4. `filePath` is present on every issue
5. `line` is a positive integer
6. Non-matching elements are ignored

### For every non-rule module
- `parser.ts` — test that a valid JSX string returns a `ParsedFile` with `ast` and `source`
- `engine.ts` — test that `analyzeFiles` maps parsed files to `FileResult[]`
- `resolver.ts` — test single-file and directory inputs, and the error case (no files found)
- `reporter.ts` — test the output format (capture stdout and assert on the string)

### Inline JSX parsing in tests
Use `@babel/parser` directly — do not read files from disk in tests:
```ts
function parseJSX(source: string, filePath = 'test.tsx'): ParsedFile {
  const ast = parse(source, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
    errorRecovery: true,
  })
  return { filePath, ast, source }
}
```

---

## Change Safety

### Before making any change
1. Run `npm test` — all tests must be green before you start
2. Identify which modules the change touches
3. Check if any other module imports those — trace the dependency chain

### After making any change
1. Run `npm test` — all tests must still be green
2. Run `npm run build` — no TypeScript errors
3. Run the CLI manually against `examples/sample.tsx` to confirm output looks correct:
   ```bash
   npm run dev -- examples/sample.tsx
   ```

### Adding a new rule
Checklist:
- [ ] Create `src/rules/<ruleName>.ts` exporting `<ruleName>Rule`
- [ ] Register it in `src/rules/index.ts` inside `runAllRules`
- [ ] Create `tests/rules/<ruleName>.test.ts` covering all cases above
- [ ] Add an example of the violation to `examples/sample.tsx`
- [ ] Add the test file to the `test` script in `package.json`
- [ ] Run `npm test && npm run build`

### Never
- Never change `Issue` interface fields without updating every rule and every test that references them
- Never change `ParsedFile` interface without updating `parser.ts`, all rules, and all tests
- Never skip the test run when editing shared modules (`parser`, `engine`, `resolver`, `rules/index`)

---

## File Structure
```
src/
  cli.ts          # Entry point — argument parsing, orchestration
  resolver.ts     # Resolves file/directory input to a list of .jsx/.tsx paths
  parser.ts       # Parses a file into a ParsedFile (AST + source + path)
  engine.ts       # Runs all rules over a list of ParsedFiles
  reporter.ts     # Formats and prints results to stdout
  rules/
    index.ts      # Registers and runs all rules
    altText.ts    # Rule: <img> must have a valid alt attribute
tests/
  rules/
    altText.test.ts
examples/
  sample.tsx      # Manual testing fixture — intentionally contains violations
```

---

## Dependency Constraints
- No new runtime dependencies without a clear reason — keep the install footprint small
- No test framework dependencies — `node:test` is sufficient
- `chalk` is the only allowed output-formatting library
