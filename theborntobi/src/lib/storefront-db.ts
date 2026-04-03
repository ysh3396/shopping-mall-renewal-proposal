import { Client } from "pg";

type QueryValue = string | number | boolean | null;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  basePrice: number | string;
  comparePrice: number | string | null;
  badges: string | null;
  sortOrder: number | string | null;
  createdAt: Date | string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  images: StorefrontProductImage[] | null;
};

function getStorefrontConnectionString() {
  const pooled = process.env.DATABASE_URL;
  if (!pooled) {
    throw new Error("DATABASE_URL is not set");
  }
  return pooled;
}

async function withClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client({
    connectionString: getStorefrontConnectionString(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

export interface StorefrontBanner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  sortOrder: number;
}

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface StorefrontProductImage {
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice: number | null;
  badges: string | null;
  sortOrder: number;
  createdAt: Date;
  category: { id: string; name: string; slug: string } | null;
  images: StorefrontProductImage[];
}

function mapProductRow(row: ProductRow): StorefrontProduct {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    basePrice: Number(row.basePrice),
    comparePrice: row.comparePrice == null ? null : Number(row.comparePrice),
    badges: row.badges,
    sortOrder: Number(row.sortOrder ?? 0),
    createdAt: new Date(row.createdAt),
    category:
      row.categoryId && row.categoryName && row.categorySlug
        ? {
            id: row.categoryId,
            name: row.categoryName,
            slug: row.categorySlug,
          }
        : null,
    images: Array.isArray(row.images) ? row.images : [],
  };
}

export async function getHomePageData() {
  return withClient(async (client) => {
    const [bannerRes, categoryRes, productRes] = await Promise.all([
      client.query(
        `select id, title, "imageUrl", "linkUrl", "sortOrder"
         from "Banner"
         where position = 'HERO' and "isActive" = true
         order by "sortOrder" asc`
      ),
      client.query(
        `select id, name, slug, "sortOrder"
         from "Category"
         where "isActive" = true
         order by "sortOrder" asc`
      ),
      client.query(
        `select
            p.id,
            p.name,
            p.slug,
            p."basePrice",
            p."comparePrice",
            p.badges,
            p."sortOrder",
            p."createdAt",
            c.id as "categoryId",
            c.name as "categoryName",
            c.slug as "categorySlug",
            coalesce(
              json_agg(
                json_build_object(
                  'url', pi.url,
                  'alt', pi.alt,
                  'sortOrder', pi."sortOrder"
                )
                order by pi."sortOrder" asc
              ) filter (where pi.id is not null),
              '[]'::json
            ) as images
         from "Product" p
         left join "Category" c on c.id = p."categoryId"
         left join "ProductImage" pi on pi."productId" = p.id
         where p."isActive" = true and p."deletedAt" is null
         group by p.id, c.id
         order by p."sortOrder" asc`
      ),
    ]);

    return {
      banners: bannerRes.rows.map((row) => ({
        id: row.id,
        title: row.title,
        imageUrl: row.imageUrl,
        linkUrl: row.linkUrl,
        sortOrder: Number(row.sortOrder),
      })) as StorefrontBanner[],
      categories: categoryRes.rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        sortOrder: Number(row.sortOrder),
      })) as StorefrontCategory[],
      products: productRes.rows.map(mapProductRow),
    };
  });
}

export async function getProductsPageData(params: { q?: string; category?: string }) {
  return withClient(async (client) => {
    const values: QueryValue[] = [];
    const where: string[] = ['p."isActive" = true', 'p."deletedAt" is null'];

    if (params.q) {
      values.push(`%${params.q}%`);
      where.push(`p.name ilike $${values.length}`);
    }

    if (params.category) {
      values.push(params.category);
      where.push(`c.slug = $${values.length}`);
    }

    const whereClause = where.join(" and ");

    const [productRes, categoryRes] = await Promise.all([
      client.query(
        `select
            p.id,
            p.name,
            p.slug,
            p."basePrice",
            p."comparePrice",
            p.badges,
            p."sortOrder",
            p."createdAt",
            c.id as "categoryId",
            c.name as "categoryName",
            c.slug as "categorySlug",
            coalesce(
              json_agg(
                json_build_object(
                  'url', pi.url,
                  'alt', pi.alt,
                  'sortOrder', pi."sortOrder"
                )
                order by pi."sortOrder" asc
              ) filter (where pi.id is not null),
              '[]'::json
            ) as images
         from "Product" p
         left join "Category" c on c.id = p."categoryId"
         left join "ProductImage" pi on pi."productId" = p.id
         where ${whereClause}
         group by p.id, c.id
         order by p."sortOrder" asc`,
        values
      ),
      client.query(
        `select id, name, slug, "sortOrder"
         from "Category"
         where "isActive" = true
         order by "sortOrder" asc`
      ),
    ]);

    return {
      products: productRes.rows.map(mapProductRow),
      categories: categoryRes.rows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        sortOrder: Number(row.sortOrder),
      })) as StorefrontCategory[],
    };
  });
}
