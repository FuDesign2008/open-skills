---
name: ensure-tests
description: 当用户说"ensure-tests"、"补全测试"、"生成测试"、"确保测试"、"补充单元测试"、"添加单元测试"、"检查测试覆盖"时触发。也可被 opsx-solve-workflow 等工作流在开发完成后调用，确保交付物包含单元测试（必须）和 E2E 测试（可选，按工程支持情况）。
---

# Ensure Tests

确保当前工程的测试套件就位：检测技术栈与框架，必要时搭建框架，生成单元测试（必须，仅针对逻辑代码），并可选生成/运行 E2E 测试。

## 调用约定

- **独立触发**：用户主动说触发词时，对当前工程执行完整流程
- **被 workflow 调用**：由 `opsx-solve-workflow`（阶段 5 末尾）等工作流调用时，以本次变更涉及的逻辑文件为重点作用域，缩小测试生成范围
- **调用前先读 SKILL.md**：workflow 每次调用前必须先读取本文件，不得凭记忆调用

---

## 阶段 1：Tech Stack 检测

扫描项目根目录，判断主要编程语言与框架：

| 文件 | 判断 |
|------|------|
| `package.json` | JavaScript / TypeScript |
| `go.mod` | Go |
| `requirements.txt` / `pyproject.toml` / `setup.py` | Python |
| `pom.xml` / `build.gradle` | Java |
| `Cargo.toml` | Rust |
| `*.csproj` / `*.sln` | C# / .NET |

若检测到 `package.json`，进一步判断前端框架：

- 含 `"vite"` → 优先使用 Vitest
- 含 `"react"` / `"vue"` / `"angular"` → 前端框架（但测试仍只覆盖逻辑层）
- 含 `"next"` / `"nuxt"` → 服务端渲染框架
- 仅含 `"express"` / `"fastify"` / `"koa"` 等 → 纯 Node.js 后端

---

## 阶段 2：测试框架检测

根据 tech stack 检测现有测试框架：

**JavaScript / TypeScript：**

- `jest.config.js` / `jest.config.ts` 存在，或 `package.json` `devDependencies` 含 `jest` → Jest ✅
- `vitest.config.js` / `vitest.config.ts` 存在，或 `devDependencies` 含 `vitest` → Vitest ✅
- `package.json` `scripts.test` 已配置 → 对应框架 ✅
- 均不存在 → 需搭建（见阶段 3）

**Python：**

- `pytest.ini` / `setup.cfg [tool:pytest]` / `pyproject.toml [tool.pytest.ini_options]` 存在 → Pytest ✅
- `devDependencies` 或 `requirements*.txt` 含 `pytest` → Pytest ✅
- 均不存在 → 需搭建（见阶段 3）

**Go：**

- 内置 `go test`，检测到 `go.mod` 即为 ✅，无需额外框架

**Java：**

- `pom.xml` 含 `junit` 依赖，或 `build.gradle` 含 `testImplementation 'junit'` → JUnit ✅

**Rust：**

- 内置 `cargo test`，无需额外检测 ✅

---

## 阶段 3：框架搭建（仅在阶段 2 判断为「需搭建」时执行）

按 tech stack 选型并安装：

| Tech Stack | 优先选型 | 安装命令 |
|-----------|---------|---------|
| TypeScript + Vite 项目 | Vitest | `npm install -D vitest @vitest/ui` |
| TypeScript / JavaScript 通用 | Jest + ts-jest | `npm install -D jest ts-jest @types/jest` |
| Python | Pytest | `pip install pytest pytest-cov` |

搭建步骤：

1. 执行安装命令
2. 创建最小配置文件（`vitest.config.ts` / `jest.config.ts` / `pytest.ini`）
3. 在 `package.json` `scripts` 中添加 `"test"` 入口（若不存在）：
   - Vitest：`"test": "vitest run"`
   - Jest：`"test": "jest"`

**工具限制**：✅ 允许 Bash 执行安装命令；✅ 允许 Write 创建配置文件

---

## 阶段 4：单元测试作用域确定

### 包含（逻辑代码）

以下目录和文件类型**在作用域内**：

- `services/`、`utils/`、`helpers/`、`lib/`、`core/`、`models/`、`store/`、`api/`
- 纯逻辑 hook（不含 JSX/模板渲染的 `hooks/`、`composables/`）
- 工具函数文件（`*.util.ts`、`*.helper.ts`、`*.service.ts`）
- 状态管理逻辑（Vuex / Redux / Zustand / Pinia store 逻辑层）
- 数据处理、格式化、校验、转换函数

### 排除（UI 层，不写单元测试）

以下目录和文件类型**不在作用域内**：

- `components/`、`views/`、`pages/`、`layouts/`、`screens/`
- 含 JSX / 模板渲染的 `.tsx`、`.vue`、`.svelte`、`.jsx` 文件
- `*.stories.tsx`、`*.stories.ts`（Storybook）
- `__mocks__/`、`fixtures/`（测试辅助文件）
- 样式文件（`*.css`、`*.scss`、`*.less`）

