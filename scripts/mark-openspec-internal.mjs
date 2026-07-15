#!/usr/bin/env node
/**
 * 给 .claude/skills/ 下各 openspec-* 目录的 SKILL.md frontmatter 标记 metadata.internal: true
 *
 * 背景：openspec-* 是 open-skills 工程级的 openspec 配置（由 `openspec init` 生成，
 * 绑定本仓库的 openspec/ 数据），属于工程级 skill，不应出现在 `npx skills add`
 * 的全局分发候选中。vercel-labs/skills 的 discoverSkills 默认排除满足
 * `metadata.internal === true` 的 skill（src/skills.ts 的 parseSkillMd）。
 *
 * ⚠️ `openspec update` 会重新生成 SKILL.md，冲掉此标记 —— 每次 openspec 升级后请重跑本脚本。
 *
 * 用法：
 *   node scripts/mark-openspec-internal.mjs          # 标记并写回（幂等，已有则跳过）
 *   node scripts/mark-openspec-internal.mjs --check   # 仅检查；有缺失则退出码 1（供 CI / git hook）
 *
 * 零依赖，风格对齐 scripts/gen-skill-docs.mjs。
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const claudeSkillsDir = path.join(root, ".claude", "skills");
const isCheck = process.argv.includes("--check");

const INTERNAL_LINE = "  internal: true";

function listOpenspecSkills() {
  if (!fs.existsSync(claudeSkillsDir)) return [];
  return fs
    .readdirSync(claudeSkillsDir)
    .filter((name) => name.startsWith("openspec-"))
    .filter((name) => fs.existsSync(path.join(claudeSkillsDir, name, "SKILL.md")))
    .map((name) => path.join(claudeSkillsDir, name, "SKILL.md"));
}

/**
 * 在 frontmatter 的 metadata 块内确保存在 `internal: true`。
 * 返回 { content, status }，status ∈ marked | already | no-frontmatter | no-metadata
 */
function ensureInternal(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { content, status: "no-frontmatter" };
  const fmBody = m[1];
  const lines = fmBody.split("\n");

  const metaIdx = lines.findIndex((line) => /^metadata:\s*$/.test(line));
  if (metaIdx === -1) return { content, status: "no-metadata" };

  // metadata 子项：行首恰好两个空格后接非空白字符。遇到其它缩进/空行即视为块结束。
  let end = metaIdx + 1;
  let hasInternal = false;
  while (end < lines.length && /^ {2}\S/.test(lines[end])) {
    if (/^  internal:\s*true\s*$/.test(lines[end])) hasInternal = true;
    end++;
  }
  if (hasInternal) return { content, status: "already" };

  lines.splice(end, 0, INTERNAL_LINE);
  const newFmBody = lines.join("\n");

  // 基于 fmBody 在原文中的精确位置替换，避免正则/替换字符串特殊字符问题
  const bodyStart = m.index + m[0].indexOf(fmBody);
  const newContent =
    content.slice(0, bodyStart) + newFmBody + content.slice(bodyStart + fmBody.length);
  return { content: newContent, status: "marked" };
}

function main() {
  const files = listOpenspecSkills();
  if (files.length === 0) {
    console.log("未发现 .claude/skills/openspec-*/SKILL.md");
    return 0;
  }

  const rel = (file) => path.relative(root, file);
  const report = { marked: [], already: [], missing: [], skipped: [] };

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const result = ensureInternal(content);
    if (result.status === "marked") {
      if (isCheck) {
        report.missing.push(file);
      } else {
        fs.writeFileSync(file, result.content, "utf-8");
        report.marked.push(file);
      }
    } else if (result.status === "already") {
      report.already.push(file);
    } else {
      report.skipped.push({ file, reason: result.status });
    }
  }

  console.log(`扫描 ${files.length} 个 openspec skill 文件${isCheck ? "（--check 模式）" : ""}`);
  if (report.marked.length) {
    console.log(`✓ 已标记 internal: true（${report.marked.length}）：`);
    report.marked.forEach((f) => console.log(`  + ${rel(f)}`));
  }
  if (report.already.length) {
    console.log(`✓ 已有标记，跳过（${report.already.length}）`);
  }
  if (report.missing.length) {
    console.log(`✗ 缺少 internal 标记（${report.missing.length}）：`);
    report.missing.forEach((f) => console.log(`  - ${rel(f)}`));
  }
  if (report.skipped.length) {
    console.log(`⚠ 跳过（${report.skipped.length}）：`);
    report.skipped.forEach((s) => console.log(`  ? ${rel(s.file)} [${s.reason}]`));
  }

  // --check 模式下，存在缺失即返回非零，便于 CI / git hook 拦截
  return report.missing.length > 0 ? 1 : 0;
}

process.exit(main());
