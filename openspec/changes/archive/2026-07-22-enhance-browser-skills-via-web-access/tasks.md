# Tasks: enhance-browser-skills-via-web-access

## 1. effective-web-research（调研向，正文英文）

- [x] 1.1 frontmatter description 补 CDP 升级说明 + 中文触发词（登录态访问/动态页面/反爬），单行双引号
- [x] 1.2 Step 0 路由表追加 CDP 升级行
- [x] 1.3 新增「Escalation — CDP via web-access」小节（升级阶梯 + 运行时局部强依赖说明 + 浏览哲学要点，英文、正向描述）
- [x] 1.4 `reference.md` 追加「CDP upgrade」小节（决策树 + curl API 速查，标注来自 web-access skill）

## 2. browser-debug-toolkit（调试向，正文英文）

- [x] 2.1 frontmatter version 1.1.0→1.2.0 + description 补 CDP 通道与中文触发词
- [x] 2.2 Scene→Tool 决策表**表内**新增 CDP Proxy 列（修正前次 review gap）
- [x] 2.3 新增「CDP Proxy (web-access) vs chrome-devtools-mcp」对比节 + login tie-breaker + 运行时检查说明
- [x] 2.4 新建 `reference.md`（curl API 速查 + 调试 recipes，标注来自 web-access）

## 3. 收尾与验证

- [x] 3.1 重生成 `docs/generated/skills-index.md`（`node scripts/gen-skill-docs.mjs`）
- [x] 3.2 `RELEASE-NOTES.md` 登记条目
- [x] 3.3 自查：frontmatter 单行双引号无 `|` 块标量、正文英文、正向描述无反例堆砌、无版本标记、SKILL.md 与 reference 不重复、能力来源标注 web-access
