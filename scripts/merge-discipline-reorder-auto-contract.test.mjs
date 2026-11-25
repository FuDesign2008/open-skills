import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url);

function read(rel) {
  return fs.readFileSync(new URL(rel, root), "utf8");
}

function walk(relDir, acc = []) {
  const abs = new URL(relDir, root);
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.posix.join(relDir, entry.name);
    if (entry.isDirectory()) {
      if (rel.includes("openspec/changes/archive")) continue;
      walk(rel, acc);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".json")) {
      acc.push(rel);
    }
  }
  return acc;
}

test("merge execution order is A→B→R→C→D in active skills and specs", () => {
  const files = [
    ...walk("skills"),
    ...walk("openspec/specs"),
  ];
  const hits = [];
  for (const rel of files) {
    const text = read(rel);
    if (text.includes("A→B→C→R→D") || text.includes("A → B → C → R → D")) {
      hits.push(rel);
    }
  }
  assert.deepEqual(hits, []);
});

test("feature-branch-closeout no longer says A→B→C→D", () => {
  for (const rel of [
    "skills/feature-branch-closeout/SKILL.md",
    "openspec/specs/feature-branch-closeout/spec.md",
  ]) {
    const text = read(rel);
    assert.equal(text.includes("A→B→C→D"), false, rel);
    assert.match(text, /A→B→R→C→D|A → B → R → C → D/);
  }
});

test("coverage-gate enum includes auto and unset stays ask", () => {
  const skill = read("skills/merge-discipline/SKILL.md");
  assert.match(skill, /coverage-gate:\\s\*\(always\|never\|ask\|auto\)\\b/);
  assert.match(skill, /unset ≡ `ask`/);
  assert.match(skill, /NOT `auto`|not `auto`/);
  const agents = read("AGENTS.md");
  assert.match(agents, /^`coverage-gate: never`$/m);
  assert.match(agents, /coverage-gate: always` \| `never` \| `ask` \| `auto`/);
  assert.match(agents, /未声明 ≡ `ask`/);
});

test("Part R satisfaction 留痕 includes tip and clean-pass template", () => {
  const skill = read("skills/merge-discipline/SKILL.md");
  assert.match(
    skill,
    /【PR code-review 门控通过】tip=<sha>。时间：<ISO>。PR：<id>。depth=<light\|full>。/,
  );
  assert.match(skill, /【PR code-review 门控跳过】用户显式跳过 Part R（pr-code-review）。tip=<sha>/);
  assert.match(skill, /【PR code-review 残留接受】[\s\S]*tip=<sha>/);
  assert.match(skill, /工程偏好 pr-review-gate: never。tip=<sha>/);
});

test("tip check before Part D is fail-closed", () => {
  const skill = read("skills/merge-discipline/SKILL.md");
  assert.match(skill, /T_trace/);
  assert.match(skill, /T_tracking/);
  assert.match(skill, /T_pr/);
  assert.match(skill, /T_local/);
  assert.match(skill, /git fetch origin <source/);
  assert.match(skill, /MUST NOT enter Part D|do \*\*not\*\* enter Part D/);
  assert.match(skill, /new merge attempt from Part A/);
});

test("coverage auto four-cell skips only non-app or empty with no scale hit", () => {
  const skill = read("skills/merge-discipline/SKILL.md");
  const reference = read("skills/merge-discipline/reference.md");
  assert.match(skill, /changed-paths=0/);
  assert.match(skill, /post-fail re-entry/);
  assert.match(skill, /auto-skip/);
  assert.match(skill, /not an implicit miss|NOT implicit misses|are \*\*not\*\* implicit misses/);
  assert.match(reference, /Coverage auto four-cell/);
  assert.match(reference, /post-fail re-entry/);
});

test("hosts keep a thin A→B→R→C→D pointer", () => {
  for (const rel of [
    "skills/jira-fix-workflow/SKILL.md",
    "skills/opsx-solve-workflow/SKILL.md",
    "skills/opsx-jira-fix-workflow/SKILL.md",
    "skills/feature-branch-closeout/SKILL.md",
  ]) {
    const text = read(rel);
    assert.match(text, /A→B→R→C→D|A → B → R → C → D/);
    assert.equal(text.includes("A→B→C→R→D"), false, rel);
    assert.equal(text.includes("A → B → C → R → D"), false, rel);
  }
});

test("evals record the new order and auto dry-runs", () => {
  const evals = read("skills/merge-discipline/evals/evals.json");
  assert.equal(evals.includes("A→B→C→R→D"), false);
  assert.match(evals, /A→B→R→C→D/);
  assert.match(evals, /coverage-gate: auto/);
  assert.match(evals, /tip=/);
  const parsed = JSON.parse(evals);
  const names = parsed.evals.map((item) => item.name);
  for (const name of [
    "coverage-auto-non-app-skip",
    "coverage-auto-app-runs",
    "coverage-auto-scale-hit-runs",
    "coverage-auto-classify-fail-runs",
    "part-r-pass-writes-tip",
    "tip-moved-during-coverage-pause",
  ]) {
    assert.ok(names.includes(name), name);
  }
});

test("openspec change and main specs carry auto, tip, and order", () => {
  const change = "openspec/changes/merge-coverage-reorder-auto";
  for (const rel of [
    `${change}/proposal.md`,
    `${change}/design.md`,
    `${change}/tasks.md`,
    `${change}/specs/merge-discipline/spec.md`,
    `${change}/specs/workflow-contract-sync/spec.md`,
    `${change}/specs/feature-branch-closeout/spec.md`,
  ]) {
    assert.equal(fs.existsSync(new URL(rel, root)), true, rel);
  }
  const main = read("openspec/specs/merge-discipline/spec.md");
  assert.match(main, /A→B→R→C→D/);
  assert.equal(main.includes("A→B→C→R→D"), false);
  assert.match(main, /always`, `never`, `ask`, or `auto`/);
  assert.match(main, /tip=<full sha/);
  assert.match(main, /T_trace/);
  const sync = read("openspec/specs/workflow-contract-sync/spec.md");
  assert.match(sync, /`always` \/ `never` \/ `ask` \/ `auto`/);
  assert.match(sync, /auto-skip/);
  const closeout = read("openspec/specs/feature-branch-closeout/spec.md");
  assert.match(closeout, /A→B→R→C→D/);
});
