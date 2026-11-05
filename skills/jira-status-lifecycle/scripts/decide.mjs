export function decidePreAnalysis({ actor, assignee, statusClass }) {
  if (actor == null || actor === "") {
    return { outcome: "stop-identity-unresolved", transition: false, notify: false };
  }
  if (assignee == null || assignee === "" || assignee !== actor) {
    return { outcome: "continue-not-assignee", transition: false, notify: true };
  }
  if (statusClass === "todo") {
    return { outcome: "need-claim", transition: true, notify: false };
  }
  if (statusClass === "in-progress") {
    return { outcome: "continue-already-in-progress", transition: false, notify: false };
  }
  return { outcome: "continue-unchanged", transition: false, notify: false };
}

export function decidePostMerge({ actor, assignee, statusClass, transitionAvailable }) {
  if (actor == null || actor === "") {
    return {
      outcome: "incomplete-identity",
      transition: false,
      comment: true,
      notify: false,
      lifecycleComplete: false,
    };
  }
  if (assignee == null || assignee === "" || assignee !== actor) {
    return {
      outcome: "incomplete-not-assignee",
      transition: false,
      comment: false,
      notify: true,
      lifecycleComplete: false,
    };
  }
  if (statusClass === "fixed") {
    return {
      outcome: "status-satisfied",
      transition: false,
      comment: true,
      notify: false,
      lifecycleComplete: true,
    };
  }
  if (!transitionAvailable) {
    return {
      outcome: "incomplete-transition",
      transition: false,
      comment: true,
      notify: false,
      lifecycleComplete: false,
    };
  }
  return {
    outcome: "transition-fixed",
    transition: true,
    comment: true,
    notify: false,
    lifecycleComplete: true,
  };
}

export function applyTransitionResult(decision, succeeded) {
  if (!decision.transition) return decision;
  if (succeeded && decision.outcome === "need-claim") {
    return { outcome: "continue-claimed", transition: false, notify: false };
  }
  if (!succeeded && decision.outcome === "need-claim") {
    return { outcome: "stop-transition-failed", transition: false, notify: false };
  }
  if (!succeeded && decision.outcome === "transition-fixed") {
    return {
      outcome: "incomplete-transition",
      transition: false,
      comment: true,
      notify: false,
      lifecycleComplete: false,
    };
  }
  if (succeeded && decision.outcome === "transition-fixed") {
    return { ...decision, transition: false, outcome: "status-satisfied", lifecycleComplete: true };
  }
  return decision;
}
