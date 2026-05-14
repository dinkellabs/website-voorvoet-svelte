# Contributing

## Requirements

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 22 (LTS) | via `nvm` or `fnm`; `.nvmrc` is present |
| pnpm | 10 | `corepack enable && corepack prepare pnpm@latest --activate` |
| pre-commit | latest | `pip install pre-commit` or `brew install pre-commit` |

## Setup

```fish
# 1. Clone the repo
git clone https://github.com/your-org/website-voorvoet-svelte.git
cd website-voorvoet-svelte

# 2. Use the correct Node version
nvm use    # or: fnm use

# 3. Install dependencies (also runs `pnpm paraglide:compile`)
pnpm install

# 4. Install git hooks
pre-commit install

# 5. Copy env and fill in values
cp .env.example .env
# Edit .env — at minimum set SMTP_* and Turnstile keys.
# For local dev the defaults (Turnstile disabled, dummy SMTP) are fine.

# 6. Start the dev server
pnpm dev
```

## Common Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build locally on :4173 |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:coverage` | Unit tests with V8 coverage report |
| `pnpm e2e` | Playwright E2E tests (requires `pnpm preview` running) |
| `pnpm lint` | ESLint (zero warnings policy) |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check (used in CI) |
| `pnpm check` | svelte-check TypeScript check |
| `pnpm paraglide:compile` | Regenerate i18n types from `messages/` |
| `pnpm version:sync` | Mirror `VERSION` into `package.json` |
| `pnpm version:check` | CI-side check that VERSION and package.json agree |
| `pnpm lighthouse` | Lighthouse CI against the local preview build |

## Release / Versioning

`VERSION` in the repo root is the single source of truth for the app version
(see `README.md` → Versioning). When bumping:

1. Edit `VERSION`. Use a [SemVer 2.0.0](https://semver.org/) string —
   `MAJOR.MINOR.PATCH`, optionally with a `-rc.N` / `-beta.N` pre-release suffix.
   **Do not use `+metadata`** — although `scripts/sync-version.mjs` regex
   accepts it, no part of the toolchain consumes it and it muddies tag names.
2. Run `pnpm version:sync` to update `package.json`.
3. Commit both files in the same commit.
4. Tag the release: `git tag v$(cat VERSION) && git push --tags`.

CI runs `pnpm version:check` and fails on drift.

## Pre-commit Hooks

Hooks are configured in `.pre-commit-config.yaml`:

| Hook | What it checks |
|------|---------------|
| `trailing-whitespace` | No trailing whitespace |
| `end-of-file-fixer` | Files end with a newline |
| `check-yaml` | YAML is valid |
| `check-json` | JSON is valid (except `tsconfig.json` and message files) |
| `mixed-line-ending` | Line endings are LF |
| `eslint` | ESLint on `.js`, `.ts`, `.svelte` |
| `prettier-check` | Prettier format on JS/TS/Svelte/CSS/JSON/HTML |
| `svelte-check` | TypeScript/Svelte type check |
| `vitest` | Unit tests must pass (bail on first failure) |

To run all hooks manually without committing:

```fish
pre-commit run --all-files
```

## Branching

This project uses a phase-based branch naming convention:

```
phase-{N}/{short-description}
```

Examples:
- `phase-1/bootstrap`
- `phase-2/components`
- `phase-3/content`
- `phase-4/performance-security`

Feature work that does not belong to a phase:

```
fix/{short-description}
chore/{short-description}
docs/{short-description}
```

Always branch off the latest phase branch, not `main` (unless `main` has been merged up).

## Pull Request Template

When opening a PR, include:

```markdown
## Summary
- What changed and why

## Test plan
- [ ] Unit tests pass (`pnpm test`)
- [ ] TypeScript clean (`pnpm check`)
- [ ] Lint clean (`pnpm lint`)
- [ ] Manual test: <describe what you tested manually>

## Checklist
- [ ] No secrets or credentials committed
- [ ] `.env.example` updated if new env vars added
- [ ] Docs updated if behaviour changed
```

## Adding New Environment Variables

1. Add to `.env.example` with a safe default or placeholder.
2. Document in `docs/DEPLOY.md` under the env-var table.
3. Use `$env/dynamic/private` for server-only secrets and `$env/dynamic/public` for client-visible values.
4. Never import `$env/dynamic/private` from a file that is also imported in client-side code.

## Code Style

- TypeScript strict mode — no `any`, no `@ts-ignore` without a comment explaining why.
- No inline comments unless the "why" is genuinely non-obvious.
- Server modules use pino for logging — no `console.log`.
- Forms use sveltekit-superforms + zod for validation.
- Components use Svelte 5 runes (`$state`, `$derived`, `$effect`).
