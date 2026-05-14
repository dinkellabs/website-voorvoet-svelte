/** @type {import('@lhci/cli').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
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
      // Soft-launch: warn first, promote to `error` once CI runner variance is
      // characterised. Local dev machines hit these comfortably; GitHub-hosted
      // runners are slower and noisier — switching to `error` now would flap.
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
