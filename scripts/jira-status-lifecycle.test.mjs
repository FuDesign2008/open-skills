import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");

function frontmatter(rel) {
  const match = read(rel).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match, `missing frontmatter: ${rel}`);
  return match[1];
}

function dependencies(rel) {
  const lines = frontmatter(rel).split(/\r?\n/);
  const start = lines.findIndex((line) => /^dependencies:\s*$/.test(line));
  if (start === -1) return [];
  const deps = [];
  for (const line of lines.slice(start + 1)) {
    const match = line.match(/^\s+-\s+(.+?)\s*$/);
    if (!match) break;
    deps.push(match[1]);
  }
  return deps;
}

const lifecycle = "skills/jira-status-lifecycle/SKILL.md";
const outcomes = [
  "stop-identity-unresolved",
  "stop-transition-failed",
  "need-claim",
  "continue-claimed",
  "continue-already-in-progress",
  "continue-unchanged",
  "continue-not-assignee",
  "incomplete-identity",
  "incomplete-not-assignee",
  "status-satisfied",
  "transition-fixed",
  "incomplete-transition",
];

test("lifecycle skill does not depend on the writeback skill", () => {
  assert.deepEqual(dependencies(lifecycle), []);
  assert.equal(frontmatter(lifecycle).includes("user-invocable: false"), true);
});

test("jira hosts and writeback depend on the lifecycle skill", () => {
  for (const rel of [
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/jira-status-writeback/SKILL.md",
  ]) {
    assert.ok(dependencies(rel).includes("jira-status-lifecycle"), rel);
  }
});

test("skill prose names every decision outcome", () => {
  const body = read(lifecycle);
  for (const outcome of outcomes) {
    assert.ok(body.includes(outcome), `missing outcome ${outcome}`);
  }
  assert.equal(body.includes("jira-status-writeback"), true);
});
