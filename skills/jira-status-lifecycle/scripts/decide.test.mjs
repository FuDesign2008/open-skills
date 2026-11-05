import test from "node:test";
import assert from "node:assert/strict";
import { applyTransitionResult, decidePostMerge, decidePreAnalysis } from "./decide.mjs";

test("pre-analysis stops when the session user cannot be resolved", () => {
  const decision = decidePreAnalysis({ actor: "", assignee: "alice", statusClass: "todo" });
  assert.equal(decision.outcome, "stop-identity-unresolved");
  assert.equal(decision.transition, false);
  assert.equal(decision.notify, false);
});

test("pre-analysis notifies and continues when the issue is not assigned to the actor", () => {
  for (const assignee of ["bob", ""]) {
    const decision = decidePreAnalysis({ actor: "alice", assignee, statusClass: "todo" });
    assert.equal(decision.outcome, "continue-not-assignee");
    assert.equal(decision.transition, false);
    assert.equal(decision.notify, true);
  }
});

test("pre-analysis claims only a todo assigned to the actor", () => {
  const claim = decidePreAnalysis({ actor: "alice", assignee: "alice", statusClass: "todo" });
  assert.equal(claim.outcome, "need-claim");
  assert.equal(claim.transition, true);
  assert.deepEqual(applyTransitionResult(claim, true), {
    outcome: "continue-claimed",
    transition: false,
    notify: false,
  });
  assert.equal(applyTransitionResult(claim, false).outcome, "stop-transition-failed");
  assert.equal(applyTransitionResult(claim, { ok: true }).outcome, "stop-transition-failed");
});

test("pre-analysis leaves in-progress and other statuses unchanged", () => {
  assert.equal(
    decidePreAnalysis({ actor: "alice", assignee: "alice", statusClass: "in-progress" }).outcome,
    "continue-already-in-progress",
  );
  const other = decidePreAnalysis({ actor: "alice", assignee: "alice", statusClass: "other" });
  assert.equal(other.outcome, "continue-unchanged");
  assert.equal(other.transition, false);
});

test("post-merge identity failure is incomplete and still requests the repair comment", () => {
  const decision = decidePostMerge({
    actor: null,
    assignee: "alice",
    statusClass: "in-progress",
    transitionAvailable: true,
  });
  assert.equal(decision.outcome, "incomplete-identity");
  assert.equal(decision.transition, false);
  assert.equal(decision.comment, true);
  assert.equal(decision.lifecycleComplete, false);
  assert.equal(decision.notify, false);
});

test("post-merge skips the status write and the repair comment when the assignee differs", () => {
  const decision = decidePostMerge({
    actor: "alice",
    assignee: "bob",
    statusClass: "in-progress",
    transitionAvailable: true,
  });
  assert.equal(decision.outcome, "incomplete-not-assignee");
  assert.equal(decision.transition, false);
  assert.equal(decision.comment, false);
  assert.equal(decision.notify, true);
  assert.equal(decision.lifecycleComplete, false);
});

test("post-merge does not treat someone else's fixed issue as satisfied", () => {
  const decision = decidePostMerge({
    actor: "alice",
    assignee: "bob",
    statusClass: "fixed",
    transitionAvailable: false,
  });
  assert.equal(decision.outcome, "incomplete-not-assignee");
  assert.equal(decision.comment, false);
  assert.equal(decision.lifecycleComplete, false);
});

test("post-merge does not treat a fixed issue as satisfied when the session user is unresolved", () => {
  const decision = decidePostMerge({
    actor: "",
    assignee: "alice",
    statusClass: "fixed",
    transitionAvailable: false,
  });
  assert.equal(decision.outcome, "incomplete-identity");
  assert.equal(decision.comment, true);
  assert.equal(decision.lifecycleComplete, false);
});

test("post-merge treats an existing fixed status as satisfied without another transition", () => {
  const decision = decidePostMerge({
    actor: "alice",
    assignee: "alice",
    statusClass: "fixed",
    transitionAvailable: false,
  });
  assert.equal(decision.outcome, "status-satisfied");
  assert.equal(decision.transition, false);
  assert.equal(decision.comment, true);
  assert.equal(decision.lifecycleComplete, true);
});

test("post-merge stays incomplete when no fixed transition exists", () => {
  const decision = decidePostMerge({
    actor: "alice",
    assignee: "alice",
    statusClass: "in-progress",
    transitionAvailable: false,
  });
  assert.equal(decision.outcome, "incomplete-transition");
  assert.equal(decision.comment, true);
  assert.equal(decision.lifecycleComplete, false);
});

test("post-merge requests the fixed transition and records an API failure as incomplete", () => {
  const decision = decidePostMerge({
    actor: "alice",
    assignee: "alice",
    statusClass: "in-progress",
    transitionAvailable: true,
  });
  assert.equal(decision.outcome, "transition-fixed");
  assert.equal(decision.transition, true);
  assert.equal(decision.lifecycleComplete, false);
  const applied = applyTransitionResult(decision, true);
  assert.equal(applied.outcome, "status-satisfied");
  assert.equal(applied.transition, false);
  assert.equal(applied.comment, true);
  assert.equal(applied.lifecycleComplete, true);
  const failed = applyTransitionResult(decision, false);
  assert.equal(failed.outcome, "incomplete-transition");
  assert.equal(failed.comment, true);
  assert.equal(failed.lifecycleComplete, false);
  const payload = applyTransitionResult(decision, { error: "transition rejected" });
  assert.equal(payload.outcome, "incomplete-transition");
  assert.equal(payload.lifecycleComplete, false);
});
