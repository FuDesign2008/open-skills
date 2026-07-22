# effective-web-research — Reference

Exhaustive reference for the `effective-web-research` skill. The main [SKILL.md](SKILL.md) is the lean decision document; **read this file only when SKILL.md points you here** — usually because you need the concrete High/Med/Low criteria for a strict-mode evaluation, or a dimension's judgment is ambiguous.

## Table of contents

1. [7-dimension rubric (High / Med / Low criteria)](#rubric)
2. [Aggregate Trust verdict rules](#trust-verdict)
3. [Strict-mode report template (expanded)](#report-template)
4. [Worked example](#worked-example)

---

## Rubric

Each dimension is scored High / Med / Low. The criteria below are deliberately concrete so two evaluators reach the same score.

### 1. Authority

Who published this, and what is their standing in the domain?

| Score | Criteria |
|-------|----------|
| **High** | Official maintainer / vendor / standards body (e.g., `react.dev`, `nodejs.org`, an RFC editor, the framework's own docs site). The canonical source of truth for the topic. |
| **Med** | Reputable secondary authority: MDN, a recognized expert's personal site with a track record, a major conference talk from the maintainer, a respected publisher (O'Reilly, A List Apart). |
| **Low** | Anonymous, unknown site, content farm, or a site with no discernible accountability. |

### 2. Expertise

What are the author's credentials for *this specific topic*?

| Score | Criteria |
|-------|----------|
| **High** | Verifiable credentials: the author is a core contributor, has published prior authoritative work on the topic, or holds relevant recognized expertise. |
| **Med** | The author appears knowledgeable (technically accurate, nuanced) but credentials are not explicitly verifiable. |
| **Low** | No expertise signals; generic or surface-level treatment; author writes about everything (a hallmark of content farms). |

### 3. Experience

Does the content demonstrate **first-hand practical experience**, or is it theoretical/aggregated?

| Score | Criteria |
|-------|----------|
| **High** | Shows direct practice: reproducible code, real benchmarks, diagnosed real bugs, screenshots of actual behavior. You could reproduce the claim. |
| **Med** | References practice but second-hand (cites others' experience, summarizes). Plausible but not personally demonstrated. |
| **Low** | Purely theoretical, or aggregated/restated from elsewhere with no original engagement. |

### 4. Currency

When was it published/updated, and does it match the version the user is on?

| Score | Criteria |
|-------|----------|
| **High** | ≤1 year old **and** the version it describes matches the user's target version. For evergreen topics (algorithms, math), timeless content also scores High. |
| **Med** | 1–3 years old, still likely valid for the topic but not verified against the current version. |
| **Low** | >3 years old on a fast-moving topic, **or** no date at all on a fast-moving topic, **or** explicitly describes a deprecated/removed feature. |

### 5. Accuracy

Is the claim verifiable? Are sources cited? Is it cross-confirmed?

| Score | Criteria |
|-------|----------|
| **High** | Cites primary sources (spec, changelog, source code, paper); the claim has been cross-confirmed by at least one other independent source; technically precise. |
| **Med** | Plausible, internally consistent, with some references but not fully cross-confirmed. No contradictions found. |
| **Low** | Uncited assertions, **or** contradicted by other sources, **or** contains demonstrable factual errors. |

### 6. Purpose / Bias

Why was this created? Is there a commercial or ideological tilt?

| Score | Criteria |
|-------|----------|
| **High** | Educational/neutral purpose; any commercial interest is disclosed and does not distort the content; the piece exists to inform. |
| **Med** | Slight commercial angle (e.g., a vendor blog favoring its own product) but the substantive content is still reliable when filtered. |
| **Low** | Pure marketing, affiliate-driven, ideological, clickbait, or the content's purpose is to persuade/sell rather than inform. |

### 7. Relevance

Does it directly answer the specific question (including the user's version/context)?

| Score | Criteria |
|-------|----------|
| **High** | Directly addresses the exact question, with the right version and context. |
| **Med** | Tangentially relevant — covers the topic but not the exact angle/version the user needs. |
| **Low** | Off-topic, or addresses a different version/scope such that the answer does not transfer. |

---

## Trust verdict

The aggregate verdict is derived from the seven scores, not averaged mechanically.

| Verdict | Rule |
|---------|------|
| **Trustworthy** | Majority of dimensions High/Med, **and** no Low on Authority or Accuracy, **and** (for security/safety-critical claims) multi-source confirmation. |
| **Cautious** | Mixed scores, or a single Low on a non-critical dimension, or single-source for a moderately important claim. Usable but flag the caveat. |
| **Unreliable** | Any of: majority Low, a Low on Authority **or** Accuracy for a claim that will be acted on, severe undisclosed bias, or active contradiction by stronger sources. |

For **security/safety-critical** conclusions (vulnerabilities, data handling, auth), raise the bar: require multi-source High on Authority + Accuracy before marking Trustworthy.

---

## Report template

The full strict-mode report. Fill every section; do not leave a dimension unscored (if you couldn't assess it, mark "unknown" with a note rather than guessing).

```markdown
# Strict research report: <topic>

## Research question
<the specific question, including the version, runtime, and any constraints>

## Source evaluation

### Source 1: <title> (<URL>, <date if known>)
- Authority: H/M/L — <one-line basis>
- Expertise: H/M/L — <one-line basis>
- Experience: H/M/L — <one-line basis>
- Currency: H/M/L — <one-line basis>
- Accuracy: H/M/L — <one-line basis>
- Purpose/Bias: H/M/L — <one-line basis>
- Relevance: H/M/L — <one-line basis>
- **Verdict**: Trustworthy / Cautious / Unreliable

### Source 2: ...
### Source 3: ...

## Claims & confidence
Group findings by claim, not by source. Each claim gets a confidence level based on how many independent High-quality sources support it.

- **<claim 1>**: ✅ Strong — supported by Sources 1, 2 (both Authority High, agree)
- **<claim 2>**: ⚠️ Moderate — only Source 3 (Med); recommend one more independent source
- **<claim 3>**: ❌ Disputed — Source 4 says X, Source 5 says Y; cannot reconcile

## Gaps & next steps
- **Still needed**: <specific sub-questions no source answered>
- **Unresolved conflicts**: <where sources disagree, and what would resolve it>
- **Recommended follow-up**: <e.g., test in a repro, check the official changelog, ask the maintainer>
```

---

## Worked example

A realistic strict-mode report, condensed to show the shape. Topic: whether a specific JWT library has a known CVE relevant to the user's version.

```markdown
# Strict research report: jsonwebtoken CVE relevance for our v8.5.1 usage

## Research question
We use `jsonwebtoken@8.5.1`. Does any published CVE affect this version, given we verify `alg` header and use a 256-bit secret?

## Source evaluation

### Source 1: npm security advisories — github.com/advisories?query=jsonwebtoken (2024-11)
- Authority: H — GitHub Advisory Database, the canonical npm CVE source
- Expertise: H — maintained by GitHub Security, sourced from CVE/NVD
- Experience: M — curated database, not first-hand exploit reproduction
- Currency: H — advisory database continuously updated; checked today
- Accuracy: H — each advisory links to the fix commit and affected ranges
- Purpose/Bias: H — neutral, defensive
- Relevance: H — directly covers `jsonwebtoken` version ranges
- **Verdict**: Trustworthy

### Source 2: "jsonwebtoken vulnerability overview" — <vendor-blog> (2022-03)
- Authority: L — vendor security blog, not the advisory source
- Expertise: M — technically literate but not the originator
- Experience: M — discusses the bug but doesn't add new evidence
- Currency: M — covers 2022 CVEs, predates some later fixes
- Accuracy: M — consistent with the advisory but adds interpretation
- Purpose/Bias: M — slight commercial tilt (vendor sells scanning)
- Relevance: M — covers the topic but not v8.5.1 specifically
- **Verdict**: Cautious

## Claims & confidence
- **`jsonwebtoken@8.5.1` is affected by CVE-2022-23529 (critical, prototype pollution)**: ❌ Disputed — Source 1 says the fix landed in 9.0.0 and the advisory marks `<9.0.0` affected, but our reading of the fix commit shows the vulnerable path requires algorithms we don't enable. Needs confirmation.
- **No CVE affects our usage given we pin `alg` and use a 256-bit secret**: ⚠️ Moderate — Source 1 confirms no later advisory targets this configuration, but "no known CVE" is not "provably safe".

## Gaps & next steps
- **Still needed**: confirm whether CVE-2022-23529's vulnerable code path is reachable with our config — read the fix diff at github.com/auth0/node-jsonwebtoken/pull/...
- **Unresolved conflicts**: the vendor blog (Source 2) overstates impact relative to the advisory; trust the advisory.
- **Recommended follow-up**: upgrade to latest `jsonwebtoken@9.x` regardless (defense in depth), and add a regression test for the prototype-pollution path.
```

Note how the report separates per-source scoring from claim-level synthesis, and explicitly flags what is still unknown rather than papering over it. That honesty is the point of strict mode.

---

## CDP upgrade

The real-browser escape hatch lives in the strongly-depended **`browser-access`** skill (carries login state via CDP Proxy). This section is the **decision tree + API cheat sheet** so you can escalate without leaving this skill's context. Full reference: `browser-access/references/cdp-api.md`.

### When to escalate (decision tree)

```
Need information from the external web?
├─ Answer likely in repo → internal tools (grep/read/LSP), do NOT escalate
└─ External → start with static layer:
    1. WebSearch     → discover sources
    2. WebFetch/curl → extract from a known URL (static HTML)
    3. Jina          → Markdown-ify article-style pages (saves tokens)
    └─ Static layer returns content LACKING the target info?
        ├─ No, got it → apply 4 maxims / strict mode, done
        └─ Yes (login wall / JS-rendered shell / anti-scrape block) → ESCALATE to CDP:
            → load browser-access → /new the page → /eval read DOM → /screenshot if visual
            → resume credibility evaluation on the retrieved content
```

Key signal: escalate only when the **page refuses the non-browser client**. "I haven't found the right URL yet" is a search problem (stay at step 1), not an escalation trigger.

### curl HTTP API cheat sheet (CDP Proxy on http://localhost:3456)

```bash
# 0. preflight (Node 22+, browser remote-debug toggle, ensure proxy)
node "${CLAUDE_SKILL_DIR_BROWSER_ACCESS}/scripts/check-deps.mjs"

# open a background tab (auto-waits for load); URL in POST body
curl -s -X POST --data-raw 'https://example.com' http://localhost:3456/new
# → returns target id

# read DOM / run JS  (the workhorse — read text, pull URLs, submit forms)
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'document.title'
curl -s -X POST "http://localhost:3456/eval?target=ID" -d 'document.querySelector("article")?.innerText'

# capture rendered state (incl. video frame)
curl -s "http://localhost:3456/screenshot?target=ID&file=/tmp/shot.png"

# interact (trigger lazy-load, paginate, expand)
curl -s -X POST "http://localhost:3456/click?target=ID" -d 'button.next'
curl -s "http://localhost:3456/scroll?target=ID&direction=bottom"

# close the tab you created (never the user's tabs)
curl -s "http://localhost:3456/close?target=ID"
```

`ID` is the target id from `/new` or `/targets`. Always `/close` tabs you created.

### Retrieval ≠ trust

After CDP retrieval, the content re-enters this skill's normal pipeline: identify the source's authority/currency, cross-validate non-trivial claims, cite with link+date. A page reachable only behind login is often a **primary source** (official platform, original post) — good for credibility, but still verify claims against a second independent source before relaying as fact.
