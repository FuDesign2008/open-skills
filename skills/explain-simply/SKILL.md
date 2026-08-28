---
name: explain-simply
version: "1.0.0"
user-invocable: true
description: "Make hard concepts easy to grasp — dual-track explanation: a rational track that goes deep (one-sentence definition → why it exists → concrete shape in the user's codebase with real file/line evidence → key design implication) and an intuitive track that keeps it simple (everyday analogy + one-line memory anchor); the simple output is earned by the deep process. Use whenever the user asks 「X 是什么」「为什么需要 X」「A 和 B 能不能/怎么通信」「给我讲讲 X」「用大白话解释 X」「帮我理解 X」, \"what is X\", \"how does X work\", \"why does X exist\", \"explain X\", \"teach me X\" about mechanisms, architecture, protocols, or processes — even if they never say \"explain\". Analogies must not introduce wrong intuitions; code evidence must be real, never invented. Do NOT use for hands-on tool tutorials or onboarding walkthroughs (use teach), marketing articles (article-writer), or design-doc rewriting (tech-review-doc)."
---

# Explain Simply — Dual-Track Concept Explanation

> Explain a technical concept on two complementary tracks: a **rational track** that builds an accurate mental model, and an **intuitive track** that lowers the comprehension barrier and gives the user something memorable and repeatable. The two tracks reinforce each other; deliver both in one answer, in the user's language.

## Design root

The skill's promise — explain it simply — presupposes depth: the rational track (deep) is the precondition of the intuitive track (simple). A simple explanation is earned by deep understanding, never by skipping it. The enemy is the Curse of Knowledge — once we know something, we find it hard to imagine what it was like not to know it (Chip & Dan Heath, *Made to Stick*, 2007); the dual-track structure forces the explainer back into the learner's frame.

- The circulating aphorism "If you can't explain it simply, you don't understand it well enough" — attributed to Einstein and Feynman, no verified source (Wikiquote marks the attribution unsubstantiated).
- The documented Feynman version: asked to prepare a freshman lecture on why spin-½ particles obey Fermi–Dirac statistics, Feynman returned days later conceding "I couldn't do it. I couldn't reduce it to the freshman level. That means we really don't understand it." — David & Judith Goodstein, *Feynman's Lost Lecture* (1996), p. 52.

## When to use

Concept / mechanism questions about how something works or why it exists — IPC, memory isolation, event loops, virtual DOM, consensus, caching, any architecture or protocol concept.

Route elsewhere and exit when the request is:

- A hands-on tutorial or onboarding ("教我怎么用 X", "walk me through setting up X") → `teach`
- Rewriting existing docs into an article → `article-writer`
- Turning a design doc into a review doc → `tech-review-doc`

## The rational track (four steps, in order)

1. **One-sentence definition** — what it is, in one precise sentence.
2. **Why it exists** — what problem it solves. Start from "what happens without it" (e.g. memory isolation makes direct reads impossible), then show how the mechanism resolves that pain.
3. **Concrete shape in the user's world** — ground the mechanism in code or architecture the asker already knows. Cite real evidence: actual files, line numbers, and APIs from the current codebase, read in this session. If the concept has no footprint in the current codebase, use a canonical public example and label it as such.
4. **Key design implication** — close the loop: which design decision in this scenario follows directly from this mechanism. This step converts understanding into engineering judgment.

## The intuitive track (two steps)

1. **Everyday analogy** — map the abstract mechanism onto one concrete, easy-to-picture scene (houses and telephone lines, a switchboard operator, a library catalog). One scene, extended — do not pile up several competing metaphors.
2. **One-line memory anchor** — compress the essence into a single sentence the user can repeat from memory.

## Fidelity criterion (hard rule for the intuitive track)

Build analogies on relational structure, not surface similarity — map how the parts relate, not how they look (Gentner's structure-mapping theory, 1983). A relationally faithful analogy survives the constraint check by construction. An analogy may simplify, but it must never contradict the rational track's defining constraints. Before delivering, check the analogy against each key constraint of the mechanism; if a constraint would be lost or inverted by the mapping, adjust or replace the analogy. A vivid analogy that teaches a wrong intuition is worse than no analogy.

## Evidence rule (hard rule for rational step 3)

Every file path, line number, and API cited must come from files actually read in this session. If you have not read the code, either read it or drop to a labeled generic/public example. When even a canonical public example is unavailable, ground the concrete-shape step in the concept's definition and why-it-exists, and label the absence of a concrete example. Fabricated evidence is a hard failure of this skill.

## Visual aids

One well-chosen table or diagram often explains more than a paragraph of prose — reach for one when the concept has a shape prose handles poorly. Pick the form by what the concept IS, not by habit:

- **Comparison or multi-item mapping** (channels vs mechanisms, options vs trade-offs) → a small **markdown table**, one row per item.
- **Topology, layering, or flow** (who talks to whom, how data moves) → a **text diagram**; use a Mermaid code block when the environment renders Mermaid, plain ASCII otherwise.
- **Simple concept with no shape** → skip the visual. A forced diagram adds noise, not clarity.

Keep visuals honest the same way as analogies: draw only relationships that actually exist — no invented arrows, no rows that don't correspond to reality. Real image files are a platform capability you may use when the environment offers them; never treat generating one as required.

## Output format

```markdown
### <Rational understanding>   (e.g. 理性认识)
1. **One-sentence definition**: ...
2. **Why it exists**: ... (start from "what happens without it")
3. **Concrete shape here**: ... (real file/line/API evidence, or a labeled public example)
   (optional visual: table or diagram when step 3 involves a comparison or topology)
4. **Key design implication**: ...

### <Intuitive understanding>  (e.g. 感性认识)
- **Everyday analogy**: ...
- **One-line memory anchor**: ...
```

Render the headers and content in the user's language. A narrower question — one a single fact answers, such as "can A talk to B" — still gets both tracks, but the rational track leads with the direct answer before the four steps. The visual slot is optional — leave it empty when the concept has no shape worth drawing.

## Worked examples

Two complete examples — a "what is X" mechanism question and a "can A talk to B" topology question — live in [reference.md](reference.md). Read them when calibrating depth, or to see how step 3's evidence grounding looks in practice (including how a generic example is labeled when the codebase has no footprint).
