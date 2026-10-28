import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
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
  renderNav,
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

test("renders long metadata values as full-width rows instead of pills", () => {
  const markdown = `# 文档 — b1

- 状态：done
- 说明：${"很长的说明".repeat(20)}

## 章节

- 条目
`;

  const html = renderDocument(markdown, {
    sourcePath: "/tmp/doc.md",
    root: "/tmp",
    kind: "card",
    generatedAt: AT,
  });

  assert.match(html, /class="meta-row"/);
  assert.match(html, /class="meta-key">说明</);
  assert.match(html, /class="chip"/);
});

test("renders inline Markdown in the document title", () => {
  const html = renderDocument("# Goal: Use `skill-name` now\n\n## 章节\n\n- 条目\n", {
    sourcePath: "/tmp/doc.md",
    root: "/tmp",
    kind: "card",
    generatedAt: AT,
  });
  assert.match(html, /<h1>Use <code>skill-name<\/code> now<\/h1>/);
  assert.doesNotMatch(html, /<h1>[^<]*`skill-name`/);
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

test("resolves names against the record repository root when the workspace is a different tree", () => {
  const recordRepo = tmp();
  fs.mkdirSync(path.join(recordRepo, ".git"));
  const queue = path.join(recordRepo, "queue");
  fs.mkdirSync(queue);
  fs.mkdirSync(path.join(recordRepo, "records"));
  fs.writeFileSync(path.join(recordRepo, "records/data.md"), "x\n", "utf8");
  const source = path.join(queue, "doc.md");
  fs.writeFileSync(source, "See `records/data.md`.\n", "utf8");
  const workspace = tmp();

  renderFile(source, { root: queue, fileRoot: workspace, generatedAt: AT });

  const html = fs.readFileSync(path.join(queue, "doc.html"), "utf8");
  assert.match(html, /class="file-link" href="\.\.\/records\/data\.md"/);
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

test("renders field cards for card detail and acceptance summary", () => {
  const markdown = `# Card

## 卡片详情

- Engine: solve-workflow
- Status: done

## 验收摘要

- Result: pass
`;
  const html = renderDocument(markdown, {
    sourcePath: "/tmp/card.md",
    root: "/tmp",
    kind: "card",
    generatedAt: AT,
  });
  assert.equal((html.match(/class="field-list"/g) || []).length, 2);
});

test("evidence page shows inspection, pending status, and empty-list copy", () => {
  const pending = renderEvidencePage(
    {
      title: "证据留痕",
      groups: [
        {
          heading: "打开 UI 的检查",
          items: [
            {
              label: "截图",
              image: "a.png",
              status: "pending",
              note: "blank frame — capture still required",
            },
          ],
        },
      ],
    },
    { root: "/tmp", generatedAt: AT },
  );
  assert.match(pending, /pending/);
  assert.match(pending, /blank frame — capture still required/);
  assert.match(pending, /待补/);

  const empty = renderEvidencePage({ groups: [] }, { root: "/tmp", generatedAt: AT });
  assert.match(empty, /未记录任何检查/);
  assert.doesNotMatch(empty, /<img /);

  const english = renderEvidencePage(
    { groups: [] },
    { root: "/tmp", generatedAt: AT, lang: "en" },
  );
  assert.match(english, /Evidence record/);
  assert.match(english, /No checks were recorded/);
  assert.doesNotMatch(english, /证据留痕/);
});

test("chrome labels follow lang for toc and entry kicker", () => {
  const zh = renderDocument("# T\n\n## 章节\n\n- a\n", {
    sourcePath: "/tmp/doc.md",
    root: "/tmp",
    kind: "progress",
    generatedAt: AT,
  });
  assert.match(zh, /本页目录/);
  assert.match(zh, /<html lang="zh">/);
  assert.match(zh, /来源:/);
  assert.match(zh, /生成:/);
  assert.doesNotMatch(zh, /Source:/);
  assert.doesNotMatch(zh, /Generated:/);

  const en = renderDocument("# T\n\n## Section\n\n- a\n", {
    sourcePath: "/tmp/doc.md",
    root: "/tmp",
    kind: "progress",
    generatedAt: AT,
    lang: "en",
  });
  assert.match(en, /On this page/);
  assert.match(en, /<html lang="en">/);
  assert.match(en, /Source:/);
  assert.match(en, /Generated:/);
  assert.doesNotMatch(en, /本页目录/);
  assert.doesNotMatch(en, /来源:/);

  const entry = renderEntryPage({
    root: "/tmp",
    entryPath: "/tmp/verification.html",
    batchId: "b1",
    lang: "en",
    generatedAt: AT,
  });
  assert.match(entry, /Acceptance entry/);
  assert.doesNotMatch(entry, /验收入口/);
});

test("evidence page image src goes through normalizeTarget", () => {
  const safe = renderEvidencePage(
    {
      groups: [{ heading: "UI", items: [{ label: "shot", image: "copies/a.png" }] }],
    },
    { root: "/tmp", generatedAt: AT },
  );
  assert.match(safe, /<img src="copies\/a\.png"/);

  for (const bad of ["javascript:alert(1)", "/etc/passwd", "//evil.example/x.png", "data:image/png;base64,xx"]) {
    const html = renderEvidencePage(
      { groups: [{ heading: "UI", items: [{ label: "shot", image: bad }] }] },
      { root: "/tmp", generatedAt: AT },
    );
    assert.doesNotMatch(html, /<img /);
    assert.doesNotMatch(html, /javascript:/i);
  }
});

test("evidence figure images are lightbox-activatable", () => {
  const html = renderEvidencePage(
    {
      title: "证据",
      groups: [{ heading: "UI", items: [{ label: "截图", image: "a.png", alt: "shot" }] }],
    },
    { sourcePath: "/tmp/queue/evidence.html", root: "/tmp/queue", generatedAt: AT },
  );
  assert.match(html, /data-lightbox/);
  assert.match(html, /<img src="a\.png"/);
  assert.match(html, /id="queue-lightbox"/);
});

test("evidence images outside the root are not referenced", () => {
  const html = renderEvidencePage(
    { groups: [{ heading: "UI", items: [{ label: "x", image: "../../../../etc/hosts" }] }] },
    { root: "/tmp", generatedAt: AT },
  );
  assert.doesNotMatch(html, /<img /);
});

test("degrade branch prints only source paths, not option values", () => {
  const dir = tmp();
  const scripts = path.join(dir, "scripts");
  fs.mkdirSync(scripts, { recursive: true });
  fs.copyFileSync(
    new URL("./render-html.mjs", import.meta.url),
    path.join(scripts, "render-html.mjs"),
  );
  const source = path.join(dir, "doc.md");
  fs.writeFileSync(source, "# t\n", "utf8");
  const result = spawnSync(
    process.execPath,
    [path.join(scripts, "render-html.mjs"), source, "--root", dir, "--at", "2026-01-01T00:00:00.000Z"],
    { encoding: "utf8" },
  );
  const lines = result.stdout.trim().split("\n").filter(Boolean);
  assert.deepEqual(lines, [source]);
});
