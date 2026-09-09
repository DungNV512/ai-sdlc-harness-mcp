---
description: Scaffold a new AI-SDLC skill in the right plugin, on its own branch, ready to write. Step 1 of the skill lifecycle (new -> submit -> approve -> sync).
argument-hint: <skill-name> [--plugin=standard|stockbook]
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# /skill-new $ARGUMENTS

Step 1 of 4 in the skill lifecycle. Creates the file and the branch; you
write the content; `/skill-submit` opens the PR.

## Where the work happens

These commands edit a **clone of the marketplace repo**, not the installed
plugin. The installed copy under `~/.claude/plugins/cache/...` is a
read-only artifact of an install -- editing it changes nothing for anyone
and is overwritten on the next update.

Resolve the checkout in this order, and **stop and ask** if none apply:

1. `$AI_SDLC_HARNESS_REPO`, if set.
2. The current working directory, if `plugin/.claude-plugin/marketplace.json`
   exists at its root.
3. Otherwise: tell the user to
   `git clone https://github.com/DungNV512/ai-sdlc-harness-mcp.git` and either
   `cd` into it or export `AI_SDLC_HARNESS_REPO` to point at it.

## Steps

1. Validate `<skill-name>`: lowercase kebab-case, no spaces, not already
   present under `plugin/vnd-ai-sdlc/skills/` or
   `plugin/vnd-ai-sdlc-stockbook/skills/`. A name collision across the two
   plugins is a real problem -- the loader resolves a name to whichever
   plugin was installed last, so the same name in both silently shadows one.
2. Decide the target plugin. `--plugin=` wins if passed. If not passed, ASK
   the user -- do not guess:
   - **`vnd-ai-sdlc`** (Standard) if the skill would work unchanged on any
     project regardless of language, framework, or git host.
   - **`vnd-ai-sdlc-stockbook`** (Overlay) if it names Flutter/Dart/BLoC,
     mobile release tooling, GitLab/`glab`, or Stockbook's own docs and
     paths.
   When unsure, prefer the overlay: a too-specific skill in Standard breaks
   other teams, while a general skill sitting in the overlay only costs
   Stockbook a later move.
3. `git fetch origin && git checkout -b skill/<skill-name> origin/main` in
   that checkout. Refuse to work on `main` directly.
4. Create `plugin/<target>/skills/<skill-name>/SKILL.md`:

   ```markdown
   ---
   name: <skill-name>
   description: <ONE sentence: what this does AND when Claude should reach
     for it. Include the words a user would actually say. This string is the
     entire matching surface -- a vague description means the skill never
     fires.>
   ---

   # <skill-name>

   <What this skill is for, in a sentence or two.>

   ## Steps

   1. ...

   ## Anti-patterns to refuse

   - ...
   ```

5. Print the path, the branch name, and the quality bar the reviewer will
   apply (see `/skill-approve`'s checklist -- read it now, not after the PR
   comes back with comments).
6. **Stop.** Do not commit, do not push, do not bump any version. Writing
   the content is the user's job; `/skill-submit` does the rest.

## Anti-patterns to refuse

- Scaffolding into the installed plugin cache instead of a real checkout.
- Guessing the target plugin when the user did not say and the content
  does not obviously decide it.
- Committing on `main`.
- Writing a placeholder `description:` and leaving it -- that field is the
  whole reason a skill ever gets used.
