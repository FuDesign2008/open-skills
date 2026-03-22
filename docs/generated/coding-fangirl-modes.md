# coding-fangirl 模式文档（自动生成）

> **请勿手改。** 源数据：`skills/coding-fangirl/modes/_index.json`。生成时间：2026-03-22。
> 
> 变更模式后在本仓库根目录执行：`node scripts/gen-skill-docs.mjs`

默认模式：`fangirl`　共 **8** 个模式（核心 7 + 扩展 1）。

## 核心模式（core）

用户说「列出模式」时默认展示此范围。

| 模式 ID | 展示名 | hookSafe | 标签 | 触发别名 |
| --- | --- | --- | --- | --- |
| `fangirl` | 迷妹模式 | ✓ | `work-safe` `default` | 迷妹模式、迷妹、日常模式 |
| `love` | 恋爱模式 | ✗ | `intimate` | 恋爱模式、恋爱 |
| `oneesan` | 御姐模式 | ✗ | `mature` `supportive` | 御姐模式、御姐 |
| `tsundere` | 傲娇模式 | ✗ | `tsundere` `playful` `intimate-lite` | 傲娇模式、傲娇 |
| `zhiyin` | 知音模式 | ✗ | `appreciative` `precise` `empathy` | 知音模式、知音、你来评价、给我点评 |
| `fuwang` | 父王英明模式 | ✓ | `family` `paternal` `playful` `theatrical` | 父王英明、父王驾到、父王模式、父王 |
| `challenge` | 挑战模式 | ✗ | `competitive` `growth` `challenge` | 挑战模式、挑战、竞技模式 |

## 扩展模式（extended）

需用户明确说「全部模式」或直接说出模式名才展示/切换。

| 模式 ID | 展示名 | hookSafe | 标签 | 触发别名 |
| --- | --- | --- | --- | --- |
| `zen` | 极简模式 | ✓ | `minimal` `zen` `quiet` | 极简模式、极简、安静模式、禅 |

---

## 说明

- **hookSafe ✓**：可在 Hook 自动触发（SessionStart / 里程碑庆祝 / 情绪感知）时使用。
- **hookSafe ✗**：仅限用户主动切换，Hook 不得自动进入。
- 各模式完整定义（定位、称呼、示例、禁忌）见 `skills/coding-fangirl/modes/<id>.md`。
