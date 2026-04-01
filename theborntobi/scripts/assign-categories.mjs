#!/usr/bin/env node
/**
 * 132개 상품 카테고리 자동 배정 스크립트
 * 상품명 키워드 매칭으로 카테고리 할당
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env
const envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

async function main() {
  console.log('=== 카테고리 자동 배정 스크립트 ===\n');

  // 1. Get categories
  const { rows: categories } = await pool.query(
    'SELECT id, name, slug FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder"'
  );
  console.log(`카테고리 ${categories.length}개:`);
  categories.forEach(c => console.log(`  ${c.slug} — ${c.name}`));

  // Build slug -> id map
  const catMap = {};
  for (const c of categories) {
    catMap[c.slug] = c.id;
  }

  // 2. Get unassigned products
  const { rows: products } = await pool.query(
    'SELECT id, name FROM "Product" WHERE "categoryId" IS NULL AND "deletedAt" IS NULL'
  );
  console.log(`\n미배정 상품: ${products.length}개\n`);

  if (products.length === 0) {
    console.log('모든 상품이 이미 배정되어 있습니다.');
    await pool.end();
    return;
  }

  // 3. Keyword matching rules (order matters — first match wins)
  // Rules based on the original imweb site category structure
  const rules = [
    // 기기&악세사리
    { keywords: ['기기', '디바이스', '배터리', '말론', '브이메이트 프로', '파워 에디션'], slug: 'devices' },
    // 팟/카트리지/코일
    { keywords: ['코일', '카트리지', '팟 ', '개선팟', '클리어 팟', '하부코일'], slug: 'pods' },
    // 일회용 전자담배
    { keywords: ['일회용', 'puff', '퍼프', '네스티바', '블랙유니콘바', '엘프바 ', '엘프바쥬스', '모스모', '긱바', '스타베어', '타이슨', '테슬라바', '톡스바', '픽스고', '오르카 에어', '언플러그', '조인원', '포포박스', '아이스킹', '아이스 킷'], slug: 'disposable' },
    // 앵그리
    { keywords: ['앵그리'], slug: 'angry' },
    // 무니코틴
    { keywords: ['무니코틴', '니코레스'], slug: 'nicotine-free' },
    // 생활용품
    { keywords: ['클리닝', '생활용품', '깨요', '비타커피', '에너지충전 음료'], slug: 'lifestyle' },
    // 모드 액상 / 폐호흡
    { keywords: ['폐호흡', '모드 액상', '■모드■', 'nic 3mg', '3mg/', '60ml', '120ml'], slug: 'mod-liquid' },
    // 고농도
    { keywords: ['고농도', '2%'], slug: 'high-nic' },
    // 기성 액상 / 입호흡 (default liquid)
    { keywords: ['입호흡', '액상', '기성', 'nic 9.8mg', 'nic 9.5mg', '9.8mg', '30ml'], slug: 'ready-liquid' },
  ];

  // 4. Assign categories
  const assignments = [];
  const unmatched = [];

  for (const product of products) {
    const name = product.name.toLowerCase();
    let assigned = false;

    for (const rule of rules) {
      for (const keyword of rule.keywords) {
        if (name.includes(keyword.toLowerCase())) {
          const catId = catMap[rule.slug];
          if (catId) {
            assignments.push({ productId: product.id, productName: product.name, categorySlug: rule.slug, categoryId: catId });
            assigned = true;
            break;
          }
        }
      }
      if (assigned) break;
    }

    if (!assigned) {
      unmatched.push(product);
    }
  }

  console.log('배정 결과:');
  const byCat = {};
  for (const a of assignments) {
    byCat[a.categorySlug] = (byCat[a.categorySlug] || 0) + 1;
  }
  Object.entries(byCat).sort((a, b) => b[1] - a[1]).forEach(([slug, count]) => {
    console.log(`  ${slug}: ${count}개`);
  });

  if (unmatched.length > 0) {
    console.log(`\n미매칭: ${unmatched.length}개`);
    unmatched.forEach(p => console.log(`  - ${p.name}`));
    // Assign unmatched to "기성 액상" as default
    console.log('\n미매칭 상품을 "기성 액상"(ready-liquid)에 배정합니다.');
    for (const p of unmatched) {
      assignments.push({
        productId: p.id,
        productName: p.name,
        categorySlug: 'ready-liquid',
        categoryId: catMap['ready-liquid'],
      });
    }
  }

  // 5. Execute updates
  console.log(`\n총 ${assignments.length}개 상품 업데이트 중...`);

  let updated = 0;
  for (const a of assignments) {
    await pool.query(
      'UPDATE "Product" SET "categoryId" = $1 WHERE id = $2',
      [a.categoryId, a.productId]
    );
    updated++;
  }

  console.log(`✓ ${updated}개 상품 카테고리 배정 완료!`);

  // 6. Verify
  const { rows: [{ count: remaining }] } = await pool.query(
    'SELECT COUNT(*) as count FROM "Product" WHERE "categoryId" IS NULL AND "deletedAt" IS NULL'
  );
  console.log(`\n남은 미배정: ${remaining}개`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
