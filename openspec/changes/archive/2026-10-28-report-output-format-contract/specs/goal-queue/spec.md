## MODIFIED Requirements

### Requirement: Human-facing queue records SHALL have generated HTML views

The queue SHALL keep every human-facing record's Markdown file as the canonical source and SHALL generate a self-contained HTML view beside it. The covered set SHALL be the task cards, the triage record, `progress.md`, `verification.md`, and each engine completion report packaged into the acceptance package. `config` and `approaches/*.md` SHALL remain Markdown-only. The existing review HTML and evidence HTML pages SHALL keep their current contract.

The HTML views SHALL be generated at the Stage 1 approval handoff (task card and triage record) and at Stage 3 package assembly (all covered records), and SHALL be regenerated immediately before any open so a stale view is never opened. `verification.html` SHALL be the acceptance entry page and SHALL link to `progress.html`, the triage HTML view, each card's HTML view, each executed card's packaged engine report's HTML view, and, for each done card, that card's review page and evidence page. A target that does not exist SHALL be annotated as unavailable for any batch, including a current batch with failed, skipped, or zero done cards; the entry page SHALL NOT invent a file. Each executed card's packaged engine report SHALL use a deterministic filename (`reports/<card-slug>.md`) and its view `reports/<card-slug>.html`, with the original path named in the footer.

The renderer's general behavior (escaping, link normalization and rewriting, inline-CSS self-containment, footer source path and generation time, determinism, and not modifying the `.md` source) SHALL follow the single authoritative contract in the `report-output-format` capability. This requirement does not restate those rules and SHALL NOT hold a second copy. Queue-specific behavior (the covered record set, view paths and filenames, generation timing, entry-page links, and the auto-open gate) SHALL remain owned here.

When Node is unavailable, the dispatcher SHALL print the `.md` paths instead of writing HTML by hand. It SHALL NOT hand-write human-facing HTML as a fallback.

The first progress-document entry SHALL record `Trigger: interactive | scheduled` from the actual run trigger. The dispatcher SHALL auto-open `verification.html` at the Stage 3 handback only when that recorded value is `interactive`. An explicit view request SHALL open the requested page regardless of the recorded trigger; the request itself is the presence input. A scheduled or unattended run SHALL NOT auto-open; it SHALL print the paths and MAY open a page only on an explicit request. The open action SHALL resolve the file under the queue directory and SHALL use an argument vector rather than a shell; tests SHALL inject the opener and SHALL NOT launch a browser. Generated HTML SHALL NOT be committed: delivery SHALL stage only the card's allowed paths, and verification SHALL show the diff excludes `.goal-driven/`.

#### Scenario: Every covered record gets an HTML sibling

- **WHEN** the queue generates human-facing views for a batch
- **THEN** each task card, the triage record, `progress.md`, `verification.md`, and each packaged engine report has a sibling `.html` view

#### Scenario: Markdown remains canonical and byte-unchanged

- **WHEN** a view is rendered
- **THEN** the `.md` source is unchanged byte-for-byte and remains the record agents edit

#### Scenario: Agent-only records stay Markdown-only

- **WHEN** the queue generates HTML views
- **THEN** `config` and `approaches/*.md` get no HTML view

#### Scenario: Verification HTML is the entry page with resolving links

- **WHEN** the acceptance package is assembled
- **THEN** `verification.html` links to progress, triage, each card, each executed card's packaged report, and, for each done card, that card's review page and evidence page; every existing target resolves, and a missing target is annotated as unavailable

#### Scenario: A pre-change batch links only existing targets

- **WHEN** a view is generated for a batch that predates this capability
- **THEN** the entry page links only to existing targets or annotates a missing target as unavailable, and does not invent a file

#### Scenario: A failed card has no review or evidence link

- **WHEN** a current batch contains a failed card that was executed and has a packaged report
- **THEN** the entry page links that card's HTML view and packaged report, and annotates the absent review/evidence target as unavailable

#### Scenario: A skipped card has no packaged report

- **WHEN** a card is `skipped (covered)` and was never executed
- **THEN** the entry page links that card's HTML view and annotates the missing report, review, and evidence targets as unavailable

#### Scenario: A zero-done batch still gets an entry page

- **WHEN** a batch finishes with zero done cards
- **THEN** `verification.html` still exists and links progress, triage, each card, each executed card's packaged report, and annotates every review/evidence target as unavailable

#### Scenario: The auto-open gate reads the recorded trigger

- **WHEN** the first progress entry records `Trigger: interactive`
- **THEN** the dispatcher may auto-open the Stage 3 entry page; when it records `Trigger: scheduled`, the dispatcher prints paths and does not auto-open, while an explicit view request may still open the requested page

#### Scenario: Protocol-relative and obfuscated schemes are rejected

- **WHEN** a link target is `//example.com/x`, `file:...`, `JaVaScRiPt:...`, `java\tscript:...`, or a backslash-prefixed path
- **THEN** normalization rejects the target and the renderer emits no active link for it

#### Scenario: Interactive handback opens the entry page

- **WHEN** the first progress entry records `Trigger: interactive` and the Stage 3 handback runs
- **THEN** the dispatcher auto-opens `verification.html` in the system default browser

#### Scenario: On-demand view opens the requested page

- **WHEN** the human explicitly asks to view a covered record, regardless of the recorded trigger
- **THEN** the dispatcher regenerates that view if stale and opens it in the system default browser; the request itself is the presence input

#### Scenario: Unattended runs do not auto-open a browser

- **WHEN** a scheduled or unattended run assembles the package
- **THEN** no browser auto-opens and the dispatcher prints the view paths; an explicit view request may still open a page

#### Scenario: A stale view is regenerated before opening

- **WHEN** the `.md` source is newer than its HTML view
- **THEN** the dispatcher re-renders the view before opening it

#### Scenario: The renderer escapes content and stays self-contained

- **WHEN** the source contains `<script>`, `&`, quotes, or heading placeholders such as `<batch-id>`
- **THEN** the renderer's general-behavior contract in `report-output-format` applies: content is escaped and the page carries inline CSS only

#### Scenario: Unsafe link schemes and attributes are blocked

- **WHEN** the source contains a `javascript:`, `data:`, or `vbscript:` link, or a link with special characters in its target
- **THEN** the renderer's general-behavior contract in `report-output-format` applies: the scheme is blocked or the attribute value is escaped

#### Scenario: Link rewriting skips code fences and missing targets

- **WHEN** the source links to another `.md` file
- **THEN** the renderer's general-behavior contract in `report-output-format` applies: the link is rewritten to its `.html` view only when that view exists and the link is not inside a code fence

#### Scenario: The no-Node fallback prints Markdown paths

- **WHEN** Node is unavailable
- **THEN** the dispatcher prints the `.md` paths and does not hand-write human-facing HTML

#### Scenario: The open action is path-contained and shell-free

- **WHEN** the dispatcher opens a view
- **THEN** the path resolves under the queue directory and the opener receives an argument vector, not a shell command

