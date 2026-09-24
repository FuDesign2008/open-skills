## ADDED Requirements

### Requirement: 主干识别 SHALL 综合四层证据交叉验证

识别主干开发分支时，系统 MUST 综合四层证据：① 历史 merge 记录的目标分支（最强）；② 远程 HEAD（`git ls-remote --symref origin HEAD` 优先，`git remote show origin` 易超时；本地符号引用视为缓存可能过期）；③ 分支命名行为与已合并 MR 的 target 分布（`sync-release/*-to-<X>` 同步分支命名、版本发布 MR 全部落在某 target 分支）；④ 证据冲突或缺失时列出候选请用户确认。四层证据结论冲突时 MUST 上报用户裁决，不得静默择一。

#### Scenario: 同名 master 与 main 并存

- **WHEN** 仓库同时存在 `master` 与 `main`，远程 HEAD、平台默认分支、`sync-release/*-to-main` 命名行为、已合并版本 MR 的 target 分布四层证据均指向 `main`
- **THEN** 系统判定 `main` 为主干并在确认表中列出证据来源

### Requirement: 按废弃处置候选分支前 SHALL 先证伪「活跃平行分支」假设

系统 MUST NOT 仅凭「remote HEAD 指向别处」或「长期未合并」将某候选分支（如 `master`）按废弃旧主干处置。按废弃处置前，系统 MUST 检查该分支是否为活跃的平行 CI 分支：独立 CI 配置（不同镜像/安装策略/独立触发规则）、近期仍有他人提交，任一成立即表明其为活跃平行分支。若判定为活跃平行分支，系统 MUST NOT 对其执行清理，并在报告中说明其角色。

#### Scenario: master 被证实为活跃平行 CI 分支

- **WHEN** `master` 存在独立 CI 配置（不同镜像、不同依赖安装策略、以分支名为触发条件），且事件当日仍有他人提交
- **THEN** 系统判定其为活跃平行分支，不按废弃处理、不清理，主干结论仍为 `main` 并注明 `master` 的真实角色

#### Scenario: 无活跃迹象才可按废弃处置

- **WHEN** 候选分支无独立 CI 配置、长期无提交、且全部版本 MR 落在另一分支
- **THEN** 系统方可按废弃旧主干处置该候选分支
