# jira-wiki-markup Specification

## Purpose
Single source of truth for Jira Wiki (Wiki renderer) notation used when agents compose wiki-rendered Jira fields, especially comments.

## Requirements

### Requirement: jira-wiki-markup SHALL be the single source for Jira Wiki markup

The repository MUST provide a skill named `jira-wiki-markup` whose instructional body is the single source of truth for Jira Wiki (Wiki renderer) notation used when an agent writes Jira wiki-rendered fields, including issue comments. The skill MUST cover headings (`h1.`–`h6.`), emphasis (`*bold*`, `_emphasis_`, `-strike-`, `+underline+`, `{{monospaced}}`), color and quote macros, line breaks and rules, links (external, alias, attachment, user, anchor), lists, tables (`||header||` / `|cell|`), `{code}` / `{panel}` / `{noformat}`, and escaping (`\X`). Markdown constructs (`**bold**`, `### heading`, fenced ` ``` `) MUST NOT be used in those fields.

#### Scenario: Agent composes a Jira comment body

- **WHEN** an agent is about to call `jira_add_comment` (or equivalent) with a `body`
- **THEN** the body uses Jira Wiki notation from `jira-wiki-markup` rather than GitHub-flavored Markdown

#### Scenario: Headings and emphasis match Wiki renderer help

- **WHEN** a comment needs a title and bold labels
- **THEN** the body uses `h2.` / `h3.` for headings and `*text*` for bold, not `##` or `**text**`

#### Scenario: Code and tables use Wiki macros

- **WHEN** a comment includes a code snippet or a table
- **THEN** the body uses `{code}` (optional language) and `||header||` / `|cell|` rows, not Markdown fences or pipe-only Markdown tables without a Wiki header row

### Requirement: Skill authoring SHALL follow repo skill contracts

`jira-wiki-markup` MUST use kebab-case directory name matching frontmatter `name`, English instructional body, Chinese trigger phrases in `description`, `description` as a single-line quoted string at or under 1024 characters, and de-identified examples only (generic hosts such as `example.com`, generic issue keys such as `PROJ-1234`). Full notation tables MUST live in `reference.md`; `SKILL.md` MUST stay a short composition guide plus a pointer to `reference.md`. The callee MUST NOT enumerate integrator skill ids as a behavioral contract (`skill-dependency-direction`).

#### Scenario: Description routes with Chinese triggers

- **WHEN** an agent reads frontmatter `description`
- **THEN** it includes Chinese trigger phrases (and MAY include English equivalents) plus a Do-NOT-use boundary against reading issues or changing Jira status

#### Scenario: No internal identifiers in the skill

- **WHEN** `npm run lint:deid` (or the repo de-identification lint) scans the new skill files as added content
- **THEN** the skill introduces no denylisted internal hostnames, product names, or project identifiers

#### Scenario: Callee omits host inventory

- **WHEN** an author reads `jira-wiki-markup` SKILL.md
- **THEN** it does not list `jira-fix-workflow` / `opsx-jira-fix-workflow` / `jira-status-writeback` as a SHALL/MUST integrator roster; orientation MAY use a role phrase such as "Referenced by Jira comment writers via frontmatter `dependencies`"

### Requirement: Referencing skills SHALL load jira-wiki-markup before writing wiki fields

Any project skill that composes a Jira wiki-rendered field MUST list `jira-wiki-markup` in frontmatter `dependencies`, abort at startup if it is missing, and load it immediately before composing the field. Hosts MUST keep comment *content* maps (branch, commit, PR URL, root cause) in the host; they MUST NOT copy the full Wiki notation tables into the host body.

#### Scenario: Missing dependency aborts the host

- **WHEN** a referencing skill starts and `jira-wiki-markup` is not available
- **THEN** the host prints the standard missing-dependency install hint and aborts

#### Scenario: Host stays thin on notation

- **WHEN** an agent reads a Jira fix host or `jira-status-writeback` after this change
- **THEN** Wiki notation tables are obtained by loading `jira-wiki-markup` / its `reference.md`, not by a full copy in the host

### Requirement: Repair comments SHALL use h3/h4 plus numbered list scenarios

Repair comments composed per `jira-wiki-markup` MUST use `h3.` for the report title, `h4.` for the Verification Scenarios section, and numbered list items `# *{scenario_name}*` for each scenario (bold name). Wiki line-start `#` is a numbered list; it MUST be kept as `#` and MUST NOT be rewritten as `h1.` or `h2.` for scenario titles. The skill body MUST state that Wiki `#` is not GitHub Markdown heading 1.

#### Scenario: Scenario titles are numbered list items

- **WHEN** a repair comment includes verification scenarios
- **THEN** each scenario title is a column-0 `# *name*` list item under `h4. Verification Scenarios`, not `h1.` / `h2.` / `h3.` headings

#### Scenario: Dialect trap is stated next to lists

- **WHEN** an agent reads `jira-wiki-markup` composition or `reference.md` Lists / canonical skeleton
- **THEN** the text states that Wiki `#` is a numbered list and GitHub Markdown `#` is heading 1, so list `#` is not rewritten as `h1.`

### Requirement: Written Wiki fields SHALL be verified for markup fidelity

Composing correct markup is necessary but not sufficient, because a relaying layer may escape or rewrite it while still returning a success response. After writing any Wiki-rendered field (comment body, description, or other wiki field), the agent MUST read the stored value back and confirm that the key markers (`h3.`/`h4.` line starts, `*bold*`, `{{mono}}`, `[label|url]`) survive verbatim. When the stored value cannot be read back at all, the write counts as unverified and the agent MUST report it rather than claim success.

When a marker is escaped or rewritten (for example `\*bold\*`, or `h3.` turned into `###`), the agent MUST treat the write as failed and retry through an available direct-REST channel that writes the same field. A channel counts as available only when its writing script and its credential resolver both exist in the installation; a skill directory alone is not enough, because the script cannot run without the resolver.

A bundled comment script covers comment bodies only. Other wiki fields (for example a description) need an equivalent REST endpoint; when no such endpoint exists, the field has no available channel. When no channel is available, the agent MUST report the fidelity failure and the missing fallback, and MUST NOT report the write as successful.

This requirement covers every wiki-field write. The post-merge repair-comment flow has its own equivalent requirement in `jira-status-writeback`; both describe the same verification discipline for their respective scopes.

#### Scenario: Markers survive the write channel

- **WHEN** the stored value read back after a write contains the composed markers verbatim
- **THEN** the write is complete and the agent proceeds with its own flow

#### Scenario: Escaped markup triggers a direct-REST retry

- **WHEN** the stored value contains escaped or rewritten markers (for example `\*bold\*` where `*bold*` was sent)
- **THEN** the agent rewrites the field through an available direct-REST channel for that field and re-verifies fidelity before reporting completion

#### Scenario: Channel presence is checked before relying on it

- **WHEN** a Jira writeback skill is installed but its fallback script or its credential resolver is missing
- **THEN** the agent treats the channel as unavailable and does not attempt the fallback

#### Scenario: No fallback channel available

- **WHEN** the write channel corrupts markup and no direct-REST channel is available for that field
- **THEN** the agent reports the fidelity failure and the missing fallback rather than reporting success

#### Scenario: Stored value cannot be read back

- **WHEN** neither the write response nor a follow-up read returns the stored field value
- **THEN** the agent reports the write as unverified and does not claim fidelity success
