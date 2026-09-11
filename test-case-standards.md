# Test Case Generation Standards

Auto-loaded by Kiro for every conversation touching this project. All
skills in `.kiro/skills/` (high-level, low-level) must
follow these rules without needing to be re-told.
Think as a senior QA engineer shifting towards AI agentic QA.

## Title convention
- Every test case title — high-level and low-level — **must start with
  "Verify"**, since the intent is always to verify a specific scenario.
  - Good: `Verify a UserUpdate event is ignored when the user does not exist in Bold BI`
  - Bad: `UserUpdate event handling`, `Test that update is ignored`

## Expected results
- Every step **must have an explicit expected result** — no step without
  one.
- Expected results are written using the **"should" modal verb**,
  describing what the system should do, not what it does or what the
  tester should check.
  - Good: `The system should display the message "no Route matched with those values"`
  - Bad: `Displays the error message`, `Check that the error appears`

## Completeness
- Every test case must include both a **Summary** (context:
  what's being validated, why, any relevant background/URLs) and **full
  numbered steps** (Action + Expected Result per step) — never steps
  without a summary, never a summary without steps.

## Format (matches the industry ADO Test Case work item type)
- Steps: numbered, one action per step, each with its own expected result.
- Summary: free text, can include background, links, prior test IDs, etc.
- Tags: free-form, multiple allowed (e.g. `functional`, `negative`,
  `Regression`, `Edge Case`, plus a service/component tag).

## Coverage expectations
- One "happy path" scenario per acceptance criterion.
- At least one negative/edge case per acceptance criterion involving user input or an external system boundary.
- Do not generate performance or load test cases unless explicitly asked.

## Review requirement — applies to every skill that writes or creates
- **Always show generated content in chat for review before writing a
  local file, and always show the exact field payload before calling any
  ADO write operation** (test case creation, suite creation, defect
  creation). Wait for explicit confirmation before proceeding.
- Never bulk-create more than 10 test cases without an explicit
  confirmation checkpoint partway through.

## Local file naming (generatedTestCases/ and generatedBugReports/)
- `HL_{Title}.txt` — output of `design-tests.md`.
- `LL_{Title}.txt` — output of `low-level-testcases.md`.

## FlowDescription.txt maintenance
- `FlowDescription.txt` in this project folder documents the end-to-end
  pipeline flow, all artifacts, and key rules.
- **This file must be updated whenever**:
  - A new skill/stage is added to the pipeline.
  - An existing skill's steps or behavior change meaningfully.
  - New supporting files or folders are introduced.
  - Key rules or standards are added or modified.
- Any skill that modifies the pipeline is responsible for keeping
  `FlowDescription.txt` in sync as part of the same change.
