# Spec Delta

## ADDED Requirements

### Requirement: explain-clearly SHALL lead a role-handoff flow with a diagram

When the subject is a flow of roles handing work onward, an HTML or Markdown explanation MUST lead with a diagram. The diagram MUST distinguish the roles, MUST show order, and MUST show what is handed off. A comparison table MUST NOT satisfy this requirement. Caption prose MAY sit with the diagram. A subject that is not a role-handoff flow MUST keep the existing visual rule, including no forced diagram when the concept has no shape.

#### Scenario: Role handoff leads with a diagram

- **WHEN** the explanation is how several roles hand work onward and the form is HTML
- **THEN** the page leads with a diagram of those roles, their order, and what is handed off

#### Scenario: A comparison table does not replace the diagram

- **WHEN** the subject is a role-handoff flow and the page also compares options
- **THEN** a comparison table is not the only visual, and the flow diagram is still present

#### Scenario: A shapeless concept stays without a diagram

- **WHEN** the concept has no comparison, mapping, topology, or role-handoff flow
- **THEN** the explanation does not add a diagram
