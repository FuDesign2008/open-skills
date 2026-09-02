## REMOVED Requirements

### Requirement: Command entry for write workflow

**Reason:** The repository no longer ships user-facing slash commands. `write-workflow` is invoked by skill name and trigger words after generic `npx` install.

**Migration:** Invoke `write-workflow` via its documented triggers (e.g. 「写文档」) or by naming the skill. Do not expect `commands/write.md` or `/write`.
