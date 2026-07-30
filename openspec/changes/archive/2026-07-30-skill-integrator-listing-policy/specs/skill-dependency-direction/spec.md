## ADDED Requirements

### Requirement: Dependency edges SHALL be host-to-callee only

Project skills MUST treat frontmatter `dependencies` on the **referencing** (host) skill as the authoritative strong-dependency edge. A **callee** skill MUST NOT maintain an authoritative reverse list of integrator skill names as a behavioral contract. Human/LLM orientation MAY use a role phrase (e.g. "Referenced by PDCA hosts via frontmatter `dependencies`") without enumerating host skill ids.

#### Scenario: Callee omits host name inventory

- **WHEN** an author updates a shared discipline or methodology skill used by multiple hosts
- **THEN** the callee body does not add or require a complete `solve-workflow` / `opsx-*` / `jira-*` name list as a SHALL/MUST contract

### Requirement: Skill description SHALL NOT encode reverse dependency graphs

Frontmatter `description` MUST remain routing-only (what / when / triggers / Do NOT use). It MUST NOT enumerate host skill names solely to document who depends on this skill.

#### Scenario: Description drops host enumerator for routing

- **WHEN** a callee's description previously listed PDCA host names only to show integrators
- **THEN** those names are removed or replaced with a short role phrase that does not function as a dependency inventory
