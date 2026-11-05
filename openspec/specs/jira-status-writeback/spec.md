# jira-status-writeback Specification

## Purpose
Single source of truth for post-merge Jira status writeback used by jira-fix hosts.

## Requirements

### Requirement: Post-merge Jira writeback SHALL use two independent API calls

The `jira-status-writeback` skill SHALL define the post-merge execution SOP for Jira status. The status decision comes from `jira-status-lifecycle` (`decidePostMerge` / `applyTransitionResult`). When that decision sets `transition` true, the skill MUST call `jira_transition_issue` **without** a `comment` parameter. The repair comment is a second, independent call with Wiki markup in the `body` field, and it runs only when the decision sets `comment` true. Passing the repair comment only via `jira_transition_issue`'s `comment` parameter is forbidden.

For step 2 the skill MUST treat the write channel as unverified until proven faithful: the agent posts through its available tooling, reads back the stored `body` from the tool response (or a follow-up read), and compares it against the composed text for the key Wiki markers (`h3.`/`h4.` line starts, `*bold*`, `{{mono}}`, `[label|url]`). If every marker survives verbatim, the write is complete. If any marker is escaped or rewritten (for example `\*bold\*` or a heading turned into `###`), the agent MUST fall back to a direct REST write via `scripts/update-comment-wiki.mjs` (credential chain identical to `jira-read`), then re-verify fidelity the same way.

#### Scenario: Comment uses jira_add_comment body

- **WHEN** the lifecycle decision sets `comment` true
- **THEN** the agent calls `jira_add_comment` with `body` set to the repair comment and does not place that comment on `jira_transition_issue`

#### Scenario: Comment without a status transition

- **WHEN** the lifecycle decision sets `comment` true and `transition` false
- **THEN** the agent posts the repair comment and does not call `jira_transition_issue`

#### Scenario: Comment uses body parameter on a faithful channel

- **WHEN** the repair comment was posted and the read-back `body` matches the composed Wiki markup verbatim
- **THEN** the writeback is complete with the primary channel

#### Scenario: Escaped markup triggers REST fallback

- **WHEN** the read-back `body` contains escaped or rewritten markers (for example `\*bold\*` where `*bold*` was sent)
- **THEN** the agent rewrites the comment through the direct REST script and re-verifies fidelity before reporting completion

#### Scenario: Transition comment parameter is not used for the repair note

- **WHEN** the lifecycle decision sets `transition` true
- **THEN** `jira_transition_issue` is invoked without relying on its `comment` parameter to persist the repair record

### Requirement: Transition target SHALL be developer-owned 「已修复」 only

