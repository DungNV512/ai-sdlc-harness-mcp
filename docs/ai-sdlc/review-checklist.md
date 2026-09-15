# Review checklist — Phase 5

`/review` and the `reviewer` agent walk this file section by section against
every changed file. It is framework-agnostic on purpose: a project adds its
own rows at the bottom rather than editing these.

**How to use it.** One pass per section, not one pass per file. Reading the
whole diff for correctness, then again for tests, finds different things than
reading each file once and asking all the questions at once.

**Severity.** Every finding carries one, and the word is doing real work:

| Severity | Meaning | Effect on Phase 5 |
|---|---|---|
| `block` | Wrong behaviour, data loss, or a security hole | **Phase 5 does not pass** |
| `major` | Right behaviour, but a maintenance or correctness trap | **Phase 5 does not pass** |
| `minor` | Worth fixing, does not have to be now | Recorded, may pass |
| `note` | Observation, no action implied | Recorded |

**Every finding cites `file:line`.** A finding with no location is an opinion,
and the author cannot act on it.

**A check that did not run is reported as "did not run"** — never as passed.
This is the framework-wide rule and it is where reviews most often lie by
omission.

---

## 1 · Correctness against the spec

- [ ] Every requirement id in `spec.md` has code that implements it, or the
      manifest records why it was dropped.
- [ ] Behaviour matches the spec **including its error cases**, not only the
      happy path the spec spends most of its words on.
- [ ] Boundary values behave: empty, zero, one, maximum, and one past it.
- [ ] Nothing in the diff implements a requirement that is **not** in the
      spec. Unrequested behaviour is scope creep that arrived through code
      instead of through the PRD, and it is invisible to the B2 trace check.

## 2 · Failure and edge behaviour

- [ ] Every external call has a defined behaviour on timeout, on a 4xx, and on
      a 5xx — and they are not the same behaviour.
- [ ] Retries, if any, are bounded, and **4xx is not retried**. Retrying our
      own bad request is a way to turn one failure into several.
- [ ] Errors surface a message the caller can act on; none is swallowed into a
      generic catch that discards the cause.
- [ ] Nothing fails open. A check that cannot run denies rather than allows.
- [ ] Concurrency: if two of these run at once, the outcome is still correct —
      or the code makes that impossible.

## 3 · Tests

- [ ] Every new behaviour has a test that **fails without the change**. Run it
      against the parent commit if there is any doubt.
- [ ] Tests assert on behaviour, not on implementation detail that will churn.
- [ ] Failure paths are tested, not just success paths.
- [ ] No test was weakened to make the diff pass — check the diff for changed
      assertions, loosened matchers, and new skips.
- [ ] Coverage meets the threshold in `test-strategy.md` where Stage C ran;
      where it did not, the project's own threshold applies.

## 4 · Readability and structure

- [ ] A reader who was not in the conversation can follow the change.
- [ ] Names say what the thing is; nothing is named for how it is currently
      implemented.
- [ ] No dead code, no commented-out blocks, no debug output left behind.
- [ ] Comments explain **why**, not what. A comment restating the line below
      is maintenance debt.
- [ ] Layer boundaries hold: nothing reaches past the layer it belongs to.

## 5 · Change size and blast radius

- [ ] Only files the manifest declares are touched, or the manifest was
      updated to say why.
- [ ] Unrelated formatting churn is out. It hides the real change from
      reviewers and from `git blame`.
- [ ] Public API changes are called out explicitly in the PR body, with the
      callers checked.
- [ ] A migration, if any, is reversible — or the PR says plainly that it is
      not.

## 6 · Documentation and traceability

- [ ] The manifest's task ids reflect what actually shipped.
- [ ] Anything that changes how the system is operated reaches the docs, not
      only the PR description.
- [ ] If a decision was made that a future reader would question, there is an
      ADR — or a `note` finding saying there should be.

---

## Project-specific rows

Projects append their own checks below this line. Keep them specific and
mechanical; a row that cannot be answered yes or no will be skipped in
practice.

`Không có` where a project has added none.
