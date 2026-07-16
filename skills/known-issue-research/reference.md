# Known Issue Research — Output Templates

## Industry-wide issue evaluation report

Output when the §3 conclusion is "no viable solution":

```
【行业通病评估】
- 问题本质：...（根因一句话总结）
- 行业现状：...（已知公开记录、主流框架态度、大厂处理方式）
- 调研结论：该问题属于 [平台限制/协议约束/语言特性/标准规范]，业界目前无可行解
- 建议：接受现状 / 评估替代方案（非修复）/ 与产品对齐预期
如需继续探索绕过方案，请说「继续」；否则工作流到此暂停。
```

## Upstream dependency fix evaluation lead

Output when §2 finds an already-fixed upstream version (feeds the workflow's `{upstream-eval step}`, executed per `upstream-dependency-debug`):

```
【上游依赖修复评估】
- 根因归属：上游依赖 bug（<依赖名@当前版本> 的 <具体问题>）
- 上游修复确认：Changelog/Release Notes/Issues 显示 <修复版本> 已修复（<引用链接+日期>）
- 升级风险评估：[patch/minor 低风险 | major 有 breaking change <列出>]
- 包管理器：项目实际用 <npm/yarn/pnpm>（依据 <lockfile>），系统级 packageManager=<...>
- 验证链：typecheck + build + 全量单测 + <真机/目标环境验证>
- dedup 检查：<npm ls <pkg> 结果，单版本/多版本>
- 建议：升级 <依赖> <旧版本>→<新版本> 作为首选方案 / 与 workaround 并列对比
```
