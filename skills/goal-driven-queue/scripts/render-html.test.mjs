import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeTarget,
  renderMarkdown,
  renderDocument,
  renderReviewPage,
  renderEvidencePage,
  renderFile,
  renderEntryPage,
  readTrigger,
  maybeAutoOpen,
  openInBrowser,
} from "./render-html.mjs";

const AT = "2026-10-26T00:00:00.000Z";

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "queue-html-"));
}

function render(md, options = {}) {
  return renderMarkdown(md, {
    sourcePath: options.sourcePath || "/tmp/queue/doc.md",
    generatedAt: AT,
    root: options.root || "/tmp/queue",
    ...options,
  });
}

test("escapes HTML special characters and heading placeholders", () => {
  const html = render('# <batch-id> & "q" \'s\' <script>alert(1)</script>');
  assert.match(html, /&lt;batch-id&gt;/);
  assert.match(html, /&amp;/);
  assert.match(html, /&quot;q&quot;/);
  assert.match(html, /&#39;s&#39;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("renders tables and honors escaped pipes", () => {
  const html = render("| A \\| B | C |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<table>/);
  assert.match(html, /<th>A \| B<\/th>/);
  assert.match(html, /<th>C<\/th>/);
  assert.match(html, /<td>1<\/td>/);
});

test("wraps tables in a horizontal scroll container so wide tables stay readable", () => {
  const html = render("| A | B |\n|---|---|\n| 1 | 2 |");
  assert.match(html, /<div class="table-wrap"><table>/);
  assert.match(html, /<\/table><\/div>/);
});

test("renders wide tables as labeled record cards instead of crushed columns", () => {
  const html = render("| A | B | C | D | E | F | G |\n|---|---|---|---|---|---|---|\n| 1 | 2 | 3 | 4 | 5 | 6 | 7 |");
  assert.match(html, /<dl class="record-list"><div class="record">/);
  assert.match(html, /<dt>A<\/dt><dd>1<\/dd>/);
  assert.match(html, /<dt>G<\/dt><dd>7<\/dd>/);
  assert.doesNotMatch(html, /<table>/);
});

test("renders ordered, unordered, nested lists and read-only checkboxes", () => {
  const html = render("- [x] done\n- [ ] todo\n  - nested\n1. one\n2. two");
  assert.match(html, /<input type="checkbox" disabled checked>/);
  assert.match(html, /<input type="checkbox" disabled>/);
  assert.match(html, /<ul>/);
  assert.match(html, /<ol>/);
  assert.match(html, /<li>nested<\/li>/);
});

test("renders fenced code and does not rewrite links inside it", () => {
  const html = render("```md\n[a](a.md)\n```");
  assert.match(html, /<pre><code/);
  assert.doesNotMatch(html, /<a href/);
  assert.match(html, /\[a\]\(a.md\)/);
});

test("renders blockquotes", () => {
  const html = render("> quoted");
  assert.match(html, /<blockquote>/);
  assert.match(html, /quoted/);
});

test("rewrites a relative .md link only when its .html view exists", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "a.md"), "# A\n", "utf8");
  const htmlNo = render("[a](a.md)", { sourcePath: path.join(dir, "b.md"), root: dir });
  assert.match(htmlNo, /href="a\.md"/);

  fs.writeFileSync(path.join(dir, "a.html"), "<h1>A</h1>", "utf8");
  const htmlYes = render("[a](a.md#x)", { sourcePath: path.join(dir, "b.md"), root: dir });
  assert.match(htmlYes, /href="a\.html#x"/);
});

test("blocks unsafe and protocol-relative link schemes", () => {
  for (const target of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,x",
    "vbscript:x",
    "file:///etc/passwd",
    "//example.com/x",
    "/root/relative",
    "\\windows\\path",
  ]) {
    const html = render(`[x](${target})`);
    assert.doesNotMatch(html, /<a href=/, target);
  }
  assert.equal(normalizeTarget("https://example.com").kind, "external");
  assert.equal(normalizeTarget("#frag").kind, "fragment");
});

test("renders local images and degrades external or missing images to alt text", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "img.png"), "not-a-real-png", "utf8");
  const local = render("![alt](img.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.match(local, /<img src="img\.png" alt="alt">/);

  const external = render("![alt](https://example.com/x.png)");
  assert.doesNotMatch(external, /<img /);
  assert.match(external, /alt/);

  const missing = render("![alt](missing.png)", { sourcePath: path.join(dir, "doc.md"), root: dir });
  assert.doesNotMatch(missing, /<img /);
});

