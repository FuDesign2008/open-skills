#!/usr/bin/env python3
"""
Results tracker for skill-evolver.

Appends to results.tsv and experiments.jsonl in the evolution workspace.

Usage:
  # Log a KEEP result
  python results_tracker.py <workspace> log \
    --iteration 5 --layer 2 --mutation-type "disambiguation_hint" \
    --description "Added hint for leave-related queries" \
    --pass-rate 0.86 --delta 0.04 --decision KEEP \
    --tokens 12400 --duration-s 91.3

  # Log a DISCARD result
  python results_tracker.py <workspace> log \
    --iteration 6 --layer 2 --mutation-type "reorder_steps" \
    --description "Reordered routing priority" \
    --pass-rate 0.82 --delta -0.04 --decision DISCARD \
    --failure-reasons "regression: case-03 PASS->FAIL"

  # Show summary
  python results_tracker.py <workspace> summary
"""

import sys
import json
from datetime import datetime, timezone
from pathlib import Path


def ensure_workspace(workspace: Path):
    """Ensure workspace directories exist."""
    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / "traces").mkdir(exist_ok=True)
    (workspace / "iterations").mkdir(exist_ok=True)
    (workspace / "gt").mkdir(exist_ok=True)


def log_result(workspace: Path, args: dict):
    """Append to results.tsv and experiments.jsonl."""
    tsv_path = workspace / "results.tsv"
    jsonl_path = workspace / "experiments.jsonl"

    # Write TSV header if file doesn't exist
    if not tsv_path.exists():
        with open(tsv_path, "w") as f:
            f.write("iteration\tlayer\tmutation_type\tdescription\tpass_rate\tdelta\tdecision\ttokens\tduration_s\ttimestamp\n")

    timestamp = datetime.now(timezone.utc).isoformat()

    desc_escaped = args["description"].replace("\t", " ").replace("\n", " ")
    tokens = int(args.get("tokens", 0))
    duration_s = float(args.get("duration_s", 0))

    # Append TSV row
    row = "\t".join([
        str(args["iteration"]),
        str(args["layer"]),
        args["mutation_type"],
        desc_escaped,
        f"{args['pass_rate']:.4f}",
        f"{args['delta']:+.4f}",
        args["decision"],
        str(tokens),
        f"{duration_s:.3f}",
        timestamp,
    ])
    with open(tsv_path, "a") as f:
        f.write(row + "\n")

    # Append JSONL entry
    entry = {
        "iteration": args["iteration"],
        "layer": args["layer"],
        "mutation_type": args["mutation_type"],
        "mutation": args["description"],
        "target_cases": args.get("target_cases", []),
        "pass_rate_before": round(args["pass_rate"] - args["delta"], 4),
        "pass_rate_after": args["pass_rate"],
        "regressions": args.get("regressions", []),
        "tokens": tokens,
        "duration_s": duration_s,
        "decision": args["decision"],
        "gate_details": args.get("gate_details", {}),
        "failure_reasons": args.get("failure_reasons", []),
        "timestamp": timestamp,
    }
    with open(jsonl_path, "a") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"Logged iteration {args['iteration']}: {args['decision']} (pass_rate={args['pass_rate']:.4f}, delta={args['delta']:+.4f})")


def show_summary(workspace: Path):
    """Print summary of evolution progress."""
    tsv_path = workspace / "results.tsv"

    if not tsv_path.exists():
        print("No results yet.")
        return

    lines = tsv_path.read_text().strip().split("\n")
    if len(lines) <= 1:
        print("No results yet.")
        return

    header = lines[0].split("\t")
    rows = [dict(zip(header, line.split("\t"))) for line in lines[1:]]

    total = len(rows)
    keeps = sum(1 for r in rows if r["decision"] == "KEEP")
    discards = total - keeps

    pass_rates = [float(r["pass_rate"]) for r in rows]
    best_rate = max(pass_rates)
    first_rate = pass_rates[0] - float(rows[0]["delta"])

    layers_used = sorted(set(r["layer"] for r in rows))

    print(f"Evolution Summary ({total} iterations)")
    print(f"  Kept: {keeps} | Discarded: {discards}")
    print(f"  Baseline pass_rate: {first_rate:.4f}")
    print(f"  Best pass_rate: {best_rate:.4f}")
    print(f"  Improvement: {best_rate - first_rate:+.4f}")
    print(f"  Layers used: {', '.join(layers_used)}")

    # Recent activity
    print(f"\nLast 5 iterations:")
    for r in rows[-5:]:
        emoji = "+" if r["decision"] == "KEEP" else "-"
        print(f"  [{emoji}] iter-{r['iteration']} L{r['layer']}: {r['description'][:60]} ({r['pass_rate']})")


def main():
    if len(sys.argv) < 3:
        print("Usage: python results_tracker.py <workspace> [log|summary] [options]")
        sys.exit(2)

    workspace = Path(sys.argv[1])
    command = sys.argv[2]

    if command == "summary":
        show_summary(workspace)
    elif command == "log":
        # Parse key=value args
        args = {}
        i = 3
        while i < len(sys.argv):
            key = sys.argv[i].lstrip("-").replace("-", "_")
            if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--"):
                value = sys.argv[i + 1]
                i += 2
            else:
                value = "true"
                i += 1

            if key in ("iteration", "layer"):
                args[key] = int(value)
            elif key == "tokens":
                args[key] = int(value)
            elif key in ("pass_rate", "delta", "duration_s"):
                args[key] = float(value)
            elif key in ("target_cases", "regressions", "failure_reasons"):
                args[key] = value.split(",") if value else []
            else:
                args[key] = value

        required = ["iteration", "layer", "mutation_type", "description", "pass_rate", "delta", "decision"]
        missing = [k for k in required if k not in args]
        if missing:
            print(f"Missing required args: {', '.join(missing)}")
            sys.exit(2)

        ensure_workspace(workspace)
        log_result(workspace, args)
    else:
        print(f"Unknown command: {command}")
        sys.exit(2)


if __name__ == "__main__":
    main()
