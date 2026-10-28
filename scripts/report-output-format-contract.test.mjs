import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("..", import.meta.url);
const read = (rel) => fs.readFileSync(new URL(rel, root), "utf8");
const exists = (rel) => fs.existsSync(new URL(rel, root));

const REGISTRY = "skills/report-output-discipline/reference.md";

function skillNames() {
  return fs
    .readdirSync(new URL("skills/", root), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && exists(`skills/${entry.name}/SKILL.md`))
    .map((entry) => entry.name)
    .sort();
}

function parseRegistry() {
  const lines = read(REGISTRY).split("\n");
  const rows = [];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 9) continue;
    if (cells[0] === "Product" || cells[0].startsWith("---")) continue;
    rows.push({
      product: cells[0],
      skills: cells[1].split("/").map((name) => name.trim()).filter(Boolean),
      klass: cells[2],
      evidence: cells[3],
      source: cells[4],
      derived: cells[5],
      path: cells[6],
      suppression: cells[7],
      status: cells[8],
    });
  }
  return rows;
}

function parseWhitelist() {
  const text = read(REGISTRY);
  const section = (text.split("## Coverage whitelist")[1] || "").split(/\n## /)[0];
  return new Set([...section.matchAll(/`([a-z0-9-]+)`/g)].map((m) => m[1]));
}

const rows = parseRegistry();
const whitelist = parseWhitelist();

test("registry parses and uses only declared class/status values", () => {
  assert.ok(rows.length >= 20, `expected a populated registry, got ${rows.length} rows`);
  for (const row of rows) {
    assert.ok(["machine", "dual", "human"].includes(row.klass), `bad class: ${row.product} -> ${row.klass}`);
    assert.ok(["接入", "sink 待定", "未接入"].includes(row.status), `bad status: ${row.product} -> ${row.status}`);
  }
});

test("every registered producing skill exists", () => {
  const names = new Set(skillNames());
  for (const row of rows) {
    for (const skill of row.skills) {
      assert.ok(names.has(skill), `registry names a missing skill: ${skill} (${row.product})`);
    }
  }
});

test("coverage: every non-whitelisted skill has a registry row", () => {
  const covered = new Set(rows.flatMap((row) => row.skills));
  const missing = skillNames().filter((name) => !covered.has(name) && !whitelist.has(name));
  assert.deepEqual(missing, [], `skills without a registry row or whitelist entry: ${missing.join(", ")}`);
});

test("whitelist names only real skills", () => {
  const names = new Set(skillNames());
  for (const name of whitelist) {
    assert.ok(names.has(name), `whitelist names a missing skill: ${name}`);
  }
});

test("consumer evidence follows the class rule", () => {
  for (const row of rows) {
    if (row.klass === "machine" || row.klass === "dual") {
      assert.ok(row.evidence.length > 0, `${row.klass} row lacks consumer evidence: ${row.product}`);
      assert.match(row.evidence, /:\d+/, `${row.klass} evidence must anchor a line: ${row.product}`);
    }
    if (row.klass === "human") {
      const isException = row.evidence.startsWith("既有契约");
      if (isException) {
        assert.match(row.evidence, /^既有契约（.+:\d+）$/, `exception evidence must name its read point: ${row.product}`);
      } else {
        assert.equal(row.evidence, "", `human row must leave evidence empty: ${row.product}`);
      }
    }
  }
});

test("integrated rows carry a path and a derived format", () => {
  for (const row of rows.filter((entry) => entry.status === "接入")) {
    assert.ok(row.path.length > 0 && row.path !== "无固定路径", `integrated row lacks a path: ${row.product}`);
    assert.equal(row.derived, "html", `integrated row must derive html: ${row.product}`);
    assert.equal(row.source, "md", `integrated row must have an md source: ${row.product}`);
    assert.notEqual(row.suppression, "不适用", `integrated row must state its suppression: ${row.product}`);
  }
});

test("sink-pending rows have no fixed path", () => {
  for (const row of rows.filter((entry) => entry.status === "sink 待定")) {
    assert.equal(row.path, "No fixed path", `sink-pending row must not fix a path: ${row.product}`);
  }
});

test("machine rows never claim a derived HTML", () => {
  for (const row of rows.filter((entry) => entry.klass === "machine")) {
    assert.equal(row.derived, "", `machine row must not derive html: ${row.product}`);
  }
});

test("mermaid: every template diagram renders to inline SVG", async () => {
  const { renderMermaid } = await import("../skills/report-output-discipline/scripts/render-mermaid.mjs");
  const template = read("skills/tech-review-doc/template.md");
  const blocks = [...template.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1]);
  assert.equal(blocks.length, 4, "template is expected to carry four mermaid diagrams");
  for (const [index, block] of blocks.entries()) {
    const svg = renderMermaid(block);
    assert.ok(svg && svg.startsWith("<svg"), `template diagram ${index + 1} did not render`);
    assert.ok(svg.includes("<text"), `template diagram ${index + 1} has no node labels`);
    assert.doesNotMatch(svg, /<script/i, `template diagram ${index + 1} emitted a script`);
    assert.doesNotMatch(svg, /\b(?:src|href)=/i, `template diagram ${index + 1} referenced an external resource`);
  }
});

