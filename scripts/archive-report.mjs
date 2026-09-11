#!/usr/bin/env node
/**
 * archive-report.mjs
 *
 * Archives the latest Playwright HTML report as a single self-contained
 * .html file under reports/, then prunes to the last N archives.
 *
 * Playwright's HTML reporter writes playwright-report/index.html with the
 * report data inlined, so for suites without large separate assets
 * (traces/videos on failures) that single file is fully self-contained.
 *
 * Usage: node scripts/archive-report.mjs
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const REPORT_DIR = path.join(projectRoot, 'playwright-report');
const REPORT_INDEX = path.join(REPORT_DIR, 'index.html');
const ARCHIVE_DIR = path.join(projectRoot, 'reports');
const RETENTION = 5; // keep the last 5 archived reports

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
  );
}

async function main() {
  // 1. Verify the report exists.
  try {
    await fs.access(REPORT_INDEX);
  } catch {
    console.error(
      `[archive-report] No report found at ${REPORT_INDEX}.\n` +
        `Run the tests with --reporter=html first.`
    );
    process.exit(1);
  }

  // 2. Warn if the report is not a single self-contained file.
  const entries = await fs.readdir(REPORT_DIR);
  const extraAssets = entries.filter((e) => e !== 'index.html');
  if (extraAssets.length > 0) {
    console.warn(
      `[archive-report] WARNING: playwright-report/ contains extra assets ` +
        `(${extraAssets.join(', ')}). These usually appear when tests fail ` +
        `(traces/videos/screenshots). The single-file archive includes only ` +
        `index.html and may not render those attachments.\n` +
        `Tip: browse the live report via "npm run test:e2e:report" for full detail.`
    );
  }

  // 3. Copy index.html to reports/report-<timestamp>.html
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });
  const outName = `report-${timestamp()}.html`;
  const outPath = path.join(ARCHIVE_DIR, outName);
  await fs.copyFile(REPORT_INDEX, outPath);
  console.log(`[archive-report] Saved ${path.relative(projectRoot, outPath)}`);

  // 4. Prune to the last RETENTION archives (timestamps sort lexically).
  const archives = (await fs.readdir(ARCHIVE_DIR))
    .filter((f) => /^report-.*\.html$/.test(f))
    .sort(); // ascending: oldest first
  const excess = archives.length - RETENTION;
  if (excess > 0) {
    const toDelete = archives.slice(0, excess);
    for (const f of toDelete) {
      await fs.rm(path.join(ARCHIVE_DIR, f));
      console.log(`[archive-report] Pruned old archive ${f}`);
    }
  }

  const kept = Math.min(archives.length, RETENTION);
  console.log(
    `[archive-report] Done. Keeping ${kept} archive(s) (retention=${RETENTION}).`
  );
}

main().catch((err) => {
  console.error('[archive-report] Failed:', err);
  process.exit(1);
});
