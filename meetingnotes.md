Meeting Notes — Supervisor 1:1 (v0.3.2)
0) One-line summary

I have implemented a browser-based Distributed Mutual Exclusion Explorer (Token Ring + Ricart–Agrawala prototype) with fault injection, scripted demos, evidence export, and CI-backed smoke tests, and I am now focusing on the final report write-up and evaluation evidence.

1) Project title + goal

Project: Distributed Mutual Exclusion Explorer (Variant 3)

Goal (one sentence): Provide an interactive, teaching-oriented simulator to visualise distributed mutual exclusion, including faults + recovery and clear explanations of safety vs liveness.

2) What is done (v0.3.2)

Implemented Token Ring mutual exclusion with interactive stepping and run mode.

Implemented Ricart–Agrawala (RA) teaching-oriented prototype with message queue stepping.

Added faults:

Token Ring: token loss, crash/recover, token regeneration.

RA: drop next in-flight message, drop-next-send.

Added scripted demos (repeatable scenarios) for Token Ring crash and RA tie-break/conflict.

Added evidence export triplet: state JSON + trace TXT + preview PNG, with timestamped naming.

Added testing + reproducibility scaffolding: manual test plan, evidence index, and CI smoke tests.

3) Evidence / Testing (reproducibility)

Automated: GitHub Actions runs npm test; smoke tests 6/6 passed (CI green).

Manual: Ran the formal test plan for key cases:

Token Ring: TR-01 / TR-02 / TR-03

RA: RA-01 / RA-02 / RA-03 / RA-04

Evidence packs: For each case exported (JSON + trace + PNG) and organised under evidence/v0.3.2/, with an evidence index to map cases to files.

Report figures: Selected 3–6 representative figures and mapped each figure back to its originating evidence case (figure index).

4) Known limitations (explicit, intentional)

RA under message loss may lose liveness (stall) — this is intentional for teaching:

Safety (mutual exclusion) remains OK,

but progress can halt due to missing REPLY.

The RA network model is teaching-oriented (queue-based delivery) rather than a full asynchronous network simulator (no retransmission/failure detector).

5) Next 2 weeks plan (practical)

Finalise report chapters:

Background/Related Work (target: ≥30 citations total),

Design/Specification,

Professional issues,

Conclusion.

Integrate evidence into the report:

cite curated figures,

reference evidence cases (TR/RA IDs),

describe safety vs liveness using RA-03/RA-04.

Prepare a short final presentation outline (optional).

Pre-meeting 5-minute checklist (avoid surprises)
A) Demo access

Choose one:

Online demo (GitHub Pages), or

Local: python -m http.server 5500 → open the project URL in browser.

B) Token Ring quick check (60 seconds)

Select TokenRing, 4 processes.

Click Request CS on P1 → Step/Run → P1 enters CS.

Click Drop token → Step should show no progress.

Click Regenerate token → progress resumes.

Crash/Recover one process once to confirm UI controls and trace updates.

C) RA quick check (2 minutes)

Select RA.

Load tie-break demo → Step until P2 enters CS before P10.

Inject fault:

either drop-next-send (arm then step through),

or drop next in-flight message (when queue non-empty).

Step until queue empty; confirm trace contains explicit stall reason (waiting for REPLY from X).

D) CI check (30 seconds)

Open GitHub Actions → confirm latest ci / smoke-tests is green.

In-meeting script (10 minutes)
0) 10-second agenda opener

“I propose a 10-minute structure: 1 minute objective+status, 3 minutes demo, 3 minutes testing/evidence, 2 minutes report plan, and 1 minute to confirm evaluation emphasis and references direction.”

1) 1 minute: current status (results only)

Built a browser-based Distributed Mutual Exclusion Explorer.

Supports Token Ring + RA (teaching-oriented prototype).

Supports faults: token loss, crash/recover, RA message loss (two modes).

Supports evidence export: state JSON + trace TXT + preview PNG.

Freeze baseline: v0.3.2; CI smoke tests passing.

2) 3 minutes: demo (only two highlights)
Demo A: RA tie-break correctness

Load scripted tie-break demo.

Step: show P2 enters CS before P10 under same timestamp.

One-line explanation: “This demonstrates the ordering and tie-break logic is deterministic and correct for the teaching scenario.”

Demo B: Message drop → stall (Safety vs Liveness)

Trigger drop-next-send or drop next in-flight.

Step until queue empty but request still pending.

Trace shows: “Stalled: waiting for REPLY from …”

One-line explanation: “This intentionally demonstrates that RA can lose liveness under message loss, while mutual exclusion safety remains preserved.”

3) 3 minutes: testing & evidence (engineering framing)

Automated: CI runs npm test, smoke tests 6/6 pass.

Manual: ran TR-01..03 and RA-01..04 using formal test plan.

Evidence: each case has triplet exports; report figures are mapped back to evidence folders via a figure index.

Net result: report claims are traceable and reproducible.

4) 2 minutes: report plan (let supervisor choose emphasis)

Implementation chapter: UI + core model + fault injection + export pipeline.

