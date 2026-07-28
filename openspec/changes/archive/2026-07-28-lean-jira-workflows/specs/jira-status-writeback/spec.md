## ADDED Requirements

### Requirement: Post-merge Jira writeback SHALL use two independent API calls

The `jira-status-writeback` skill SHALL define the sole SOP for writing Jira status after a successful PR/MR merge into the target branch. The skill MUST require two independent calls: (1) resolve transitions and call `jira_transition_issue` **without** a `comment` parameter; (2) call `jira_add_comment` with comment text in the `body` parameter (not `comment`). Passing the repair comment only via `jira_transition_issue`'s `comment` parameter is forbidden.

#### Scenario: Comment uses jira_add_comment body

- **WHEN** writeback runs after a successful merge
- **THEN** the agent transitions the issue and separately calls `jira_add_comment` with `body` set to the repair comment

#### Scenario: Transition comment parameter is not used for the repair note

- **WHEN** writeback runs
- **THEN** `jira_transition_issue` is invoked without relying on its `comment` parameter to persist the repair record

### Requirement: Transition target SHALL be developer-owned 「已修复」 only

The skill SHALL transition only to the developer-owned status equivalent to「已修复」(or the project's configured same-meaning status). Closing, verification-pass, or QA-owned statuses MUST NOT be applied by this skill; if no matching transition exists, the skill MUST skip the transition, emit a warning, and still attempt the comment when possible.

#### Scenario: Matching 已修复 transition

- **WHEN** `jira_get_transitions` lists a transition to「已修复」
- **THEN** the skill applies that transition and does not close the issue

#### Scenario: No matching transition

- **WHEN** no「已修复」-equivalent transition is available
- **THEN** the skill skips transition with a warning and does not block the host workflow solely for that miss

### Requirement: Comment fields SHALL be host-parameterized

The skill SHALL define a required comment field set using placeholders supplied by the host (e.g. branch, commit, PR/MR URL, root cause, fix summary, changed files, verification scenarios, OpenSpec change path when applicable). Hosts MUST pass concrete values; the skill MUST NOT invent project-specific paths.

#### Scenario: Host supplies OpenSpec path

- **WHEN** `opsx-jira-fix-workflow` invokes writeback after archive-aware merge
- **THEN** the comment includes the OpenSpec change path among the host-supplied fields

#### Scenario: Host omits OpenSpec path

- **WHEN** `jira-fix-workflow` invokes writeback without an OpenSpec change
- **THEN** the comment still includes the non-OpenSpec required fields the host mapped

### Requirement: Writeback failure SHALL warn without blocking merge completion

If transition or comment API calls fail, the skill MUST record a warning for the host report and MUST NOT treat writeback failure as a reason to revert the already-completed merge.

#### Scenario: Comment API fails after merge

- **WHEN** merge succeeded but `jira_add_comment` fails
- **THEN** the skill reports a warning and the host continues completion bookkeeping

### Requirement: Jira fix hosts SHALL declare and load jira-status-writeback

`jira-fix-workflow` and `opsx-jira-fix-workflow` MUST list `jira-status-writeback` in frontmatter `dependencies`, abort at startup if missing, and at post-merge writeback MUST load the skill and follow it instead of inlining the two-step API and status-boundary rules in the host body (hosts MAY keep a one-line pointer and host-specific field mapping).

#### Scenario: Missing dependency aborts

- **WHEN** either host starts and `jira-status-writeback` is not available
- **THEN** the host aborts with the standard missing-dependency install hint

#### Scenario: Host body is thin on writeback

- **WHEN** an agent reads the post-merge writeback section of either host
- **THEN** the authoritative two-step API and「已修复」-only rule are obtained by loading `jira-status-writeback`, not by a full inline copy in the host
