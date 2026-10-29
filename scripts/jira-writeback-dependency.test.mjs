import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");
const exists = (rel) => fs.existsSync(new URL(rel, root));

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

test("jira-status-writeback declares its runtime dependencies", () => {
  const deps = dependencies("skills/jira-status-writeback/SKILL.md");
  assert.ok(deps.includes("jira-wiki-markup"), "missing jira-wiki-markup dependency");
  assert.ok(deps.includes("jira-read"), "missing jira-read dependency");
});

test("every declared dependency resolves to a skill in this repo", () => {
  for (const dep of dependencies("skills/jira-status-writeback/SKILL.md")) {
    assert.ok(exists(`skills/${dep}/SKILL.md`), `declared dependency has no skill directory: ${dep}`);
  }
});

test("fallback script imports a resolver that jira-read provides", () => {
  const script = read("skills/jira-status-writeback/scripts/update-comment-wiki.mjs");
  const specifier = script.match(/from\s+["']([^"']*resolve-jira-token\.mjs)["']/);
  assert.ok(specifier, "fallback script no longer imports resolve-jira-token.mjs");
  const target = new URL(specifier[1], new URL("skills/jira-status-writeback/scripts/", root));
  assert.ok(fs.existsSync(target), `fallback import target missing: ${target.pathname}`);
});

test("jira-fix-workflow declares jira-read for its credential chain", () => {
  const deps = dependencies("skills/jira-fix-workflow/SKILL.md");
  assert.ok(deps.includes("jira-read"), "jira-fix-workflow must declare jira-read");
});