Testing chapter: manual test plan + CI smoke tests + reproducibility workflow.

Evaluation chapter:

correctness (safety invariant),

liveness discussion (fault-induced stall),

usability (Nielsen checklist),

reproducibility (tag/release/evidence index).
Question: “Would you prefer the evaluation to emphasise correctness/theory, or the educational tool value (usability + reproducibility)? I can weight the write-up accordingly.”

5) 1 minute: 5 key questions to ask (copy/paste)

Evaluation focus: algorithmic rigour vs educational value and evidence quality?

RA positioning: is “teaching-oriented prototype” wording acceptable?

References: should the 30+ citations lean more to distributed algorithms, or can I also include HCI/education/reproducibility sources?

Evaluation depth: how much quantitative data is expected (message counts, case coverage, timings, heuristic scoring)?

Deliverable expectations: besides repo + zip, do you want a fuller user manual/installation guide in the appendix?

After-meeting actions (avoid back-and-forth)

Within 30 minutes, write down the supervisor decisions as 5 concrete TODOs (issues or notes).

If evaluation emphasis is agreed, freeze the report structure and only add content/evidence (no more restructuring).

Do we still need code changes?

Only if:

a bug affects evidence or demo stability, or

the supervisor requests a missing capability.
Otherwise:

no new features,

only bug fixes, small clarity tweaks, and report-supporting polish.

Minimal prep (if time is tight)

Copy this file into MEETING_NOTES.md

Practice two demos (tie-break + stall) — 60 seconds each

Ask the 5 questions above


下面是“导师可能追问的问题清单 + 标准回答要点”（中文指导 + 可直接说的英文句子），按你当前 v0.3.2 的实际实现与证据体系来写。你会前把最常见的 10 个练熟即可。

另外提醒：我无法稳定访问你很早之前上传的部分压缩包（会过期）。如果你需要我逐段审阅 Overleaf 的 `report.tex / Chapters/*.tex`，到时候再上传一次最新 `report.zip` 即可。

---

## 0) 30 秒开场（建议背下来）

**English (ready-to-say):**
“My project delivers a browser-based Distributed Mutual Exclusion Explorer for teaching. It supports a token-based Token Ring model and a teaching-oriented Ricart–Agrawala prototype. The tool provides step-by-step execution, scripted demos, fault injection (token loss, crash/recover, message drops), and reproducible evidence export (state JSON, trace TXT, preview PNG). The freeze baseline is v0.3.2 with CI smoke tests passing, and I’m now focusing on the final report write-up and evaluation evidence.”

---

## 1) “你的 artefact 是什么？技术栈是什么？为什么这样选？”

**导师意图：**确认符合 BCS/毕设要求（必须有计算 artefact），并且 stack 合理。

**要点（中文）：**

* artefact：交互式教学模拟器（web-based）
* stack：HTML/CSS/JS，ES modules，无依赖，可离线/Pages
* 选型理由：部署简单、可复现、适合教学演示、降低门槛

**English：**
“The artefact is an interactive web-based simulator for distributed mutual exclusion. It is implemented in plain HTML/CSS/JavaScript using ES modules, with no external dependencies. This keeps deployment and reproduction simple: it runs locally or via GitHub Pages.”

---

## 2) “Variant 3 要求 faults + recovery + clarity，你怎么满足？”

**要点：**

* faults：Token Ring 的 token loss、crash；RA 的 drop in-flight、drop-next-send
* recovery：regenerate token、recover process
* clarity：trace + queue table + stalled explanation（waiting for REPLY from who）

**English：**
“I cover faults and recovery explicitly: token loss/regeneration and crash/recover in Token Ring, and message drops in RA. Clarity is provided through a step-by-step trace, a message queue table for RA, and explicit stall explanations indicating which REPLY is missing.”

---

## 3) “你怎么证明 mutual exclusion 是正确的？”

**导师意图：**安全性（safety）是核心。

**要点：**

* 明确 safety invariant：任意时刻最多 1 个进程 in CS
* 工具里实时 checkSafety，UI 显示 Safety OK/Violation
* 测试：TR-01、RA-01 等覆盖，CI smoke tests 也检查

**English：**
“The primary correctness claim is the safety invariant: at most one process can be in the critical section at any time. I enforce and continuously check this invariant in the model and expose it via the Safety indicator. Both manual test cases and smoke tests cover this property.”

---

## 4) “为什么 RA 有时候不进入 CS？是不是 bug？”

**导师意图：**你是否理解 safety vs liveness。

**要点：**

* message loss 下 liveness 可能失败，这是“教学点”，不是 bug
* 你在 trace 明确输出 stalled 原因（waiting for REPLY from Px）
* 强调：safety 仍 OK

**English：**
“This is an intentional demonstration of safety versus liveness. Under message loss, RA may stall because a required REPLY is missing, so liveness is not guaranteed. The tool makes this explicit by logging which REPLY is being waited for, while safety remains satisfied.”

---

## 5) “你 RA 的 ordering/tie-break 是怎么做的？为什么 P2 会先于 P10？”

**要点：**

