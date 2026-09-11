---
name: run-e2e-tests
description: Run the TodoMVC Playwright E2E tests locally and manage HTML reports. Use when the user asks to run, execute, watch, or debug the E2E/UI tests, or to view or archive the Playwright report. Drives the npm scripts (test:e2e:*) and explains the local watch flow and its gotchas.
---

# Run E2E Tests (local)

Drives the project's npm scripts for running Playwright tests and handling
HTML reports. Primary use is LOCAL/interactive (headed browser, human
watching), not CI.

## Scripts (defined in package.json)
- `npm run test:e2e`         Plain run, all projects, config defaults.
- `npm run test:e2e:headed`  Headed chromium run, HTML reporter.
- `npm run test:e2e:report`  Open the last HTML report (BLOCKS: serves a
                             local web server until Ctrl+C).
- `npm run test:e2e:archive` Copy playwright-report/index.html to
                             reports/report-<timestamp>.html and prune to
                             the last 5 archives.
- `npm run test:e2e:watch`   All-in-one local flow (via
                             scripts/run-e2e-watch.mjs): run headed ->
                             archive single-file report -> show report
                             (last). ALWAYS archives and shows even when
                             tests fail, and still exits with the test
                             run's status code.

## When to use which
- "Run and watch the tests" / "run E2E locally"  -> test:e2e:watch
- "Just run the tests"                           -> test:e2e or :headed
- "Show me the last report"                      -> test:e2e:report
- "Save/archive the report"                      -> test:e2e:archive

## Gotchas (explain to the user when relevant)
- show-report BLOCKS the terminal (it starts a local web server). It is
  intentionally sequenced LAST in test:e2e:watch. Stop it with Ctrl+C.
- --headed opens real browser windows; it will NOT work on a headless CI
  agent. For CI, run `npm run test:e2e` (headless) instead.
- The single-file archive carries index.html only. On failing runs with
  traces/videos/screenshots, those attachments live as separate assets and
  may not render from the archived .html; use test:e2e:report for full
  detail, or open the live playwright-report/ folder.
- Archives land in reports/ (git-ignored), auto-pruned to the last 5.
- Do NOT launch long-running commands (show-report, --headed watch) as a
  blocking foreground call in an automated context; run them where a human
  can Ctrl+C, or advise the user to run them manually.

## Notes
- Retention (5) and output naming live in scripts/archive-report.mjs;
  change RETENTION there if needed.
- The watch flow is orchestrated by scripts/run-e2e-watch.mjs (a Node
  runner) rather than shell && chaining, so archive/show run even on test
  failures and behavior is consistent across shells/OSes.
- This skill is for local execution. A CI-friendly variant (headless,
  non-blocking, JUnit reporter for ADO) can be added later.
