#!/usr/bin/env python3
"""Mechanically check that this harness follows its own document conventions.

The framework insists on machine-checkable DoDs and then had no check of its
own. This is that check. It verifies five things that drifted silently before
it existed:

  1. every phase template carries the C-1 identity fields;
  2. every gate-signed template carries a C-2 version-history table;
  3. every schema id referenced anywhere has a template, and vice versa;
  4. every artefact-producing command cites the same schema version as the
     template it produces, and references the conventions;
  5. every `docs/ai-sdlc/...` path a command, agent or skill tells the reader
     to open actually exists -- either committed here, or written into the
     consuming repo by /harness-init.

Check 5 was added after an audit found eight dead paths at once, including
`review-checklist.md` and `security-checklist.md`: the Standard plugin's
`reviewer` and `security` agents both instruct "walk this file section by
section" for files that existed nowhere. Nothing caught it, because a
reference to a missing document fails silently -- the agent improvises and the
phase appears to pass.

Exit code 1 on any failure, so it can gate a commit.
"""
import re, sys, glob, os

TPL = 'docs/ai-sdlc/templates'

# Not phase artefacts: a PR body, a Jira ticket and a SKILL.md are formats,
# not versioned documents with an owner and a gate.
NOT_PHASE = {'jira-ticket.md', 'pull-request.md', 'skill.md'}

# C-2 applies to artefacts signed off at a gate. Pre-gate one-shot captures
# are superseded by the Discovery Report rather than revised, so they are
# exempt -- see C-2.
PRE_GATE_ONESHOT = {'idea-card.md', 'issue-report.md', 'problem-statement-canvas.md',
                    'market-scan.md', 'feasibility-assessment.md'}

ID_PATTERNS = {
    'Version': r'\*\*(Version|Phiên bản)\*\*|^version:',
    'Status':  r'\*\*(Status|Trạng thái)\*\*|^status:',
    'Owner':   r'\*\*(Owner|PM|Author|Designer|Raised by|Architect|Tác giả)\*\*|^owner:',
    'Date':    r'\*\*(Date|Ngày|Last reviewed)\*\*|^date:',
    'Sources': r'\*\*(Sources?|Nguồn)\*\*|^sources:',
}

fails = []

def body_of(text):
    """Return the outer ```markdown block, tolerating nested fences.

    A naive non-greedy match stops at the first ``` it meets -- which, in a
    template carrying an inline ```mermaid diagram, truncates the body and
    hides everything after it. That is how srs.md read as missing a version
    history it actually had.
    """
    lines = text.split('\n')
    try:
        start = next(i for i, l in enumerate(lines) if l.startswith('```markdown'))
    except StopIteration:
        return text
    depth = 0
    for i in range(start, len(lines)):
        if lines[i].startswith('```'):
            depth += 1 if i == start or not lines[i].strip() == '```' else -1
            if depth == 0:
                return '\n'.join(lines[start + 1:i])
    return '\n'.join(lines[start + 1:])

# --- 1 + 2 -----------------------------------------------------------------
for f in sorted(glob.glob(f'{TPL}/*.md')):
    name = os.path.basename(f)
    if name in NOT_PHASE:
        continue
    text = open(f).read()
    body = body_of(text)
    missing = [k for k, p in ID_PATTERNS.items()
               if not re.search(p, body, re.M)]
    if missing:
        fails.append(f'C-1  {name}: identity block missing {", ".join(missing)}')
    if name not in PRE_GATE_ONESHOT:
        if not re.search(r'(?i)version history|lịch sử phiên bản', body):
            fails.append(f'C-2  {name}: no version-history table '
                         f'(gate-signed artefacts need one)')

# --- 3 ---------------------------------------------------------------------
referenced = {}
for f in (glob.glob('docs/ai-sdlc/*.md') + glob.glob('plugin/vnd-ai-sdlc/commands/*.md')
          + glob.glob(f'{TPL}/*')):
    for m in re.finditer(r'vnd\.ai-sdlc\.([a-z-]+)/v(\d+)', open(f).read()):
        referenced.setdefault(m.group(1), set()).add(m.group(2))

