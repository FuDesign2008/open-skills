# 文档索引

| 文档 | 适合谁 | 内容 |
|------|--------|------|
| [../README.md](../README.md) | 所有人 | 项目简介、安装决策树、入口链接 |
| [INSTALL.md](INSTALL.md) | 需要 **手动安装 / 卸载 / 多路径** 的用户 | 各平台 clone 路径、Cursor 配置、排错补充 |
| [README.opencode.md](README.opencode.md) | OpenCode 用户 | OpenCode 侧使用说明 |
| [../.opencode/INSTALL.md](../.opencode/INSTALL.md) | OpenCode 深度安装 | 插件、符号链接、命令 |
| [opencode-coding-fangirl-implementation.md](opencode-coding-fangirl-implementation.md) | 贡献者 | coding-fangirl 在 OpenCode 的实现说明 |
| [generated/skills-index.md](generated/skills-index.md) | 所有人 | **自动生成**：全部 skill 的版本、可唤起性、描述（触发条件） |

维护约定：修改 `skills/**` 后在本仓库根目录执行 `node scripts/gen-skill-docs.mjs`，并随 PR 提交更新后的 `docs/generated/skills-index.md`。
