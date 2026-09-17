## Why

Change A gave the queue the ability to choose the right work; it still executes **one card at a time**, so wall-clock time is untouched — and throughput is the reason parallelism was raised in the first place. Three costs also survive: same-module cards each re-explore the same code (no cost amortization), and the human faces N merge decisions at acceptance with no pre-computed conflict picture.

The queue's safety today is **bought by serial execution**: one child at a time makes isolation trivial (one branch suffices, so `(or linked worktree)` was enough), accounting trivial (a single writer), and failure isolation trivial (one failure at a time). Concurrency turns all three into coordination problems simultaneously — which is why it was excluded by design rather than overlooked. The current contract says so out loud: the Red Flags literally forbid running two children concurrently, and 逐任务隔离 treats a worktree as optional precisely because serial made one branch sufficient.

## What Changes

- **BREAKING — 串行消费与非阻塞失败 becomes concurrent consumption.** The consumption loop moves from "for each pending card in order" to a **slot dispatch**: while slots are free, admit a pending card, run it, and refill on completion. Ordering (priority → information leverage → certainty band → FIFO) still decides the *sequence of admission*, not the concurrency.
- **BREAKING — 逐任务隔离 becomes strength-graded.** A worktree is required for every concurrent child when concurrency ≥ 2 (one branch in one working tree cannot serve two children); concurrency 1 keeps today's branch-or-worktree behavior. Refusing worktrees caps a queue's concurrency at 1, recorded on the queue.
- **BREAKING — Red Flags reversal.** "Running two children concurrently" is replaced by "exceeding the resolved concurrency" and "letting two children share one worktree"; the failure-isolation half of that red flag (one failed card never cancels the rest) is preserved.
- **Add — concurrency is an enqueue-time decision.** Settled while the human is present and recorded in the queue config, alongside isolation strength: asked at enqueue with a recommended default of **3**; a run with the human present and no recorded value asks; an absent or unattended run reuses the recorded value and falls back to 1 when none is recorded.
- **Add — module-overlap admission criterion.** A free slot is offered only to a pending card whose module set does not overlap any in-flight card, so same-module writes serialize automatically instead of colliding. This one criterion discharges isolation, worktree justification, and write-conflict avoidance together.
- **Add — three-way cap set.** `max-tasks` (kept) / `max-concurrent` (new) / **wall-clock** time cap; the summed-estimate comparison is demoted to reference only, because it is no longer an upper bound on wall-clock.
- **Add — single-writer progress accounting.** The dispatcher is the sole writer of the progress document; children report back and never write shared files.
- **Add — same-module exploration amortization.** The first card touching a module produces an exploration record; later cards on that module seed from it instead of re-exploring — reusing change A's Approach Record mechanism rather than introducing a parallel one.
- **Add — acceptance merge-decision compression.** Each executed task's branch is auto-rebased onto the latest main and the conflict picture is pre-run during package assembly, so the human reviews real conflicts instead of performing N unassisted merge decisions.
- **Add — platform-degradation path.** Concurrency is expressed as intent and realized by the platform's native capability; when the platform cannot run N children concurrently the queue falls back to 1 and states it — never silently pretending to have run concurrently.

## Capabilities

### New Capabilities

- `goal-queue-concurrency`: slot-based concurrent dispatch with the module-overlap admission criterion, the three-way cap set, the enqueue-time concurrency and isolation decisions with their absent-run reuse rule, worktree-mandatory isolation at concurrency ≥ 2, single-writer progress accounting, the platform-degradation path, and the exploration-amortization and acceptance-compression behaviors that ride the concurrent loop.

### Modified Capabilities

- `goal-queue`: 串行消费与非阻塞失败 becomes concurrent consumption (inverted); 逐任务隔离 becomes strength-graded (worktree mandatory above concurrency 1); 队列级预算与停止规则 gains the three-way cap set and the wall-clock accounting change; 进度文档与验收包 gains single-writer accounting and the compressed acceptance; 入库即预审批 gains the concurrency/isolation ticket; 显式触发边界 gains the concurrency clause in the trigger; goal-queue 代理检查点接线 gains serialized checkpoint adjudication across in-flight children.

## Impact

- `skills/goal-driven-queue/SKILL.md` (Stage 1 concurrency/isolation ticket, Stage 2 slot dispatch and admission criterion, Stage 3 compressed acceptance, Red Flags reversal, frontmatter description), `reference.md` (queue config fields, caps defaults, exploration-record pointer, progress-document accounting), `evals/evals.json`.
- `docs/generated/skills-index.md` regenerated by the pre-commit hook (never hand-edited).
- After archive: `openspec/specs/goal-queue/spec.md` updated and a new `openspec/specs/goal-queue-concurrency/spec.md`.
- Referenced, not modified: `git-worktree-discipline` (upgraded from a development-time option to a **runtime** carrier for concurrent children), `ai-proxy-discipline` (checkpoint events from several in-flight children are adjudicated serially by the dispatcher), `intake-interview-discipline` (the enqueue interview gains the concurrency/isolation ticket), `merge-discipline` (compression reduces the count of human merge decisions; the discipline itself is unchanged).
- Runtime artifacts in *user* projects: one worktree per concurrent child (disk cost, and the sibling-path/packaging difficulties already recorded in `docs/git-worktree-multi-repo-local-verify-case.md`); the queue config gains concurrency and isolation-strength fields.
- Existing behavior is unchanged when concurrency resolves to 1 — the same guarantee change A gave for unselected cards.
- Deliberately out of scope: worktree pooling or pre-warming, dynamic slot sizing by estimate band, cross-queue concurrency, and any hardcoded platform concurrency tool (intent only, per the repository's platform-agnostic rule).
