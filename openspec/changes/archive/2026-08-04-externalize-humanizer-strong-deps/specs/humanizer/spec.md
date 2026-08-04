## REMOVED Requirements

### Requirement: humanizer skill removes English AI writing patterns

**Reason**: humanizer is an external strong dependency of write-workflow; open-skills no longer ships the skill in-repo.

**Migration**: Install upstream with `npx skills add https://github.com/blader/humanizer.git` ensuring the skill directory name is `humanizer`.

### Requirement: humanizer preserves facts and attributes upstream

**Reason**: In-repo capability removed; behavior and LICENSE live upstream.

**Migration**: Use blader/humanizer upstream skill.
