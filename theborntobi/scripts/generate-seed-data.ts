/**
 * Converts crawled all-products.json → prisma/seed-data/products.json
 *
 * Usage: npx tsx scripts/generate-seed-data.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── Types ──────────────────────────────────────────────

interface CrawledProduct {
  id: string;
  name: string;
  og_image: string;
  product_images: string[];
  prices: string[];
  has_product_data: boolean;
}

interface SeedProduct {
  originalId: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice: number | null;
  isActive: boolean;
  isAdult: boolean;
  sortOrder: number;
  images: { url: string; alt: string; sortOrder: number }[];
  detailHtml: string | null;
}

// ── Constants ──────────────────────────────────────────

const EXCLUDED_NAMES = ["개인결제창"];
const SHIPPING_FEE = 3000;

// Global template images that appear in every product — not product content
const GLOBAL_TEMPLATE_IMAGES = [
  "171ef79e934e6.png",
  "f900a78122f82.png",
];

function isGlobalTemplate(url: string): boolean {
  return GLOBAL_TEMPLATE_IMAGES.some((hash) => url.includes(hash));
}

// ── Price Parsing ──────────────────────────────────────

function parsePrices(raw: string[]): { basePrice: number; comparePrice: number | null } | null {
  const parsed: number[] = [];

  for (const p of raw) {
    // Clean: remove commas, trim, handle malformed like ",1000"
    const cleaned = p.replace(/,/g, "").replace(/\s/g, "").replace(/^(\d)/, "$1");
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num > 0 && num !== SHIPPING_FEE) {
      parsed.push(num);
    }
  }

  if (parsed.length === 0) return null;

  const min = Math.min(...parsed);
  const max = Math.max(...parsed);

  return {
    basePrice: min,
    comparePrice: max !== min ? max : null,
  };
}

// ── Image Classification ───────────────────────────────

function classifyImages(
  ogImage: string,
  productImages: string[],
  productName: string
): { galleryImages: SeedProduct["images"]; detailHtml: string | null } {
  const galleryUrls: string[] = [];
  const detailUrls: string[] = [];

  // og_image is always the primary gallery image
  if (ogImage) {
    galleryUrls.push(ogImage);
  }

  for (const url of productImages) {
    if (isGlobalTemplate(url)) continue;

    // Skip duplicates of og_image
    if (url === ogImage) continue;

    if (url.includes("/thumbnail/")) {
      galleryUrls.push(url);
    } else if (url.includes("/upload/")) {
      detailUrls.push(url);
    } else {
      // Unknown pattern → treat as gallery
      galleryUrls.push(url);
    }
  }

  const galleryImages = galleryUrls.map((url, i) => ({
    url,
    alt: i === 0 ? `${productName} 메인` : `${productName} ${i + 1}`,
    sortOrder: i,
  }));

  let detailHtml: string | null = null;
  if (detailUrls.length > 0) {
    const imgTags = detailUrls
      .map(
        (url) =>
          `<div class="mb-4"><img src="${url}" alt="${productName}" class="w-full" loading="lazy" /></div>`
      )
      .join("\n");
    detailHtml = `<div class="space-y-2">\n${imgTags}\n</div>`;
  }

  return { galleryImages, detailHtml };
}

// ── HTML Entity Decoding ───────────────────────────────

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

// ── Main ───────────────────────────────────────────────

function main() {
  const crawledPath = join(
    __dirname,
    "../../.firecrawl/theborntobi/all-products.json"
  );
  const outputDir = join(__dirname, "../prisma/seed-data");
  const outputPath = join(outputDir, "products.json");

  console.log("Reading crawled data from:", crawledPath);
  const rawData: CrawledProduct[] = JSON.parse(
    readFileSync(crawledPath, "utf-8")
  );
  console.log(`Total crawled products: ${rawData.length}`);

  mkdirSync(outputDir, { recursive: true });

  const products: SeedProduct[] = [];
  let excluded = 0;
  let noPriceCount = 0;

  for (let i = 0; i < rawData.length; i++) {
    const raw = rawData[i];
    const name = decodeHtmlEntities(raw.name.trim());

    // Exclude non-product entries
    if (EXCLUDED_NAMES.some((ex) => name.includes(ex))) {
      console.log(`  SKIP (excluded name): ${name} (id=${raw.id})`);
      excluded++;
      continue;
    }

    // Parse prices
    const priceResult = parsePrices(raw.prices);
    if (!priceResult) {
      console.log(`  SKIP (no valid price): ${name} (id=${raw.id})`);
      noPriceCount++;
      continue;
    }

    // Classify images
    const { galleryImages, detailHtml } = classifyImages(
      raw.og_image,
      raw.product_images,
      name
    );

    const product: SeedProduct = {
      originalId: raw.id,
      name,
      slug: `product-${raw.id}`,
      basePrice: priceResult.basePrice,
      comparePrice: priceResult.comparePrice,
      isActive: priceResult.basePrice > 0,
      isAdult: true,
      sortOrder: i,
      images: galleryImages,
      detailHtml,
    };

    products.push(product);
  }

  writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf-8");

  console.log(`\n── Results ──`);
  console.log(`  Valid products: ${products.length}`);
  console.log(`  Excluded (name): ${excluded}`);
  console.log(`  Excluded (no price): ${noPriceCount}`);
  console.log(`  Total images: ${products.reduce((s, p) => s + p.images.length, 0)}`);
  console.log(`  Products with detailHtml: ${products.filter((p) => p.detailHtml).length}`);
  console.log(`\nOutput: ${outputPath}`);
}

main();
