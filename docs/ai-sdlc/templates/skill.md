# SKILL.md template

`schema: vnd.ai-sdlc.skill/v1`

A skill is loaded by its `description` and nothing else. Everything below the
frontmatter is only read *after* the skill has already fired, so the
description is not documentation — it is the entire matching surface.

```markdown
---
name: <skill-name>
description: <ONE sentence containing BOTH what this does AND the situations
  that should trigger it, in the words a user would actually type. A vague
  description means the skill never fires, and a skill that never fires is
  indistinguishable from one that was never written.>
---

# <skill-name>

<One or two sentences: what this is for.>

## When to use this

- <A concrete situation, phrased the way it actually shows up.>

## When NOT to use this

- <The neighbouring skill or command this is most likely to be confused
  with, and which one wins. Required: skills that overlap silently shadow
  each other, and the loader resolves to whichever plugin installed last.>

## Steps

1. <Ordered, specific enough to follow without re-deriving them.>

## Anti-patterns to refuse

- <What this skill must NOT do, especially the plausible-looking shortcut.>
```

## Which plugin does it belong in

| Put it in | When |
|---|---|
| `vnd-ai-sdlc` (Standard) | It works unchanged in a repo that is not Stockbook and not Flutter — it names no framework, no language toolchain, and no company-specific host |
| `vnd-ai-sdlc-stockbook` (overlay) | It names Flutter/Dart, a specific package layout, GitLab, or a specific product's structure |

The test is not "does the word Flutter appear". It is "would this still be
correct in a Vite/React repo". Structural assumptions count: a skill that
expects `modules/` or `lib/` is an overlay skill even if it never says
"Flutter". This exact mistake shipped once already and needed `/harness-init`
to undo.

## Before submitting

- The name is not already used in **either** plugin.
- Frontmatter `name` matches the directory name.
- The plugin's `version` in `.claude-plugin/plugin.json` is bumped, and the
  new value is higher than what is on `main` **right now** — not merely
  higher than the branch's base. See `/skill-approve`.
- `claude plugin validate plugin/<target>` passes.
- No secrets, no absolute paths from your machine, no customer data.
