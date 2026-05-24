/**
 * Lighthouse config for ad-hoc audits of the live production site.
 *
 * Invoked via `make lighthouse` (= `pnpm lighthouse`). NOT run in CI —
 * see ADR-style notes in README.md "Lighthouse" section for the
 * rationale (synthetic perf scores flap on shared CI runners; real
 * perf signal lives in CrUX/RUM; the audits worth gating on PR are
 * already covered by lint/type/E2E).
 *
 * Reports land in `lighthouse-reports/` (gitignored). Open the HTML
 * files in a browser to inspect scores and opportunities.
 */
const SITE = 'https://voorvoet.nl';

/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      url: [
        // NL
        `${SITE}/nl`,
        `${SITE}/nl/informatie`,
        `${SITE}/nl/vergoedingen`,
        `${SITE}/nl/contact`,
        `${SITE}/nl/zolen-bestellen`,
        `${SITE}/nl/blog`,
        `${SITE}/nl/blog/podotherapeut-of-podoloog`,
        `${SITE}/nl/credits`,
        // DE
        `${SITE}/de`,
        `${SITE}/de/informationen`,
        `${SITE}/de/erstattungen`,
        `${SITE}/de/kontakt`,
        `${SITE}/de/einlagen-bestellen`,
        `${SITE}/de/blog`,
        `${SITE}/de/blog/podotherapeut-oder-podologe`,
        `${SITE}/de/credits`,
        // EN
        `${SITE}/en`,
        `${SITE}/en/information`,
        `${SITE}/en/reimbursements`,
        `${SITE}/en/contact`,
        `${SITE}/en/order-insoles`,
        `${SITE}/en/blog`,
        `${SITE}/en/blog/podiatrist-or-podologist`,
        `${SITE}/en/credits`,
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
        budgetPath: './lighthouse/budget.json',
      },
    },
    assert: {
      // Diagnostic only. All categories warn rather than error so the
      // command always exits 0 and you can read the reports without
      // tripping over a hard-fail. Adjust if you want a single category
      // to fail the local run (e.g., promote a11y to 'error' for a
      // pre-deploy sanity check).
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['warn', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 1.0 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
