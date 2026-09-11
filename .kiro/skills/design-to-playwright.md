---
name: design-to-playwright
description: Convert high-level (HL) test cases into runnable Playwright TypeScript specs in the tests/ folder. Use when the user asks to turn HL test cases into automation, generate .spec.ts from HL_*.txt, or automate scenarios for the TodoMVC project. Prefers the Playwright MCP to verify selectors on the live app, falls back to existing spec conventions, writes after review, and regenerates TestSummary.md to keep the test catalogue in sync.
---

# HL Test Cases -> Playwright Spec Conversion

You are a senior QA automation engineer. This skill turns high-level
scenario test cases (produced by the `design-tests` skill, stored
as `generatedTestCases/HL_{Title}.txt`) into runnable Playwright
TypeScript tests under `tests/`.

Objective: produce `.spec.ts` files that run identically from VS Code,
Kiro, and ADO CI (`npx playwright test`).

## Inputs
1. The source HL file (e.g. `generatedTestCases/HL_TodoMVC_MainFunctionalities.txt`).
2. Existing specs (`tests/todo.spec.ts`) for selector and style conventions.
3. The live app URL (https://todomvc.com/examples/react/dist/).

## Selector strategy (in priority order)
1. **Playwright MCP (preferred):** if the Playwright MCP server is
   connected, drive the live app to confirm the real locators and verify
   each expected result before writing it. Capture the exact
   `getByTestId` / `getByRole` / `getByText` locators the app exposes.
2. **Existing spec reuse:** reuse locators already proven in
   `tests/todo.spec.ts`:
     - new-todo input: `page.getByTestId('text-input')`
     - list:           `page.getByTestId('todo-list')`
     - item toggle:    `getByTestId('todo-item-toggle')`
     - a list item:    `page.getByRole('listitem').filter({ hasText })`
     - delete button:  `getByRole('button', { name: 'Delete todo' })`
     - filters:        `getByRole('link', { name: 'All'|'Active'|'Completed' })`
     - clear:          `getByRole('button', { name: 'Clear completed' })`
3. If a control is not covered by the above and the MCP is unavailable,
   flag the uncertain locator in chat and ask before committing it.

## Mapping rules (HL -> Playwright)
- 1 HL test case -> 1 `test(...)` block.
- Keep the HL title verbatim as the test title, including the leading
  "Verify". Append a stable traceability tag derived from the scenario,
  e.g. `Verify a todo can be deleted @HL-todo-delete`.
- Group all tests from one HL file inside a single
  `test.describe('TodoMVC - <area>', () => { ... })`.
- Each HL step's `Action` becomes Playwright action call(s).
- Each HL step's `Expected` ("should ...") becomes an `expect(...)`
  assertion. Never drop an expected result; every "should" maps to at
  least one assertion.
- Prefer web-first assertions (`toBeVisible`, `toHaveText`,
  `toHaveCount`, `toBeChecked`) with auto-waiting over manual waits.

## Test independence
- Add a `beforeEach` that navigates to the app and clears persistence so
  tests do not leak state:
    await page.goto(URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
- The persistence scenario is the exception: it intentionally relies on
  localStorage surviving a reload within the single test.

## ADO / CI compatibility
- Keep tests self-contained and headless-safe (no reliance on a visible
  browser).
- Titles carry the `@HL-*` tag so they can be filtered
  (`--grep @HL-todo-delete`) and mapped to ADO Test Case work items.
- Do not add secrets or environment-specific URLs; use the public app URL.

## Review and write workflow (mandatory)
1. Show the full generated spec in chat for review BEFORE writing.
2. Wait for explicit confirmation.
3. Write to `tests/{descriptive-name}.spec.ts` (default:
   `tests/todo-hl.spec.ts` for the combined TodoMVC set).
4. Verify it compiles/lists: run `npx playwright test <file> --list`.
   If it fails, fix before declaring done.
5. Regenerate `TestSummary.md` (see "Regenerate TestSummary.md" below).
6. Update `FlowDescription.txt` to reflect the new automation artifact.

## Regenerate TestSummary.md (mandatory after any spec change)
`TestSummary.md` at the project root is the at-a-glance catalogue of all
test cases and QA metrics. Whenever this skill adds, removes, renames, or
re-categorizes tests, regenerate it in the SAME change so it never drifts
from the specs.

Steps:
1. Enumerate every `test(...)` across the `tests/*.spec.ts` files that
   hold HL-derived cases (exclude the default `example.spec.ts` unless
   asked to include it). The authoritative list can be obtained with:
     `npx playwright test tests/ --list --project=chromium`
   Deduplicate the per-browser projections down to unique titles.
2. For each test, extract:
   - Title (the text before the tags).
   - Tags: the coverage-type tags from the HL source
     (functional / negative / Edge Case / Regression) plus any inline
     `@...` tags in the test title (`@HL-*`, `@sanityTest`).
   - Coverage area (Create / Complete / Delete / Edit / Filter /
     Bulk actions / Persistence / etc.) derived from the HL case.
   - Automation status (Automated when a matching `test()` exists).
   - Traceability tag (the `@HL-*` tag).
3. Rewrite `TestSummary.md` with:
   - A header block: app URL, test type, source HL file, spec file,
     last-updated date.
   - A test table: `# | Title | Type / Tags | Coverage area | Automated |
     Traceability tag`.
   - "Metrics at a glance": total count; counts by coverage area; counts
     by coverage type (happy path vs negative/edge); counts by automation
     status; the Regression subset and the `@sanityTest` smoke subset.
   - A "How to run" section (all tests, smoke only, by tag, single
     browser).
   - A "Notes / findings" section for behavioral findings (e.g. no
     persistence, empty-state quirks) surfaced during MCP verification.
4. Keep counts internally consistent: the per-area totals and the
   per-type totals must each sum to the overall total. Re-check before
   declaring done.

## Output conventions
- `import { test, expect } from '@playwright/test';`
- One `const URL = 'https://todomvc.com/examples/react/dist/';` constant.
- Readable comments tying each test back to its HL case where helpful.
