---
title: Pagination — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Pagination

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Pagination`

Figma: page `919:2` · set `927:557`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `variant` | `Page numbers` |

`Pagination` props:

| Prop | Type |
|---|---|
| `type` | `Page numbers` \| `Minimal` \| `Full` \| `page-numbers` |
| `background` | `None` \| `Base` \| `Canvas` \| `Surface` |
| `pageLabel` | `string` |
| `results` | `string` |
| `rowsPerPage` | `boolean` |
| `currentPage` | `number` |
| `defaultPage` | `number` |
| `pageCount` | `number` |
| `previousLabel` | `string` |
| `nextLabel` | `string` |
| `onPageChange` | `function` |

Figma → API: Figma Type=Page numbers maps to Pagination. Page and navigation labels come from the consumer; currentPage is visual state and onPageChange is called without sorting or data work. See Pagination.mdx.
