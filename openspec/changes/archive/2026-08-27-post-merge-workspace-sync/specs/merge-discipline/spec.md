## ADDED Requirements

### Requirement: Part D SHALL sync the local workspace onto the merged target branch

After the post-merge ancestor check passes, merge-discipline SHALL bring the local workspace back onto the integration line: resolve the target branch from the MR's base metadata (`gh pr view <id> --json baseRefName` / GitLab `target_branch`, reusing the base resolved in Part B) rather than assuming `main` or `master`; when the target branch exists locally, check it out and fast-forward it with `git pull --ff-only origin <target>`, reporting the sync outcome in one line. When checkout or fast-forward is impossible (branch absent locally, diverged history), the step MUST state what happened and how to recover instead of skipping silently. Deleting the merged source branch MAY be offered as explicit follow-up (local and remote), consistent with closeout cleanup ownership.

#### Scenario: Target branch is not main

- **WHEN** an MR merges into `develop` (or any non-main target)
- **THEN** the workspace switches to `develop` and fast-forwards it from origin, without ever consulting `main`

#### Scenario: Local copy of the target is missing

- **WHEN** the resolved target branch does not exist in the local repository
- **THEN** the step reports the fetch command to obtain it (e.g. `git fetch origin <target>:<target>`) and does not treat this as a silent skip

#### Scenario: Fast-forward is blocked

- **WHEN** the local target branch has diverged from origin so `--ff-only` would fail
- **THEN** the step reports the divergence state and hands the decision to the user instead of rebasing or force-updating on its own
