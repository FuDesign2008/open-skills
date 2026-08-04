## Why

`write-workflow` already reserves an extension slot for AI-de-slop / humanize writers. Users need first-class, in-repo skills for English and Chinese humanization, wired as **strong dependencies** of the write host so the document-writing entry always has both writers available. Upstream sources: [blader/humanizer](https://github.com/blader/humanizer) and [op7418/Humanizer-zh](https://github.com/op7418/humanizer-zh) (MIT).

## What Changes

- Add `humanizer` (English body + Chinese triggers) adapted from blader/humanizer for open-skills frontmatter conventions.
- Add `humanizer-zh` (Chinese-only skill body, like `article-writer`) adapted from Humanizer-zh; remove platform-hardcoded tool lists.
- Update `write-workflow`: strong-depend both; route table + language selection (zh → `humanizer-zh`, en → `humanizer`); adjust stage-6 gate notes (humanizer has no tech-review §1 gate).
- Update AGENTS inventory, skills-index, attribution/LICENSE copies.
- OpenSpec specs for new capabilities + delta on `write-workflow`.

## Capabilities

### New Capabilities

- `humanizer`: English AI-writing-pattern removal writer skill.
- `humanizer-zh`: Chinese AI-writing-pattern removal writer skill.

### Modified Capabilities

- `write-workflow`: strong dependencies and routing for both humanizer skills; host gate differences by writer type.

## Impact

- `skills/humanizer/`, `skills/humanizer-zh/`, `skills/write-workflow/`
- `AGENTS.md`, `docs/generated/skills-index.md`
- License attribution for upstream MIT works
- Install surface grows: write-workflow prerequisite now requires four skills (clarifying-question-discipline, tech-review-doc, workflow-mode-lifecycle, humanizer, humanizer-zh) — intentional per user choice
