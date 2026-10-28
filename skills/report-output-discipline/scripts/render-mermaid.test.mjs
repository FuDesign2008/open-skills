import test from "node:test";
import assert from "node:assert/strict";
import { parseFlowchart, renderMermaid } from "./render-mermaid.mjs";

test("renders a basic flowchart with nodes and a labelled edge", () => {
  const svg = renderMermaid("flowchart TB\n  A[开始] -->|下一步| B[结束]");
  assert.ok(svg.startsWith("<svg"));
  assert.match(svg, /开始/);
  assert.match(svg, /结束/);
  assert.match(svg, /下一步/);
  assert.doesNotMatch(svg, /<script/i);
  assert.doesNotMatch(svg, /\b(?:src|href)=/i);
});

test("supports every declared direction", () => {
  for (const direction of ["TB", "TD", "BT", "LR", "RL"]) {
    const svg = renderMermaid(`flowchart ${direction}\n  A --> B`);
    assert.ok(svg, `${direction} should render`);
  }
});

test("renders every declared node shape", () => {
  const svg = renderMermaid("flowchart TB\n  A[rect] --> B(round)\n  B --> C{diamond}\n  C --> D([stadium])\n  D --> E((circle))");
  assert.ok(svg);
  assert.match(svg, /<rect/);
  assert.match(svg, /<polygon/);
  assert.match(svg, /<ellipse/);
});

test("renders quoted subgraph titles", () => {
  const svg = renderMermaid('flowchart TB\n  subgraph Client["客户端"]\n    A[应用]\n  end\n  B[服务]');
  assert.ok(svg);
  assert.match(svg, /客户端/);
  assert.match(svg, /mermaid-subgraph/);
});

test("escapes node labels", () => {
  const svg = renderMermaid("flowchart TB\n  A[<script>x</script>] --> B[y]");
  assert.ok(svg);
  assert.doesNotMatch(svg, /<script>/);
  assert.match(svg, /&lt;script&gt;/);
});

test("boundary: empty and header-only sources do not render", () => {
  assert.equal(renderMermaid(""), null);
  assert.equal(renderMermaid("flowchart TB"), null);
  assert.equal(renderMermaid("   \n  \n"), null);
});

test("boundary: a single node renders without edges", () => {
  const svg = renderMermaid("flowchart LR\n  A[only]");
  assert.ok(svg);
  assert.match(svg, /only/);
});

test("boundary: a cycle still terminates and renders", () => {
  const svg = renderMermaid("flowchart TB\n  A --> B\n  B --> A");
  assert.ok(svg);
});

test("error: unsupported diagram types degrade", () => {
  for (const source of [
    "sequenceDiagram\n  A->>B: hi",
    "classDiagram\n  A <|-- B",
    "stateDiagram-v2\n  [*] --> A",
    "gantt\n  title x",
    "pie\n  \"a\": 1",
  ]) {
    assert.equal(renderMermaid(source), null, source.split("\n")[0]);
  }
});

test("error: unsupported constructs inside a supported type degrade the whole graph", () => {
  for (const source of [
    "flowchart TB\n  A --> B\n  classDef warn fill:#f00",
    "flowchart TB\n  A --> B\n  class A warn",
    "flowchart TB\n  A --> B\n  style A fill:#f00",
    "flowchart TB\n  A --> B\n  linkStyle 0 stroke:#f00",
    "flowchart TB\n  A[a<br/>b] --> B",
    "flowchart TB\n  A --> B\n  click A callback",
  ]) {
    assert.equal(renderMermaid(source), null, source);
  }
});

test("parser reports the reason for degradation", () => {
  assert.deepEqual(parseFlowchart("sequenceDiagram\n  A->>B: hi"), { ok: false, reason: "unsupported-type" });
  assert.deepEqual(parseFlowchart("flowchart TB\n  A --> B\n  classDef x fill:#f00"), {
    ok: false,
    reason: "unsupported-construct",
  });
});
