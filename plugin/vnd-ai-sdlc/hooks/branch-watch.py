#!/usr/bin/env python3
"""branch-watch.py -- notify when a watched remote branch has moved.

Wired as both a Stop and SessionStart hook in .claude/settings.json (task
#11). Watches `origin/<BRANCH_WATCH_BRANCH or dev>` so nobody keeps
building on a stale base without knowing the remote moved.

FAIL-SILENT CONTRACT -- this ships to the whole team via committed
settings.json and runs at the end of every turn and the start of every
session. Every failure path (no network, VPN down, detached HEAD, missing
origin, deleted remote branch, corrupt state file, git hangs) MUST exit 0
with no output. A hook that blocks or errors for someone offline is worse
than no hook at all. To keep that contract airtight even under a bug in
this script, the whole body runs under one top-level try/except and only
ever prints a fully-built message at the very end -- never partial output
mid-failure.

NOTIFY-ON-CHANGE, NOT ON STATE -- the hook persists the last remote SHA it
already told the user about (`last_notified_sha` in the state file). It
only speaks up when the current remote SHA differs from that. Repeating
"you are N commits behind" on every turn trains the reader to stop
reading it -- at which point it is actively worse than silence.

NO timeout/gtimeout ON THIS MACHINE -- every git subprocess call is
bounded by Python's own subprocess timeout instead (see GIT_TIMEOUT
below), never by an external timeout binary.
"""
import json
import os
import subprocess
import sys
import time

BRANCH = os.environ.get("BRANCH_WATCH_BRANCH", "dev")
THROTTLE_SECONDS = 5 * 60
GIT_TIMEOUT = 10  # seconds -- the only bound on any git call; no timeout/gtimeout exists here.
STATE_FILENAME = "branch-watch-state.json"


def _resolve_repo():
    """Resolve this script's OWN repo root + .git dir -- never the caller's cwd.

    stockbookapp is nested inside a second, independent git repo (the
    mother repo). A hook invoked with the wrong cwd could silently end up
    watching the mother repo's `dev` branch instead, and because every
    failure path here is silent by design, nobody would notice. Guard
    against that explicitly:

    1. Anchor entirely on this script's own on-disk path (`.claude/hooks/
       branch-watch.py`), never on os.getcwd() -- `git -C <path>` pins the
       repo regardless of what cwd the hook happens to be invoked from.
    2. Ask git for BOTH --git-dir and --show-toplevel from that anchor,
       and verify --show-toplevel resolves to the same directory this
       script lives under. If a symlink, submodule quirk, or nested-repo
       mixup ever made git resolve to a different toplevel, this check
       fails closed (returns None -> silent no-op) instead of watching
       the wrong repository.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    expected_root = os.path.dirname(os.path.dirname(script_dir))  # .claude/hooks -> repo root

    result = subprocess.run(
        ["git", "-C", expected_root, "rev-parse", "--git-dir", "--show-toplevel"],
        capture_output=True, text=True, timeout=GIT_TIMEOUT,
    )
    if result.returncode != 0:
        return None

    lines = result.stdout.strip().splitlines()
    if len(lines) != 2:
        return None
    git_dir_raw, toplevel = lines

    if os.path.realpath(toplevel) != os.path.realpath(expected_root):
        return None  # resolved to a different repo than this script lives in -- refuse.

    git_dir_abs = git_dir_raw if os.path.isabs(git_dir_raw) else os.path.join(toplevel, git_dir_raw)
    return toplevel, git_dir_abs


def _load_state(state_path):
    if not os.path.exists(state_path):
        return {}
    try:
        with open(state_path) as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError, ValueError):
        return {}  # corrupt state file -- treat as fresh, never crash on it.


def _save_state(state_path, state):
    try:
        with open(state_path, "w") as f:
            json.dump(state, f)
    except OSError:
        pass  # can't persist -- next run just re-checks; never fatal.


def _git(repo_root, *args, env=None):
    return subprocess.run(
        ["git", "-C", repo_root, *args],
        capture_output=True, text=True, timeout=GIT_TIMEOUT, env=env,
    )


def _build_message(repo_root, env, old_sha, new_sha):
    """Best-effort commit count + short log between old_sha and new_sha.

    Best-effort: if old_sha's object isn't available locally (e.g. a
    force-push rewrote history), fall back to a plain "moved to <sha>"
    line rather than failing the whole notification.
    """
    branch_label = BRANCH
    try:
        count = _git(repo_root, "rev-list", "--count", f"{old_sha}..{new_sha}", env=env)
        log = _git(repo_root, "log", f"--format=%h %an %ar %s", f"{old_sha}..{new_sha}", env=env)
        if count.returncode == 0 and log.returncode == 0:
            n = count.stdout.strip()
            lines = log.stdout.strip("\n")
            return (
                f"origin/{branch_label} moved: {n} new commit(s).\n{lines}"
            )
    except (subprocess.TimeoutExpired, OSError):
        pass
    return f"origin/{branch_label} moved to {new_sha[:7]} (previously {old_sha[:7]})."


def _run():
    resolved = _resolve_repo()
    if resolved is None:
        return None
    repo_root, git_dir = resolved

    state_path = os.path.join(git_dir, STATE_FILENAME)
    state = _load_state(state_path)

    now = time.time()
    last_check = state.get("last_check_ts", 0)
    if not isinstance(last_check, (int, float)):
        last_check = 0
    if now - last_check < THROTTLE_SECONDS:
        return None  # throttled -- no network call at all.

    env = dict(os.environ)
    env["GIT_TERMINAL_PROMPT"] = "0"

    try:
        ls = _git(repo_root, "ls-remote", "--heads", "origin", BRANCH, env=env)
    except (subprocess.TimeoutExpired, OSError):
        return None  # network/VPN down, git missing, etc. -- silent.

    state["last_check_ts"] = now

    if ls.returncode != 0 or not ls.stdout.strip():
        _save_state(state_path, state)  # remote unreachable / branch deleted -- silent.
        return None

    remote_sha = ls.stdout.split()[0]
    last_notified_sha = state.get("last_notified_sha")

    if last_notified_sha is None:
        # First time we've ever seen this branch from this clone -- there is
        # no prior baseline to have "changed" from, so establish one
        # silently rather than notifying (that would fire on every fresh
        # clone/worktree, which is exactly the wallpaper this hook must
        # avoid). Subsequent runs compare against this baseline.
        state["last_notified_sha"] = remote_sha
        _save_state(state_path, state)
        return None

    if remote_sha == last_notified_sha:
        _save_state(state_path, state)
        return None

    try:
        fetch = _git(repo_root, "fetch", "origin", BRANCH, env=env)
    except (subprocess.TimeoutExpired, OSError):
        _save_state(state_path, state)
        return None

    if fetch.returncode != 0:
        _save_state(state_path, state)
        return None

    message = _build_message(repo_root, env, last_notified_sha, remote_sha)
    state["last_notified_sha"] = remote_sha
    _save_state(state_path, state)
    return message


def main():
    try:
        message = _run()
    except Exception:
        # Final defensive net -- ANY unexpected exception must still exit 0
        # with no output, never a stack trace or a hung process.
        message = None

    if message:
        print(json.dumps({"systemMessage": message}))
    sys.exit(0)


if __name__ == "__main__":
    main()
