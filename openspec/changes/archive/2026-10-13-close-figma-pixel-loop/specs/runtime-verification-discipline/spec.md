# Delta Spec: runtime-verification-discipline

## ADDED Requirements

### Requirement: 能打开界面的验证 SHALL 留存非空截图文件

当一次验证打开了可查看的界面，证据记录 SHALL 写明本轮保存的运行界面截图路径。该文件 SHALL 存在且非空，扩展名为 png、jpg、jpeg 或 webp。没有打开界面的检查（单测、规格校验，以及只打印布局数字且打不开界面的探针）SHALL NOT 被要求附截图，也 SHALL NOT 为了留痕伪造图片。截图 SHALL NOT 代替该验证自己的通过条件。本纪律 SHALL NOT 复述 Figma 通道或报告字段；那些留在 `figma-pixel-verify`。

#### Scenario: 打开了界面

- **WHEN** 验证在浏览器或应用里打开了界面并完成检查
- **THEN** 记录包含一个已保存、非空的截图路径

#### Scenario: 非界面检查

- **WHEN** 验证是单测或规格校验，没有打开界面
- **THEN** 通过结论不要求截图文件

#### Scenario: 打不开界面的布局探针

- **WHEN** 测量命令只打印布局后的数字，且本轮打不开界面
- **THEN** 记录标明打不开界面，不要求伪造截图
