# Stage 1: Builder
# node:22.23.4-slim pinned by digest for reproducible builds (Renovate/Dependabot can bump on a schedule).
# Do not go below 22.23.4: it is the first 22.x whose bundled CA store distrusts the compromised eMudhra intermediates (Oct 2026).
FROM node:22.23.4-slim@sha256:5991875dfb80938dd8a6ba3fe3e96fd04929e70792762b3319d8caadbbe229bc AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy package manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./
COPY project.inlang ./project.inlang/
COPY messages ./messages/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build the app
RUN pnpm build

# Prune devDependencies after build (--config.confirmModulesPurge=false for non-TTY)
RUN pnpm prune --prod --config.confirmModulesPurge=false

# Strip devDependencies declarations from the manifest that ships to runtime —
# avoids advertising our dev supply-chain surface in the production image.
RUN node -e "const p=require('./package.json'); delete p.devDependencies; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2));"

# Stage 2: Runtime
FROM node:22.23.4-slim@sha256:5991875dfb80938dd8a6ba3fe3e96fd04929e70792762b3319d8caadbbe229bc AS runtime

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 sveltekit

# Copy built output and production deps
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build
COPY --from=builder --chown=sveltekit:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:nodejs /app/package.json ./package.json

USER sveltekit

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "build"]
