---
name: explain-clearly
version: "1.0.1"
user-invocable: true
description: "Explain a concept clearly: the rational track comes first and the analogy is only auxiliary. When the user has not named a form, ask once among the current session, HTML, Markdown, and plain text, and recommend HTML. Use whenever the user asks 「X 是什么」「为什么需要 X」「A 和 B 能不能/怎么通信」「给我讲讲 X」「用大白话解释 X」「帮我理解 X」, \"what is X\", \"how does X work\", \"why does X exist\", \"explain X\" about mechanisms, architecture, protocols, or processes — even if they never say \"explain\". Do NOT use for hands-on tutorials (teach), marketing articles (article-writer), or design-doc rewriting (tech-review-doc)."
---

# Explain Clearly

> Explain a technical concept so the user can see how it works. The rational track is the explanation. An analogy is an auxiliary section, not a second equal track. Deliver the explanation in the user's language, in the form they chose.

## When to use

Use this for concept and mechanism questions: what something is, why it exists, and whether two parts can communicate. IPC, memory isolation, event loops, virtual DOM, consensus, and caching are typical subjects.

Route elsewhere and stop when the request is:

- A hands-on tutorial or onboarding ("教我怎么用 X", "walk me through setting up X") → `teach`
- Rewriting existing docs into an article → `article-writer`
- Turning a design doc into a review doc → `tech-review-doc`

## Choose the form

When the user has already named a form, use that form. When they have not, ask once. Offer exactly these choices, and recommend HTML:

1. current session
2. HTML
3. Markdown
4. plain text

## What every explanation contains

Write these four steps in order. They are the explanation.

1. **One-sentence definition** — what it is, in one precise sentence. A question that one fact answers, such as "can A talk to B", leads with that fact and then continues through the four steps.
2. **Why it exists** — start from what happens without it, then show how the mechanism removes that pain.
3. **Concrete shape in the user's world** — ground the mechanism in code or architecture the asker already knows. Cite files, line numbers, and APIs read in this session. If the concept has no footprint in the current codebase, use a canonical public example and label it as such. If no canonical public example exists, ground this step in the definition and why-it-exists, and say that no concrete example is available. An invented path, line, or API is a failed explanation.
4. **Key design implication** — the design decision in this situation that follows from the mechanism.

Then add one auxiliary section:

- **Everyday analogy** — one scene, extended, mapping how the parts relate. Check it against each defining constraint of the mechanism. If a constraint would be lost or inverted, adjust or replace the analogy before delivery.
- **One-line memory anchor** — one sentence the user can repeat.

## Visuals

Add a visual when the concept has a comparison, a multi-item mapping, or a topology or flow. Draw only relationships that exist.

- Comparison or mapping → a table, one row per item.
- Topology, layering, or flow → a diagram.
- No such shape → leave the visual out.

HTML and Markdown include that visual. Plain text stays prose. The current session uses a table or a text diagram in the chat.

## Deliver

Create the workspace-root directory `.explain-clearly/` when a file form needs it. Name each file `<topic-slug>-<local-YYYYMMDD-HHmm>` with the extension for that form. Write a new file every time. Leave an existing file in place.

Do not edit the workspace gitignore.

- **current session** — put the explanation in the chat. Include the visual when the concept has a shape. Write no file.
- **HTML** — write `.explain-clearly/<name>.html` in the user's language. Read `assets/explanation-shell.html` as a reference for structure: the same sections, inline CSS, no script, and text written as text. The English words in that file are examples, because this skill is written in English. Omit the visual block when the concept has no shape. Open that local HTML file in the browser. In the chat, give the file path and ask the user to view the page. Do not paste the full explanation. If the browser cannot be opened, still give the file path.
- **Markdown** — write `.explain-clearly/<name>.md` with the same sections. Include the visual when the concept has a shape. In the chat, give the file path and do not paste the full explanation.
- **plain text** — write `.explain-clearly/<name>.txt` as prose only. In the chat, give the file path and do not paste the full explanation.

## Worked examples

Two calibrated examples live in [reference.md](reference.md). Read them to match depth and to see how a generic example is labeled when the codebase has no footprint. In those examples the analogy is the auxiliary section.
