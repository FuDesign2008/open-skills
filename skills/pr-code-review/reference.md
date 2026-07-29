# PR Code Review — Reference

## Comment format (when issues remain)

```markdown
### Code review

Found N issues:

1. <brief description> (<why: guidance quote or bug reason>)

https://github.com/<owner>/<repo>/blob/<full-sha>/<path>#L<start>-L<end>

2. ...
```

## Comment format (no issues ≥80)

```markdown
### Code review

No issues found. Checked for bugs and project guidance (AGENTS.md / CLAUDE.md) compliance.
```

## Permalink rules

- Full git SHA (never abbreviated; never shell-expand in the comment body).
- Repo must match the PR’s repository.
- Fragment form: `#Lstart-Lend` with at least one line of context before and after the cited lines.

## Origin

Adapted from Anthropic Claude Code plugin **code-review** (`commands/code-review.md`, author Boris Cherny). That artifact is a Claude Code *plugin command*; this file is the open-skills Agent Skills port for `npx skills` install and cross-host use.
