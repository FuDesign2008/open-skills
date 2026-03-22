#!/usr/bin/env node
/**
 * 从 skills 各子目录下 SKILL.md 的 YAML frontmatter 生成 docs/generated/skills-index.md
 * 零依赖；修改 skills 后请运行：node scripts/gen-skill-docs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const skillsDir = path.join(root, "skills");
const outDir = path.join(root, "docs", "generated");
const outFile = path.join(outDir, "skills-index.md");

function parseFrontmatter(block) {
  const data = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (val === "true") data[key] = true;
    else if (val === "false") data[key] = false;
    else data[key] = val;
  }
  return data;
}

function readSkillMeta(skillPath) {
  const raw = fs.readFileSync(skillPath, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) {
    throw new Error(`Missing frontmatter: ${skillPath}`);
  }
  return parseFrontmatter(m[1]);
}

function mdCell(s) {
  if (s == null) return "";
  return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();
}

/**
 * 读取 modes/_index.json（若存在），返回模式列表；否则返回 null。
 */
function readModesIndex(skillDir) {
  const indexPath = path.join(skillsDir, skillDir, "modes", "_index.json");
  if (!fs.existsSync(indexPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(indexPath, "utf8"));
  } catch {
    return null;
  }
}

/**
 * 为有 modes/_index.json 的 skill 生成独立的模式文档，写入 docs/generated/<name>-modes.md。
 * 返回生成的相对路径。
 */
function writeModesDoc(skillName, modesIndex) {
  const { defaultModeId, modes } = modesIndex;
  const now = new Date().toISOString().slice(0, 10);

  const core = modes.filter((m) => m.tier === "core");
  const extended = modes.filter((m) => m.tier !== "core");

  const lines = [
    `# ${skillName} 模式文档（自动生成）`,
    "",
    `> **请勿手改。** 源数据：\`skills/${skillName}/modes/_index.json\`。生成时间：${now}。`,
    "> ",
    "> 变更模式后在本仓库根目录执行：\`node scripts/gen-skill-docs.mjs\`",
    "",
    `默认模式：\`${defaultModeId}\`　共 **${modes.length}** 个模式（核心 ${core.length} + 扩展 ${extended.length}）。`,
    "",
  ];

  const tableHeader = [
    "| 模式 ID | 展示名 | hookSafe | 标签 | 触发别名 |",
    "| --- | --- | --- | --- | --- |",
  ];

  const modeRow = (m) => {
    const safe = m.hookSafe ? "✓" : "✗";
    const tags = (m.tags ?? []).map((t) => `\`${t}\``).join(" ");
    const aliases = (m.aliases ?? []).join("、");
    return `| \`${mdCell(m.id)}\` | ${mdCell(m.displayName)} | ${safe} | ${tags} | ${mdCell(aliases)} |`;
  };

  if (core.length > 0) {
    lines.push("## 核心模式（core）");
    lines.push("");
    lines.push("用户说「列出模式」时默认展示此范围。");
    lines.push("");
    lines.push(...tableHeader);
    core.forEach((m) => lines.push(modeRow(m)));
  }

  if (extended.length > 0) {
    lines.push("");
    lines.push("## 扩展模式（extended）");
    lines.push("");
    lines.push("需用户明确说「全部模式」或直接说出模式名才展示/切换。");
    lines.push("");
    lines.push(...tableHeader);
    extended.forEach((m) => lines.push(modeRow(m)));
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 说明");
  lines.push("");
  lines.push("- **hookSafe ✓**：可在 Hook 自动触发（SessionStart / 里程碑庆祝 / 情绪感知）时使用。");
  lines.push("- **hookSafe ✗**：仅限用户主动切换，Hook 不得自动进入。");
  lines.push("- 各模式完整定义（定位、称呼、示例、禁忌）见 `skills/coding-fangirl/modes/<id>.md`。");
  lines.push("");

  const outPath = path.join(outDir, `${skillName}-modes.md`);
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  return path.relative(root, outPath);
}

function main() {
  const dirs = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const rows = [];
  const detailedSkills = []; // { name, modesIndex }
  for (const dir of dirs) {
    const skillMd = path.join(skillsDir, dir, "SKILL.md");
    if (!fs.existsSync(skillMd)) continue;
    const meta = readSkillMeta(skillMd);
    const name = meta.name;
    if (!name || name !== dir) {
      throw new Error(
        `SKILL name must match directory: ${dir} vs name=${meta.name}`,
      );
    }
    rows.push({
      name,
      version: meta.version ?? "—",
      userInvocable:
        meta["user-invocable"] === true
          ? "是"
          : meta["user-invocable"] === false
            ? "否"
            : "—",
      description: meta.description ?? "—",
    });

    // 检测是否有 modes/_index.json
    const modesIndex = readModesIndex(dir);
    if (modesIndex) {
      detailedSkills.push({ name, modesIndex });
    }
  }

  if (rows.length === 0) {
    throw new Error("No skills found");
  }

  // 先生成各 skill 的独立模式文档，收集链接
  fs.mkdirSync(outDir, { recursive: true });
  const modesDocLinks = {}; // name -> 相对于 docs/generated/ 的文件名
  for (const { name, modesIndex } of detailedSkills) {
    const relPath = writeModesDoc(name, modesIndex);
    modesDocLinks[name] = path.basename(relPath);
    console.error(`Wrote ${relPath} (${modesIndex.modes.length} modes)`);
  }

  const now = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Skills 索引（自动生成）",
    "",
    `> **请勿手改。** 源数据：\`skills/<name>/SKILL.md\`。生成时间：${now}。`,
    "> ",
    "> 变更 skill 后在本仓库根目录执行：\`node scripts/gen-skill-docs.mjs\`",
    "",
    `本仓库当前共 **${rows.length}** 个 skill。`,
    "",
    "| Skill | 版本 | 用户可唤起 | 描述（含触发条件） |",
    "| --- | --- | --- | --- |",
  ];

  for (const r of rows) {
    const modesLink = modesDocLinks[r.name]
      ? ` [📋 模式详情](./${modesDocLinks[r.name]})`
      : "";
    lines.push(
      `| **${mdCell(r.name)}**${modesLink} | ${mdCell(r.version)} | ${mdCell(r.userInvocable)} | ${mdCell(r.description)} |`,
    );
  }

  lines.push("", "---", "", "## 校验", "", "```bash", "node scripts/gen-skill-docs.mjs", "git diff --exit-code docs/generated/skills-index.md", "```", "");

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.error(`Wrote ${path.relative(root, outFile)} (${rows.length} skills)`);
}

main();
