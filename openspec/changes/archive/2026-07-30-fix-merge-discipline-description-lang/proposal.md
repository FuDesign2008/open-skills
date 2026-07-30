## Why

`merge-discipline` frontmatter `description` mixed Chinese narrative with English terms and bilingual triggers in one run-on string, hurting routing clarity and diverging from the repo’s English-primary description + Chinese trigger pattern.

## What Changes

- Rewrite `skills/merge-discipline/SKILL.md` `description` to English-primary routing text (Parts A→B→C→R→D, active-change / direct-merge Do NOT boundaries) with Chinese + English triggers at the end (solution 2 wording).
- Regenerate `docs/generated/skills-index.md` as needed.
- Bump `merge-discipline` patch version.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `merge-discipline`: description language/layout only (routing string); behavioral Parts A–D unchanged.

## Impact

- `skills/merge-discipline/SKILL.md`, `docs/generated/skills-index.md`
- No host dependency graph changes
