# Known Issue Research — Output Templates

## Industry-wide issue evaluation report

Output when the §3 conclusion is "no viable solution":

```
【Industry-wide issue evaluation】
- Problem essence: ... (one-line root-cause summary)
- Industry status: ... (known public records, mainstream framework stance, large-vendor approaches)
- Research conclusion: this issue is [platform limit / protocol constraint / language trait / standard], and the industry currently has no viable fix
- Recommendation: accept as-is / evaluate alternatives (not a fix) / align expectations with product
To keep exploring workarounds, say「继续」/ "continue"; otherwise pause the workflow here.
```

## Upstream dependency fix evaluation lead

Output when §2 finds an already-fixed upstream version (feeds the workflow's `{upstream-eval step}`, executed per `upstream-dependency-debug`):

```
【Upstream dependency fix evaluation】
- Root-cause ownership: upstream dependency bug (<dep@current-version>: <specific issue>)
- Upstream fix confirmation: Changelog / Release Notes / Issues show <fixed-version> resolved it (<link + date>)
- Upgrade risk: [patch/minor low risk | major with breaking changes <list>]
- Package manager: project uses <npm/yarn/pnpm> (from <lockfile>); system packageManager=<...>
- Verification chain: typecheck + build + full unit tests + <device / target-env verification>
- Dedup check: <npm ls <pkg> result, single version / multiple versions>
- Recommendation: upgrade <dep> <old>→<new> as preferred option / compare alongside workaround
```
