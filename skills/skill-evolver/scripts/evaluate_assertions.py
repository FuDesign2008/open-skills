#!/usr/bin/env python3
"""
Programmatic assertion evaluator for skill-evolver.

Evaluates expectations with type prefixes ([contains], [regex], etc.)
against skill output. Plain-text expectations (no prefix) are skipped
and left for LLM-based grading.

Usage:
  # Evaluate from file
  python evaluate_assertions.py --output-file output.txt \
    --expectations '[\"[contains] 通讯录\", \"[regex] \\\\d{4}\"]'

  # Evaluate from stdin (pipe output)
  echo "some output" | python evaluate_assertions.py \
    --expectations '[\"[contains] some\"]'

  # Output as JSON
  python evaluate_assertions.py --output-file output.txt \
    --expectations '[\"[contains] foo\", \"plain text expectation\"]' \
    --json

Exit codes:
  0 = all programmatic assertions passed
  1 = at least one programmatic assertion failed
  2 = usage error
  3 = no programmatic assertions evaluated; LLM grading required
"""

import sys
import re
import json
import subprocess
from pathlib import Path


PROGRAMMATIC_PREFIXES = {
    "contains",
    "not_contains",
    "regex",
    "file_exists",
    "json_valid",
    "script_check",
}


def parse_expectation(expectation: str) -> tuple:
    """Parse an expectation string into (type, value) or (None, original) for LLM-judged."""
    match = re.match(r'^\[(\w+)\]\s*(.*)', expectation, re.DOTALL)
    if match:
        etype = match.group(1)
        value = match.group(2).strip()
        if etype in PROGRAMMATIC_PREFIXES:
            return etype, value
        if etype == "fact_coverage":
            return None, expectation
    return None, expectation


def evaluate_contains(output: str, value: str) -> dict:
    passed = value in output
    return {
        "text": f"[contains] {value}",
        "passed": passed,
        "evidence": f"Found in output" if passed else f"Substring not found in output ({len(output)} chars)",
    }


def evaluate_not_contains(output: str, value: str) -> dict:
    passed = value not in output
    return {
        "text": f"[not_contains] {value}",
        "passed": passed,
        "evidence": "Substring correctly absent" if passed else "Substring was found in output",
    }


def evaluate_regex(output: str, pattern: str) -> dict:
    try:
        match = re.search(pattern, output)
        passed = match is not None
        evidence = f"Matched: '{match.group()}'" if passed else "No match found"
    except re.error as e:
        passed = False
        evidence = f"Invalid regex: {e}"
    return {
        "text": f"[regex] {pattern}",
        "passed": passed,
        "evidence": evidence,
    }


def evaluate_file_exists(output: str, filepath: str) -> dict:
    exists = Path(filepath).exists()
    return {
        "text": f"[file_exists] {filepath}",
        "passed": exists,
        "evidence": f"File exists at {filepath}" if exists else f"File not found: {filepath}",
    }


def evaluate_json_valid(output: str, value: str) -> dict:
    try:
        json.loads(output)
        return {
            "text": "[json_valid]",
            "passed": True,
            "evidence": "Output is valid JSON",
        }
    except json.JSONDecodeError as e:
        return {
            "text": "[json_valid]",
            "passed": False,
            "evidence": f"Invalid JSON: {e}",
        }


def evaluate_script_check(output: str, script: str) -> dict:
    script_path = Path(script)
    if ".." in script:
        return {
            "text": f"[script_check] {script}",
            "passed": False,
            "evidence": "Script path rejected: path traversal is not allowed",
        }
    if script_path.is_absolute() or str(script_path).startswith("/"):
        return {
            "text": f"[script_check] {script}",
            "passed": False,
            "evidence": "Script path rejected: absolute paths are not allowed",
        }

    resolved_script = script_path.resolve()
    if not resolved_script.exists():
        return {
            "text": f"[script_check] {script}",
            "passed": False,
            "evidence": f"Script not found: {script}",
        }

    try:
        result = subprocess.run(
            ["python3", str(resolved_script)],
            input=output,
            capture_output=True,
            text=True,
            timeout=30,
        )
        passed = result.returncode == 0
        evidence = result.stdout.strip() or result.stderr.strip() or f"Exit code: {result.returncode}"
    except subprocess.TimeoutExpired:
        passed = False
        evidence = "Script timed out (30s)"
    except FileNotFoundError:
        passed = False
        evidence = f"Script not found: {script}"
    return {
        "text": f"[script_check] {script}",
        "passed": passed,
        "evidence": evidence[:200],
    }


EVALUATORS = {
    "contains": evaluate_contains,
    "not_contains": evaluate_not_contains,
    "regex": evaluate_regex,
    "file_exists": evaluate_file_exists,
    "json_valid": evaluate_json_valid,
    "script_check": evaluate_script_check,
}


def evaluate(output: str, expectations: list) -> dict:
    """Evaluate all expectations against output."""
    results = []
    skipped = []

    for exp in expectations:
        etype, value = parse_expectation(exp)
        if etype is None:
            skipped.append({"text": exp, "reason": "LLM-judged (no programmatic prefix)"})
            continue

        evaluator = EVALUATORS.get(etype)
        if evaluator is None:
            skipped.append({"text": exp, "reason": f"Unknown type: {etype}"})
            continue

        result = evaluator(output, value)
        results.append(result)

    passed = sum(1 for r in results if r["passed"])
    total = len(results)

    return {
        "results": results,
        "skipped": skipped,
        "summary": {
            "passed": passed,
            "failed": total - passed,
            "total": total,
            "skipped": len(skipped),
            "pass_rate": passed / total if total > 0 else 1.0,
        },
    }


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Evaluate programmatic assertions")
    parser.add_argument("--output-file", help="Path to file containing skill output")
    parser.add_argument("--expectations", required=True, help="JSON array of expectation strings")
    parser.add_argument("--case-id", help="Case ID to include in JSON output")
    parser.add_argument("--json", action="store_true", help="Output results as JSON")
    args = parser.parse_args()

    if args.output_file:
        try:
            output = Path(args.output_file).read_text(encoding="utf-8")
        except FileNotFoundError:
            print(f"ERROR: Output file not found: {args.output_file}")
            sys.exit(2)
    else:
        output = sys.stdin.read()

    try:
        expectations = json.loads(args.expectations)
    except json.JSONDecodeError as e:
        print(f"ERROR: Invalid expectations JSON: {e}")
        sys.exit(2)

    result = evaluate(output, expectations)
    if args.case_id:
        result["case_id"] = args.case_id

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        s = result["summary"]
        print(f"Results: {s['passed']}/{s['total']} passed ({s['skipped']} skipped for LLM grading)")
        for r in result["results"]:
            mark = "PASS" if r["passed"] else "FAIL"
            print(f"  [{mark}] {r['text']}")
            print(f"         {r['evidence']}")
        if result["skipped"]:
            print(f"\nSkipped (require LLM grading):")
            for sk in result["skipped"]:
                print(f"  - {sk['text']}")

    if result["summary"]["total"] == 0:
        print("No programmatic assertions to evaluate — LLM grading required.", file=sys.stderr)
        sys.exit(3)

    all_passed = all(r["passed"] for r in result["results"])
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