present = {}
for f in glob.glob(f'{TPL}/*'):
    m = re.search(r'vnd\.ai-sdlc\.([a-z-]+)/v(\d+)', open(f).read())
    if m:
        present[m.group(1)] = m.group(2)

for slug in sorted(referenced):
    if slug in ('document-conventions',):
        continue
    if slug not in present:
        fails.append(f'REF  vnd.ai-sdlc.{slug} referenced but no template declares it')
for slug in sorted(present):
    if slug not in referenced:
        fails.append(f'REF  {slug} template exists but nothing references it')

# --- 4 ---------------------------------------------------------------------
for slug, versions in sorted(referenced.items()):
    if slug in present and len(versions) > 1:
        fails.append(f'VER  vnd.ai-sdlc.{slug} referenced at versions '
                     f'{sorted(versions)} — one of them is stale')

NOT_PHASE_SLUGS = {os.path.splitext(n)[0] for n in NOT_PHASE} | {'traceability'}
for f in sorted(glob.glob('plugin/vnd-ai-sdlc/commands/*.md')):
    text = open(f).read()
    produced = {m.group(1) for m in re.finditer(r'vnd\.ai-sdlc\.([a-z-]+)/v\d+', text)}
    # A command that only emits a PR body, a Jira ticket, a SKILL.md or the
    # manifest is not writing a phase document; C-1/C-2 do not apply to it.
    if produced - NOT_PHASE_SLUGS and 'document-conventions' not in text:
        fails.append(f'C-ref {os.path.basename(f)}: produces a phase artefact but '
                     f'never references document-conventions.md')

# --- 5 -----------------------------------------------------------------------
# A command that says "walk docs/ai-sdlc/x.md" when x.md exists nowhere does
# not error -- the agent improvises and the step reports success. So every
# referenced path must be satisfied one of two ways:
#   (a) committed in this repo, or
#   (b) written into the consuming repo by /harness-init, which declares the
#       files it writes as `- `docs/ai-sdlc/x`` bullets or `### `docs/ai-sdlc/x``
#       headings.
# Adding a reference therefore means committing the file or adding the bullet.
HARNESS_INIT = 'plugin/vnd-ai-sdlc/commands/harness-init.md'
_init = open(HARNESS_INIT).read() if os.path.exists(HARNESS_INIT) else ''
SCAFFOLDED = set(re.findall(r'^(?:\s*[-*]|#{2,4})\s+`docs/ai-sdlc/([^`]+)`', _init, re.M))

# A path the text builds at runtime (<slug>, <n>, <name>) is a pattern, not a
# file; only literal paths are checkable.
PLACEHOLDER = re.compile(r'[<>*]')

ref_sites = {}
for f in sorted(set(glob.glob('plugin/**/*.md', recursive=True)
                    + glob.glob('docs/ai-sdlc/*.md'))):
    if f.endswith(HARNESS_INIT.split('/')[-1]) and f == HARNESS_INIT:
        continue  # it declares the files; it does not consume them
    text = open(f).read()
    for m in re.finditer(r'docs/ai-sdlc/([A-Za-z0-9_./-]+\.(?:md|ya?ml|py))', text):
        p = m.group(1)
        if PLACEHOLDER.search(p):
            continue
        ref_sites.setdefault(p, set()).add(f)

for p in sorted(ref_sites):
    if os.path.exists(f'docs/ai-sdlc/{p}') or p in SCAFFOLDED:
        continue
    where = sorted(os.path.basename(x) for x in ref_sites[p])
    shown = ', '.join(where[:3]) + (f' +{len(where) - 3} more' if len(where) > 3 else '')
    fails.append(f'DEAD docs/ai-sdlc/{p}: referenced by {shown} but neither '
                 f'committed here nor scaffolded by /harness-init')

# --- report ----------------------------------------------------------------
if fails:
    print(f'{len(fails)} convention failure(s):\n')
    for x in fails:
        print('  ' + x)
    sys.exit(1)
print('All document conventions hold.')