test("writes a footer with the source path, source label, and generation time", () => {
  const html = render("# T", { sourceLabel: "/child/worktree/report.md" });
  assert.match(html, /<footer>/);
  assert.match(html, /\/tmp\/queue\/doc\.md/);
  assert.match(html, /\/child\/worktree\/report\.md/);
  assert.match(html, new RegExp(AT));
});

test("output is self-contained and UTF-8 with non-ASCII round-trip", () => {
  const html = render("# 标题\n\n正文");
  assert.match(html, /<meta charset="utf-8">/);
  assert.match(html, /标题/);
  assert.doesNotMatch(html, /<script/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  assert.doesNotMatch(html, /@import/i);
  assert.doesNotMatch(html, /src="https?:/i);
});

test("is deterministic for the same source and generation time", () => {
  const a = render("# T\n\nbody");
  const b = render("# T\n\nbody");
  assert.equal(a, b);
});

test("does not modify the Markdown source", () => {
  const dir = tmp();
  const source = path.join(dir, "doc.md");
  const original = "# T\n\nbody\n";
  fs.writeFileSync(source, original, "utf8");
  renderFile(source, { root: dir, generatedAt: AT });
  assert.equal(fs.readFileSync(source, "utf8"), original);
  assert.ok(fs.existsSync(path.join(dir, "doc.html")));
});

test("reads the recorded trigger and opens only for interactive", () => {
  const dir = tmp();
  const page = path.join(dir, "verification.html");
  fs.writeFileSync(page, "<html></html>", "utf8");

  const interactive = path.join(dir, "progress.md");
  fs.writeFileSync(interactive, "- Trigger: interactive\n", "utf8");
  assert.equal(readTrigger(interactive), "interactive");

  const scheduled = path.join(dir, "progress-scheduled.md");
  fs.writeFileSync(scheduled, "- Trigger: scheduled\n", "utf8");
  assert.equal(readTrigger(scheduled), "scheduled");

  const calls = [];
  const spawnFn = (command, args) => {
    calls.push({ command, args });
    return { unref() {} };
  };

  const opened = maybeAutoOpen({ trigger: "interactive", filePath: page, root: dir, spawnFn });
  assert.equal(opened.opened, true);
  assert.equal(calls.length, 1);

  const skipped = maybeAutoOpen({ trigger: "scheduled", filePath: page, root: dir, spawnFn });
  assert.equal(skipped.opened, false);
  assert.equal(calls.length, 1);
});

test("injects a cross-navigation block with relative links and unavailable markers", () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "verification.html"), "", "utf8");
  fs.writeFileSync(path.join(dir, "progress.html"), "", "utf8");
  fs.writeFileSync(path.join(dir, "card.md"), "# Card\n", "utf8");

  renderFile(path.join(dir, "card.md"), {
    root: dir,
    navRoot: dir,
    generatedAt: AT,
    nav: [
      { label: "入口", path: "verification.html" },
      { label: "进度", path: "progress.html" },
      { label: "报告", path: "missing.html" },
    ],
    unavailableLabel: "不可用",
  });

  const html = fs.readFileSync(path.join(dir, "card.html"), "utf8");
  assert.match(html, /<nav class="queue-nav"/);
  assert.match(html, /href="verification\.html"/);
  assert.match(html, /href="progress\.html"/);
  assert.match(html, /报告（不可用）/);
});

test("entry page links every category and annotates missing targets", () => {
  const dir = tmp();
  for (const rel of [
    "progress.html",
    "triage.html",
    "done-card.html",
    "failed-card.html",
    "skipped-card.html",
    "reports/done-card.html",
    "reports/failed-card.html",
    "review/done-card.html",
    "evidence/done-card.html",
  ]) {
    const absolute = path.join(dir, rel);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, "<html></html>", "utf8");
  }

  const html = renderEntryPage({
    batchId: "b1",
    generatedAt: AT,
    root: dir,
    entryPath: path.join(dir, "verification.html"),
    progressPath: "progress.html",
    triagePath: "triage.html",
    cards: [
      {
        slug: "done-card",
        status: "done",
        viewPath: "done-card.html",
        reportPath: "reports/done-card.html",
        reviewPath: "review/done-card.html",
        evidencePath: "evidence/done-card.html",
      },
      {
        slug: "failed-card",
        status: "failed",
        viewPath: "failed-card.html",
        reportPath: "reports/failed-card.html",
      },
      { slug: "skipped-card", status: "skipped", viewPath: "skipped-card.html" },
    ],
  });

  assert.match(html, /href="progress\.html"/);
  assert.match(html, /href="triage\.html"/);
  assert.match(html, /href="done-card\.html"/);
  assert.match(html, /href="review\/done-card\.html"/);
  assert.match(html, /href="evidence\/done-card\.html"/);
  assert.match(html, /href="reports\/failed-card\.html"/);
  assert.match(html, /Review failed-card/);
  assert.match(html, /Evidence failed-card/);
  assert.match(html, /<em>unavailable<\/em>/);
  assert.match(html, /Report skipped-card/);
  assert.match(html, /Review skipped-card/);

  const zeroDone = renderEntryPage({
    batchId: "b0",
    generatedAt: AT,
    root: dir,
    entryPath: path.join(dir, "verification.html"),
    progressPath: "progress.html",
    triagePath: "triage.html",
    cards: [{ slug: "skipped-card", status: "skipped", viewPath: "skipped-card.html" }],
  });
  assert.match(zeroDone, /Review skipped-card/);
  assert.match(zeroDone, /<em>unavailable<\/em>/);
});

