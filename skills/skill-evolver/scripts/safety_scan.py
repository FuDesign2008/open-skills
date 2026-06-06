#!/usr/bin/env python3
"""
L1 Safety Scanner for skill-evolver.

Scans a skill directory for safety violations. 11 rules total:
- 2 critical (block evolution immediately)
- 9 warnings (logged for proposer reference)

Exit codes:
  0 = clean (no criticals, warnings only)
  1 = blocked (at least one critical violation)
  2 = usage error
"""

import sys
import re
from pathlib import Path

SELF_PATH = Path(__file__).resolve()


CRITICAL_RULES = [
    {
        "id": "S01",
        "name": "dangerous_delete",
        "description": "Dangerous delete commands (rm -rf /, rm -rf ~, etc.)",
        "pattern": r'rm\s+(-[a-zA-Z]*f[a-zA-Z]*\s+)?(/\s|/\s*$|~/|/\*|\$HOME)',
        "severity": "critical",
    },
    {
        "id": "S02",
        "name": "hardcoded_secret",
        "description": "Hardcoded API keys, tokens, or passwords",
        "pattern": r'(?i)(api[_-]?key|api[_-]?secret|access[_-]?token|password|secret[_-]?key)\s*[=:]\s*["\'][a-zA-Z0-9_\-]{16,}["\']',
        "severity": "critical",
    },
]

WARNING_RULES = [
    {
        "id": "S03",
        "name": "hardcoded_absolute_path",
        "description": "Hardcoded absolute paths (non-standard)",
        "pattern": r'(?<![a-zA-Z0-9_/])(/Users/[a-zA-Z0-9_]+/|/home/[a-zA-Z0-9_]+/|C:\\\\Users\\\\)',
        "severity": "warning",
    },
    {
        "id": "S04",
        "name": "force_push",
        "description": "Force push to git remote",
        "pattern": r'git\s+push\s+(-[a-zA-Z]*f|--force)',
        "severity": "warning",
    },
    {
        "id": "S05",
        "name": "sudo_usage",
        "description": "Usage of sudo in skill instructions",
        "pattern": r'\bsudo\s+',
        "severity": "warning",
    },
    {
        "id": "S06",
        "name": "curl_pipe_bash",
        "description": "Piping curl output to shell execution",
        "pattern": r'curl\s+.*\|\s*(bash|sh|zsh)',
        "severity": "warning",
    },
    {
        "id": "S07",
        "name": "eval_usage",
        "description": "Use of eval() or exec() in scripts",
        "pattern": r'\b(eval|exec)\s*\(',
        "severity": "warning",
    },
    {
        "id": "S08",
        "name": "wildcard_permission",
        "description": "Overly broad file permission changes",
        "pattern": r'chmod\s+(-[a-zA-Z]*\s+)?7[0-7]{2}\s',
        "severity": "warning",
    },
    {
        "id": "S09",
        "name": "env_file_commit",
        "description": "Instructions to commit .env or credential files",
        "pattern": r'git\s+add\s+.*\.(env|credentials|pem|key)\b',
        "severity": "warning",
    },
    {
        "id": "S10",
        "name": "disable_ssl",
        "description": "Disabling SSL verification",
        "pattern": r'(?i)(verify\s*=\s*False|--insecure|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*0)',
        "severity": "warning",
    },
    {
        "id": "S11",
        "name": "skip_hooks",
        "description": "Skipping git hooks",
        "pattern": r'--no-verify',
        "severity": "warning",
    },
]

ALL_RULES = CRITICAL_RULES + WARNING_RULES


def scan_file(filepath: Path, rules: list) -> list:
    """Scan a single file against all rules."""
    violations = []
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return violations

    for line_num, line in enumerate(content.splitlines(), 1):
        for rule in rules:
            if re.search(rule["pattern"], line):
                violations.append({
                    "rule_id": rule["id"],
                    "rule_name": rule["name"],
                    "severity": rule["severity"],
                    "description": rule["description"],
                    "file": str(filepath),
                    "line": line_num,
                    "content": line.strip()[:120],
                })
    return violations


def scan_skill(skill_path: str) -> dict:
    """Scan an entire skill directory."""
    skill_dir = Path(skill_path)
    if not skill_dir.is_dir():
        return {"error": f"Not a directory: {skill_path}", "violations": [], "blocked": True}

    scannable_extensions = {".md", ".py", ".sh", ".bash", ".zsh", ".js", ".ts", ".yaml", ".yml", ".toml", ".json"}
    violations = []

    for filepath in skill_dir.rglob("*"):
        if not filepath.is_file():
            continue
        if filepath.suffix.lower() not in scannable_extensions:
            continue
        if ".git" in filepath.parts:
            continue
        if filepath.resolve() == SELF_PATH:
            continue
        violations.extend(scan_file(filepath, ALL_RULES))

    criticals = [v for v in violations if v["severity"] == "critical"]
    warnings = [v for v in violations if v["severity"] == "warning"]

    return {
        "skill_path": str(skill_dir),
        "total_violations": len(violations),
        "critical_count": len(criticals),
        "warning_count": len(warnings),
        "criticals": criticals,
        "warnings": warnings,
        "blocked": len(criticals) > 0,
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: python safety_scan.py <skill_directory>")
        sys.exit(2)

    result = scan_skill(sys.argv[1])

    if "error" in result:
        print(f"ERROR: {result['error']}")
        sys.exit(2)

    if result["blocked"]:
        print(f"BLOCKED: {result['critical_count']} critical violation(s) found")
        for v in result["criticals"]:
            print(f"  [{v['rule_id']}] {v['description']}")
            print(f"    {v['file']}:{v['line']}: {v['content']}")
        sys.exit(1)

    if result["warning_count"] > 0:
        print(f"PASS with {result['warning_count']} warning(s)")
        for v in result["warnings"]:
            print(f"  [{v['rule_id']}] {v['description']}")
            print(f"    {v['file']}:{v['line']}: {v['content']}")
    else:
        print("PASS: clean")

    sys.exit(0)


if __name__ == "__main__":
    main()