* Lamport timestamp ordering
* 同 timestamp 时用 PID 做 deterministic tie-break（数值比较，避免 lexical 误导）
* scripted demo 证明该点

**English：**
“I use Lamport-style request timestamps, and when timestamps tie I apply a deterministic tie-break by numeric PID. That is why P2 wins over P10 in the scripted tie-break demo.”

---

## 6) “你的 network model 为什么是 queue？这和真实分布式系统一致吗？”

**导师意图：**模型假设是否清楚、是否会过度宣称。

**要点：**

* queue 是 teaching abstraction：把“异步消息”离散成可观察 step
* 不追求真实网络延迟分布，只追求可解释与可复现
* 报告中会明确 limitation（threats to validity）

**English：**
“The queue is a teaching abstraction: it makes asynchronous message delivery observable and reproducible, one message per step. I do not claim fidelity to real timing distributions; instead the focus is explainability and controlled fault demonstrations, which I document as a limitation.”

---

## 7) “你对 crash 的语义是什么？消息发给 crashed 会怎样？”

**要点：**

* 明确语义：crashed 不响应，消息可能视为 dropped 或无法 delivered
* crash 会影响 progress（尤其 token holder crash）
* recover 恢复参与

**English：**
“A crashed process is treated as non-participating: it does not act on messages, and deliveries to it are effectively lost. This can stall progress. Recovery re-enables participation.”

---

## 8) “为什么你实现了 Token Ring + RA，而不是只做一个算法更深入？”

**要点：**

* Variant 3 允许 token-based 或 RA
* 选择两类代表：对比 token-based vs message-based
* 教学价值：更容易解释 safety 与 liveness、fault 类型差异
* 规模可控：RA 是 prototype，不夸大

**English：**
“I implemented one token-based and one message-based algorithm to provide contrasting mental models. This supports teaching: students can compare how exclusivity is enforced and how different faults affect progress. The RA component is explicitly positioned as a teaching-oriented prototype.”

---

## 9) “你怎么评估你的工具是‘pedagogically effective’？”

**要点：**

* 你采用可交付的评估框架：manual test cases（学习任务）、Nielsen heuristics、可重复 scripted demos
* 你输出 evidence triplets，报告里图/证据可追溯
* 如果导师希望更强：可加轻量 user study（可选），但不必承诺做不到的事

**English：**
“I evaluate pedagogical effectiveness through structured walkthrough tasks, clear trace-based explanations, and repeatable scripted demos. Usability is assessed via a Nielsen heuristic checklist, and all claims are backed by traceable evidence exports.”

---

## 10) “你怎么保证可复现？别人怎么复现你的结果？”

**要点：**

* tag/release：v0.3.2 freeze baseline
* evidence：JSON/trace/PNG + evidence index + figure index
* CI：GitHub Actions 跑 smoke tests
* env.md 记录环境（OS、browser、node、python）

**English：**
“I use a freeze baseline tag (v0.3.2), store evidence triplets per test case, and maintain an evidence index and a figure-to-evidence mapping. CI runs smoke tests on each push. The environment is recorded in env.md.”

---

## 11) “30 references 你怎么写得自然？”

**要点：**

* 分配到章节：Background/Related Work（主力），Evaluation/Usability，Reproducibility/Professional Issues
* 不是凑数：每段 claim 对应 citation
* RA/lamport/token ring/DS textbooks + HCI/usability + reproducibility

**English：**
“I plan to distribute citations across Background/Related Work, Evaluation (usability and methodology), and Reproducibility/professional issues, so references support specific claims rather than being added artificially.”

---

## 12) “Professional issues / ethics / accessibility 你准备写什么？”

**要点：**

* accessibility：键盘操作可作为 future work；对比 WCAG 基本点（对比度、可见反馈、无需颜色单独传递信息）
* privacy：无个人数据收集
* sustainability：无依赖、静态部署、可长期维护
* academic integrity：引用、证据、版本冻结

**English：**
“I address accessibility, privacy, and sustainability. The tool collects no personal data, is dependency-free for longevity, and the report will document limitations and traceability to maintain research integrity.”

---

# 导师常见“追问”与一句话应对（速记版）

* **Q:** “So is liveness guaranteed?”
  **A:** “Not under message loss in the RA prototype; the tool intentionally demonstrates liveness failure while preserving safety.”

* **Q:** “What’s your main contribution?”
  **A:** “A teaching-oriented, reproducible DME explorer with faults/recovery and traceable evidence exports.”

* **Q:** “If you had more time?”
  **A:** “Add optional timeouts/retransmissions to discuss recovery strategies, plus a small user study/SUS for usability evidence.”

---

## 会前最省时间的 3 件事（你现在做就够）

1. 把上面的 **Meeting Notes** 放到 `MEETING_NOTES.md`（或手机备忘录）
2. 练熟两个 demo（每个 60 秒）：**RA tie-break** + **RA drop→stall**
3. 把“5 个关键问题”准备好（让导师选方向）

---

如果你希望我再进一步压缩成“只读稿（不超过 25 行）”，我可以给你一个“极短版”，适合你紧张时直接念。
