#!/usr/bin/env python3
"""Heuristic grade: assertion passes if enough keywords from assertion text appear in answer.md."""
import json, re, sys
from pathlib import Path

def tokens(s):
    return [t for t in re.split(r"[^a-zA-Z0-9\u4e00-\u9fff]+", s.lower()) if len(t) >= 3]

def grade(answer: str, assertion: str) -> bool:
    toks = tokens(assertion)
    if not toks:
        return True
    a = answer.lower()
    hits = sum(1 for t in toks if t in a)
    return hits >= max(1, len(toks) // 3)

def main(workspace: Path):
    evals = json.loads((workspace / "evals.json").read_text())
    results = []
    for ev in evals["evals"]:
        name = ev["name"]
        for variant in ("with_skill", "old_skill"):
            ans_path = workspace / "iteration-1" / name / variant / "outputs" / "answer.md"
            if not ans_path.exists():
                results.append({"eval": name, "variant": variant, "missing": True})
                continue
            answer = ans_path.read_text(encoding="utf-8", errors="replace")
            expectations = []
            for assertion in ev.get("assertions", []):
                expectations.append({
                    "text": assertion,
                    "passed": grade(answer, assertion),
                    "evidence": "keyword heuristic"
                })
            out = {
                "eval_id": ev["id"],
                "eval_name": name,
                "variant": variant,
                "expectations": expectations,
                "pass_rate": sum(e["passed"] for e in expectations) / max(1, len(expectations))
            }
            grade_path = workspace / "iteration-1" / name / variant / "grading.json"
            grade_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
            results.append(out)
    summary = workspace / "iteration-1" / "grading-summary.json"
    summary.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {summary}")
    for r in results:
        if r.get("missing"):
            print(f"MISSING {r['eval']} {r['variant']}")
        else:
            print(f"{r['eval_name']:30} {r['variant']:12} pass_rate={r['pass_rate']:.0%}")

if __name__ == "__main__":
    main(Path(sys.argv[1]))
