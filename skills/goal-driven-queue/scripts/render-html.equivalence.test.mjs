// Byte-level equivalence baselines for the queue adapter.
//
// The adapter is expected to keep producing identical HTML across internal
// refactors. These fixtures pin the whole document by SHA-256 so a pure code
// move cannot silently change whitespace, ordering, or escaping.
//
// Run with QUEUE_EQUIV_CAPTURE=1 to print fresh hashes after an intentional
// output change; paste them into BASELINES and review the diff of the printed
// HTML before accepting it.
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  renderDocument,
  renderEntryPage,
  renderReviewPage,
  renderEvidencePage,
} from "./render-html.mjs";

const AT = "2026-10-30T00:00:00.000Z";
const CAPTURE = process.env.QUEUE_EQUIV_CAPTURE === "1";

const CARD = `# Goal: card-a
- Status: done
- Engine: solve-workflow
- MR: opened https://example.com/pr/1

## 概览
卡片用于验证队列文档版式。

## 卡片详情
- 裁决：accepted
- 说明：修复了空指针。

## 验证清单
- 功能：done
- 边界：done
`;

const TRIAGE = `# Triage 2026-10-30

- 本批卡片: 3

## 合并与分簇
- card-a / card-b 同根因，合并为一张卡。
- card-c 建议 kill。

## 其余观察
- 无。
`;

const PROGRESS = `# 队列进度

- 窗口: 22:00-06:00
- 触顶: 并发

## 概览
| 卡片 | 状态 |
| --- | --- |
| card-a | done |
| card-b | failed |
| card-c | pending |

## 关键事件
- 22:10 card-a 下发
- 23:00 card-a done
`;

const VERIFICATION = `# 人工核对

- 核对: Verified 2 / Awaiting 1 / Returned 0
- 其他结果: Failed 1 / Skipped 0 / Parked 0 / Left pending 1

## 核对清单
- card-a: done
- card-b: failed

## 需要你决定
- 是否接受 card-b 的 no-diff 结论。
`;

const REPORT = `# 完成报告

- 结果: done
- MR: opened https://example.com/pr/2

## 问题
卡片状态未更新。

## 原因
状态写入发生在子进程内。

## 已完成的修复
改由 dispatcher 统一写入。

> 详细命令见 \`handleDone\`。
`;

const DOCUMENTS = [
  ["card-zh", CARD, { kind: "card", lang: "zh" }],
  ["card-en", CARD, { kind: "card", lang: "en" }],
  ["triage-zh", TRIAGE, { kind: "triage", lang: "zh" }],
  ["triage-en", TRIAGE, { kind: "triage", lang: "en" }],
  ["progress-zh", PROGRESS, { kind: "progress", lang: "zh" }],
  ["progress-en", PROGRESS, { kind: "progress", lang: "en" }],
  ["verification-zh", VERIFICATION, { kind: "verification", lang: "zh" }],
  ["verification-en", VERIFICATION, { kind: "verification", lang: "en" }],
  ["report-zh", REPORT, { kind: "report", lang: "zh" }],
  ["report-en", REPORT, { kind: "report", lang: "en" }],
  ["document-zh", REPORT, { kind: "document", lang: "zh" }],
  ["document-en", REPORT, { kind: "document", lang: "en" }],
];

const BASELINES = {
  "document:card-zh": "6aac65478614976af2e2616a5325712107698c02a06639e63b5020b74d8c4627",
  "document:card-en": "0fb7b750ce9a85dff444f38f0a7669fa83e4b919df0e06bf1d85f11ccad3707d",
  "document:triage-zh": "0f7ee01ab1c80933fb2c37e96284b038ac67f670c7b18a4c7e9aee017b75627d",
  "document:triage-en": "c976a6c72a60b82d3c14bf4302d789c798810ed70c22725dabb887dceeaa59be",
  "document:progress-zh": "5d62774f54e2e8064550c2ea297bd753cf723b95c3edc5e1cc1efc1730eb3a5b",
  "document:progress-en": "77d58e9b0c56f0fda6a8011754a6c365d317aa53b38f64fcbd734eb09fea1d0f",
  "document:verification-zh": "a6c04186be5e87f010215ff555bc16a1a13bfc08b5a6c2711011c3f63453c56f",
  "document:verification-en": "4818b18a79f33503db2b12d1df277856dca9a7d5b411295ae9ea4484c2549d82",
  "document:report-zh": "7642bbc474fee1d37f985d2f65850dd962b2549471de3d8a1c416b51cbe29d05",
  "document:report-en": "35b71607754ecb67183f6634a7fe6d1c2ce13c2d841f785a018e76b80e6ece76",
  "document:document-zh": "2c8bb857b6675c6fb7cc9fe9a5cade3cfa0251e0e4ed3cc45ef339bc03b40ae9",
  "document:document-en": "c6fc7e1b01160aef0a0d8fe2344d20e24d4cef568f2c2f5cbd20504191ee8030",
  "page:entry": "a3fa88e7d18de6ff731c672f2fc56efc3adc8cad1cb2fc1221eb4dd4d99b545a",
  "page:entry-en": "5ec03f179ad91299665f64024c381c215cc6c31484bfb2fde143a0ebc733f6b8",
  "page:review": "37bd2c049f29c56310101722b576e69c7eae6b66cad15ad20c759752ee17be85",
  "page:review-en": "8c252ee7cf15d1b8f0d3c4e1635a1fd1800af844044457b4d2c8ed7f12ab7475",
  "page:review-nav": "64d23f71fcc5104bfc4d1267bc33941f7bc55bdf19ea893fd44e709c48f09788",
  "page:evidence": "fd805276dceb51484eb54e80b9aceb3c1f89c8dc872de716311efe97eb308f27",
  "page:evidence-en": "12fe363bb78094aee45bd7c6deca7ec73db16f3b75ef5788498a76ebd2150686",
  "page:evidence-empty": "f7d2130994f120d1779bbf698073330c85599669248335509169a70bc8f806bd",
};

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "queue-equivalence-"));
  for (const rel of [
    "progress.html",
    "triage.html",
    "content.html",
    "card-a.html",
    "reports/card-a.html",
    "review/card-a.html",
    "evidence/card-a.html",
    "evidence/card-a/shot.png",
  ]) {
    const absolute = path.join(root, rel);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, "fixture", "utf8");
  }
  return root;
}

