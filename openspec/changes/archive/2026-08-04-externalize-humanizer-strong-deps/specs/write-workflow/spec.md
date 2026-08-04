## MODIFIED Requirements

### Requirement: Write-workflow strongly depends on both humanizer skills

`write-workflow` frontmatter `dependencies` MUST include `humanizer` and `humanizer-zh` in addition to existing dependencies. Missing either MUST abort startup with an install hint (no silent degrade). The repository MUST NOT ship `skills/humanizer/` or `skills/humanizer-zh/`. The missing-dependency notice MUST instruct installing from upstream URLs and require exact directory names:

- `npx skills add https://github.com/blader/humanizer.git` → directory / name `humanizer`
- `npx skills add https://github.com/op7418/Humanizer-zh.git` → directory / name `humanizer-zh`

The notice MUST NOT claim these skills are installable via `FuDesign2008/open-skills --skill humanizer` (or humanizer-zh).

#### Scenario: Missing humanizer-zh aborts write-workflow

- **WHEN** `humanizer-zh` is not installed
- **THEN** write-workflow prints a missing-dependency notice pointing at the Humanizer-zh upstream install command and directory-name requirement, and does not proceed

#### Scenario: open-skills does not vendor humanizer trees

- **WHEN** an auditor lists `skills/` in this repository
- **THEN** neither `humanizer` nor `humanizer-zh` skill directories are present
