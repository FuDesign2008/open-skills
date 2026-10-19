# known-issue-research Specification

## ADDED Requirements

### Requirement: 竞品产品行为观察 SHALL 归 competitive-research

`known-issue-research` MUST 继续只承载调研路由、已知缺陷快搜与行业通病评估。竞品的用户可见行为、交互边界与实现机制观察 MUST 由 `competitive-research` 承载。本 skill 的 description MUST 写明这一边界。

#### Scenario: 用户可见行为问题不把快搜当成竞品观察

- **WHEN** 问题的预期结果是用户可见行为，且已知问题快搜的触发条件未命中
- **THEN** 本 skill 不输出竞品产品行为结论，竞品行为观察由 `competitive-research` 执行
