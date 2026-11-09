---
title: Field — @vnd/ds-one 0.0.2 API
category: components
status: generated
---

# Field

Generated from @vnd/ds-one 0.0.2 and the library's Figma specs. Do not edit by hand. Index and how to read: [../index.md](../index.md).

Exports: `Field`, `FieldLabel`, `FieldDescription`, `InputGroup`, `InputGroupAddon`, `InputGroupInput`, `Input`, `Textarea`, `NumberStepper`, `NumberSpinner`, `ChipInput`, `VerificationCode`, `AmountInput`, `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`

Figma: set `1554:3094`

Usage rules: not documented yet. Apply [component-patterns.md](../../guidelines/component-patterns.md); leave a `TODO` for design decisions.

| Axis | Values |
|---|---|
| `type` | `Chip` · `Input` · `Number stepper` · `Verification code` |
| `size` | `Compact` · `Standard` · `Large` |
| `state` | `Disabled` · `Error` · `Filled` · `Filling` · `Focused` · `Placeholder` · `Success` |

`Field` props:

| Prop | Type |
|---|---|
| `size` | `large` \| `standard` \| `compact` |
| `radius` | `default` \| `full` |
| `type` | `input` \| `number-stepper` \| `number-spinner` \| `verification-code` \| `chip` |
| `disabled` | `boolean` |

Figma → API: Type=Input → Input; Type=Chip → ChipInput; Type=Number stepper → NumberStepper; Type=Verification code → VerificationCode. State=Error → invalid/isError (aria-invalid), Disabled → native disabled, Focused → :focus-visible, Placeholder/Filled → native placeholder/value, Success → FieldDescription tone=success. Select dùng Radix và Textarea là các control bổ sung theo tiền lệ Stockbook, không phải Type của set Field này. readOnly dùng thuộc tính HTML readOnly vì Figma không có state tương ứng.
