## MODIFIED Requirements

### Requirement: feature-branch-closeout SHALL own the post-verify closeout menu

After verification is green (or each failing check is explicitly labeled Pending with required action), and after optional `delivery-discipline` when the host runs delivery first, `feature-branch-closeout` MUST present a closeout menu before claiming the branch work is finished. Minimum options: **open/update PR**, **merge** (into the protected target), **keep branch**, **continue development**. Hosts MAY add worktree cleanup or discard with explicit confirmation. The skill MUST NOT embed rebase/coverage/tip-pin steps — those remain in `merge-discipline`. The skill MUST NOT inline commit/push/PR-create steps — those remain in `delivery-discipline`.

#### Scenario: Menu after green verify

- **WHEN** verification has passed (or pendings are listed) and archive (if any) is done
- **THEN** the agent presents the closeout menu rather than silently ending or merging

#### Scenario: Keep skips merge-discipline

- **WHEN** the user chooses keep branch or continue development
- **THEN** the agent MUST NOT load merge-discipline Parts A–D for a merge

## ADDED Requirements

### Requirement: feature-branch-closeout SHALL delegate open/update PR to delivery-discipline

When the chosen option is open/update PR, the agent MUST load `delivery-discipline` and follow it (need-delivery gate, commit if needed, create/refresh PR). feature-branch-closeout MUST NOT restate commit or PR-create steps inline.

#### Scenario: PR-only path loads delivery-discipline

- **WHEN** closeout selects open/update PR
- **THEN** `delivery-discipline` is loaded and run; merge-discipline is not started
