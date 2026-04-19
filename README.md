# a11y-check

Static accessibility analyzer for React JSX/TSX files. Catches WCAG violations at the source level — no browser, no runtime, no DOM required.

## Why

Tools like axe-core run in the browser against a rendered page. They miss components that aren't tested, routes that aren't visited, and code that isn't deployed yet. `a11y-check` runs on raw source files so developers get feedback at the earliest possible point — in CI, as a pre-commit hook, or locally before opening a PR.

## Install

```bash
npm install --save-dev a11y-check
```

Or globally:

```bash
npm install -g a11y-check
```

## Usage

```bash
# Analyze a single file
a11y-check src/components/Button.tsx

# Analyze an entire directory
a11y-check src/

# Run via npx (no install required)
npx a11y-check src/
```

Exit code is `1` when errors are found, `0` when clean — safe to use in CI scripts.

## Rules

### Level A (errors)

| Rule | What it catches |
|---|---|
| `alt-text` | `<img>` missing `alt` or with bare `alt` (no value) |
| `button-label` | `<button>` with no text, no `aria-label`, or only an unlabelled icon |
| `input-label` | `<input>` with no `aria-label`, `aria-labelledby`, or linked `id` |
| `link-text` | `<a>` with empty text or non-descriptive text ("click here", "read more") |
| `interactive-role` | Non-interactive elements (`div`, `span`, etc.) with `onClick` but no `role`, keyboard handler, or `tabIndex` |
| `aria-valid-attr` | `aria-*` attributes not in the ARIA specification |
| `lang-attribute` | `<html>` without a `lang` attribute or with an empty one |
| `iframe-title` | `<iframe>` missing `title` or with an empty one |
| `autoplay-media` | `<video>` or `<audio>` with `autoPlay` but no `muted` |
| `link-href` | `<a>` with no `href`, empty `href`, or `href="#"` |

### Level AA (warnings)

| Rule | What it catches |
|---|---|
| `heading-order` | Heading levels that skip (e.g. `<h1>` followed by `<h3>`) |

## Configuration

Create `.a11yrc.json` at your project root:

```json
{
  "rules": {
    "interactive-role": "off",
    "heading-order": "error",
    "link-text": "warning"
  },
  "exclude": [
    "src/legacy/**",
    "**/*.stories.tsx"
  ]
}
```

### Rule values

| Value | Behaviour |
|---|---|
| `"error"` | Reported as error, exits with code 1 |
| `"warning"` | Reported as warning, does not affect exit code |
| `"off"` | Rule is disabled entirely |

### Exclude patterns

Glob patterns in `exclude` are matched against file paths. Files in `node_modules` and `dist` are always excluded.

## Ignoring specific lines

To suppress a false positive on the next line, add an ignore comment directly above it.

**Suppress all rules:**
```tsx
// a11y-ignore-next-line
<img src="purely-decorative.png" />
```

**Suppress a specific rule:**
```tsx
// a11y-ignore-next-line alt-text
<img src="purely-decorative.png" />
```

**Suppress multiple rules:**
```tsx
// a11y-ignore-next-line alt-text, button-label
<img src="icon.png" />
```

**Inside JSX:**
```tsx
return (
  <div>
    {/* a11y-ignore-next-line interactive-role */}
    <div onClick={handleDrag} role="none">...</div>
  </div>
)
```

## CI — GitHub Actions

```yaml
# .github/workflows/a11y.yml
name: Accessibility check

on: [push, pull_request]

jobs:
  a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx a11y-check src/
```

## Pre-commit hook (husky)

```bash
npm install --save-dev husky
npx husky init
echo "npx a11y-check src/" > .husky/pre-commit
```

## License

MIT
