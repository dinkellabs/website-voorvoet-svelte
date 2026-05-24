.DEFAULT_GOAL := help

.PHONY: help install run dev build preview paraglide \
	lint format format-check check \
	test test-coverage e2e lighthouse \
	version version-sync version-check bump release \
	docker-build up down logs

help:  ## Show this help.
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} \
		/^[a-zA-Z0-9_-]+:.*##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 } \
		/^## .*/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 4) }' $(MAKEFILE_LIST)

## Dev server

install:  ## Install dependencies (also compiles Paraglide i18n on first run)
	pnpm install

run:  ## Start the SvelteKit dev server with HMR (http://localhost:5173)
	pnpm dev

dev: run  ## Alias for `run`

preview:  ## Build then serve the production bundle (http://localhost:4173)
	pnpm build && pnpm preview

paraglide:  ## Regenerate Paraglide i18n types from messages/
	pnpm paraglide:compile

## Build

build:  ## Production build
	pnpm build

## Quality

lint:  ## ESLint — zero warnings allowed
	pnpm lint

format:  ## Prettier write
	pnpm format

format-check:  ## Prettier check (no writes)
	pnpm format:check

check:  ## svelte-check TypeScript / Svelte diagnostics
	pnpm check

## Tests

test:  ## Run Vitest unit/integration suite
	pnpm test

test-coverage:  ## Run Vitest with V8 coverage
	pnpm test:coverage

e2e:  ## Run Playwright end-to-end tests
	pnpm e2e

lighthouse:  ## Audit live voorvoet.nl with Lighthouse (writes reports to lighthouse-reports/)
	pnpm lighthouse

## Versioning

version:  ## Print the current canonical version
	@cat VERSION

version-sync:  ## Sync package.json version from the VERSION file
	pnpm version:sync

version-check:  ## Fail if package.json drifts from VERSION
	pnpm version:check

bump:  ## Bump the canonical version (usage: make bump VERSION=0.2.0)
	@if [ -z "$(VERSION)" ]; then echo "Usage: make bump VERSION=X.Y.Z" >&2; exit 2; fi
	@echo "$(VERSION)" > VERSION
	pnpm version:sync

release:  ## Bump version, commit, tag (usage: make release VERSION=0.2.0)
	@if [ -z "$(VERSION)" ]; then echo "Usage: make release VERSION=X.Y.Z" >&2; exit 2; fi
	@if ! git diff --quiet || ! git diff --cached --quiet; then \
		echo "Working tree is dirty; commit or stash first." >&2; exit 1; \
	fi
	@echo "$(VERSION)" > VERSION
	pnpm version:sync
	git add VERSION package.json
	git commit -m "Release v$(VERSION)"
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	@echo
	@echo "Tagged v$(VERSION). Push with: git push --follow-tags"

## Docker

docker-build:  ## Build the production image (tags :VERSION and :latest)
	@v=$$(cat VERSION); \
	echo "Building voorvoet:$$v"; \
	docker build -t voorvoet:$$v -t voorvoet:latest .

up:  ## Start the app container in the background (expects an upstream reverse proxy)
	docker compose up -d

down:  ## Stop the docker-compose stack
	docker compose down

logs:  ## Tail docker-compose logs
	docker compose logs -f --tail=100
