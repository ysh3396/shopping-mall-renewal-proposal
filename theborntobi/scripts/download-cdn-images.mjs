#!/usr/bin/env node
/**
 * CDN 이미지 다운로드 및 로컬 경로 교체 스크립트
 *
 * 1. products.json, seed.ts, page.tsx에서 cdn.imweb.me URL 추출
 * 2. public/images/products/ 및 public/images/banners/로 다운로드
 * 3. 소스 파일의 URL을 로컬 경로로 교체
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Directories
const PRODUCTS_IMG_DIR = path.join(ROOT, 'public/images/products');
const BANNERS_IMG_DIR = path.join(ROOT, 'public/images/banners');
const DETAILS_IMG_DIR = path.join(ROOT, 'public/images/details');

// Source files to process
const FILES = {
  productsJson: path.join(ROOT, 'prisma/seed-data/products.json'),
  seedTs: path.join(ROOT, 'prisma/seed.ts'),
  pageTsx: path.join(ROOT, 'src/app/(storefront)/page.tsx'),
};

// CDN URL pattern
const CDN_REGEX = /https:\/\/cdn[^"'\s,\\]+/g;

function extractFilename(url) {
  // Remove query params, get the last path segment
  const clean = url.split('?')[0];
  return clean.split('/').pop();
}

function categorizeUrl(url) {
  if (url.includes('/thumbnail/')) {
    // Check if it's from seed.ts banners (specific known banner URLs)
    return 'thumbnail';
  }
  if (url.includes('/upload/')) {
    return 'upload';
  }
  return 'other';
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      resolve('cached');
      return;
    }

    const cleanUrl = url.split('?')[0]; // Download original, no resize params

    const request = https.get(cleanUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${cleanUrl}`));
        return;
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => { stream.close(); resolve('downloaded'); });
      stream.on('error', reject);
    });
    request.on('error', reject);
    request.setTimeout(15000, () => { request.destroy(); reject(new Error(`Timeout: ${cleanUrl}`)); });
  });
}

async function downloadBatch(items, concurrency = 10) {
  const results = { success: 0, cached: 0, failed: 0, errors: [] };

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const promises = batch.map(async ({ url, dest, label }) => {
      try {
        const status = await download(url, dest);
        if (status === 'cached') results.cached++;
        else results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${label}: ${err.message}`);
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
  console.log('=== CDN 이미지 로컬화 스크립트 ===\n');

  // 1. Create directories
  for (const dir of [PRODUCTS_IMG_DIR, BANNERS_IMG_DIR, DETAILS_IMG_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 2. Read source files
  const productsJson = fs.readFileSync(FILES.productsJson, 'utf-8');
  const seedTs = fs.readFileSync(FILES.seedTs, 'utf-8');
  const pageTsx = fs.readFileSync(FILES.pageTsx, 'utf-8');

  // 3. Extract all unique URLs and build mapping
  const allContent = productsJson + seedTs + pageTsx;
  const allUrls = [...new Set(allContent.match(CDN_REGEX) || [])];

  console.log(`총 ${allUrls.length}개 고유 CDN URL 발견\n`);

  // 4. Identify banner URLs (from seed.ts)
  const bannerUrls = new Set([...(seedTs.match(CDN_REGEX) || [])]);

  // 5. Identify detail HTML URLs (from detailHtml fields)
  const detailUrlSet = new Set();
  const products = JSON.parse(productsJson);
  for (const p of products) {
    if (p.detailHtml) {
      const detailUrls = p.detailHtml.match(CDN_REGEX) || [];
      detailUrls.forEach(u => detailUrlSet.add(u));
    }
  }

  // 6. Build download list with URL -> local path mapping
  const urlMap = new Map(); // cdn url -> local path (for replacement)
  const downloadList = [];

  for (const url of allUrls) {
    const filename = extractFilename(url);
    let localDir, localPrefix;

    if (bannerUrls.has(url) && !detailUrlSet.has(url)) {
      localDir = BANNERS_IMG_DIR;
      localPrefix = '/images/banners';
    } else if (detailUrlSet.has(url)) {
      localDir = DETAILS_IMG_DIR;
      localPrefix = '/images/details';
    } else {
      localDir = PRODUCTS_IMG_DIR;
      localPrefix = '/images/products';
    }

    const dest = path.join(localDir, filename);
    const localPath = `${localPrefix}/${filename}`;

    urlMap.set(url, localPath);
    downloadList.push({ url, dest, label: filename });
  }

  // 7. Download all images
  console.log('이미지 다운로드 시작...');
  const results = await downloadBatch(downloadList, 15);

  console.log(`  성공: ${results.success}, 캐시: ${results.cached}, 실패: ${results.failed}`);
  if (results.errors.length > 0) {
    console.log('  실패 목록:');
    results.errors.forEach(e => console.log(`    - ${e}`));
  }

  // 8. Replace URLs in source files
  console.log('\n소스 파일 URL 교체 중...');

  // Sort URLs by length descending to avoid partial replacements
  const sortedEntries = [...urlMap.entries()].sort((a, b) => b[0].length - a[0].length);

  function replaceUrls(content) {
    let result = content;
    for (const [cdnUrl, localPath] of sortedEntries) {
      result = result.split(cdnUrl).join(localPath);
    }
    return result;
  }

  const newProductsJson = replaceUrls(productsJson);
  const newSeedTs = replaceUrls(seedTs);
  const newPageTsx = replaceUrls(pageTsx);

  // Count replacements
  const productsReplaced = (productsJson.match(CDN_REGEX) || []).length - (newProductsJson.match(CDN_REGEX) || []).length;
  const seedReplaced = (seedTs.match(CDN_REGEX) || []).length - (newSeedTs.match(CDN_REGEX) || []).length;
  const pageReplaced = (pageTsx.match(CDN_REGEX) || []).length - (newPageTsx.match(CDN_REGEX) || []).length;

  console.log(`  products.json: ${productsReplaced}개 교체`);
  console.log(`  seed.ts: ${seedReplaced}개 교체`);
  console.log(`  page.tsx: ${pageReplaced}개 교체`);

  // Verify no CDN URLs remain
  const remaining = [
    ...(newProductsJson.match(CDN_REGEX) || []),
    ...(newSeedTs.match(CDN_REGEX) || []),
    ...(newPageTsx.match(CDN_REGEX) || []),
  ];

  if (remaining.length > 0) {
    console.log(`\n⚠ 미교체 URL ${remaining.length}개:`);
    [...new Set(remaining)].slice(0, 5).forEach(u => console.log(`    ${u}`));
  } else {
    console.log('\n✓ 모든 CDN URL 교체 완료!');
  }

  // 9. Write files
  fs.writeFileSync(FILES.productsJson, newProductsJson, 'utf-8');
  fs.writeFileSync(FILES.seedTs, newSeedTs, 'utf-8');
  fs.writeFileSync(FILES.pageTsx, newPageTsx, 'utf-8');

  // 10. Summary
  const totalSize = downloadList.reduce((sum, { dest }) => {
    try { return sum + fs.statSync(dest).size; } catch { return sum; }
  }, 0);

  console.log(`\n=== 완료 ===`);
  console.log(`다운로드: ${results.success + results.cached}개 이미지`);
  console.log(`총 용량: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`교체: ${productsReplaced + seedReplaced + pageReplaced}개 URL`);
}

main().catch(console.error);
