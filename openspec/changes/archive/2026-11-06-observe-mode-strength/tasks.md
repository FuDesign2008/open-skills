## 1. Contract

- [x] 1.1 `workflow-mode-lifecycle` 增加 `observe` 模式定义
- [x] 1.2 增加请求强度 `explicit` / `inferred` 规则
- [x] 1.3 明确 `observe` 与 `ai-proxy` overlay 正交

## 2. Skill body

- [x] 2.1 `description` 增加 observe 触发词，保持 ≤1024 字符
- [x] 2.2 正文模式识别改为三态
- [x] 2.3 恢复规则覆盖 observe

## 3. Verification

- [x] 3.1 `npm test` 通过
- [x] 3.2 `npm run lint:skill-description` 通过
- [x] 3.3 `npm run lint:deid` 通过
- [x] 3.4 `openspec validate observe-mode-strength --strict` 通过
- [x] 3.5 引用方残留检查：未改动宿主是否仍两态