function normalize(html, root) {
  return html.split(root).join("<ROOT>");
}

function outputs() {
  const map = new Map();
  for (const [name, markdown, options] of DOCUMENTS) {
    map.set(
      `document:${name}`,
      renderDocument(markdown, {
        sourcePath: "queue/run/card.md",
        root: "queue/run",
        generatedAt: AT,
        linkExists: () => true,
        ...options,
      }),
    );
  }

  const root = fixtureRoot();
  map.set(
    "page:entry",
    normalize(
      renderEntryPage({
        batchId: "batch-1",
        generatedAt: AT,
        root,
        entryPath: path.join(root, "verification.html"),
        progressPath: "progress.html",
        triagePath: "triage.html",
        contentPath: "content.html",
        cards: [
          {
            slug: "card-a",
            status: "done",
            viewPath: "card-a.html",
            reportPath: "reports/card-a.html",
            reviewPath: "review/card-a.html",
            evidencePath: "evidence/card-a.html",
          },
          { slug: "card-b", status: "failed", viewPath: "card-b.html" },
        ],
        extras: [{ label: "Runbook", path: "runbook.html" }],
        kpis: [
          ["Verified", "2"],
          ["Awaiting", "1"],
        ],
      }),
      root,
    ),
  );
  map.set(
    "page:entry-en",
    normalize(
      renderEntryPage({
        batchId: "batch-1",
        generatedAt: AT,
        root,
        lang: "en",
        entryPath: path.join(root, "verification.html"),
        progressPath: "progress.html",
        triagePath: "triage.html",
        contentPath: "content.html",
        cards: [{ slug: "card-a", status: "done", viewPath: "card-a.html" }],
      }),
      root,
    ),
  );
  map.set(
    "page:review",
    normalize(
      renderReviewPage(
        {
          title: "card-a",
          lead: "状态写入修复",
          problem: "卡片状态未更新。\n- 子进程写入被覆盖",
          cause: "写入发生在子进程内。",
          fix: "改由 dispatcher 统一写入。\n\n```js\nhandleDone(card)\n```",
        },
        { generatedAt: AT, root, sourcePath: path.join(root, "review.md") },
      ),
      root,
    ),
  );
  map.set(
    "page:review-en",
    normalize(
      renderReviewPage(
        {
          title: "card-a",
          lead: "Status write fix",
          problem: "Card status was not updated.",
          cause: "The child wrote state directly.",
          fix: "The dispatcher writes it now.",
        },
        { generatedAt: AT, root, lang: "en", sourcePath: path.join(root, "review.md") },
      ),
      root,
    ),
  );
  map.set(
    "page:review-nav",
    normalize(
      renderReviewPage(
        { title: "card-a", problem: "p", cause: "c", fix: "f" },
        {
          generatedAt: AT,
          root,
          sourcePath: path.join(root, "review.md"),
          navHtml: '<nav class="shared-nav"><a href="review.html">review</a></nav>',
        },
      ),
      root,
    ),
  );
  map.set(
    "page:evidence",
    normalize(
      renderEvidencePage(
        {
          title: "card-a",
          intro: "两项检查",
          groups: [
            {
              heading: "功能",
              items: [
                {
                  label: "打开设置页",
                  image: "evidence/card-a/shot.png",
                  note: "截图已核对",
                },
                {
                  label: "运行命令",
                  command: "npm test",
                  output: "ok",
                  status: "done",
                },
              ],
            },
            {
              heading: "边界",
              items: [{ label: "空输入", status: "pending", note: "待补" }],
            },
          ],
        },
        { generatedAt: AT, root, sourcePath: path.join(root, "evidence.md") },
      ),
      root,
    ),
  );
  map.set(
    "page:evidence-en",
    normalize(
      renderEvidencePage(
        {
          title: "card-a",
          groups: [
            {
              heading: "Checks",
              items: [
                { label: "Open settings", image: "evidence/card-a/shot.png", note: "Reviewed" },
                { label: "Boundary", status: "pending", note: "Still required" },
              ],
            },
          ],
        },
        {
          generatedAt: AT,
          root,
          lang: "en",
          sourcePath: path.join(root, "evidence.md"),
        },
      ),
      root,
    ),
  );
  map.set(
    "page:evidence-empty",
    normalize(
      renderEvidencePage(
        { title: "card-b" },
        { generatedAt: AT, root, sourcePath: path.join(root, "evidence.md") },
      ),
      root,
    ),
  );
  return map;
}

test("queue adapter output matches its byte-level baselines", () => {
  const actual = outputs();
  if (CAPTURE) {
    for (const [name, html] of actual) {
      process.stdout.write(`${name} ${sha256(html)}\n`);
    }
    return;
  }

  for (const [name, html] of actual) {
    assert.equal(
      sha256(html),
      BASELINES[name],
      `HTML for ${name} changed; inspect the rendered output before updating the baseline`,
    );
  }
});
