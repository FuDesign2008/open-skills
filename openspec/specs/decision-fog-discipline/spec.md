# decision-fog-discipline Specification

## Purpose
Decision-fog map / tickets / graduation before solution exploration.

## Requirements
### Requirement: decision-fog-discipline SHALL gate solution exploration until fog graduates

When the path to a clear solution set is still foggy (unknown destination, unresolved decision tickets, or cross-session unfinished map), `decision-fog-discipline` MUST prevent entering the host's solution-exploration stage (and creating an OpenSpec `proposal.md` that picks a solution) until fog is graduated or the user explicitly skips with 留痕. Graduation means: destination stated, open decision tickets resolved or deferred with reason, and the agent can list 2–5 concrete solution directions.

#### Scenario: Fog blocks exploration

- **WHEN** critical decision tickets remain open and the user has not skipped
- **THEN** the agent MUST NOT present the full solution-comparison table or write a solution-picking proposal yet

#### Scenario: Graduated fog proceeds

- **WHEN** destination is clear and blocking tickets are resolved or explicitly deferred
- **THEN** the agent MAY enter solution exploration / OpenSpec proposal

### Requirement: decision-fog-discipline SHALL use destination, tickets, and clarifying asks

The skill MUST structure work as: (1) state destination / success picture, (2) maintain a short decision-ticket list (fog items), (3) resolve one ticket at a time using `clarifying-question-discipline` when asking humans. It MUST NOT hard-require an external tracker; a session note or repo-local markdown MAY be used. It MUST NOT replace OpenSpec specs with the fog map.

#### Scenario: One ticket per human ask

- **WHEN** a human decision is needed on a fog ticket
- **THEN** the agent asks exactly one critical question per turn per clarifying-question-discipline

### Requirement: decision-fog-discipline skill identity SHALL avoid external name collisions

The skill `name` MUST be `decision-fog-discipline` (not `wayfinder`). Body English; description includes Chinese triggers.

#### Scenario: Collision-free name

- **WHEN** published in open-skills
- **THEN** `name` is `decision-fog-discipline`
