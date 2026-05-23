/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      // lhci spawns `vite preview` and waits for it before hitting the URLs
      // below. Without this, Chrome lands on the "site can't be reached"
      // interstitial and lhci reports "Chrome prevented page load".
      startServerCommand: 'pnpm preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      url: [
        // NL
        'http://localhost:4173/nl',
        'http://localhost:4173/nl/informatie',
        'http://localhost:4173/nl/vergoedingen',
        'http://localhost:4173/nl/contact',
        'http://localhost:4173/nl/zolen-bestellen',
        'http://localhost:4173/nl/blog',
        'http://localhost:4173/nl/blog/podotherapeut-of-podoloog',
        'http://localhost:4173/nl/credits',
        // DE
        'http://localhost:4173/de',
        'http://localhost:4173/de/informationen',
        'http://localhost:4173/de/erstattungen',
        'http://localhost:4173/de/kontakt',
        'http://localhost:4173/de/einlagen-bestellen',
        'http://localhost:4173/de/blog',
        'http://localhost:4173/de/blog/podotherapeut-oder-podologe',
        'http://localhost:4173/de/credits',
        // EN
        'http://localhost:4173/en',
        'http://localhost:4173/en/information',
        'http://localhost:4173/en/reimbursements',
        'http://localhost:4173/en/contact',
        'http://localhost:4173/en/order-insoles',
        'http://localhost:4173/en/blog',
        'http://localhost:4173/en/blog/podiatrist-or-podologist',
        'http://localhost:4173/en/credits',
      ],
      numberOfRuns: 1,
      settings: {
        preset: 'desktop',
        throttlingMethod: 'simulate',
        budgetPath: './lighthouse/budget.json',
        skipAudits: [
          // Skip these because they require a real prod domain
          'uses-http2',
          'redirects-http',
          'canonical',
        ],
      },
    },
    assert: {
      // Accessibility and SEO are deterministic enough to fail CI on regressions.
      // Performance + best-practices are kept as warnings until GitHub-runner
      // variance is fully characterised (the local-vs-CI throttling delta has
      // been ±5 points historically).
      assertions: {
        'categories:performance': ['warn', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 1.0 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'lighthouse-reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
  },
};
