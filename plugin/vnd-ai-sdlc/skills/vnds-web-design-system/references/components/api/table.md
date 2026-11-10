---
title: Table — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Table

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `TableExpandToggle`, `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableCaption`, `TableHead`, `TableCell`, `TableCellText`, `TableRow`, `TableExpandedRow`, `TableSummaryRow`, `TableGroupHeader`, `TableToolbar`, `TableFilterGroup`, `TableBulkActionGroup`, `TableActionGroup`, `TableExtraRows`, `TableSearchField`, `TableBulkActions`

Figma: page `919:2` · set `1727:6598`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `style` | `Listing` |
| `headerSize` | `Small` |
| `align` | `Left` · `Right` |
| `sort` | `Ascending` · `Descending` · `None` |
| `expanded` | `Table` |
| `rowSize` | `Small` |
| `state` | `Default` · `Disabled` · `Hover` |
| `cellType` | `Action CTA` · `Actions` · `Avatar + text` · `Badge` · `Button` · `Icon button` · `Input` · `Number` · `Select` · `Text + supporting` · `Text + tag` · `Text` |
| `toolbarType` | `Filters` |

`Table` props:

| Prop | Type |
|---|---|
| `toolbar` | `ReactNode` |
| `bulkActions` | `ReactNode` |
| `pagination` | `ReactNode` |
| `size` | `Compact` \| `Regular` \| `Prominent` \| `sm` \| `md` \| `lg` |
| `layout` | `Listing` \| `Grouped` \| `Expandable` |
| `showToolbar` | `boolean` |
| `showBulkActions` | `boolean` |
| `showPagination` | `boolean` |
| `showSummaryRow` | `boolean` |
| `summaryRow` | `ReactNode` |

Figma → API: Figma Style=Listing maps to composable Table primitives. Figma Size=Small maps to the selected token-backed row/header treatment (no size prop); Align maps to TableHead.align; Sort maps to the display-only TableHead.sort state and onSortChange callback (the consumer owns sorting). Cell Type maps to children composed from existing Checkbox, Button, Badge/Tag, Avatar and Field components; Type=Number maps to TableCell.numeric. Row Expanded maps to TableExpandToggle, TableExpandedRow, TableGroupHeader and TableSummaryRow composition. Toolbar Type=Filters maps to TableToolbar.variant=filters. These aliases are described in Table.mdx.
