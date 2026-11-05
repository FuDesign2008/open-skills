# jira-status-lifecycle Specification

## Purpose

Developer-owned Jira bug status decisions shared by fix hosts and post-merge writeback.

## Requirements

### Requirement: Lifecycle skill SHALL decide developer-owned status without depending on writeback

`jira-status-lifecycle` SHALL be the decision source for the before-analysis claim and the post-merge「已修复」decision. It MUST NOT list `jira-status-writeback` in frontmatter `dependencies`. The executable matrix SHALL live in `scripts/decide.mjs`.

#### Scenario: No dependency cycle

- **WHEN** an agent reads `jira-status-lifecycle` frontmatter
- **THEN** `jira-status-writeback` is not a declared dependency

### Requirement: Fix hosts and writeback SHALL load the lifecycle skill

`jira-fix-workflow`, `opsx-jira-fix-workflow`, and `jira-status-writeback` MUST list `jira-status-lifecycle` in frontmatter `dependencies` and abort at startup when it is missing. Fix hosts MUST run the before-analysis decision after the issue assignee and status are known and before the first analysis stage. `jira-status-writeback` MUST run the post-merge decision before transitioning.

#### Scenario: Missing lifecycle skill aborts the host

- **WHEN** a fix host or `jira-status-writeback` loads and `jira-status-lifecycle` is not available
- **THEN** it aborts with the standard missing-dependency install hint

#### Scenario: Claim happens before analysis

- **WHEN** a fix host has read an issue assigned to the session user whose status means「待处理」
- **THEN** it transitions to the status that means「解决中」and starts analysis only after that transition succeeds

#### Scenario: Unresolved session user stops analysis

- **WHEN** the authenticated Jira session user cannot be resolved
- **THEN** the host reports `stop-identity-unresolved` and does not start analysis

#### Scenario: Other people's issues are not transitioned

- **WHEN** the issue assignee is not the session user
- **THEN** the host leaves the status unchanged, tells the operator, and may continue analysis

### Requirement: Post-merge fixed transition SHALL follow the lifecycle decision

After the fix PR/MR is on the target branch, `jira-status-writeback` MUST discover whether a transition to「已修复」exists and then follow `decidePostMerge`. `transition-fixed` leaves the lifecycle incomplete until `applyTransitionResult` receives boolean `true`. Any other result is a failed transition. A required transition that fails leaves the lifecycle incomplete, keeps the merge, and still posts the repair comment. An issue assigned to someone else MUST NOT be transitioned and MUST NOT receive the repair comment. 验证通过 and 关闭 MUST NOT be selected.

#### Scenario: Successful fixed transition

- **WHEN** the issue is assigned to the session user and a transition to「已修复」exists
- **THEN** writeback applies that transition without a comment parameter and then posts the repair comment

#### Scenario: Non-true transition result stays incomplete

- **WHEN** writeback passes any result other than boolean `true` into `applyTransitionResult` for `transition-fixed`
- **THEN** the outcome is `incomplete-transition`, the repair comment still posts, and the lifecycle stays incomplete

#### Scenario: Assignee mismatch after merge

- **WHEN** the merged fix's issue is not assigned to the session user
- **THEN** writeback does not transition, does not post the repair comment, notifies the operator, and leaves the lifecycle incomplete
