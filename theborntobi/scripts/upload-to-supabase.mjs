#!/usr/bin/env node
/**
 * Supabase Storage 일괄 업로드 + 소스 파일 URL 교체
 *
 * 1. public/images/{products,banners,details}/ 의 모든 이미지를 Supabase Storage에 업로드
 * 2. 소스 파일의 로컬 경로를 Supabase 공개 URL로 교체
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env
const envPath = path.join(ROOT, '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'images';
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;

// Source files
const FILES = {
  productsJson: path.join(ROOT, 'prisma/seed-data/products.json'),
  seedTs: path.join(ROOT, 'prisma/seed.ts'),
  pageTsx: path.join(ROOT, 'src/app/(storefront)/page.tsx'),
};

// Image directories
const IMG_DIRS = [
  { dir: path.join(ROOT, 'public/images/products'), prefix: 'products' },
  { dir: path.join(ROOT, 'public/images/banners'), prefix: 'banners' },
  { dir: path.join(ROOT, 'public/images/details'), prefix: 'details' },
];

const MIME_MAP = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

async function uploadFile(localPath, storagePath) {
  const ext = path.extname(localPath).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  const fileData = fs.readFileSync(localPath);
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': mime,
      'x-upsert': 'true',
    },
    body: fileData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function uploadBatch(items, concurrency = 10) {
  const results = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const promises = batch.map(async ({ localPath, storagePath }) => {
      try {
        await uploadFile(localPath, storagePath);
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${storagePath}: ${err.message}`);
      }
    });
    await Promise.all(promises);

    const done = Math.min(i + concurrency, items.length);
    process.stdout.write(`\r  진행: ${done}/${items.length}`);
  }
  console.log();
  return results;
}

async function main() {
  console.log('=== Supabase Storage 업로드 스크립트 ===\n');
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Bucket: ${BUCKET}\n`);

  // 1. Collect all images
  const uploadList = [];
  const pathMapping = new Map(); // local path -> supabase public URL

  for (const { dir, prefix } of IMG_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
    for (const file of files) {
      const localPath = path.join(dir, file);
      const storagePath = `${prefix}/${file}`;
      const publicUrl = `${PUBLIC_BASE}/${storagePath}`;
      const localRef = `/images/${prefix}/${file}`;

      uploadList.push({ localPath, storagePath });
      pathMapping.set(localRef, publicUrl);
    }
  }

  console.log(`업로드 대상: ${uploadList.length}개 이미지\n`);

  // 2. Upload all
  console.log('업로드 시작...');
  const results = await uploadBatch(uploadList, 15);

  console.log(`  성공: ${results.success}, 실패: ${results.failed}`);
  if (results.errors.length > 0) {
    console.log('  실패 목록:');
    results.errors.slice(0, 10).forEach(e => console.log(`    - ${e}`));
  }

  if (results.failed > 0) {
    console.log('\n실패한 파일이 있으므로 URL 교체를 건너뜁니다.');
    process.exit(1);
  }

  // 3. Replace local paths with Supabase URLs in source files
  console.log('\n소스 파일 URL 교체 중...');

  // Sort by length descending to avoid partial replacements
  const sortedEntries = [...pathMapping.entries()].sort((a, b) => b[0].length - a[0].length);

  function replaceUrls(content) {
    let result = content;
    for (const [localPath, supabaseUrl] of sortedEntries) {
      result = result.split(localPath).join(supabaseUrl);
    }
    return result;
  }

  for (const [key, filePath] of Object.entries(FILES)) {
    const original = fs.readFileSync(filePath, 'utf-8');
    const replaced = replaceUrls(original);
    const count = (original.match(/\/images\/(products|banners|details)\//g) || []).length -
                  (replaced.match(/\/images\/(products|banners|details)\//g) || []).length;
    fs.writeFileSync(filePath, replaced, 'utf-8');
    console.log(`  ${path.basename(filePath)}: ${count}개 교체`);
  }

  // 4. Verify
  const allContent = Object.values(FILES).map(f => fs.readFileSync(f, 'utf-8')).join('');
  const remaining = (allContent.match(/\/images\/(products|banners|details)\//g) || []).length;

  if (remaining > 0) {
    console.log(`\n⚠ 미교체 로컬 경로 ${remaining}개 남음`);
  } else {
    console.log('\n✓ 모든 로컬 경로 → Supabase URL 교체 완료!');
  }

  console.log(`\n=== 완료 ===`);
  console.log(`Public URL 패턴: ${PUBLIC_BASE}/{products|banners|details}/{filename}`);
}

main().catch(console.error);
