## ADDED Requirements

### Requirement: 构建产物识别 SHALL 发生在语义分析与文件读取之前

冲突盘点完成后、语义分析之前，系统 MUST 先判定每个冲突文件是否为「构建产物」（编译后/打包后的派生文件）。命中构建产物的文件 MUST 进入短路处理流程，不得进入语义分析流程。

#### Scenario: 命中构建产物则不进入语义分析

- **WHEN** 冲突文件被判定为构建产物（如 hash chunk、构建目录下的文件、压缩文件）
- **THEN** 系统跳过三方内容读取（`git show :1:/:2:/:3:`）与语义分析（Y.2），直接进入短路解决

#### Scenario: 非构建产物保持原有语义分析

- **WHEN** 冲突文件为源码、配置等非构建产物
- **THEN** 系统继续走原有语义分析流程（Y.2 → Y.3 → Y.4），处理行为不变

### Requirement: 构建产物识别范围 SHALL 覆盖常见打包/编译产物特征

系统 MUST 通过「构建目录前缀 + 文件特征」识别构建产物，且 MUST 支持使用者补充项目专属目录。识别范围 SHALL 至少覆盖：hash chunk 文件名（如 `<name>.<8+位hex>.js|css|map`）、构建输出目录（如 `dist/`、`build/`、`out/`、`assets/`、`static/`、打包资源目录 `resources/<bundle>/`）、压缩文件（`.min.js`、`.min.css`）、source map 与资源文件（`.map`、`.wasm`、字体、图片）。

#### Scenario: hash chunk 文件被识别

- **WHEN** 冲突文件名匹配 `<name>.<8+位十六进制>.js|css|map`（如 webpack/vite/rollup 产物）
- **THEN** 文件被判定为构建产物，进入短路

#### Scenario: 构建目录下的文件被识别

- **WHEN** 冲突文件路径位于构建输出目录前缀下（如 `dist/`、`build/`、`resources/<bundle>/`）
- **THEN** 文件被判定为构建产物，进入短路

#### Scenario: 使用者补充的项目专属目录也被识别

- **WHEN** 使用者声明了项目专属构建目录或文件特征
- **THEN** 这些目录/特征下的文件同样被判定为构建产物，进入短路

### Requirement: 构建产物冲突 SHALL NOT 读取文件内容，MUST 直接取发版分支版本

构建产物是机器生成的派生物，其权威始终是发版分支（release）。系统 MUST NOT 读取构建产物的文件内容用于分析，MUST 直接用 release 侧版本覆盖解决冲突。

#### Scenario: 内容冲突的构建产物取 release 侧

- **WHEN** 构建产物为两侧都修改的内容冲突（UU）
- **THEN** 系统取 release 侧（`--theirs`）版本，不读取也不分析文件内容

#### Scenario: 整目录构建产物取 release 侧

- **WHEN** 构建目录下多个产物文件冲突
- **THEN** 系统整目录取 release 侧版本，不逐文件读取

#### Scenario: 解决过程不产生 token 浪费

- **WHEN** 构建产物文件体积巨大（如单行 minified 文件数十万字符）
- **THEN** 系统不读取其内容，token 消耗不随产物体积增长

### Requirement: rename + 构建产物 hash 冲突 SHALL 通过 git rename 元数据获取文件名，MUST NOT 读取冲突标记内容

当冲突为「rename + 构建产物 hash」类型（diff3 标签含不同 hash 文件名）时，系统 MUST 通过 `git diff --name-status --diff-filter=U` 等 git 元数据获取两侧文件名，MUST NOT 通过读取文件内的冲突标记（如 `grep "^<<<<<<<"`）提取文件名。系统 MUST 删除旧 hash 文件并从 release 取新 hash 文件，避免仓库残留两个功能相同的 chunk。

#### Scenario: rename+hash 冲突不读文件内容即可解决

- **WHEN** 冲突为 rename + 构建产物 hash（两侧文件名为不同 hash）
- **THEN** 系统从 git rename 元数据获取旧/新文件名，删除旧 hash 文件，从 release 取新 hash 文件，全程不读取文件内容

#### Scenario: 不残留重复 chunk

- **WHEN** rename+hash 冲突解决完成
- **THEN** 仓库中不存在两个功能相同的 chunk（旧 hash + 新 hash）

### Requirement: 构建产物短路解决后 SHALL 仍执行残留冲突标记验证

短路处理完成后，系统 MUST 对该文件执行冲突标记残留扫描（与即时验证一致），确保无 `<<<<<<<`/`=======`/`>>>>>>>` 等标记残留后再继续。

#### Scenario: 短路解决后验证无残留

- **WHEN** 构建产物文件经短路处理完成
- **THEN** 系统对其执行冲突标记残留扫描，检测到残留则回滚重做，无残留则放行

### Requirement: 调用方 `git-release-finish` SHALL 受益于短路且阶段 8 残留扫描 SHALL 覆盖构建产物路径

`git-release-finish` 调用 `git-conflict-resolve` 时，构建产物短路 MUST 自动生效，无需调用方额外传参。`git-release-finish` 阶段 5 冲突检测后 SHALL 提示构建产物冲突将走短路；阶段 8 合并前残留扫描 SHALL 在其扫描范围内覆盖构建产物路径，作为短路失效时的最后防线。

#### Scenario: 调用方无需额外配置即可短路

- **WHEN** `git-release-finish` 阶段 6 调用 `git-conflict-resolve` 处理含构建产物的冲突
- **THEN** 构建产物短路自动生效，调用方无需新增参数

#### Scenario: 阶段 8 残留扫描覆盖构建产物

- **WHEN** 短路处理意外残留了冲突标记在构建产物中
- **THEN** `git-release-finish` 阶段 8 残留扫描能检出并阻断合并
