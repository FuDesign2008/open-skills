# Reference and Templates

## Input Formats (Auto-detected)

| Input | Detection Method | Retrieval |
|-------|-----------------|-----------|
| MR/PR URL (GitLab) | Contains `/merge_requests/` | `glab mr diff <iid>` or prompt user to paste diff |
| MR/PR URL (GitHub) | Contains `/pull/` | `gh pr diff <number>` or prompt user to paste diff |
| Commit hash | 40-char or short hash, no `/` | `git show <hash>` or `git diff <hash>~1 <hash>` |
| Diff text | Starts with `diff --git` or `+++` / `---` | Use directly |
| Branch name | Short string, not URL or hash | `git diff main...<branch>` |
| No input | — | `git diff` (uncommitted changes) or `git diff HEAD~1` (latest commit) |

**Fallback**: If the platform CLI is not installed or auth fails, prompt user to manually paste the diff content.

## File Naming Rules

Default save location: **current working directory** (the AI execution environment's cwd, not necessarily the repo root).

**Format**: `<feature>_manual_test_guide_<YYYY-MM-DD>.md`

- `<feature>`: Extract the core feature name from the changes
  - Use kebab-case or a short phrase; **avoid** spaces and special filesystem characters (`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`)
  - For multi-feature changes, use the primary one; if hard to determine, use `general` as fallback
- `<YYYY-MM-DD>`: Date at generation time
- **Examples**:
  - `phone-login_manual_test_guide_2026-06-15.md`
  - `user-auth_manual_test_guide_2026-06-15.md`
  - `general_manual_test_guide_2026-06-15.md` (fallback)

**User override**: User can specify a custom path or filename at trigger time (absolute path / relative path / filename only); save as specified, naming rules don't apply.

**Path confirmation**: Before writing, clearly state the full save path to the user (`Saved to: <absolute path>`) so the user can locate the file.

## Tool Constraints

| Step | Edit/Write | Bash | Notes |
|------|-----------|------|-------|
| Step 1: Obtain changes | ❌ | ✅ (read-only git/CLI commands) | Read-only diff retrieval |
| Step 2: Change analysis | ❌ | ❌ | Pure analysis |
| Step 3: Generate guide | ❌ | ❌ | Pure generation |
| Step 4: Supplement regression | ❌ | ❌ | Pure analysis |
| Step 5: Output | ✅ (write to file by default) | ❌ | Default save to current working directory |

## Conversation Output Strategy

After generating and saving the file, **do not repeat full content in the conversation** — only output a brief summary:

1. **Save path**: Full absolute path
2. **Test item statistics**: Total count + distribution by priority (how many P0/P1/P2)
3. **Core change points**: 3–5 most important user-perceivable changes
4. **Regression scope**: List module names requiring regression (don't expand verification methods)

> Full test items, prerequisites, steps, expected results, etc. are always written to the file only.

---

## Test Guide Output Template

```markdown
# 📋 Manual Test Guide

> Generated from [change source] | Generated: YYYY-MM-DD

## Change Overview

| Item | Details |
|------|---------|
| Change source | [commit / MR / PR / branch] |
| Change scope | [N files, M modules] |
| Change types | [Added/Modified/Fixed/Config/Removed] |

---

## 🔍 Change List

### Module 1: [module name]

#### Change 1.1: [brief description]
- **File**: `path/to/file`
- **Type**: [🆕 Added / 🔄 Modified / 🐛 Fixed / ⚙️ Config / 🗑️ Removed]
- **User impact**: [description of impact on user/system behavior]

---

## ✅ Test Items

### [P0] Test Item 1: [test objective]

**Prerequisites**:
- [condition 1]
- [condition 2]

**Test steps**:
1. [step 1]
2. [step 2]
3. [step 3]

**Expected results**:
- [pass criterion 1]
- [pass criterion 2]

---

### [P1] Test Item 2: [test objective]

**Prerequisites**:
- [condition]

**Test steps**:
1. [step]

**Expected results**:
- [criterion]

---

## 🔄 Regression Verification

| Verification item | Verification method | Related change |
|-------------------|---------------------|----------------|
| [feature point] | [brief operation] | [change ID] |

---

## ⚠️ Notes

- [points requiring special attention]
- [environment/data requirements]
```

---

## Full Example

**Input**: A MR diff involving user login feature changes and password rule config updates.

**Output**:

```markdown
# 📋 Manual Test Guide

> Generated from MR !123 (feat: phone number login + password rule upgrade) | Generated: 2026-06-11

## Change Overview

| Item | Details |
|------|---------|
| Change source | MR !123 |
| Change scope | 5 files, 2 modules |
| Change types | 🆕 Added + 🔄 Modified + ⚙️ Config |

---

## 🔍 Change List

### Module 1: User Login

#### Change 1.1: Added phone number + verification code login
- **File**: `src/pages/Login.vue`, `src/api/auth.js`
- **Type**: 🆕 Added
- **User impact**: Login page adds a "Phone Login" tab; users can log in via phone number + SMS verification code

#### Change 1.2: Password error message copy refined
- **File**: `src/pages/Login.vue`
- **Type**: 🔄 Modified
- **User impact**: Password error prompt changed from "Incorrect password" to "Account or password is incorrect, please try again"

### Module 2: Security Config

#### Change 2.1: Minimum password length increased from 6 to 8
- **File**: `config/security.yaml`
- **Type**: ⚙️ Config
- **User impact**: New registrations and password changes now require at least 8 characters

---

## ✅ Test Items

### [P0] Test Item 1: Phone login complete flow

**Prerequisites**:
- Have a registered phone number
- Ensure SMS gateway is working (test environment may use fixed code 123456)

**Test steps**:
1. Open the login page, confirm it shows "Account Login" and "Phone Login" tabs
2. Click the "Phone Login" tab
3. Enter the registered phone number, click "Get Verification Code"
4. Enter the verification code, click "Login"
5. Verify successful login and redirect to home page

**Expected results**:
- Tab switching works; phone login form shows phone number input and verification code input
- "Get Verification Code" button enters 60-second countdown after click
- Correct verification code logs in successfully and redirects to home
- User info displays correctly after login

---

### [P0] Test Item 2: Password length rule enforced

**Prerequisites**:
- Have an unregistered phone number/email

**Test steps**:
1. Go to the registration page
2. Enter a 6-character password (e.g. `abc123`), attempt to submit
3. Enter an 8-character password (e.g. `abcd1234`), attempt to submit

**Expected results**:
- 6-character password shows "Password must be at least 8 characters"
- 8-character password passes validation and registration succeeds

---

### [P0] Test Item 3: Existing account login unaffected

**Prerequisites**:
- Have an existing account with password

**Test steps**:
1. Open the login page, stay on "Account Login" tab
2. Enter existing account and correct password, click login
3. Enter existing account and wrong password, click login

**Expected results**:
- Correct password logs in successfully
- Wrong password shows "Account or password is incorrect, please try again" (verifies copy change)

---

### [P1] Test Item 4: Phone login edge cases

**Prerequisites**:
- Have registered and unregistered phone numbers

**Test steps**:
1. Enter an unregistered phone number, get verification code and attempt login
2. Click login with empty verification code
3. Click login with wrong verification code

**Expected results**:
- Unregistered phone number shows "This phone number is not registered"
- Empty verification code shows "Please enter verification code"
- Wrong verification code shows "Incorrect verification code"

---

### [P2] Test Item 5: Tab switching interaction

**Prerequisites**:
- Open the login page

**Test steps**:
1. Type partial content in "Account Login" tab, then switch to "Phone Login" tab
2. Switch back to "Account Login" tab

**Expected results**:
- Tab switching is smooth, no page flicker
- Whether previous input is preserved after switching is acceptable, but no errors should occur

---

## 🔄 Regression Verification

| Verification item | Verification method | Related change |
|-------------------|---------------------|----------------|
| Logout | Log out and log back in, verify flow works | 1.1 |
| Password recovery | Recover password via phone number, verify SMS works | 1.1 |
| Change password | Verify 8-character rule enforced when changing password | 2.1 |
| Third-party login (if any) | WeChat/Google login flow works | 1.1 |

---

## ⚠️ Notes

- Phone login depends on SMS gateway; confirm test environment SMS service is working before testing
- Password rule change only affects **new registrations and password changes**; existing user passwords are unaffected (still work)
- If multiple platforms exist (Web/H5/App), phone login must be verified on each platform
```
