# GitLab branch access

Read this file only when `origin` is GitLab. Placeholders: `<path>` is the URL-encoded project path (`glab` accepts `:fullpath` inside the repo). `<branch>` is the exact branch name. Encode `/` as `%2F` and `*` as `%2A` inside URL paths.

Access levels: `0` is no one, `40` is Maintainer. A role grants that role and every higher role.

## Read rules

```bash
glab api "projects/:fullpath/protected_branches"
glab api "version"
```

Also request the group's protected branches when the project belongs to a group (`GET groups/<group-id>/protected_branches`). A 404 means this server has no group endpoint; record that and continue with project rules. A 403 means the group layer cannot be read; set `blocked-layer` and stop.

A branch's effective push, merge, and force-push values are the most permissive matching rule. Exact names do not beat wildcards. Group rules and project rules are one pool. Code-owner approval is the exception and uses the strictest rule; this skill does not change that flag. Copy `code_owner_approval_required` from the existing rule onto any replacement so the write does not drop it.

## ensure-default

Target pattern: `release/*`.

Desired rule: `push_access_level=0`, `merge_access_level=0`, `allow_force_push=false`.

If the effective policy for a release branch with no exact allow rule is already that, do nothing else in this operation. List exact rules whose merge level is above `0`.

If `release/*` is missing or still allows merge, write the desired rule with the update procedure below.

## allow-merge

Create or update an exact rule for `<branch>`: `push_access_level=0`, `merge_access_level=40`, `allow_force_push=false`.

Do not delete other exact rules. Run `ensure-default` first when the caller is `git-release-start`.

## freeze

Delete only the exact protected-branch rule named `<branch>`.

```bash
glab api --method DELETE "projects/:fullpath/protected_branches/<url-encoded-branch>"
```

If no exact rule exists, the branch already follows `release/*`. Recompute the effective merge level. When it is still above `0`, report the branch as not frozen and name the rule that allows merge. Do not delete that other rule.

## check-trunk

Read the rule for the trunk name (`main` or `master`). Expected: push `0`, merge `40`, force-push off. Print a mismatch. Do not write.

## set-trunk

Same expected rule as `check-trunk`. Write it only when the user asked this skill to set trunk policy.

## rollback

Run only after the user confirms `<sha>` and the force-push.

1. `git branch backup/<branch>-<short-sha> <current-tip>` and push that backup branch. It must not match `release/*`.
2. Temporarily set the exact rule to `push_access_level=40` and `allow_force_push=true` so the rewind is possible. A wildcard that denies force-push still wins if the exact rule does not allow it, because the loosest rule wins. The exact rule must allow force-push; do not try to "tighten" the wildcard.
3. `git push --force-with-lease=refs/heads/<branch>:<current-tip> origin <sha>:refs/heads/<branch>`
4. Fetch and hard-reset the local branch to the remote.
5. Run `freeze` so the exact force-push rule is removed and `release/*` applies again.
6. Tell collaborators to fetch and `git reset --hard origin/<branch>`. A branch rewind does not unpublish build artifacts.

## Update procedure

Compare `version` with 15.6.

On 15.6 or newer, PATCH the named rule. Send `allowed_to_push` and `allowed_to_merge` when the server accepts them. When the server rejects those fields, use the replace procedure below.

Below 15.6, or when PATCH is not available, replace in one shell command so a failed create does not leave the pattern unprotected:

```bash
glab api --method DELETE "projects/:fullpath/protected_branches/<url-encoded-name>" \
  && glab api --method POST "projects/:fullpath/protected_branches" \
    -f 'name=<branch-or-pattern>' \
    -f 'push_access_level=<0-or-40>' \
    -f 'merge_access_level=<0-or-40>' \
    -F 'allow_force_push=false'
```

`glab api` form fields are flat (`push_access_level`, `merge_access_level`). Bracketed names such as `allowed_to_push[0][access_level]` are rejected by `glab`. If POST returns an error about the access-level fields, stop and quote it. Do not invent a second payload.

If DELETE succeeds and POST fails, say the pattern is currently unprotected and stop.

## Permission check

Prefer an open merge request whose target is the branch:

```bash
glab api graphql -f query='
query {
  project(fullPath: "<group>/<project>") {
    mergeRequest(iid: "<iid>") {
      state
      userPermissions { canMerge }
    }
  }
}'
```

`userPermissions.canMerge` is the verdict. `mergeStatus` is not. When no open merge request targets the branch, report the computed levels and set `observed-mr` to `none`.
