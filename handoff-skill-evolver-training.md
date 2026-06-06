# Handoff: Skill-Evolver 训练本仓库 Skill

**目标**：在 Claude Code 中使用已下载的 `skill-evolver` 训练 open-skills 仓库中的 skill。
**来源**：OpenCode Sisyphus 会话，用户要求切换到 Claude Code 执行训练。

---

## 当前状态

### 已完成
1. **skill-evolver 已下载**到 `skills/skill-evolver/`（来自 [stellarlinkco/skills](https://github.com/stellarlinkco/skills)）
2. **与文章对照完成**：确认该 SKILL.md 是张思宇文章《让 Skill 自己训练自己》的忠实工程化实现
3. **skills-index 已更新**：20 skills（19→20）
4. **前置条件分析完成**：
   - ✅ `claude` CLI `2.1.163` 已安装
   - ✅ `python3` `3.14.3` 已安装
   - ✅ git 仓库就绪
   - ❌ **`skill-creator` 未安装**——这是硬依赖

### 未提交到 git
- `skills/skill-evolver/` 目录（新增 10 个文件）
- `docs/generated/skills-index.md`（更新，20 skills）

---

## Claude Code 接手后的第一步

### 1. 安装 skill-creator（硬依赖）

```bash
git clone --depth 1 https://github.com/anthropics/skills.git /tmp/anthropic-skills
cp -r /tmp/anthropic-skills/skills/skill-creator ~/.claude/skills/skill-creator
rm -rf /tmp/anthropic-skills
```

验证：`ls ~/.claude/skills/skill-creator/scripts/quick_validate.py`

### 2. 选择训练目标 skill

推荐优先级：

| Skill | 适合度 | 理由 |
|-------|--------|------|
| **git-commit** | ⭐⭐⭐ | 输入输出明确（用户指令 → commit message），GT 容易写 |
| **chinese-format** | ⭐⭐⭐ | 纯文本转换，`[contains]`/`[not_contains]` 精确断言 |
| **jira-read** | ⭐⭐ | 需 Jira API 连接，GT 依赖外部数据 |
| **solve-workflow** | ⭐ | 多阶段工作流，评测主观性高 |

### 3. 准备 GT 测试用例

GT 文件格式见 `skills/skill-evolver/references/gt-format.md`。

8 种 assertion 类型：
- **程序判**（6 种）：`[contains]`、`[not_contains]`、`[regex]`、`[file_exists]`、`[json_valid]`、`[script_check]`
- **LLM 判**（2 种）：plain text（通用质量）、`[fact_coverage]`（知识点覆盖）

示例（git-commit）：
```json
{
  "skill_name": "git-commit",
  "evals": [
    {
      "id": "case-01",
      "prompt": "帮我提交代码",
      "expected_output": "检测变更文件，生成约定式提交规范 commit message",
      "expectations": [
        "[contains] git add",
        "[contains] feat:",
        "[regex] \\w+:\\s+.+",
        "检查了 git status 获取变更列表"
      ],
      "difficulty": "standard",
      "tags": ["basic-commit"]
    }
  ]
}
```

### 4. 启动进化循环

在 Claude Code 中触发（触发词在 description 中）：

> "evolve this skill: skills/git-commit with GT from gt/evals.json, target pass_rate 100%"

或：

> "train this skill: skills/chinese-format"

### 5. 查看效果

| 方法 | 路径 |
|------|------|
| 进化摘要 | `<skill-name>-evolution/results.tsv` |
| 实验日志 | `<skill-name>-evolution/experiments.jsonl` |
| 每轮 Trace | `<skill-name>-evolution/traces/iteration-{N}/case-{id}.md` |
| L2 评测结果 | `<skill-name>-evolution/iterations/iteration-{N}/l2_results.json` |
| L3 严格评测 | `<skill-name>-evolution/iterations/iteration-{N}/l3_results.json` |
| Git 审计 | `cd skills/<skill-name> && git log --oneline --grep="evolve:"` |

### 6. 注意事项

- **成本**：文章提到 19 轮 ~$100。从小 skill 试起
- **分支**：不要在 main 分支跑进化。开 feature 分支
- **前 3-5 轮看一眼**：帮 skill-evolver 建立正确方向
- **GT 质量 = 天花板**：多花时间在 GT 上

---

## 关键文件索引

| 文件 | 说明 |
|------|------|
| `skills/skill-evolver/SKILL.md` | 主文件，271 行，8 阶段 Loop |
| `skills/skill-evolver/references/gt-format.md` | GT 格式，8 种 assertion，split 策略 |
| `skills/skill-evolver/references/evaluation.md` | 3 层评测管线（L1/L2/L3） |
| `skills/skill-evolver/references/gate.md` | 5 维 AND 门控决策逻辑 |
| `skills/skill-evolver/references/mutation.md` | 分层 mutation 策略（Layer 1-3） |
| `skills/skill-evolver/scripts/safety_scan.py` | L1 安全扫描（11 规则，2 critical） |
| `skills/skill-evolver/scripts/evaluate_assertions.py` | 程序化 assertion 评测 |
| `skills/skill-evolver/scripts/results_tracker.py` | results.tsv + experiments.jsonl 追踪 |

## 参考文章

- [让 Skill 自己训练自己](https://mp.weixin.qq.com/s/dDkVA9mfNbJWTwkVKN1AOQ) — 张思宇，腾讯云开发者
- [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — 外循环骨架
- [anthropics/skills/skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) — 评测引擎底座
- [Stanford Meta-Harness](https://arxiv.org/abs/2603.28052) — Trace 驱动诊断理论

---

## Suggested Skills for Next Agent

1. **skill-evolver**（已在本仓库）— 核心训练工具，直接触发 "evolve this skill"
2. **skill-creator**（需先安装）— 硬依赖，提供 quick_validate / grader / comparator
3. **git-commit**（本仓库 skill）— 可作为第一个训练目标的候选 skill