The skill SHALL call `jira_get_transitions` (or equivalent) before `decidePostMerge` and pass that result as whether a transition to the `fixed` status exists. It SHALL transition only to the developer-owned status equivalent to「已修复」(or the project's configured same-meaning status), and only when `jira-status-lifecycle` returns `transition: true`. Closing, verification-pass, or QA-owned statuses MUST NOT be applied by this skill. `applyTransitionResult` receives boolean `true` only when that transition call succeeded; every other result, including an object payload, is a failed transition. If the status is already the `fixed` class, the outcome is `status-satisfied`: skip the transition, post the repair comment, and treat the status obligation as met. If no matching transition exists and the status is not already `fixed`, the outcome is `incomplete-transition`: skip the transition, leave the lifecycle incomplete, keep the merge, and still attempt the comment.

#### Scenario: Matching 已修复 transition

- **WHEN** `jira_get_transitions` lists a transition to「已修复」and `decidePostMerge` returns `transition: true`
- **THEN** the skill applies that transition and does not close the issue

#### Scenario: Already fixed

- **WHEN** the issue status already means「已修复」
- **THEN** the skill skips the transition, posts the repair comment, and treats the status obligation as met

#### Scenario: No matching transition

- **WHEN** the issue is not already「已修复」and no「已修复」-equivalent transition is available
- **THEN** the skill skips the transition, leaves the lifecycle incomplete, keeps the merge, and still attempts the repair comment

### Requirement: Comment fields SHALL be host-parameterized

The skill SHALL define a required comment field set using placeholders supplied by the host (e.g. branch, commit, PR/MR URL, root cause, fix summary, changed files, verification scenarios, OpenSpec change path when applicable). Hosts MUST pass concrete values; the skill MUST NOT invent project-specific paths.

#### Scenario: Host supplies OpenSpec path

- **WHEN** `opsx-jira-fix-workflow` invokes writeback after archive-aware merge
- **THEN** the comment includes the OpenSpec change path among the host-supplied fields

#### Scenario: Host omits OpenSpec path

- **WHEN** `jira-fix-workflow` invokes writeback without an OpenSpec change
- **THEN** the comment still includes the non-OpenSpec required fields the host mapped

### Requirement: Status-transition failure SHALL leave the merge and keep the lifecycle incomplete

If the「已修复」transition fails, or the session user cannot be resolved, the skill MUST NOT revert the already-completed merge and MUST NOT report the lifecycle as complete. The repair comment still runs when the lifecycle decision sets `comment` true. A comment API failure after a successful transition MUST be recorded as a warning; the merge stays, and the already-met status obligation stays met.

#### Scenario: Comment API fails after a successful transition

- **WHEN** merge succeeded, the issue transitioned to「已修复」, and `jira_add_comment` fails
- **THEN** the skill reports a warning, the merge stays, and the status obligation stays met

#### Scenario: Transition fails after merge

- **WHEN** merge succeeded and the「已修复」transition fails
- **THEN** the skill leaves the lifecycle incomplete, keeps the merge, and still attempts the repair comment

### Requirement: Jira fix hosts SHALL declare and load jira-status-writeback

`jira-fix-workflow` and `opsx-jira-fix-workflow` MUST list `jira-status-writeback` in frontmatter `dependencies`, abort at startup if missing, and at post-merge writeback MUST load the skill and follow it instead of inlining the two-step API and status-boundary rules in the host body (hosts MAY keep a one-line pointer and host-specific field mapping).

#### Scenario: Missing dependency aborts

- **WHEN** either host starts and `jira-status-writeback` is not available
- **THEN** the host aborts with the standard missing-dependency install hint

#### Scenario: Host body is thin on writeback

- **WHEN** an agent reads the post-merge writeback section of either host
- **THEN** the post-merge execution SOP is obtained by loading `jira-status-writeback` (which loads `jira-status-lifecycle` for the decision), not by a full inline copy in the host

### Requirement: Writeback comment body SHALL use jira-wiki-markup

`jira-status-writeback` MUST list `jira-wiki-markup` in frontmatter `dependencies` and abort at startup if it is missing. When composing the repair comment `body` (step 2 of the existing two-step SOP), the skill MUST load `jira-wiki-markup` and emit Jira Wiki markup. Host-supplied field values remain the semantic content; Wiki notation is not optional. After composing, if any line of that repair `body` starts with `h1.` or `h2.`, the skill MUST rewrite those titles as numbered `# *name*` items so the posted comment stays at `h3.`/`h4.` plus lists, then call `jira_add_comment`.

#### Scenario: Missing jira-wiki-markup aborts writeback skill load

- **WHEN** `jira-status-writeback` is loaded and `jira-wiki-markup` is not available
- **THEN** the skill (or its host prerequisite check) aborts with the standard missing-dependency install hint

#### Scenario: Repair comment is Wiki not Markdown

- **WHEN** writeback calls `jira_add_comment` after a successful merge
- **THEN** `body` uses Wiki headings/emphasis/lists/links as specified by `jira-wiki-markup` (for example `*Fix Branch*` or `h4. Verification Scenarios`) and does not use Markdown `**bold**` or `### heading`

#### Scenario: Stray h1/h2 scenario titles are rewritten before post

- **WHEN** the composed repair `body` contains a line starting with `h1.` or `h2.`
- **THEN** those titles are rewritten as numbered `# *name*` items before `jira_add_comment`

### Requirement: Comment writeback SHALL verify markup fidelity and fall back to direct REST

The skill MUST ship a fidelity-checking REST fallback script (`scripts/update-comment-wiki.mjs`) that: resolves credentials via the same chain as `jira-read` (env `JIRA_PERSONAL_TOKEN` / `JIRA_PAT`, else first line of `~/.config/jira-certs/jira-pat.txt`); accepts the site base URL via env `JIRA_URL`; reads the Wiki body from `--file <path>` or stdin; supports create (no comment id) and update (comment id argument); enables optional mTLS when `client.crt`/`client.key` are resolvable; performs a built-in read-back fidelity check reporting PASS/FAIL with the diff detail. The skill MUST document when to use the script: only after the primary channel fails the fidelity check. The script MUST NOT log the token.

#### Scenario: Script creates a comment with verbatim Wiki storage

- **WHEN** the script runs with a wiki file, an issue key, and no comment id on a faithful REST endpoint
- **THEN** the comment is created and the script reports fidelity PASS with the stored `body` preview

#### Scenario: Script updates an escaped comment

- **WHEN** the script runs with issue key and comment id whose stored body is markup-escaped
- **THEN** the comment is updated and fidelity re-verified against the composed text

#### Scenario: Token is never logged

- **WHEN** the script runs with any credential resolution outcome
- **THEN** no log line contains the token or its file path contents

### Requirement: jira-read SHALL be declared for the bundled REST fallback

The bundled fidelity fallback (`scripts/update-comment-wiki.mjs`) imports `resolveJiraToken` from `jira-read`, so an installation without `jira-read` cannot run the fallback the spec promises. In addition to the `jira-wiki-markup` dependency covered by the existing dependency requirement, `jira-status-writeback` MUST list `jira-read` in frontmatter `dependencies` and abort its own load when it is missing.

When that check fails at writeback load, the agent MUST abort writeback, MUST NOT revert an already-completed merge, and MUST leave the lifecycle incomplete.

The skill prose MUST distinguish the two authentication paths: the SOP itself uses the agent's session or MCP tooling (behavior unchanged), while the bundled script resolves credentials through the `jira-read` chain (`JIRA_PERSONAL_TOKEN` / `JIRA_PAT` / `~/.config/jira-certs/jira-pat.txt`). The "this skill does not resolve PAT files" statement MUST be scoped to the SOP rather than the whole skill, so it does not contradict the shipped script.

The bundled script keeps its static import and assumes both skills are installed under the same skills root (the standard `--skill` installation layout). Direct invocation without `jira-read` remains unsupported; the load-time check is what keeps a compliant run away from that path.

#### Scenario: Missing jira-read aborts the skill

- **WHEN** `jira-status-writeback` loads and `jira-read` is not available
- **THEN** the skill aborts with the standard missing-dependency install hint instead of proceeding until the fallback crashes

#### Scenario: Single-skill install fails at the prerequisite check

- **WHEN** a user installs only `jira-status-writeback` and starts a writeback run
- **THEN** the prerequisite check reports the missing `jira-read` before any Jira call is made

#### Scenario: Missing dependency after merge does not revert the merge

- **WHEN** the dependency check fails after a PR/MR has already merged
- **THEN** the agent aborts writeback, the merge stays, and the lifecycle stays incomplete

#### Scenario: Documentation separates SOP auth from script auth

- **WHEN** an agent reads the skill overview and the fidelity fallback step
- **THEN** the overview limits the "no PAT resolution" statement to the SOP, and the fallback step states that the script resolves credentials through the `jira-read` chain
