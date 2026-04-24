# a11y-check

Static accessibility analyzer for React JSX/TSX files. Catches WCAG violations at the source level no browser, no runtime, no DOM required.

## Why

Tools like axe-core run in the browser against a rendered page. They miss components that aren't tested, routes that aren't visited, and code that isn't deployed yet. `a11y-check` runs on raw source files so developers get feedback at the earliest possible point in CI, as a pre-commit hook, or locally before opening a PR.

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

Exit code is `1` when errors are found, `0` when clean safe to use in CI scripts.

## Rules

`a11y-check` covers the full set of WCAG 2.1 Level A rules that are statically detectable in JSX/TSX. Level AA rules are in active development.

### Level A — complete coverage

| Rule | WCAG | What it catches |
|---|---|---|
| `alt-text` | 1.1.1 | `<img>` missing `alt` or with bare `alt` (no value) |
| `video-captions` | 1.2.2 | `<video>` with no `<track kind="captions">` child |
| `heading-order` | 1.3.1 | Heading levels that skip (e.g. `<h1>` followed by `<h3>`) |
| `input-label` | 1.3.1 | `<input>` with no `aria-label`, `aria-labelledby`, or linked `id` |
| `select-label` | 1.3.1 | `<select>` with no `aria-label`, `aria-labelledby`, or linked `id` |
| `textarea-label` | 1.3.1 | `<textarea>` with no `aria-label`, `aria-labelledby`, or linked `id` |
| `table-captions` | 1.3.1 | `<table>` with no `<caption>`, `aria-label`, or `aria-labelledby` |
| `table-headers` | 1.3.1 | `<table>` with data cells (`<td>`) but no header cells (`<th>`) |
| `autoplay-media` | 1.4.2 | `<video>` or `<audio>` with `autoPlay` but no `muted` |
| `interactive-role` | 2.1.1 | Non-interactive elements (`div`, `span`, etc.) with `onClick` but no `role`, keyboard handler, or `tabIndex` |
| `iframe-title` | 2.4.1 | `<iframe>` missing `title` or with an empty one |
| `tab-index` | 2.4.3 | `tabIndex` values greater than `0`, which override natural tab order |
| `link-text` | 2.4.4 | `<a>` with empty text or non-descriptive text ("click here", "read more") |
| `link-href` | 2.4.4 | `<a>` with no `href`, empty `href`, or `href="#"` |
| `lang-attribute` | 3.1.1 | `<html>` without a `lang` attribute or with an empty one |
| `duplicate-id` | 4.1.1 | Multiple elements sharing the same static `id` value |
| `button-label` | 4.1.2 | `<button>` with no text, no `aria-label`, or only an unlabelled icon |
| `aria-valid-attr` | 4.1.2 | `aria-*` attributes not in the ARIA specification |
| `aria-hidden-focus` | 4.1.2 | Focusable elements (`<button>`, `<input>`, `<a>`, etc.) with `aria-hidden="true"` |

### Level AA — coming soon

Level AA rules (WCAG 1.4.3 colour contrast hints, 1.4.4 text resize, 2.4.6 headings and labels, 2.5.3 label-in-name, and others) are planned for the next release.

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

## CI  GitHub Actions

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
