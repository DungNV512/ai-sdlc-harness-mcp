# Security checklist — Phase 6

`/security-review` and the `security` agent walk this file end to end. It is
framework-agnostic; projects append their own rows at the bottom.

Phase 6 is not a second code review. It asks one question the review does not:
**what does this diff newly expose, and to whom?**

**Output** — a STRIDE table with a residual risk per row:

| Component | Threat (STRIDE) | Actor | Attack | Mitigation | Residual |
|---|---|---|---|---|---|

**Phase 6 does not pass** while a `high` residual risk has no named follow-up
with an owner. "Accepted" is a valid outcome — **accepted by nobody** is not.

Where Stage C produced a threat model, start from it and check only what the
diff changes. Where it did not, this checklist is the whole assessment.

---

## 1 · Secrets — in the diff *and* in the history

- [ ] No credential, token, key, connection string or certificate in the diff.
- [ ] **No credential anywhere in the branch's history**, including commits
      later reverted. A secret removed in the working tree but still reachable
      in an earlier commit is still leaked, and this is the row that gets
      skipped: a real audit of `dchat` found `.env.prod`, `.env.uat` and
      `.env.production` across nine to eleven commits each, with live values.
- [ ] `.env`-shaped files are git-ignored, and the ignore rule predates any
      file it is meant to cover.
- [ ] Secrets come from the environment or a secret store at runtime, never
      from a checked-in default.
- [ ] If a secret was ever committed, it is **rotated**, not just deleted.
      Deletion changes nothing for anyone who already cloned.

## 2 · Authentication and authorisation

- [ ] Every new endpoint, route or handler states who may call it.
- [ ] Authorisation is checked **server-side**, on every request, not inferred
      from what the client was shown.
- [ ] Object-level access is checked, not only route-level: being allowed to
      call `GET /orders/{id}` is not being allowed to read *that* order.
- [ ] Where the SRS defines a permissions matrix, the code matches it cell for
      cell, including the data-scope column.
- [ ] Nothing fails open. An authorisation check that errors denies.

## 3 · Input handling

- [ ] Every input crossing a trust boundary is validated where it enters, and
      the review can name that line.
- [ ] Validation is allow-list shaped wherever the value space is known.
- [ ] Queries are parameterised; no string-built SQL, no string-built shell.
- [ ] Untrusted content is escaped at the point of rendering, and any raw-HTML
      sink in the diff is justified in writing.
- [ ] Deserialisation of untrusted input does not instantiate arbitrary types.
- [ ] Size and rate limits exist on anything an outsider can call repeatedly.

## 4 · Data handling and privacy

- [ ] Any new field holding personal data is identified as such, and its
      retention is stated. Where Stage C ran, both belong in the SRS entity
      register.
- [ ] Personal data does not reach logs, traces, crash reports or analytics.
- [ ] URLs and query strings carry no personal or sensitive values — they land
      in server logs, browser history and referrer headers.
- [ ] Data at rest that needs encryption has it, and the decision is recorded
      either way.
- [ ] Deletion means deletion, including derived copies and caches.

## 5 · Session and token handling

- [ ] Tokens are stored where script running on the page cannot read them
      unless the design explicitly accepts that risk in writing.
- [ ] Cookies carrying identity set `Secure`, `HttpOnly` and an explicit
      `SameSite`. The `dchat` audit found a token cookie with
      `{ expires: 7, path: "/" }` and none of the three — a `block`, and the
      kind that is trivially missed because the code reads as ordinary.
- [ ] Token lifetimes are bounded; refresh rotates rather than extends
      indefinitely.
- [ ] Logout invalidates server-side, not only client-side.

## 6 · Dependencies and supply chain

- [ ] New dependencies are named in the PR body with a reason.
- [ ] Each new dependency is pinned, and its source is the ecosystem's real
      registry.
- [ ] The project's audit command has been run over the new set, and its
      output is quoted — or reported as "did not run", with why.
- [ ] No dependency was added to obtain a function the standard library
      already provides.

## 7 · Transport and configuration

- [ ] All external calls are TLS, with verification **on**. A disabled
      certificate check is a `block` regardless of the reason given.
- [ ] No debug flag, verbose logger or permissive CORS rule reaches
      production configuration.
- [ ] Error responses to outsiders carry no stack trace, no internal
      hostname, no version string.
- [ ] New infrastructure defaults to closed and is opened deliberately.

## 8 · The STRIDE pass

For each component the diff touches, ask all six and record the ones that
apply:

| | Question |
|---|---|
| **S**poofing | Can someone claim to be someone else here? |
| **T**ampering | Can data be modified in transit or at rest? |
| **R**epudiation | Can an actor deny having done this, with no evidence to the contrary? |
| **I**nformation disclosure | Can someone read what they should not? |
| **D**enial of service | Can someone make this unavailable cheaply? |
| **E**levation of privilege | Can someone gain rights they were not granted? |

A component with no applicable threat is recorded as `Không có` — explicitly,
so the reader can tell it was considered rather than skipped.

---

## Project-specific rows

Projects append their own checks below this line — platform-specific storage
rules, certificate pinning, deep-link validation and the like belong here
rather than in the framework-agnostic sections above.

`Không có` where a project has added none.