test("renders a designed document page with header, toc, kpis and verdict", () => {
  const dir = tmp();
  const markdown = `# 人工核对 — b1

- 队列：q-1
- 核对：Verified 1 / Awaiting 0 / Returned 0
- 其他结果：Failed 0 / Skipped 0 / Parked 0 / Left pending 0

## 卡片：demo

- 引擎：opsx-solve-workflow
- 裁决：[x] verified（验收通过）

## 需要你决定的事项

- 合并 MR
`;

  const html = renderDocument(markdown, {
    sourcePath: path.join(dir, "verification.md"),
    root: dir,
    kind: "verification",
    generatedAt: AT,
  });

  assert.match(html, /class="doc-header"/);
  assert.match(html, /class="toc"/);
  assert.match(html, /class="doc-section/);
  assert.match(html, /class="kpi-row"/);
  assert.match(html, /class="field-list"/);
  assert.match(html, /class="verdict"/);
  assert.match(html, /callout-decision/);
});

test("renders a progress timeline and KPI tiles", () => {
  const markdown = `# 进度

- 窗口：07:14 → 08:16
- 触顶：无

## 概览

| 任务 | 状态 |
|---|---|
| a | done |
| b | failed |

## 关键事件

- 07:14 — 启动
- 08:16 — 完成
`;

  const html = renderDocument(markdown, {
    sourcePath: "/tmp/progress.md",
    root: "/tmp",
    kind: "progress",
    generatedAt: AT,
  });

  assert.match(html, /class="kpi-row"/);
  assert.match(html, /class="timeline"/);
  assert.match(html, /class="kpi-value">2</);
});

test("linkifies plain URLs in body text but not inside code spans", () => {
  const html = render("See https://example.com/x and `https://example.com/y`.");
  assert.match(html, /<a href="https:\/\/example\.com\/x">https:\/\/example\.com\/x<\/a>/);
  assert.match(html, /<code>https:\/\/example\.com\/y<\/code>/);
  assert.doesNotMatch(html, /<a href="https:\/\/example\.com\/y"/);
});

test("stops a plain URL at CJK punctuation", () => {
  const html = render("MR：https://example.com/pull/341；见（https://example.com/x）。");
  assert.match(html, /<a href="https:\/\/example\.com\/pull\/341">https:\/\/example\.com\/pull\/341<\/a>；见/);
  assert.match(html, /<a href="https:\/\/example\.com\/x">https:\/\/example\.com\/x<\/a>）。/);
  assert.doesNotMatch(html, /href="https:\/\/example\.com\/pull\/341；/);
});

test("links inline file paths that exist and leaves commands plain", () => {
  const workspace = tmp();
  fs.mkdirSync(path.join(workspace, "skills/demo"), { recursive: true });
  fs.writeFileSync(path.join(workspace, "skills/demo/SKILL.md"), "# demo\n", "utf8");
  const source = path.join(workspace, "doc.md");
  fs.writeFileSync(source, "See `skills/demo/SKILL.md` and run `npm test`.\n", "utf8");

  renderFile(source, { root: workspace, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(workspace, "doc.html"), "utf8");
  assert.match(html, /class="file-link"/);
  assert.match(html, /href="skills\/demo\/SKILL\.md"/);
  assert.match(html, /<code>npm test<\/code>/);
  assert.doesNotMatch(html, /file-link[^>]*>npm test/);
});

test("links bare file and directory names by existence, not by extension", () => {
  const workspace = tmp();
  fs.writeFileSync(path.join(workspace, "config"), "x\n", "utf8");
  fs.mkdirSync(path.join(workspace, "scripts"), { recursive: true });
  const source = path.join(workspace, "doc.md");
  fs.writeFileSync(source, "See `config` and `scripts/`; keep `md` and `notes/*.md` plain.\n", "utf8");

  renderFile(source, { root: workspace, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(workspace, "doc.html"), "utf8");
  assert.match(html, /class="file-link" href="config"/);
  assert.match(html, /class="file-link" href="scripts"/);
  assert.match(html, /<code>md<\/code>/);
  assert.match(html, /<code>notes\/\*\.md<\/code>/);
});

test("resolves bare names against the skill directory", () => {
  const workspace = tmp();
  const source = path.join(workspace, "doc.md");
  fs.writeFileSync(source, "See `reference.md`.\n", "utf8");

  renderFile(source, { root: workspace, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(workspace, "doc.html"), "utf8");
  assert.match(html, /class="file-link" href="[^"]*reference\.md"/);
});

test("resolves record names inside the queue's batch directories", () => {
  const queue = tmp();
  const run = path.join(queue, "runs/20260101-0000");
  fs.mkdirSync(run, { recursive: true });
  fs.writeFileSync(path.join(run, "progress.md"), "# p\n", "utf8");
  const source = path.join(queue, "card.md");
  fs.writeFileSync(source, "See `progress.md`.\n", "utf8");

  renderFile(source, { root: queue, fileRoot: queue, generatedAt: AT });

  const html = fs.readFileSync(path.join(queue, "card.html"), "utf8");
  assert.match(html, /class="file-link" href="runs\/20260101-0000\/progress\.md"/);
});

test("keeps a bare name plain when several batch directories match", () => {
  const queue = tmp();
  for (const batch of ["a", "b"]) {
    fs.mkdirSync(path.join(queue, "runs", batch), { recursive: true });
    fs.writeFileSync(path.join(queue, "runs", batch, "progress.md"), "# p\n", "utf8");
  }
  const source = path.join(queue, "card.md");
  fs.writeFileSync(source, "See `progress.md`.\n", "utf8");

  renderFile(source, { root: queue, fileRoot: queue, generatedAt: AT });

  const html = fs.readFileSync(path.join(queue, "card.html"), "utf8");
  assert.doesNotMatch(html, /class="file-link"/);
});

test("generates the review page from structured data", () => {
  const html = renderReviewPage(
    {
      title: "变更说明",
      lead: "一句话说明",
      problem: "问题",
      cause: "原因",
      fix: "修复",
      evidencePath: "evidence.html",
    },
    { root: "/tmp", generatedAt: AT },
  );
  assert.match(html, /class="doc-header"/);
  assert.match(html, /callout-problem/);
  assert.match(html, /callout-cause/);
  assert.match(html, /callout-fix/);
  assert.doesNotMatch(html, /href="evidence\.html"/);
  assert.doesNotMatch(html, /证据留痕/);
});

test("generates the evidence page from structured data", () => {
  const html = renderEvidencePage(
    {
      title: "证据留痕",
      groups: [
        { heading: "打开 UI 的检查", items: [{ label: "截图", image: "a.png" }] },
        {
          heading: "未打开 UI 的检查",
          items: [{ label: "测试", command: "npm test", output: "78/78" }],
        },
      ],
    },
    { root: "/tmp", generatedAt: AT },
  );
  assert.match(html, /<img src="a\.png"/);
  assert.match(html, /<code>npm test<\/code>/);
  assert.match(html, /78\/78/);
  assert.doesNotMatch(html, /<img[^>]+src="[^"]*test/);
});

test("open action is path-contained and shell-free", () => {
  const dir = tmp();
  const outside = tmp();
  const page = path.join(dir, "verification.html");
  fs.writeFileSync(page, "<html></html>", "utf8");
  fs.writeFileSync(path.join(outside, "x.html"), "<html></html>", "utf8");

  const calls = [];
  const spawnFn = (command, args) => {
    calls.push({ command, args });
    return { unref() {} };
  };

  const result = openInBrowser(page, { root: dir, spawnFn });
  assert.equal(result.opened, true);
  assert.equal(calls.length, 1);
  assert.ok(Array.isArray(calls[0].args));
  assert.ok(calls[0].args.includes(page));

  assert.throws(
    () => openInBrowser(path.join(outside, "x.html"), { root: dir, spawnFn }),
    /outside the queue root/,
  );
  assert.equal(calls.length, 1);
});
