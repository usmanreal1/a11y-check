# SKILLS.md — Development Patterns & Conventions

## Adding a New Rule

### 1. Create the rule file
`src/rules/<ruleName>.ts`

```ts
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import type { ParsedFile } from '../parser'
import type { Issue } from './altText'

export function <ruleName>Rule(parsed: ParsedFile): Issue[] {
  const issues: Issue[] = []

  traverse(parsed.ast, {
    JSXOpeningElement(path) {
      // your detection logic here
    },
  })

  return issues
}
```

### 2. Register it
`src/rules/index.ts`:
```ts
import { <ruleName>Rule } from './<ruleName>'

export function runAllRules(parsed: ParsedFile): Issue[] {
  return [
    ...altTextRule(parsed),
    ...<ruleName>Rule(parsed),
  ]
}
```

### 3. Write the test file
`tests/rules/<ruleName>.test.ts` — must cover every case listed in CLAUDE.md.

### 4. Add to test script
`package.json`:
```json
"test": "node --import tsx --test tests/rules/altText.test.ts tests/rules/<ruleName>.test.ts"
```

### 5. Add a fixture
`examples/sample.tsx` — add at least one passing and one failing example of the new rule.

---

## Issue Severity Guide

| Severity | When to use |
|---|---|
| `error` | Directly blocks screen reader users or fails WCAG Level A |
| `warning` | Degrades experience or fails WCAG Level AA — may have valid exceptions |

---

## WCAG Reference Quick Guide

| Rule | Criterion | Level |
|---|---|---|
| `alt-text` | 1.1.1 Non-text Content | A |
| `button-label` | 4.1.2 Name, Role, Value | A |
| `form-label` | 1.3.1 Info and Relationships | A |
| `link-text` | 2.4.6 Headings and Labels | AA |
| `heading-order` | 1.3.1 Info and Relationships | A |
| `color-contrast` | 1.4.3 Contrast (Minimum) | AA |
| `aria-valid` | 4.1.2 Name, Role, Value | A |

---

## Issue Object Reference

```ts
interface Issue {
  rule: string       // kebab-case rule name, e.g. 'alt-text'
  severity: 'error' | 'warning'
  message: string    // what is wrong — short, factual
  suggestion: string // how to fix it — actionable
  wcag: string       // e.g. 'WCAG 1.1.1 (Level A)'
  line: number       // 1-based
  column: number     // 0-based (Babel convention)
  filePath: string   // absolute or relative path passed in
}
```

---

## Babel AST Helpers Cheatsheet

```ts
// Check element name
t.isJSXIdentifier(name) && name.name === 'img'

// Find a specific attribute by name
const attr = attrs.find(
  (a) => t.isJSXAttribute(a) && t.isJSXIdentifier(a.name) && a.name.name === 'alt'
)

// Attribute has no value (bare: <img alt />)
t.isJSXAttribute(attr) && attr.value === null

// Attribute has an empty string value (<img alt="" />)
t.isStringLiteral(attr.value) && attr.value.value === ''

// Attribute has a JSX expression value (<img alt={label} />)
t.isJSXExpressionContainer(attr.value)

// Get location safely
const line = path.node.loc?.start.line ?? 0
const column = path.node.loc?.start.column ?? 0
```

---

## Running the Tool

```bash
# Analyze a single file
npm run dev -- examples/sample.tsx

# Analyze an entire directory
npm run dev -- src/

# Run all tests
npm test

# Type-check without emitting
npx tsc --noEmit

# Build for production
npm run build
```

---

## What Good Output Looks Like

```
Analyzing 1 file(s)...

/path/to/Component.tsx
  12:4  error  <img> is missing an alt attribute  [alt-text]
  → Add alt="" for decorative images, or alt="description" for informative ones
  → WCAG 1.1.1 (Level A)

──────────────────────────────────────────────────
✖ 1 issue found
```
