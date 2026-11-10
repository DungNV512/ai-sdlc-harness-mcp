---
title: EmptyState — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# EmptyState

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `EmptyStateIcon`, `EmptyStateActionButton`, `EmptyState`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `size` | `large` · `small` |

`EmptyState` props:

| Prop | Type |
|---|---|
| `title` | `string` |
| `description` | `boolean \| string` |
| `descriptionText` | `string` |
| `icon` | `boolean` |
| `actions` | `boolean` |
| `primaryButton` | `boolean` |
| `secondaryButton` | `boolean` |
| `action` | `ReactNode` |

Figma → API: Figma Size maps to `size`; title, description, illustration, and action are slots. `action`/children are caller supplied and this package does not compose Button.
