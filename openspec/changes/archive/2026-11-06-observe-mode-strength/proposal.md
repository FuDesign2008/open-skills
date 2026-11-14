## Why

模式生命周期目前只有手动与自动两态：要么每一步都等人确认，要么整条流程自动执行。缺少一个「先影子运行几轮、记录会怎么做、确认无误再放行」的过渡态，导致用户第一次开启自动模式时承担全部风险。

同时，请求来源缺少强度区分：人明确要求的工作与系统推断「应该做」的工作被同等对待，后者本应默认只记录不执行。

## What Changes

- `workflow-mode-lifecycle` 增加 `observe` 模式：完整执行判定与记录，但不产生副作用。
- 增加请求强度 `explicit` / `inferred`：`inferred` 请求即使处在自动模式，也降级为 `observe`。
- 明确 `observe` 与 `ai-proxy` overlay 的正交关系：前者是控制流态，后者是人工席位的代理。

## Capabilities

### Modified Capabilities

- `workflow-mode-lifecycle`: 模式识别从两态扩展为三态；新增请求强度规则。

## Impact

- **Skill**：`skills/workflow-mode-lifecycle/SKILL.md`
- **契约**：`openspec/specs/workflow-mode-lifecycle/spec.md`
- **引用方**：无需改动；未声明 `observe` 触发词的宿主保持两态识别
- **测试**：`npm test`；`openspec validate --strict --all`
