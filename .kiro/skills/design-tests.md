---
name: design-tests
description: Generate high-level (scenario-level) UI test cases for the TodoMVC Playwright project. Use when the user asks to create, draft, or expand high-level test cases, HL test cases, or scenario coverage for a feature or app. Produces ADO-style test cases (Summary + numbered steps + Tags) and writes them to generatedTestCases/HL_{Title}.txt after review.
---

# High-Level Test Case Generation

You are acting as a senior QA engineer shifting toward AI-agentic QA.
This skill produces **high-level (scenario-level)** test cases: one test
case per user-facing scenario, describing WHAT is verified without
low-level selector/step-by-step automation detail.

Always follow `test-case-standards.md` in the project root. The rules
below restate and operationalize those standards for this skill.

## Inputs to gather before writing
1. The feature/app under test and its URL (e.g. the TodoMVC React app at
   https://todomvc.com/examples/react/dist/).
2. Any existing Playwright specs (e.g. `tests/todo.spec.ts`) to align
   terminology, selectors, and covered flows.
3. The acceptance criteria or the list of main functionalities to cover.
   If not given, derive them from the app and existing specs, then state
   the assumptions.

## Required structure per test case
- **Title** — MUST start with "Verify". Describe the specific scenario.
  - Good: `Verify a todo can be deleted`
  - Bad: `Delete todo`, `Test deletion works`
- **Summary** — free text: what is being validated, why, background, the
  app URL, and references to related specs/prior test IDs.
- **Steps** — numbered, one action per step. Each step has BOTH:
  - `Action:` a single user action.
  - `Expected:` the expected result, written with the modal verb
    "should", describing what the SYSTEM should do (not what the tester
    should check).
    - Good: `The system should display "1 item left".`
    - Bad: `Check the counter`, `Counter updates`.
- **Tags** — free-form, multiple allowed. Include coverage-type tags
  (`functional`, `negative`, `Edge Case`, `Regression`) plus a
  component tag (e.g. `todo-creation`, `filtering`).

## Coverage rules
- One "happy path" scenario per acceptance criterion / main functionality.
- At least one negative or edge case per acceptance criterion that
  involves user input or an external/system boundary (e.g. empty input,
  whitespace-only input, persistence across reload).
- Keep it high-level: do not embed automation code or exact locator
  syntax in the steps. Reference controls by their user-visible name or
  role (e.g. "the Clear completed button", "the toggle for the item").
- Do NOT generate performance or load test cases unless explicitly asked.

## Review and write workflow (mandatory)
1. **Show all generated test cases in chat first** for review. Do not
   write any file yet.
2. If more than 10 test cases are being generated, pause partway through
   for an explicit confirmation checkpoint before continuing.
3. Wait for explicit user confirmation.
4. On confirmation, write to `generatedTestCases/HL_{Title}.txt` using the
   `HL_` prefix naming convention. Group related scenarios into a single
   descriptive file when they cover one feature area/app.
5. After writing, update `FlowDescription.txt` if the pipeline, artifacts,
   or rules changed as a result (per the FlowDescription maintenance rule
   in the standards).

## Output file format (plain text .txt)
Use a readable plain-text layout:

```
HL_Verify <scenario>
Summary:
  <context, why, URL, related specs>
Tags: <tag>, <tag>, ...
Steps:
  1. Action:   <single action>
     Expected: The system should <...>.
  2. Action:   <single action>
     Expected: The system should <...>.
```
