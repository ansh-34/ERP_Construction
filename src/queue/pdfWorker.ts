import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Job } from 'pg-boss';
import { getBoss, PDF_QUEUE } from './pgBoss.js';

// @ts-expect-error import.meta is valid at runtime (ESM via tsx / NodeNext build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hard cap on a single child process. Slightly above the in-render timeout
// (PDF_RENDER_TIMEOUT_MS, default 30s) so the child can normally finish/clean up
// on its own; this only catches a child that hangs before/around rendering.
const CHILD_TIMEOUT_MS = Number(process.env.PDF_CHILD_TIMEOUT_MS) || 60000;

// Run one PDF generation in a forked child process, isolated from the main
// API/queue process. Resolves on success, rejects on failure/timeout so pg-boss
// records the failure and applies retry/backoff.
function runPdfInChild(invoiceId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const isTs = __filename.endsWith('.ts');
    const childPath = path.join(
      __dirname,
      'processors',
      `pdfChild.${isTs ? 'ts' : 'js'}`,
    );

    const child = fork(childPath, [invoiceId], {
      // In dev the child is a .ts file — load it through tsx.
      execArgv: isTs ? ['--import', 'tsx'] : [],
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    });

    let settled = false;
    let lastError: string | undefined;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish(() =>
        reject(new Error(`PDF child timed out after ${CHILD_TIMEOUT_MS}ms`)),
      );
    }, CHILD_TIMEOUT_MS);

    child.on('message', (msg: { ok?: boolean; error?: string }) => {
      if (msg && msg.ok === false) lastError = msg.error;
    });
    child.on('error', (err) => finish(() => reject(err)));
    child.on('exit', (code) => {
      if (code === 0) finish(() => resolve());
      else
        finish(() =>
          reject(new Error(lastError || `PDF child exited with code ${code}`)),
        );
    });
  });
}

// Registers the pg-boss worker. Each job is processed in a forked child process
// (concurrency kept at 1 via batchSize) so heavy Puppeteer renders never block
// the main event loop and all browser resources die with the child.
export async function startPdfWorker(): Promise<void> {
  const boss = await getBoss();

  await boss.work<{ invoiceId: string }>(
    PDF_QUEUE,
    { batchSize: 1 },
    async (jobs: Job<{ invoiceId: string }>[]) => {
      for (const job of jobs) {
        const { invoiceId } = job.data;
        console.log(
          `[Worker] Job ${job.id} [Invoice: ${invoiceId}] is now active.`,
        );
        try {
          await runPdfInChild(invoiceId);
          console.log(
            `[Worker] Job ${job.id} [Invoice: ${invoiceId}] successfully completed.`,
          );
        } catch (err) {
          // Re-throw so pg-boss records the failure and applies retry/backoff.
          console.error(
            `[Worker] Job ${job.id} [Invoice: ${invoiceId}] failed:`,
            err instanceof Error ? err.message : err,
          );
          throw err;
        }
      }
    },
  );

  console.log(
    `[Worker] pg-boss worker listening on '${PDF_QUEUE}' (child-process mode)`,
  );
}
