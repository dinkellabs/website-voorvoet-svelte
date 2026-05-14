#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const versionFile = join(root, 'VERSION');
const pkgFile = join(root, 'package.json');

const version = readFileSync(versionFile, 'utf8').trim();
if (!/^\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?$/.test(version)) {
  console.error(`VERSION file content "${version}" is not a valid semver.`);
  process.exit(1);
}

const pkgRaw = readFileSync(pkgFile, 'utf8');
const pkg = JSON.parse(pkgRaw);
const check = process.argv.includes('--check');

if (pkg.version === version) {
  console.log(`package.json version (${pkg.version}) matches VERSION.`);
  process.exit(0);
}

if (check) {
  console.error(
    `package.json version (${pkg.version}) does not match VERSION (${version}). Run "pnpm version:sync".`,
  );
  process.exit(1);
}

pkg.version = version;
writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Updated package.json version to ${version}.`);
