import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // ─────────────────────────────────────────────
  // Cleanup (idempotent)
  // ─────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.variantOptionValue.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.exchangeRequest.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.qnA.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.productRequest.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productOptionValue.deleteMany();
  await prisma.productOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.customerGrade.deleteMany();
  await prisma.siteConfig.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.popup.deleteMany();
  await prisma.pageContent.deleteMany();
  await prisma.redirectRule.deleteMany();

  console.log('Cleaned up existing data.');

  // ─────────────────────────────────────────────
  // 1. SiteConfig
  // ─────────────────────────────────────────────
  await prisma.siteConfig.create({
    data: {
      siteName: '더본투비',
      domain: 'theborntobi.com',
      businessName: '주식회사 더본투비',
      businessNumber: '123-45-67890',
      ceoName: '왕한빈',
      address: '경기도 양평군',
      phone: '010-0000-0000',
      email: 'admin@theborntobi.com',
      bankName: '국민은행',
      bankAccount: '123456-78-901234',
      bankHolder: '주식회사 더본투비',
      freeShippingThreshold: 50000,
      defaultShippingFee: 2500,
      returnShippingFee: 3000,
      restrictionMode: 'NONE',
    },
  });
  console.log('SiteConfig created.');

  // ─────────────────────────────────────────────
  // 2. CustomerGrades
  // ─────────────────────────────────────────────
  const gradeNormal = await prisma.customerGrade.create({
    data: { name: '일반', minOrderAmount: 0, discountRate: 0 },
  });
  const gradeSilver = await prisma.customerGrade.create({
    data: { name: 'Silver', minOrderAmount: 100000, discountRate: 3 },
  });
  const gradeGold = await prisma.customerGrade.create({
    data: { name: 'Gold', minOrderAmount: 300000, discountRate: 5 },
  });
  console.log('CustomerGrades created.');

  // ─────────────────────────────────────────────
  // 3. Roles + Permissions
  // ─────────────────────────────────────────────
  const resources = ['products', 'orders', 'customers', 'shipping', 'promotions', 'settings', 'users', 'reports'];
  const actions = ['create', 'read', 'update', 'delete'];

  const permissions: Record<string, string> = {};
  for (const resource of resources) {
    for (const action of actions) {
      const perm = await prisma.permission.create({
        data: { resource, action },
      });
      permissions[`${resource}.${action}`] = perm.id;
    }
  }

  const roleSuperAdmin = await prisma.role.create({ data: { name: 'super_admin' } });
  const roleManager = await prisma.role.create({ data: { name: 'manager' } });
  const roleStaff = await prisma.role.create({ data: { name: 'staff' } });

  // super_admin: all permissions
  const allPermissionIds = Object.values(permissions);
  for (const permId of allPermissionIds) {
    await prisma.rolePermission.create({
      data: { roleId: roleSuperAdmin.id, permissionId: permId },
    });
  }

  // manager: all except settings.delete, users.create, users.delete
  const managerExcluded = new Set(['settings.delete', 'users.create', 'users.delete']);
  for (const [key, permId] of Object.entries(permissions)) {
    if (!managerExcluded.has(key)) {
      await prisma.rolePermission.create({
        data: { roleId: roleManager.id, permissionId: permId },
      });
    }
  }

  // staff: only read permissions
  for (const resource of resources) {
    await prisma.rolePermission.create({
      data: { roleId: roleStaff.id, permissionId: permissions[`${resource}.read`] },
    });
  }

  console.log('Roles and permissions created.');

  // ─────────────────────────────────────────────
  // 4. AdminUser
  // ─────────────────────────────────────────────
  await prisma.adminUser.create({
    data: {
      email: 'admin@theborntobi.com',
      name: '관리자',
      passwordHash: '$2a$10$rQEY2Wl5gkz5LD.GjhRF3OQz8NyjPr6BmH8M.8qx0sE5y3D3K3zKi',
      roleId: roleSuperAdmin.id,
    },
  });
  console.log('AdminUser created.');

  // ─────────────────────────────────────────────
  // 5. Categories
  // ─────────────────────────────────────────────
  const categoryData = [
    { name: 'HOME', slug: 'home', sortOrder: 0, isRestricted: false },
    { name: '기기&악세사리', slug: 'devices', sortOrder: 1, isRestricted: true },
    { name: '팟/카트리지/코일', slug: 'pods', sortOrder: 2, isRestricted: true },
    { name: '무니코틴', slug: 'nicotine-free', sortOrder: 3, isRestricted: true },
    { name: '생활용품', slug: 'lifestyle', sortOrder: 4, isRestricted: false },
    { name: '❤️앵그리❤️', slug: 'angry', sortOrder: 5, isRestricted: true },
    { name: '기성 액상', slug: 'ready-liquid', sortOrder: 6, isRestricted: true },
    { name: '모드 액상', slug: 'mod-liquid', sortOrder: 7, isRestricted: true },
    { name: 'NEW 신상', slug: 'new-arrivals', sortOrder: 8, isRestricted: true },
    { name: '입호흡', slug: 'mtl', sortOrder: 9, isRestricted: true },
    { name: '폐호흡', slug: 'dtl', sortOrder: 10, isRestricted: true },
    { name: '고농도', slug: 'high-nic', sortOrder: 11, isRestricted: true },
    { name: '일회용 전자담배', slug: 'disposable', sortOrder: 12, isRestricted: true },
    { name: '떨이몰', slug: 'clearance', sortOrder: 13, isRestricted: true },
    { name: 'PREMIUM', slug: 'premium', sortOrder: 14, isRestricted: true },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created.id;
  }
  console.log('Categories created.');

  // ─────────────────────────────────────────────
  // 6. Products with variants
  // ─────────────────────────────────────────────

  // ─────────────────────────────────────────────
  // 6a. Products from crawled data (JSON import)
  // ─────────────────────────────────────────────
  interface SeedImage { url: string; alt: string; sortOrder: number }
  interface SeedProduct {
    originalId: string;
    name: string;
    slug: string;
    basePrice: number;
    comparePrice: number | null;
    isActive: boolean;
    isAdult: boolean;
    sortOrder: number;
    images: SeedImage[];
    detailHtml: string | null;
  }

  const productsJsonPath = join(__dirname, 'seed-data', 'products.json');
  const seedProducts: SeedProduct[] = JSON.parse(readFileSync(productsJsonPath, 'utf-8'));
  console.log(`Importing ${seedProducts.length} products from JSON...`);

  const createdProductIds: string[] = [];

  for (const sp of seedProducts) {
    const product = await prisma.product.create({
      data: {
        name: sp.name,
        slug: sp.slug,
        detailHtml: sp.detailHtml,
        basePrice: sp.basePrice,
        comparePrice: sp.comparePrice,
        isActive: sp.isActive,
        isAdult: sp.isAdult,
        sortOrder: sp.sortOrder,
      },
    });
    createdProductIds.push(product.id);

    if (sp.images.length > 0) {
      await prisma.productImage.createMany({
        data: sp.images.map((img) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })),
      });
    }

    // Create a single default variant for each product
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: `PROD-${sp.originalId}`,
        price: sp.basePrice,
        stock: 100,
        isActive: sp.isActive,
      },
    });
  }

  console.log(`${seedProducts.length} products imported from JSON.`);

  // ─────────────────────────────────────────────
  // 7. Sample Customers
  // ─────────────────────────────────────────────
  const now = new Date();

  const customer1 = await prisma.customer.create({
    data: {
      email: 'test@naver.com',
      name: '김철수',
      provider: 'naver',
      providerId: 'naver_user_001',
      ageVerified: true,
      ageVerifiedAt: now,
      ageVerifyMethod: 'PASS',
      gradeId: gradeSilver.id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      email: 'test2@naver.com',
      name: '이영희',
      provider: 'kakao',
      providerId: 'kakao_user_002',
      ageVerified: true,
      ageVerifiedAt: now,
      ageVerifyMethod: 'PASS',
      gradeId: gradeNormal.id,
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      email: 'test3@naver.com',
      name: '박지민',
      provider: 'naver',
      providerId: 'naver_user_003',
      ageVerified: true,
      ageVerifiedAt: now,
      ageVerifyMethod: 'PASS',
      gradeId: gradeGold.id,
    },
  });

  console.log('Customers created.');

  // ─────────────────────────────────────────────
  // 8. Sample Orders
  // ─────────────────────────────────────────────

  // Fetch variants for order items (use first 3 products from imported data)
  const [pid1, pid2, pid3] = createdProductIds;
  const relxVariant = await prisma.productVariant.findFirst({ where: { productId: pid1 } });
  const saltVariant = await prisma.productVariant.findFirst({ where: { productId: pid2 } });
  const juulVariant = await prisma.productVariant.findFirst({ where: { productId: pid3 } });

  if (!relxVariant || !saltVariant || !juulVariant) {
    throw new Error('Variants not found');
  }
  const prod1 = await prisma.product.findUnique({ where: { id: pid1 } });
  const prod2 = await prisma.product.findUnique({ where: { id: pid2 } });
  const prod3 = await prisma.product.findUnique({ where: { id: pid3 } });

  const shippingAddress = {
    recipient: '김철수',
    phone: '010-1234-5678',
    zipCode: '12345',
    address1: '경기도 수원시 영통구 매탄동',
    address2: '101동 501호',
  };

  // Order 1: AWAITING_DEPOSIT
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260101-001',
      customerId: customer1.id,
      status: 'AWAITING_DEPOSIT',
      subtotal: relxVariant.price,
      shippingFee: 2500,
      discountAmount: 0,
      totalAmount: relxVariant.price + 2500,
      shippingAddress,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: pid1,
      variantId: relxVariant.id,
      productName: prod1?.name ?? 'Product 1',
      variantName: '기본',
      price: relxVariant.price,
      quantity: 1,
      subtotal: relxVariant.price,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      method: 'BANK_TRANSFER',
      amount: relxVariant.price + 2500,
      status: 'AWAITING_DEPOSIT',
      bankName: '국민은행',
      accountNumber: '123456-78-901234',
      depositorName: '김철수',
      depositDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Order 2: PAID
  const shippingAddress2 = {
    recipient: '이영희',
    phone: '010-9876-5432',
    zipCode: '54321',
    address1: '서울특별시 강남구 역삼동',
    address2: '202동 302호',
  };
  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260102-001',
      customerId: customer2.id,
      status: 'PAID',
      subtotal: saltVariant.price * 2,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: saltVariant.price * 2,
      shippingAddress: shippingAddress2,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: pid2,
      variantId: saltVariant.id,
      productName: prod2?.name ?? 'Product 2',
      variantName: '기본',
      price: saltVariant.price,
      quantity: 2,
      subtotal: saltVariant.price * 2,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      method: 'KAKAOPAY',
      amount: saltVariant.price * 2,
      status: 'COMPLETED',
      pgProvider: 'kakaopay',
      pgTxId: 'KAKAO-TX-20260102-001',
      paidAt: new Date(),
    },
  });

  // Order 3: DELIVERED
  const shippingAddress3 = {
    recipient: '박지민',
    phone: '010-5555-7777',
    zipCode: '67890',
    address1: '부산광역시 해운대구 우동',
    address2: '303동 101호',
  };
  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-20260103-001',
      customerId: customer3.id,
      status: 'DELIVERED',
      subtotal: juulVariant.price * 3,
      shippingFee: 2500,
      discountAmount: 0,
      totalAmount: juulVariant.price * 3 + 2500,
      shippingAddress: shippingAddress3,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: pid3,
      variantId: juulVariant.id,
      productName: prod3?.name ?? 'Product 3',
      variantName: '기본',
      price: juulVariant.price,
      quantity: 3,
      subtotal: juulVariant.price * 3,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order3.id,
      method: 'TOSSPAY',
      amount: juulVariant.price * 3 + 2500,
      status: 'COMPLETED',
      pgProvider: 'tosspay',
      pgTxId: 'TOSS-TX-20260103-001',
      paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.shipment.create({
    data: {
      orderId: order3.id,
      carrier: '우체국택배',
      trackingNumber: '1234567890',
      status: 'DELIVERED',
      shippedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Orders created.');

  // ─────────────────────────────────────────────
  // 9. Banners
  // ─────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      {
        title: '더본투비 히어로 배너 1',
        imageUrl: 'https://cdn.imweb.me/thumbnail/20231220/10355eabef49a.jpg',
        linkUrl: null,
        position: 'HERO',
        sortOrder: 0,
        isActive: true,
      },
      {
        title: '더본투비 히어로 배너 2',
        imageUrl: 'https://cdn.imweb.me/thumbnail/20240219/1414ee1a88aef.jpg',
        linkUrl: null,
        position: 'HERO',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: '더본투비 히어로 배너 3',
        imageUrl: 'https://cdn.imweb.me/thumbnail/20240619/95e9c6ffac000.png',
        linkUrl: null,
        position: 'HERO',
        sortOrder: 2,
        isActive: true,
      },
      {
        title: '더본투비 히어로 배너 4',
        imageUrl: 'https://cdn.imweb.me/thumbnail/20240424/61d9f4567e0cc.jpg',
        linkUrl: null,
        position: 'HERO',
        sortOrder: 3,
        isActive: true,
      },
      {
        title: '더본투비 히어로 배너 5',
        imageUrl: 'https://cdn.imweb.me/thumbnail/20240108/3667f7c6c72d8.png',
        linkUrl: null,
        position: 'HERO',
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  console.log('Banners created.');
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
