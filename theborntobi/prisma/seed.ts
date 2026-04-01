import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient();

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

  // Product 1: RELX 인피니티 플러스 기기 — 컬러 3 variants
  const product1 = await prisma.product.create({
    data: {
      name: 'RELX 인피니티 플러스 기기',
      slug: 'relx-infinity-plus',
      description: 'RELX 인피니티 플러스 전자담배 기기. 세련된 디자인과 뛰어난 성능.',
      categoryId: categories['devices'],
      basePrice: 35000,
      comparePrice: 45000,
      badges: 'BEST,HOT',
      isActive: true,
      isAdult: true,
      isRestricted: false,
      sortOrder: 1,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product1.id, url: 'https://cdn.imweb.me/thumbnail/20230227/a554c65fa7f7a.png', alt: 'RELX 인피니티 플러스 기기 메인', sortOrder: 0 },
      { productId: product1.id, url: 'https://cdn.imweb.me/thumbnail/20230314/f896897ec6166.png', alt: 'RELX 인피니티 플러스 기기 상세', sortOrder: 1 },
    ],
  });

  const option1Color = await prisma.productOption.create({
    data: { productId: product1.id, name: '컬러', sortOrder: 0 },
  });

  const colors1 = ['블랙', '실버', '민트그린'];
  const colorValueIds1: string[] = [];
  for (let i = 0; i < colors1.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option1Color.id, value: colors1[i], sortOrder: i },
    });
    colorValueIds1.push(val.id);
  }

  for (let i = 0; i < colors1.length; i++) {
    const variant = await prisma.productVariant.create({
      data: {
        productId: product1.id,
        sku: `RELX-INF-${colors1[i]}`,
        price: 35000,
        stock: 50,
        isActive: true,
      },
    });
    await prisma.variantOptionValue.create({
      data: { variantId: variant.id, optionValueId: colorValueIds1[i] },
    });
  }

  // Product 2: 솔트 니코틴 액상 30ml — 니코틴함량 x 맛 (2x3=6 variants)
  const product2 = await prisma.product.create({
    data: {
      name: '솔트 니코틴 액상 30ml',
      slug: 'salt-nicotine-30ml',
      description: '프리미엄 솔트 니코틴 액상. 부드러운 목 넘김과 풍부한 맛.',
      categoryId: categories['ready-liquid'],
      basePrice: 15000,
      badges: 'SALE',
      isActive: true,
      isAdult: true,
      isRestricted: false,
      sortOrder: 2,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product2.id, url: 'https://cdn.imweb.me/thumbnail/20230613/48bdebc097de9.jpg', alt: '솔트 니코틴 액상 30ml 메인', sortOrder: 0 },
      { productId: product2.id, url: 'https://cdn.imweb.me/thumbnail/20230319/7654e1a664ff9.jpg', alt: '솔트 니코틴 액상 30ml 상세', sortOrder: 1 },
    ],
  });

  const option2Nic = await prisma.productOption.create({
    data: { productId: product2.id, name: '니코틴함량', sortOrder: 0 },
  });
  const option2Flavor = await prisma.productOption.create({
    data: { productId: product2.id, name: '맛', sortOrder: 1 },
  });

  const nicStrengths = ['9.8mg', '20mg'];
  const nicValueIds: string[] = [];
  for (let i = 0; i < nicStrengths.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option2Nic.id, value: nicStrengths[i], sortOrder: i },
    });
    nicValueIds.push(val.id);
  }

  const flavors2 = ['민트', '담배', '과일'];
  const flavorValueIds2: string[] = [];
  for (let i = 0; i < flavors2.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option2Flavor.id, value: flavors2[i], sortOrder: i },
    });
    flavorValueIds2.push(val.id);
  }

  const stocks2 = [30, 20, 25, 15, 40, 10];
  let variantIdx2 = 0;
  for (let n = 0; n < nicStrengths.length; n++) {
    for (let f = 0; f < flavors2.length; f++) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product2.id,
          sku: `SALT-LIQ-${nicStrengths[n]}-${flavors2[f]}`,
          price: 15000,
          stock: stocks2[variantIdx2++],
          isActive: true,
        },
      });
      await prisma.variantOptionValue.createMany({
        data: [
          { variantId: variant.id, optionValueId: nicValueIds[n] },
          { variantId: variant.id, optionValueId: flavorValueIds2[f] },
        ],
      });
    }
  }

  // Product 3: JUUL 호환 팟 카트리지 — 맛 4 variants
  const product3 = await prisma.product.create({
    data: {
      name: 'JUUL 호환 팟 카트리지',
      slug: 'juul-compatible-pod',
      description: 'JUUL 기기와 완벽하게 호환되는 프리미엄 팟 카트리지.',
      categoryId: categories['pods'],
      basePrice: 8000,
      badges: 'BEST',
      isActive: true,
      isAdult: true,
      isRestricted: false,
      sortOrder: 3,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product3.id, url: 'https://cdn.imweb.me/thumbnail/20230314/9c3b2278bb63e.png', alt: 'JUUL 호환 팟 카트리지 메인', sortOrder: 0 },
      { productId: product3.id, url: 'https://cdn.imweb.me/thumbnail/20230124/3da74510a2d71.jpg', alt: 'JUUL 호환 팟 카트리지 상세', sortOrder: 1 },
    ],
  });

  const option3Flavor = await prisma.productOption.create({
    data: { productId: product3.id, name: '맛', sortOrder: 0 },
  });

  const flavors3 = ['쿨민트', '리치라이치', '골든토바코', '클래식'];
  const stocks3 = [45, 30, 60, 25];
  for (let i = 0; i < flavors3.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option3Flavor.id, value: flavors3[i], sortOrder: i },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product3.id,
        sku: `JUUL-POD-${flavors3[i]}`,
        price: 8000,
        stock: stocks3[i],
        isActive: true,
      },
    });
    await prisma.variantOptionValue.create({
      data: { variantId: variant.id, optionValueId: val.id },
    });
  }

  // Product 4: 무니코틴 프리미엄 액상 — 용량 x 맛 (2x3=6 variants)
  const product4 = await prisma.product.create({
    data: {
      name: '무니코틴 프리미엄 액상',
      slug: 'nicotine-free-premium-liquid',
      description: '니코틴 없는 프리미엄 액상. 풍부한 과일향으로 즐기는 건강한 베이핑.',
      categoryId: categories['nicotine-free'],
      basePrice: 12000,
      badges: 'NEW',
      isActive: true,
      isAdult: true,
      isRestricted: false,
      sortOrder: 4,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product4.id, url: 'https://cdn.imweb.me/thumbnail/20230615/ec4b2caaddc27.jpg', alt: '무니코틴 프리미엄 액상 메인', sortOrder: 0 },
      { productId: product4.id, url: 'https://cdn.imweb.me/thumbnail/20230613/72d8bd1c23d53.jpg', alt: '무니코틴 프리미엄 액상 상세', sortOrder: 1 },
    ],
  });

  const option4Volume = await prisma.productOption.create({
    data: { productId: product4.id, name: '용량', sortOrder: 0 },
  });
  const option4Flavor = await prisma.productOption.create({
    data: { productId: product4.id, name: '맛', sortOrder: 1 },
  });

  const volumes4 = ['30ml', '60ml'];
  const volumePrices4 = [12000, 20000];
  const volumeValueIds4: string[] = [];
  for (let i = 0; i < volumes4.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option4Volume.id, value: volumes4[i], sortOrder: i },
    });
    volumeValueIds4.push(val.id);
  }

  const flavors4 = ['블루베리', '멜론', '복숭아'];
  const flavorValueIds4: string[] = [];
  for (let i = 0; i < flavors4.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option4Flavor.id, value: flavors4[i], sortOrder: i },
    });
    flavorValueIds4.push(val.id);
  }

  let variantIdx4 = 0;
  const stocks4 = [20, 15, 30, 10, 25, 18];
  for (let v = 0; v < volumes4.length; v++) {
    for (let f = 0; f < flavors4.length; f++) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product4.id,
          sku: `NF-LIQ-${volumes4[v]}-${flavors4[f]}`,
          price: volumePrices4[v],
          stock: stocks4[variantIdx4++],
          isActive: true,
        },
      });
      await prisma.variantOptionValue.createMany({
        data: [
          { variantId: variant.id, optionValueId: volumeValueIds4[v] },
          { variantId: variant.id, optionValueId: flavorValueIds4[f] },
        ],
      });
    }
  }

  // Product 5: 전자담배 휴대용 파우치 — 컬러 2 variants (not adult/restricted)
  const product5 = await prisma.product.create({
    data: {
      name: '전자담배 휴대용 파우치',
      slug: 'vape-portable-pouch',
      description: '전자담배와 액상을 함께 보관할 수 있는 실용적인 파우치.',
      categoryId: categories['lifestyle'],
      basePrice: 9900,
      badges: null,
      isActive: true,
      isAdult: false,
      isRestricted: false,
      sortOrder: 5,
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: product5.id, url: 'https://cdn.imweb.me/thumbnail/20240402/0d51f583e49db.jpg', alt: '전자담배 휴대용 파우치 메인', sortOrder: 0 },
      { productId: product5.id, url: 'https://cdn.imweb.me/thumbnail/20260317/4b3b69046ecab.png', alt: '전자담배 휴대용 파우치 상세', sortOrder: 1 },
    ],
  });

  const option5Color = await prisma.productOption.create({
    data: { productId: product5.id, name: '컬러', sortOrder: 0 },
  });

  const colors5 = ['블랙', '네이비'];
  const stocks5 = [80, 60];
  for (let i = 0; i < colors5.length; i++) {
    const val = await prisma.productOptionValue.create({
      data: { optionId: option5Color.id, value: colors5[i], sortOrder: i },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product5.id,
        sku: `POUCH-${colors5[i]}`,
        price: 9900,
        stock: stocks5[i],
        isActive: true,
      },
    });
    await prisma.variantOptionValue.create({
      data: { variantId: variant.id, optionValueId: val.id },
    });
  }

  console.log('Products and variants created.');

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

  // Fetch variants for order items
  const relxVariant = await prisma.productVariant.findFirst({ where: { productId: product1.id } });
  const saltVariant = await prisma.productVariant.findFirst({ where: { productId: product2.id } });
  const juulVariant = await prisma.productVariant.findFirst({ where: { productId: product3.id } });

  if (!relxVariant || !saltVariant || !juulVariant) {
    throw new Error('Variants not found');
  }

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
      subtotal: 35000,
      shippingFee: 2500,
      discountAmount: 0,
      totalAmount: 37500,
      shippingAddress,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product1.id,
      variantId: relxVariant.id,
      productName: 'RELX 인피니티 플러스 기기',
      variantName: '블랙',
      price: 35000,
      quantity: 1,
      subtotal: 35000,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order1.id,
      method: 'BANK_TRANSFER',
      amount: 37500,
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
      subtotal: 30000,
      shippingFee: 0,
      discountAmount: 0,
      totalAmount: 30000,
      shippingAddress: shippingAddress2,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: product2.id,
      variantId: saltVariant.id,
      productName: '솔트 니코틴 액상 30ml',
      variantName: '9.8mg / 민트',
      price: 15000,
      quantity: 2,
      subtotal: 30000,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order2.id,
      method: 'KAKAOPAY',
      amount: 30000,
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
      subtotal: 24000,
      shippingFee: 2500,
      discountAmount: 0,
      totalAmount: 26500,
      shippingAddress: shippingAddress3,
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order3.id,
      productId: product3.id,
      variantId: juulVariant.id,
      productName: 'JUUL 호환 팟 카트리지',
      variantName: '쿨민트',
      price: 8000,
      quantity: 3,
      subtotal: 24000,
    },
  });
  await prisma.payment.create({
    data: {
      orderId: order3.id,
      method: 'TOSSPAY',
      amount: 26500,
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
