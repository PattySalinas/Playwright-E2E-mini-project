#!/usr/bin/env node
/**
 * run-e2e-watch.mjs
 *
 * Local all-in-one E2E flow that ALWAYS archives and shows the report,
 * even when tests fail:
 *   1. Run: playwright test --headed --project=chromium --reporter=html
 *   2. Archive the single-file report (regardless of step 1 outcome).
 *   3. Show the report last (blocks until Ctrl+C).
 *
 * The process still exits with the test run's status code so failures are
 * not masked (useful if this is ever wired into other tooling).
 *
 * Usage: node scripts/run-e2e-watch.mjs
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const node = process.execPath;

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: projectRoot,
    shell: process.platform === 'win32', // resolve npx.cmd on Windows
    ...opts,
  });
}

// 1. Run the tests (do not throw on failure; capture the exit code).
const test = run(npx, [
  'playwright',
  'test',
  '--headed',
  '--project=chromium',
  '--reporter=html',
]);
const testExitCode = test.status ?? 1;
if (testExitCode !== 0) {
  console.warn(
    `\n[run-e2e-watch] Tests finished with failures (exit ${testExitCode}). ` +
      `Archiving and opening the report anyway...\n`
  );
}

// 2. Archive the report regardless of test outcome.
run(node, [path.join(__dirname, 'archive-report.mjs')]);

// 3. Show the report last (this blocks until the user hits Ctrl+C).
console.log(
  '[run-e2e-watch] Opening the HTML report (Ctrl+C to stop the server)...'
);
const show = run(npx, ['playwright', 'show-report']);

// Prefer surfacing the test failure code; fall back to show-report's code.
process.exit(testExitCode !== 0 ? testExitCode : show.status ?? 0);