### 作用域优先级

1. **被 workflow 调用时**：优先覆盖 workflow 传入的变更文件中属于逻辑代码的部分；若无传入，扫描全局
2. **独立触发时**：扫描全局，优先处理无对应测试文件的逻辑文件

---

## 阶段 5：单元测试生成与运行【必须，阻断性】

### 生成原则

- 每个逻辑文件对应一个测试文件，已有则**追加**缺失用例，不覆盖
- 每个函数/方法至少覆盖三类用例：
  - 正常路径（happy path）
  - 边界值（空值、零值、极限输入）
  - 错误路径（异常抛出、无效入参）
- 使用框架原生断言，不引入额外断言库

### 测试文件命名约定

| 框架 | 命名规范 | 推荐位置 |
|------|---------|---------|
| Jest / Vitest | `<name>.spec.ts` 或 `<name>.test.ts` | 与源文件同目录，或 `__tests__/` |
| Pytest | `test_<name>.py` 或 `<name>_test.py` | `tests/` 目录或与源文件同目录 |
| Go | `<name>_test.go` | 与源文件同目录（同包） |
| JUnit | `<Name>Test.java` | `src/test/java/` 对应包路径 |

### 运行

```bash
# JavaScript / TypeScript（Jest）
npm test -- --passWithNoTests

# JavaScript / TypeScript（Vitest）
npx vitest run

# Python
pytest --tb=short

# Go
go test ./...

# Rust
cargo test

# Java（Maven）
mvn test

# Java（Gradle）
./gradlew test
```

### 阻断条件

单元测试运行失败（非零退出码）时：

1. 输出失败用例列表（文件名 + 用例名 + 错误信息）
2. 尝试自动修复（最多 **2 轮**：分析报错 → 修改测试代码或实现）
3. 2 轮后仍失败：**停止，等待用户介入**，输出：
   - 失败原因分析
   - 建议修复方向（修改实现 / 修改测试期望值 / 手动补充 mock）

---

## 阶段 6：E2E 测试检测与执行【可选】

### 检测是否支持 E2E

| 配置文件 | 框架 |
|---------|------|
| `playwright.config.ts` / `playwright.config.js` | Playwright |
| `cypress.config.ts` / `cypress.config.js` | Cypress |
| `nightwatch.conf.js` / `nightwatch.conf.ts` | Nightwatch |
| `wdio.conf.js` / `wdio.conf.ts` | WebdriverIO |

- **检测到** → 执行 E2E 测试生成与运行
- **未检测到** → 静默跳过，在输出中注明「未检测到 E2E 框架，跳过」

### E2E 测试生成原则（仅检测到框架时执行）

- 优先覆盖核心用户流程（登录/注册、主业务操作、关键页面跳转）
- 被 workflow 调用时，重点覆盖本次变更涉及的页面/流程
- 已有 E2E 用例则**追加**，不覆盖

### 运行

```bash
# Playwright
npx playwright test

# Cypress（无头模式）
npx cypress run
```

E2E 失败时：输出失败截图路径（若有）和失败原因，**不阻断**主流程（E2E 为可选项）。

---

## 输出格式

```text
【ensure-tests 执行结果】
- Tech Stack：...（如 TypeScript + Vite）
- 测试框架：已存在 <框架名> / 新安装 <框架名>（含配置文件路径）
- 单元测试：
  - 作用域逻辑文件：X 个
  - 新增测试文件：X 个，追加用例：X 个
  - 运行结果：✅ X 通过，0 失败 / ❌ X 失败（列出失败用例）
- E2E 测试：
  - 检测结果：检测到 <框架名> / 未检测到，跳过
  - 运行结果：✅ X 通过 / ❌ X 失败（附截图路径）/ 跳过
```

---

## 常见错误

| 错误 | 后果 | 修正 |
|------|------|------|
| 将 UI 组件文件纳入单元测试作用域 | 生成无意义的渲染测试，维护成本高 | 严格遵循排除规则，仅覆盖逻辑层 |
| 框架已存在却重复安装 | 依赖版本冲突 | 阶段 2 检测到框架后跳过阶段 3 |
| 覆盖已有测试文件 | 丢失已有测试逻辑 | 始终采用追加模式，不覆盖 |
| 单元测试失败超 2 轮仍继续执行 | 带着失败测试交付 | 超 2 轮必须停止，等待用户介入 |
| E2E 失败时阻断主流程 | E2E 为可选项，不应成为硬门控 | E2E 失败只输出警告，不阻断 |
| 被 workflow 调用时忽略传入的变更文件列表 | 测试覆盖范围过宽或遗漏关键变更 | 优先以变更文件为作用域，再扩展全局 |
