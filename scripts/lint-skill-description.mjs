#!/usr/bin/env node
/**
 * 校验 skills 各子目录下 SKILL.md frontmatter 的 description 长度。
 * 硬上限 1024 字符（Agent Skills 规范，超限平台加载器会报警），软目标 950（留统计口径余量）。
 * 超硬上限退出码 1；超软目标仅警告。
 * 运行：node scripts/lint-skill-description.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const skillsDir = path.join(root, "skills");

const HARD_LIMIT = 1024;
const SOFT_TARGET = 950;

// 提取 frontmatter 中的 description（兼容单行引号与多行折叠写法）
function extractDescription(content, file) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) throw new Error(`${file}: 缺少 YAML frontmatter`);
  const lines = m[1].split("\n");
  const start = lines.findIndex((l) => l.startsWith("description:"));
  if (start === -1) throw new Error(`${file}: frontmatter 缺少 description 字段`);
  const parts = [lines[start].slice("description:".length)];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^[A-Za-z][\w-]*:/.test(lines[i])) break; // 下一个顶层字段
    parts.push(lines[i]);
  }
  let desc = parts.map((l) => l.trim()).join(" ").trim();
  if (
    (desc.startsWith('"') && desc.endsWith('"')) ||
    (desc.startsWith("'") && desc.endsWith("'"))
  ) {
    desc = desc.slice(1, -1);
  }
  return desc;
}

const entries = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => path.join(skillsDir, d.name, "SKILL.md"))
  .filter((p) => fs.existsSync(p))
  .sort();

let errors = 0;
let warnings = 0;

for (const file of entries) {
  const name = path.basename(path.dirname(file));
  let desc;
  try {
    desc = extractDescription(fs.readFileSync(file, "utf8"), file);
  } catch (e) {
    console.error(`ERROR ${name}: ${e.message}`);
    errors++;
    continue;
  }
  const len = [...desc].length; // 按 Unicode 码点计数，与 python len() 语义一致
  if (len > HARD_LIMIT) {
    console.error(
      `ERROR ${name}: description ${len} 字符，超过硬上限 ${HARD_LIMIT}`
    );
    errors++;
  } else if (len > SOFT_TARGET) {
    console.warn(
      `WARN  ${name}: description ${len} 字符，超过软目标 ${SOFT_TARGET}（硬上限 ${HARD_LIMIT}）`
    );
    warnings++;
  }
}

console.log(
  `Checked ${entries.length} skills: ${errors} error(s), ${warnings} warning(s) (hard limit ${HARD_LIMIT}, soft target ${SOFT_TARGET})`
);
if (errors > 0) {
  console.error(
    "请压缩 description：只保留触发路由四要素（做什么 / 何时用 / 触发词 / 反向边界），细节归入正文或 reference.md。"
  );
  process.exit(1);
}
