# Ground Truth (GT) Format

## Contents
- Compatibility with skill-creator
- GT Case Structure and assertion types
- Difficulty Levels
- GT File Structure
- Dev/Holdout/Regression Split
- Generating GT from Scratch

## Compatibility with skill-creator

GT files use a format compatible with skill-creator's `evals.json`. The `expectations` field uses plain strings (matching skill-creator's grader format). For programmatic checks, prefix the expectation with a type tag like `[contains]`, `[regex]`, etc. The `evaluate_assertions.py` script parses these tags.

## GT Case Structure

Each GT case is a JSON object representing one test scenario for the skill:

```json
{
  "id": "case-01",
  "prompt": "The user's input prompt that triggers the skill",
  "expected_output": "Human-readable description of the correct result",
  "files": ["optional/input/files.md"],
  "expectations": [
    "[contains] 通讯录",
    "[not_contains] 404",
    "[regex] \\d{4}-\\d{2}-\\d{2}",
    "[file_exists] output/report.md",
    "The output correctly explains the leave policy",
    "[fact_coverage] fact 1 that must be covered | fact 2"
  ],
  "difficulty": "standard",
  "tags": ["routing", "edge-case"]
}
```

Expectations WITHOUT a `[type]` prefix are treated as LLM-judged (passed to skill-creator's grader as-is). Expectations WITH a `[type]` prefix are evaluated programmatically by `scripts/evaluate_assertions.py`.

## Assertion Types

### Programmatic (evaluated by evaluate_assertions.py)

| Prefix | What It Checks | Example |
|--------|---------------|---------|
| `[contains]` | Output contains a substring | `"[contains] 通讯录"` |
| `[not_contains]` | Output does NOT contain a substring | `"[not_contains] 404"` |
| `[regex]` | Output matches a regular expression | `"[regex] \\d{4}-\\d{2}-\\d{2}"` |
| `[file_exists]` | A specific file was created | `"[file_exists] output/report.md"` |
| `[json_valid]` | Output parses as valid JSON | `"[json_valid]"` |
| `[script_check]` | A custom script returns exit code 0 | `"[script_check] check_output.py"` |

### LLM-Judged (passed to skill-creator grader)

| Style | What It Checks | Example |
|-------|---------------|---------|
| Plain text | General quality/correctness | `"The output correctly explains the leave policy"` |
| `[fact_coverage]` | All listed facts appear in the output | `"[fact_coverage] fact 1 | fact 2 | fact 3"` |

LLM-judged assertions use a simple YES/NO prompt — the program counts YES responses and computes the score. This keeps LLM involvement minimal and deterministic.

## Difficulty Levels

- `standard` — Normal use cases the skill should handle
- `hard` — Edge cases, ambiguous inputs, adversarial prompts
- `regression` — Cases that previously broke and must stay fixed

## GT File Structure

Compatible with skill-creator's `evals.json`:

```json
{
  "skill_name": "my-skill",
  "evals": [
    { "id": "case-01", "prompt": "...", "expected_output": "...", "expectations": ["..."], "difficulty": "standard", "tags": [] },
    { "id": "case-02", "prompt": "...", "expected_output": "...", "expectations": ["..."], "difficulty": "hard", "tags": [] }
  ]
}
```

## Dev/Holdout/Regression Split

### Purpose

- **Dev set (70%)**: The optimizer sees results from these cases every iteration. Mutations target failures here.
- **Holdout set (20%)**: The optimizer NEVER sees these during iteration. Only evaluated during L3 Strict Eval. Detects overfitting — if dev pass_rate >> holdout pass_rate, the skill is memorizing dev cases instead of genuinely improving.
- **Regression set (10% + grows)**: Cases that already pass in the baseline. Any regression on these cases is an automatic DISCARD.

### Split Strategy

1. Stratify by difficulty: ensure each split has proportional standard/hard cases
2. Stratify by tags: ensure each split covers all tag categories
3. If fewer than 10 total cases, skip holdout — use dev + regression only
4. The split is fixed for the entire evolution session — never re-split mid-session

### Dynamic Growth

During evolution, new GT cases may be discovered (e.g., the skill hits a failure mode not covered by existing GT). Add new cases to the dev set. Log the addition in `experiments.jsonl`.

Cases that fail 5+ consecutive iterations across all three layers are candidates for GT review — the GT annotation itself may be wrong. Flag these to the user with a recommendation to either fix the GT or exclude the case as a known bad annotation.

Unfixable cases with bad GT should be excluded entirely, not moved to regression. Keep them in the `excluded` list in `evolve_plan.md` and remove them from all evaluation sets; regression cases must all pass.

## Generating GT from Scratch

If no GT exists, use skill-creator's evaluation generation:

1. Analyze the skill's SKILL.md to understand its purpose
2. Generate 10-20 representative prompts spanning the skill's scope
3. For each prompt, write expected output and 2-3 assertions
4. Ask the user to review and correct
5. Split into dev/holdout/regression

The quality ceiling of evolution is bounded by GT quality. Bad GT = bad skill, no matter how many iterations you run.
