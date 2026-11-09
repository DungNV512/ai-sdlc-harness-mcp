---
title: Uploader — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Uploader

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Dropzone`, `UploadFileItem`, `Uploader`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `State` | `Default` · `Hover` · `Disabled` · `Error` |
| `Status` | `Uploading` · `Complete` · `Error` |

`Uploader` props:

| Prop | Type |
|---|---|
| `size` | `Desktop` \| `Mobile` |
| `label` | `string` |
| `required` | `boolean` |
| `helperText` | `string` |
| `fileList` | `boolean` |
| `header` | `boolean` |
| `helper` | `boolean` |

Figma → API: Dropzone State=Hover maps to the native hover/drag-over state, State=Disabled maps to `disabled`, and State=Error maps to `error`. Item Status=Complete maps to `status='success'`; Uploading and Error keep their names. `accept` and `maxSize` are consumer supplied, and selected files are returned through `onFilesSelected` without uploading. An optional `onFilesRejected` reports files that fail either constraint.
