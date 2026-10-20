---
name: branch-access-lifecycle
version: "1.0.0"
user-invocable: true
description: "Use when setting or checking who can push or merge release/*, an exact release branch, or main/master — whitelist the active release, freeze a finished release, set trunk protection, or roll a release branch back to a chosen commit. Also use when git-release-start or git-release-finish finds an enabled branch-access.json. Triggers — 「分支权限」「保护分支」「冻结 release」「release 白名单」「回退保护分支」 / branch protection, freeze release branch, release whitelist, protected branch permission. Do NOT use for creating the release branch, tagging and merging the release, or merging an ordinary change."
---

# Branch Access Lifecycle

## Overview

Keep one active `release/X.Y.Z` mergeable, keep every other release branch closed, and keep trunk push closed. GitLab and GitHub combine overlapping rules differently, so the host procedure lives in one reference file. Read that file before any API call.

**Pairing**: `git-release-start` calls `ensure-default` then `allow-merge` after it creates the remote branch. `git-release-finish` calls `check-trunk` while fingerprinting and `freeze` only after the tag and the trunk merge have both succeeded. Neither release skill calls `rollback`.

## Use when / Do not use for

**Use when**:

- The user asks to freeze a release branch, open one release branch for merge, set `main` or `master` protection, or roll a release branch back to an older commit
- `git-release-start` or `git-release-finish` finds `<repo-root>/branch-access.json` with `"enabled": true`

**Do not use for**:

- Creating the release branch (`git-release-start`)
- Tagging and merging the release into trunk (`git-release-finish`)
- Deciding whether an ordinary merge request may land (`merge-discipline`)

## Opt-in marker

Path: `<repo-root>/branch-access.json`.

```json
{
  "enabled": true,
  "trunk": "main"
}
```

| Field | Meaning |
|-------|---------|
| `enabled` | JSON `true` opts the repo in. Missing file, `false`, or invalid JSON means the release skills do not touch protection |
| `trunk` | Optional. When set, trunk checks use this branch. When omitted, the caller passes the trunk it already identified |

A direct invocation from the user does not require the marker. The two release skills require it. When the marker is present and this skill is not available to the release skill, that run stops and prints:

```bash
npx skills add FuDesign2008/open-skills -g --skill branch-access-lifecycle --yes
```

## Detect the host

From the repo's `origin` URL, choose one reference and do not mix procedures:

| Origin | Reference |
|--------|-----------|
| GitLab host | [references/gitlab.md](references/gitlab.md) |
| GitHub host | [references/github.md](references/github.md) |
| Anything else | Stop. Say this skill covers GitLab and GitHub only |

## Operations

Run the matching section in the host reference. After every write, verify with that file's permission check. `merge_status`, `mergeable`, and `mergeable_state` are not the verdict.

| Operation | Effect |
|-----------|--------|
| `ensure-default` | Unmatched `release/*` branches deny push and deny merge. Leave an existing default that already does this unchanged. List every exact rule that still allows merge |
| `allow-merge <branch>` | That exact branch denies push and allows maintainer merge. Other allow entries stay |
| `freeze <branch>` | Remove only that branch's allow entry. If a wider rule still allows merge, report the branch as not frozen and name the rule |
| `check-trunk [name]` | Compare trunk with "push denied, maintainer merge allowed". Report a mismatch. Do not write |
| `rollback <branch> <sha>` | Only when the user invoked this operation and confirmed the sha and the force-push. Backup, move the branch, restore the frozen policy |

Order for a new release: `ensure-default`, then `allow-merge`. `freeze` runs only after the tag exists and the trunk merge has succeeded.

Trunk writes happen only when the user asks this skill to set trunk policy. Use the same push-denied, maintainer-merge policy. Release skills never issue that write.

## Report

Print this after every operation:

```text
branch: <name>
operation: <ensure-default|allow-merge|freeze|check-trunk|rollback|set-trunk>
push: denied | allowed
merge: denied | maintainers
evidence: <permission field or rule computation>
observed-mr: <iid or none>
still-open: <exact branches that remain mergeable, or none>
blocked-layer: <group or organization rule the caller cannot edit, or none>
```

When `blocked-layer` is set, stop. Do not claim the branch is frozen or whitelisted.

## Examples

Input: "冻结 release/1.2.3"

Output: `freeze release/1.2.3`, then the report. On GitLab this deletes the exact allow rule and leaves `release/*` denying merge. On GitHub this removes the exception for that branch on every layer that targets it.
