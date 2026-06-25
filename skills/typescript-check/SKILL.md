---
name: typescript-check
version: "1.0.0"
user-invocable: true
description: TypeScript type-checking workflow. Use this skill whenever the user works with TypeScript and mentions type errors, type checking, or says "类型检查" (type check), "type-check", "tsc", "检查类型" — even if they don't explicitly ask for a "type check" but are encountering compilation or type issues in a TypeScript project.
---

# TypeScript Type-Check Workflow

## Triggers

- "类型检查"
- "type-check"
- "tsc"
- "检查类型"

## Workflow

### Step 1: Detect the Right Command

Try the following commands in priority order:

```bash
# Prefer project-configured scripts
if grep -q '"type-check"' package.json; then
    npm run type-check
elif grep -q '"check"' package.json; then
    npm run check
elif [ -f "tsconfig.json" ]; then
    npx tsc --noEmit
else
    echo "⚠️ No TypeScript configuration found"
fi
```

### Step 2: Report Results

**If the check passes:**
```
✅ TypeScript type check passed
```

**If the check fails:**
```
❌ TypeScript type errors found:

file:xxx.ts:line:column - error description
file:yyy.tsx:line:column - error description

Total: N errors
```

### Step 3: Propose Fixes

For each error, present the fix in this format:

```
### Error N: [brief description]

📍 Location: file:line

🔧 Fix:
[explain the fix approach]

Apply this fix? (wait for user confirmation)
```

**Important**: Never apply a fix without explicit user confirmation.

### Step 4: Batch Fix

Once the user confirms, fix errors one by one or in batch. After each fix, re-run the type check until all errors are resolved.
