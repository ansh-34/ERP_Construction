const fs = require('node:fs');
const { execSync } = require('node:child_process');

const checks = [];

function pass(message) {
  checks.push({ ok: true, message });
}

function fail(message) {
  checks.push({ ok: false, message });
}

function exists(path) {
  return fs.existsSync(path);
}

function hasContent(path) {
  return exists(path) && fs.readFileSync(path, 'utf8').trim().length > 0;
}

if (hasContent('prisma/schema.prisma')) {
  pass('prisma/schema.prisma exists and is not empty');
} else {
  fail('prisma/schema.prisma is missing or empty');
}

if (exists('prisma.config.ts')) {
  pass('prisma.config.ts exists');
} else {
  fail('prisma.config.ts is missing');
}

if (exists('.env') && fs.readFileSync('.env', 'utf8').includes('DATABASE_URL=')) {
  pass('.env contains DATABASE_URL');
} else {
  fail('.env is missing DATABASE_URL');
}

if (exists('src/infra/database/prisma/generated/prisma/client.ts')) {
  pass('generated Prisma client exists');
} else {
  fail('generated Prisma client is missing');
}

try {
  execSync('npx.cmd prisma validate', { stdio: 'pipe', shell: true });
  pass('prisma validate passed');
} catch {
  fail('prisma validate failed');
}

for (const check of checks) {
  console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.message}`);
}

if (checks.some((check) => !check.ok)) {
  process.exit(1);
}
