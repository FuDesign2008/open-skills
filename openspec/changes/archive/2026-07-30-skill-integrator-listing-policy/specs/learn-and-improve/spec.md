## REMOVED Requirements

### Requirement: learn-and-improve SHALL list Jira host integrators

**Reason**: Conflicts with AGENTS.md ("被依赖的 skill 不需要反向声明") and the new `skill-dependency-direction` capability — reverse integrator name lists are not a callee contract and drift when hosts change.

**Migration**: Use a role phrase ("Referenced by PDCA hosts via frontmatter `dependencies`") in When to use / Relationship sections; hosts remain SoT via their own `dependencies` and the AGENTS dependency table.

## ADDED Requirements

### Requirement: learn-and-improve SHALL NOT maintain an authoritative integrator name list

`learn-and-improve` MUST NOT require or maintain an exhaustive list of host skill names as a behavioral contract. Orientation text MAY say it is loadable standalone or by PDCA hosts via `dependencies`, without naming each host.

#### Scenario: Relationship section uses role phrase

- **WHEN** a reader opens `learn-and-improve` relationship guidance after this change
- **THEN** there is no SHALL-level "Integrated by: &lt;host1&gt;, &lt;host2&gt;, …" inventory; hosts declare the edge themselves
