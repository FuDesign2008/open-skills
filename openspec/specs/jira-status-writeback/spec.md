# jira-status-writeback Specification

## Purpose
Single source of truth for post-merge Jira status writeback used by jira-fix hosts.

## Requirements

### Requirement: Post-merge Jira writeback SHALL use two independent API calls

The `jira-status-writeback` skill SHALL define the sole SOP for writing Jira status after a successful PR/MR merge into the target branch. The skill MUST require two independent calls: (1) resolve transitions and call `jira_transition_issue` **without** a `comment` parameter; (2) post the repair comment with Wiki markup in the `body` field. Passing the repair comment only via `jira_transition_issue`'s `comment` parameter is forbidden.

For step 2 the skill MUST treat the write channel as unverified until proven faithful: the agent posts through its available tooling, reads back the stored `body` from the tool response (or a follow-up read), and compares it against the composed text for the key Wiki markers (`h3.`/`h4.` line starts, `*bold*`, `{{mono}}`, `[label|url]`). If every marker survives verbatim, the write is complete. If any marker is escaped or rewritten (for example `\*bold\*` or a heading turned into `###`), the agent MUST fall back to a direct REST write via `scripts/update-comment-wiki.mjs` (credential chain identical to `jira-read`), then re-verify fidelity the same way.

#### Scenario: Comment uses jira_add_comment body

- **WHEN** writeback runs after a successful merge
- **THEN** the agent transitions the issue and separately calls `jira_add_comment` with `body` set to the repair comment

#### Scenario: Comment uses body parameter on a faithful channel

- **WHEN** writeback runs after a successful merge and the read-back `body` matches the composed Wiki markup verbatim
- **THEN** the writeback is complete with the primary channel

#### Scenario: Escaped markup triggers REST fallback

- **WHEN** the read-back `body` contains escaped or rewritten markers (for example `\*bold\*` where `*bold*` was sent)
- **THEN** the agent rewrites the comment through the direct REST script and re-verifies fidelity before reporting completion

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