test("mermaid: unsupported types and constructs degrade as a whole graph", async () => {
  const { renderMermaid } = await import("../skills/report-output-discipline/scripts/render-mermaid.mjs");
  const cases = {
    sequenceDiagram: "sequenceDiagram\n  A->>B: hi",
    classDef: "flowchart TB\n  A --> B\n  classDef warn fill:#f00",
    style: "flowchart TB\n  A --> B\n  style A fill:#f00",
    htmlLabel: "flowchart TB\n  A[a<br/>b] --> B",
  };
  for (const [name, source] of Object.entries(cases)) {
    assert.equal(renderMermaid(source), null, `${name} should degrade rather than render`);
  }
});

test("renderer: mermaid fence becomes a figure, not a silent code block", async () => {
  const { renderMarkdown } = await import("../skills/report-output-discipline/scripts/render-core.mjs");
  const html = renderMarkdown("# t\n\n```mermaid\nflowchart TB\n  A[开始] --> B[结束]\n```\n", {
    sourcePath: "/tmp/x.md",
    generatedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.match(html, /<figure class="mermaid-figure"><svg/);
  assert.doesNotMatch(html, /language-mermaid/);
});

test("renderer: unsupported mermaid keeps source under a visible marker", async () => {
  const { renderMarkdown } = await import("../skills/report-output-discipline/scripts/render-core.mjs");
  const html = renderMarkdown("# t\n\n```mermaid\nsequenceDiagram\n  A->>B: hi\n```\n", {
    sourcePath: "/tmp/x.md",
    generatedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.match(html, /mermaid-degraded/);
  assert.match(html, /language-mermaid/);
  assert.match(html, /图未渲染|Diagram not rendered/);
});

test("integrated hosts declare the dependency and call the shared renderer", () => {
  const hosts = {
    "skills/tech-review-doc/SKILL.md": /tech-review-\*-\*\.html|tech-review-\{topic\}-\{YYYY-MM-DD\}\.html/,
    "skills/test-guide-from-code/SKILL.md": /manual_test_guide<|_manual_test_guide_<YYYY-MM-DD>\.html|同名 \.html/,
    "skills/git-release-finish/SKILL.md": /release-<VERSION>-report\.html/,
  };
  for (const [file, derivedPattern] of Object.entries(hosts)) {
    const body = read(file);
    assert.match(body, /report-output-discipline/, `${file} must declare or reference the discipline`);
    assert.match(body, derivedPattern, `${file} must state the derived HTML path`);
    assert.match(body, /both paths/i, `${file} must report both paths`);
    assert.match(body, /npx skills add[^\n]*--skill/, `${file} must abort with an install command when the discipline is missing`);
  }
});


test("every host runs a prerequisite check for the discipline", () => {
  for (const file of [
    "skills/tech-review-doc/SKILL.md",
    "skills/test-guide-from-code/SKILL.md",
    "skills/git-release-finish/SKILL.md",
    "skills/goal-driven-queue/SKILL.md",
    "skills/goal-driven-workflow/SKILL.md",
  ]) {
    const body = read(file);
    assert.match(body, /dependencies:\s*\n(?:\s+- .*\n)*\s+- report-output-discipline/, `${file} must declare the dependency`);
    assert.match(body, /abort|install guidance|npx skills add/, `${file} must state the abort / install path`);
  }
});
