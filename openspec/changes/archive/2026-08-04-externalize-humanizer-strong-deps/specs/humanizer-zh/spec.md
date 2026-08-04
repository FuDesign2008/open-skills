## REMOVED Requirements

### Requirement: humanizer-zh skill removes Chinese AI writing patterns

**Reason**: humanizer-zh is an external strong dependency of write-workflow; open-skills no longer ships the skill in-repo.

**Migration**: Install upstream with `npx skills add https://github.com/op7418/Humanizer-zh.git` ensuring the skill directory name is `humanizer-zh`.

### Requirement: humanizer-zh attributes upstream translation sources

**Reason**: In-repo capability removed; attribution lives upstream.

**Migration**: Use op7418/Humanizer-zh upstream skill.
