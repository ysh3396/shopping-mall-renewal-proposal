-- Seed data for 더본투비 쇼핑몰
-- Converted from prisma/seed.ts

BEGIN;

DO $$
DECLARE
  -- CustomerGrade IDs
  v_grade_normal       TEXT := gen_random_uuid()::TEXT;
  v_grade_silver       TEXT := gen_random_uuid()::TEXT;
  v_grade_gold         TEXT := gen_random_uuid()::TEXT;

  -- Role IDs
  v_role_super_admin   TEXT := gen_random_uuid()::TEXT;
  v_role_manager       TEXT := gen_random_uuid()::TEXT;
  v_role_staff         TEXT := gen_random_uuid()::TEXT;

  -- Permission IDs (resource.action)
  v_perm_products_create    TEXT := gen_random_uuid()::TEXT;
  v_perm_products_read      TEXT := gen_random_uuid()::TEXT;
  v_perm_products_update    TEXT := gen_random_uuid()::TEXT;
  v_perm_products_delete    TEXT := gen_random_uuid()::TEXT;
  v_perm_orders_create      TEXT := gen_random_uuid()::TEXT;
  v_perm_orders_read        TEXT := gen_random_uuid()::TEXT;
  v_perm_orders_update      TEXT := gen_random_uuid()::TEXT;
  v_perm_orders_delete      TEXT := gen_random_uuid()::TEXT;
  v_perm_customers_create   TEXT := gen_random_uuid()::TEXT;
  v_perm_customers_read     TEXT := gen_random_uuid()::TEXT;
  v_perm_customers_update   TEXT := gen_random_uuid()::TEXT;
  v_perm_customers_delete   TEXT := gen_random_uuid()::TEXT;
  v_perm_shipping_create    TEXT := gen_random_uuid()::TEXT;
  v_perm_shipping_read      TEXT := gen_random_uuid()::TEXT;
  v_perm_shipping_update    TEXT := gen_random_uuid()::TEXT;
  v_perm_shipping_delete    TEXT := gen_random_uuid()::TEXT;
  v_perm_promotions_create  TEXT := gen_random_uuid()::TEXT;
  v_perm_promotions_read    TEXT := gen_random_uuid()::TEXT;
  v_perm_promotions_update  TEXT := gen_random_uuid()::TEXT;
  v_perm_promotions_delete  TEXT := gen_random_uuid()::TEXT;
  v_perm_settings_create    TEXT := gen_random_uuid()::TEXT;
  v_perm_settings_read      TEXT := gen_random_uuid()::TEXT;
  v_perm_settings_update    TEXT := gen_random_uuid()::TEXT;
  v_perm_settings_delete    TEXT := gen_random_uuid()::TEXT;
  v_perm_users_create       TEXT := gen_random_uuid()::TEXT;
  v_perm_users_read         TEXT := gen_random_uuid()::TEXT;
  v_perm_users_update       TEXT := gen_random_uuid()::TEXT;
  v_perm_users_delete       TEXT := gen_random_uuid()::TEXT;
  v_perm_reports_create     TEXT := gen_random_uuid()::TEXT;
  v_perm_reports_read       TEXT := gen_random_uuid()::TEXT;
  v_perm_reports_update     TEXT := gen_random_uuid()::TEXT;
  v_perm_reports_delete     TEXT := gen_random_uuid()::TEXT;

  -- Category IDs
  v_cat_home              TEXT := gen_random_uuid()::TEXT;
  v_cat_devices           TEXT := gen_random_uuid()::TEXT;
  v_cat_pods              TEXT := gen_random_uuid()::TEXT;
  v_cat_nicotine_free     TEXT := gen_random_uuid()::TEXT;
  v_cat_lifestyle         TEXT := gen_random_uuid()::TEXT;
  v_cat_angry             TEXT := gen_random_uuid()::TEXT;
  v_cat_ready_liquid      TEXT := gen_random_uuid()::TEXT;
  v_cat_mod_liquid        TEXT := gen_random_uuid()::TEXT;
  v_cat_new_arrivals      TEXT := gen_random_uuid()::TEXT;
  v_cat_mtl               TEXT := gen_random_uuid()::TEXT;
  v_cat_dtl               TEXT := gen_random_uuid()::TEXT;
  v_cat_high_nic          TEXT := gen_random_uuid()::TEXT;
  v_cat_disposable        TEXT := gen_random_uuid()::TEXT;

  -- Product IDs
  v_prod1                 TEXT := gen_random_uuid()::TEXT;
  v_prod2                 TEXT := gen_random_uuid()::TEXT;
  v_prod3                 TEXT := gen_random_uuid()::TEXT;
  v_prod4                 TEXT := gen_random_uuid()::TEXT;
  v_prod5                 TEXT := gen_random_uuid()::TEXT;

  -- Product 1 option/value/variant IDs
  v_opt1_color            TEXT := gen_random_uuid()::TEXT;
  v_oval1_black           TEXT := gen_random_uuid()::TEXT;
  v_oval1_silver          TEXT := gen_random_uuid()::TEXT;
  v_oval1_mint            TEXT := gen_random_uuid()::TEXT;
  v_var1_black            TEXT := gen_random_uuid()::TEXT;
  v_var1_silver           TEXT := gen_random_uuid()::TEXT;
  v_var1_mint             TEXT := gen_random_uuid()::TEXT;

  -- Product 2 option/value/variant IDs
  v_opt2_nic              TEXT := gen_random_uuid()::TEXT;
  v_opt2_flavor           TEXT := gen_random_uuid()::TEXT;
  v_oval2_9mg             TEXT := gen_random_uuid()::TEXT;
  v_oval2_20mg            TEXT := gen_random_uuid()::TEXT;
  v_oval2_mint            TEXT := gen_random_uuid()::TEXT;
  v_oval2_tobacco         TEXT := gen_random_uuid()::TEXT;
  v_oval2_fruit           TEXT := gen_random_uuid()::TEXT;
  v_var2_9mg_mint         TEXT := gen_random_uuid()::TEXT;
  v_var2_9mg_tobacco      TEXT := gen_random_uuid()::TEXT;
  v_var2_9mg_fruit        TEXT := gen_random_uuid()::TEXT;
  v_var2_20mg_mint        TEXT := gen_random_uuid()::TEXT;
  v_var2_20mg_tobacco     TEXT := gen_random_uuid()::TEXT;
  v_var2_20mg_fruit       TEXT := gen_random_uuid()::TEXT;

  -- Product 3 option/value/variant IDs
  v_opt3_flavor           TEXT := gen_random_uuid()::TEXT;
  v_oval3_coolmint        TEXT := gen_random_uuid()::TEXT;
  v_oval3_lychee          TEXT := gen_random_uuid()::TEXT;
  v_oval3_tobacco         TEXT := gen_random_uuid()::TEXT;
  v_oval3_classic         TEXT := gen_random_uuid()::TEXT;
  v_var3_coolmint         TEXT := gen_random_uuid()::TEXT;
  v_var3_lychee           TEXT := gen_random_uuid()::TEXT;
  v_var3_tobacco          TEXT := gen_random_uuid()::TEXT;
  v_var3_classic          TEXT := gen_random_uuid()::TEXT;

  -- Product 4 option/value/variant IDs
  v_opt4_volume           TEXT := gen_random_uuid()::TEXT;
  v_opt4_flavor           TEXT := gen_random_uuid()::TEXT;
  v_oval4_30ml            TEXT := gen_random_uuid()::TEXT;
  v_oval4_60ml            TEXT := gen_random_uuid()::TEXT;
  v_oval4_blueberry       TEXT := gen_random_uuid()::TEXT;
  v_oval4_melon           TEXT := gen_random_uuid()::TEXT;
  v_oval4_peach           TEXT := gen_random_uuid()::TEXT;
  v_var4_30ml_blueberry   TEXT := gen_random_uuid()::TEXT;
  v_var4_30ml_melon       TEXT := gen_random_uuid()::TEXT;
  v_var4_30ml_peach       TEXT := gen_random_uuid()::TEXT;
  v_var4_60ml_blueberry   TEXT := gen_random_uuid()::TEXT;
  v_var4_60ml_melon       TEXT := gen_random_uuid()::TEXT;
  v_var4_60ml_peach       TEXT := gen_random_uuid()::TEXT;

  -- Product 5 option/value/variant IDs
  v_opt5_color            TEXT := gen_random_uuid()::TEXT;
  v_oval5_black           TEXT := gen_random_uuid()::TEXT;
  v_oval5_navy            TEXT := gen_random_uuid()::TEXT;
  v_var5_black            TEXT := gen_random_uuid()::TEXT;
  v_var5_navy             TEXT := gen_random_uuid()::TEXT;

  -- Customer IDs
  v_cust1                 TEXT := gen_random_uuid()::TEXT;
  v_cust2                 TEXT := gen_random_uuid()::TEXT;
  v_cust3                 TEXT := gen_random_uuid()::TEXT;

  -- Order IDs
  v_order1                TEXT := gen_random_uuid()::TEXT;
  v_order2                TEXT := gen_random_uuid()::TEXT;
  v_order3                TEXT := gen_random_uuid()::TEXT;

  v_now                   TIMESTAMPTZ := NOW();

BEGIN

  -- ─────────────────────────────────────────────
  -- Cleanup (idempotent)
  -- ─────────────────────────────────────────────
  DELETE FROM "AuditLog";
  DELETE FROM "Notification";
  DELETE FROM "VariantOptionValue";
  DELETE FROM "CartItem";
  DELETE FROM "Cart";
  DELETE FROM "InventoryLog";
  DELETE FROM "OrderItem";
  DELETE FROM "Shipment";
  DELETE FROM "Refund";
  DELETE FROM "ReturnRequest";
  DELETE FROM "ExchangeRequest";
  DELETE FROM "Payment";
  DELETE FROM "Order";
  DELETE FROM "Review";
  DELETE FROM "QnA";
  DELETE FROM "CouponUsage";
  DELETE FROM "ProductRequest";
  DELETE FROM "Address";
  DELETE FROM "Customer";
  DELETE FROM "ProductOptionValue";
  DELETE FROM "ProductOption";
  DELETE FROM "ProductVariant";
  DELETE FROM "ProductImage";
  DELETE FROM "Product";
  DELETE FROM "Category";
  DELETE FROM "AdminUser";
  DELETE FROM "RolePermission";
  DELETE FROM "Permission";
  DELETE FROM "Role";
  DELETE FROM "CustomerGrade";
  DELETE FROM "SiteConfig";
  DELETE FROM "Banner";
  DELETE FROM "Coupon";
  DELETE FROM "Promotion";
  DELETE FROM "Collection";
  DELETE FROM "Popup";
  DELETE FROM "PageContent";
  DELETE FROM "RedirectRule";

  -- ─────────────────────────────────────────────
  -- 1. SiteConfig
  -- ─────────────────────────────────────────────
  INSERT INTO "SiteConfig" (
    "id", "siteName", "domain", "businessName", "businessNumber",
    "ceoName", "address", "phone", "email",
    "bankName", "bankAccount", "bankHolder",
    "freeShippingThreshold", "defaultShippingFee", "returnShippingFee",
    "restrictionMode", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    '더본투비',
    'theborntobi.com',
    '주식회사 더본투비',
    '123-45-67890',
    '왕한빈',
    '경기도 양평군',
    '010-0000-0000',
    'admin@theborntobi.com',
    '국민은행',
    '123456-78-901234',
    '주식회사 더본투비',
    50000,
    2500,
    3000,
    'NONE'::"RestrictionMode",
    v_now,
    v_now
  );

  -- ─────────────────────────────────────────────
  -- 2. CustomerGrades
  -- ─────────────────────────────────────────────
  INSERT INTO "CustomerGrade" ("id", "name", "minOrderAmount", "discountRate") VALUES
    (v_grade_normal, '일반',   0,      0),
    (v_grade_silver, 'Silver', 100000, 3),
    (v_grade_gold,   'Gold',   300000, 5);

  -- ─────────────────────────────────────────────
  -- 3. Roles
  -- ─────────────────────────────────────────────
  INSERT INTO "Role" ("id", "name") VALUES
    (v_role_super_admin, 'super_admin'),
    (v_role_manager,     'manager'),
    (v_role_staff,       'staff');

  -- ─────────────────────────────────────────────
  -- 4. Permissions (resources x actions)
  -- ─────────────────────────────────────────────
  INSERT INTO "Permission" ("id", "resource", "action") VALUES
    (v_perm_products_create,   'products',   'create'),
    (v_perm_products_read,     'products',   'read'),
    (v_perm_products_update,   'products',   'update'),
    (v_perm_products_delete,   'products',   'delete'),
    (v_perm_orders_create,     'orders',     'create'),
    (v_perm_orders_read,       'orders',     'read'),
    (v_perm_orders_update,     'orders',     'update'),
    (v_perm_orders_delete,     'orders',     'delete'),
    (v_perm_customers_create,  'customers',  'create'),
    (v_perm_customers_read,    'customers',  'read'),
    (v_perm_customers_update,  'customers',  'update'),
    (v_perm_customers_delete,  'customers',  'delete'),
    (v_perm_shipping_create,   'shipping',   'create'),
    (v_perm_shipping_read,     'shipping',   'read'),
    (v_perm_shipping_update,   'shipping',   'update'),
    (v_perm_shipping_delete,   'shipping',   'delete'),
    (v_perm_promotions_create, 'promotions', 'create'),
    (v_perm_promotions_read,   'promotions', 'read'),
    (v_perm_promotions_update, 'promotions', 'update'),
    (v_perm_promotions_delete, 'promotions', 'delete'),
    (v_perm_settings_create,   'settings',   'create'),
    (v_perm_settings_read,     'settings',   'read'),
    (v_perm_settings_update,   'settings',   'update'),
    (v_perm_settings_delete,   'settings',   'delete'),
    (v_perm_users_create,      'users',      'create'),
    (v_perm_users_read,        'users',      'read'),
    (v_perm_users_update,      'users',      'update'),
    (v_perm_users_delete,      'users',      'delete'),
    (v_perm_reports_create,    'reports',    'create'),
    (v_perm_reports_read,      'reports',    'read'),
    (v_perm_reports_update,    'reports',    'update'),
    (v_perm_reports_delete,    'reports',    'delete');

  -- ─────────────────────────────────────────────
  -- 5. RolePermissions
  -- ─────────────────────────────────────────────

  -- super_admin: all 32 permissions
  INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
    (v_role_super_admin, v_perm_products_create),
    (v_role_super_admin, v_perm_products_read),
    (v_role_super_admin, v_perm_products_update),
    (v_role_super_admin, v_perm_products_delete),
    (v_role_super_admin, v_perm_orders_create),
    (v_role_super_admin, v_perm_orders_read),
    (v_role_super_admin, v_perm_orders_update),
    (v_role_super_admin, v_perm_orders_delete),
    (v_role_super_admin, v_perm_customers_create),
    (v_role_super_admin, v_perm_customers_read),
    (v_role_super_admin, v_perm_customers_update),
    (v_role_super_admin, v_perm_customers_delete),
    (v_role_super_admin, v_perm_shipping_create),
    (v_role_super_admin, v_perm_shipping_read),
    (v_role_super_admin, v_perm_shipping_update),
    (v_role_super_admin, v_perm_shipping_delete),
    (v_role_super_admin, v_perm_promotions_create),
    (v_role_super_admin, v_perm_promotions_read),
    (v_role_super_admin, v_perm_promotions_update),
    (v_role_super_admin, v_perm_promotions_delete),
    (v_role_super_admin, v_perm_settings_create),
    (v_role_super_admin, v_perm_settings_read),
    (v_role_super_admin, v_perm_settings_update),
    (v_role_super_admin, v_perm_settings_delete),
    (v_role_super_admin, v_perm_users_create),
    (v_role_super_admin, v_perm_users_read),
    (v_role_super_admin, v_perm_users_update),
    (v_role_super_admin, v_perm_users_delete),
    (v_role_super_admin, v_perm_reports_create),
    (v_role_super_admin, v_perm_reports_read),
    (v_role_super_admin, v_perm_reports_update),
    (v_role_super_admin, v_perm_reports_delete);

  -- manager: all except settings.delete, users.create, users.delete
  INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
    (v_role_manager, v_perm_products_create),
    (v_role_manager, v_perm_products_read),
    (v_role_manager, v_perm_products_update),
    (v_role_manager, v_perm_products_delete),
    (v_role_manager, v_perm_orders_create),
    (v_role_manager, v_perm_orders_read),
    (v_role_manager, v_perm_orders_update),
    (v_role_manager, v_perm_orders_delete),
    (v_role_manager, v_perm_customers_create),
    (v_role_manager, v_perm_customers_read),
    (v_role_manager, v_perm_customers_update),
    (v_role_manager, v_perm_customers_delete),
    (v_role_manager, v_perm_shipping_create),
    (v_role_manager, v_perm_shipping_read),
    (v_role_manager, v_perm_shipping_update),
    (v_role_manager, v_perm_shipping_delete),
    (v_role_manager, v_perm_promotions_create),
    (v_role_manager, v_perm_promotions_read),
    (v_role_manager, v_perm_promotions_update),
    (v_role_manager, v_perm_promotions_delete),
    (v_role_manager, v_perm_settings_create),
    (v_role_manager, v_perm_settings_read),
    (v_role_manager, v_perm_settings_update),
    -- excluded: v_perm_settings_delete
    -- excluded: v_perm_users_create
    (v_role_manager, v_perm_users_read),
    (v_role_manager, v_perm_users_update),
    -- excluded: v_perm_users_delete
    (v_role_manager, v_perm_reports_create),
    (v_role_manager, v_perm_reports_read),
    (v_role_manager, v_perm_reports_update),
    (v_role_manager, v_perm_reports_delete);

  -- staff: only read permissions (8 resources)
  INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
    (v_role_staff, v_perm_products_read),
    (v_role_staff, v_perm_orders_read),
    (v_role_staff, v_perm_customers_read),
    (v_role_staff, v_perm_shipping_read),
    (v_role_staff, v_perm_promotions_read),
    (v_role_staff, v_perm_settings_read),
    (v_role_staff, v_perm_users_read),
    (v_role_staff, v_perm_reports_read);

  -- ─────────────────────────────────────────────
  -- 6. AdminUser
  -- ─────────────────────────────────────────────
  INSERT INTO "AdminUser" (
    "id", "email", "name", "passwordHash", "roleId", "isActive", "createdAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    'admin@theborntobi.com',
    '관리자',
    '$2a$10$rQEY2Wl5gkz5LD.GjhRF3OQz8NyjPr6BmH8M.8qx0sE5y3D3K3zKi',
    v_role_super_admin,
    TRUE,
    v_now
  );

  -- ─────────────────────────────────────────────
  -- 7. Categories (13)
  -- ─────────────────────────────────────────────
  INSERT INTO "Category" ("id", "name", "slug", "sortOrder", "isActive", "isRestricted") VALUES
    (v_cat_home,          'HOME',           'home',         0,  TRUE, FALSE),
    (v_cat_devices,       '기기&악세사리',   'devices',      1,  TRUE, TRUE),
    (v_cat_pods,          '팟/카트리지/코일', 'pods',         2,  TRUE, TRUE),
    (v_cat_nicotine_free, '무니코틴',        'nicotine-free', 3, TRUE, TRUE),
    (v_cat_lifestyle,     '생활용품',        'lifestyle',    4,  TRUE, FALSE),
    (v_cat_angry,         '앵그리',          'angry',        5,  TRUE, TRUE),
    (v_cat_ready_liquid,  '기성 액상',       'ready-liquid', 6,  TRUE, TRUE),
    (v_cat_mod_liquid,    '모드 액상',       'mod-liquid',   7,  TRUE, TRUE),
    (v_cat_new_arrivals,  'NEW 신상',        'new-arrivals', 8,  TRUE, TRUE),
    (v_cat_mtl,           '입호흡',          'mtl',          9,  TRUE, TRUE),
    (v_cat_dtl,           '폐호흡',          'dtl',          10, TRUE, TRUE),
    (v_cat_high_nic,      '고농도',          'high-nic',     11, TRUE, TRUE),
    (v_cat_disposable,    '일회용 전자담배', 'disposable',   12, TRUE, TRUE);

  -- ─────────────────────────────────────────────
  -- 8. Products
  -- ─────────────────────────────────────────────

  -- Product 1: RELX 인피니티 플러스 기기
  INSERT INTO "Product" (
    "id", "name", "slug", "description", "categoryId",
    "basePrice", "comparePrice", "badges",
    "isActive", "isAdult", "isRestricted", "sortOrder", "createdAt", "updatedAt"
  ) VALUES (
    v_prod1,
    'RELX 인피니티 플러스 기기',
    'relx-infinity-plus',
    'RELX 인피니티 플러스 전자담배 기기. 세련된 디자인과 뛰어난 성능.',
    v_cat_devices,
    35000, 45000, 'BEST,HOT',
    TRUE, TRUE, FALSE, 1, v_now, v_now
  );

  INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder") VALUES
    (gen_random_uuid()::TEXT, v_prod1, '/images/products/product-1-1.jpg', 'RELX 인피니티 플러스 기기 메인', 0),
    (gen_random_uuid()::TEXT, v_prod1, '/images/products/product-1-2.jpg', 'RELX 인피니티 플러스 기기 상세', 1);

  INSERT INTO "ProductOption" ("id", "productId", "name", "sortOrder") VALUES
    (v_opt1_color, v_prod1, '컬러', 0);

  INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "sortOrder") VALUES
    (v_oval1_black,  v_opt1_color, '블랙',    0),
    (v_oval1_silver, v_opt1_color, '실버',    1),
    (v_oval1_mint,   v_opt1_color, '민트그린', 2);

  INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "stock", "isActive") VALUES
    (v_var1_black,  v_prod1, 'RELX-INF-블랙',    35000, 50, TRUE),
    (v_var1_silver, v_prod1, 'RELX-INF-실버',    35000, 50, TRUE),
    (v_var1_mint,   v_prod1, 'RELX-INF-민트그린', 35000, 50, TRUE);

  INSERT INTO "VariantOptionValue" ("variantId", "optionValueId") VALUES
    (v_var1_black,  v_oval1_black),
    (v_var1_silver, v_oval1_silver),
    (v_var1_mint,   v_oval1_mint);

  -- Product 2: 솔트 니코틴 액상 30ml
  INSERT INTO "Product" (
    "id", "name", "slug", "description", "categoryId",
    "basePrice", "badges",
    "isActive", "isAdult", "isRestricted", "sortOrder", "createdAt", "updatedAt"
  ) VALUES (
    v_prod2,
    '솔트 니코틴 액상 30ml',
    'salt-nicotine-30ml',
    '프리미엄 솔트 니코틴 액상. 부드러운 목 넘김과 풍부한 맛.',
    v_cat_ready_liquid,
    15000, 'SALE',
    TRUE, TRUE, FALSE, 2, v_now, v_now
  );

  INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder") VALUES
    (gen_random_uuid()::TEXT, v_prod2, '/images/products/product-2-1.jpg', '솔트 니코틴 액상 30ml 메인', 0),
    (gen_random_uuid()::TEXT, v_prod2, '/images/products/product-2-2.jpg', '솔트 니코틴 액상 30ml 상세', 1);

  INSERT INTO "ProductOption" ("id", "productId", "name", "sortOrder") VALUES
    (v_opt2_nic,    v_prod2, '니코틴함량', 0),
    (v_opt2_flavor, v_prod2, '맛',        1);

  INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "sortOrder") VALUES
    (v_oval2_9mg,     v_opt2_nic,    '9.8mg', 0),
    (v_oval2_20mg,    v_opt2_nic,    '20mg',  1),
    (v_oval2_mint,    v_opt2_flavor, '민트',  0),
    (v_oval2_tobacco, v_opt2_flavor, '담배',  1),
    (v_oval2_fruit,   v_opt2_flavor, '과일',  2);

  -- 6 variants: 9.8mg x (민트,담배,과일), 20mg x (민트,담배,과일)
  -- stocks: [30, 20, 25, 15, 40, 10]
  INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "stock", "isActive") VALUES
    (v_var2_9mg_mint,    v_prod2, 'SALT-LIQ-9.8mg-민트',  15000, 30, TRUE),
    (v_var2_9mg_tobacco, v_prod2, 'SALT-LIQ-9.8mg-담배',  15000, 20, TRUE),
    (v_var2_9mg_fruit,   v_prod2, 'SALT-LIQ-9.8mg-과일',  15000, 25, TRUE),
    (v_var2_20mg_mint,   v_prod2, 'SALT-LIQ-20mg-민트',   15000, 15, TRUE),
    (v_var2_20mg_tobacco,v_prod2, 'SALT-LIQ-20mg-담배',   15000, 40, TRUE),
    (v_var2_20mg_fruit,  v_prod2, 'SALT-LIQ-20mg-과일',   15000, 10, TRUE);

  INSERT INTO "VariantOptionValue" ("variantId", "optionValueId") VALUES
    (v_var2_9mg_mint,     v_oval2_9mg),
    (v_var2_9mg_mint,     v_oval2_mint),
    (v_var2_9mg_tobacco,  v_oval2_9mg),
    (v_var2_9mg_tobacco,  v_oval2_tobacco),
    (v_var2_9mg_fruit,    v_oval2_9mg),
    (v_var2_9mg_fruit,    v_oval2_fruit),
    (v_var2_20mg_mint,    v_oval2_20mg),
    (v_var2_20mg_mint,    v_oval2_mint),
    (v_var2_20mg_tobacco, v_oval2_20mg),
    (v_var2_20mg_tobacco, v_oval2_tobacco),
    (v_var2_20mg_fruit,   v_oval2_20mg),
    (v_var2_20mg_fruit,   v_oval2_fruit);

  -- Product 3: JUUL 호환 팟 카트리지
  INSERT INTO "Product" (
    "id", "name", "slug", "description", "categoryId",
    "basePrice", "badges",
    "isActive", "isAdult", "isRestricted", "sortOrder", "createdAt", "updatedAt"
  ) VALUES (
    v_prod3,
    'JUUL 호환 팟 카트리지',
    'juul-compatible-pod',
    'JUUL 기기와 완벽하게 호환되는 프리미엄 팟 카트리지.',
    v_cat_pods,
    8000, 'BEST',
    TRUE, TRUE, FALSE, 3, v_now, v_now
  );

  INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder") VALUES
    (gen_random_uuid()::TEXT, v_prod3, '/images/products/product-3-1.jpg', 'JUUL 호환 팟 카트리지 메인', 0),
    (gen_random_uuid()::TEXT, v_prod3, '/images/products/product-3-2.jpg', 'JUUL 호환 팟 카트리지 상세', 1);

  INSERT INTO "ProductOption" ("id", "productId", "name", "sortOrder") VALUES
    (v_opt3_flavor, v_prod3, '맛', 0);

  -- flavors3 = ['쿨민트', '리치라이치', '골든토바코', '클래식'], stocks3 = [45, 30, 60, 25]
  INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "sortOrder") VALUES
    (v_oval3_coolmint, v_opt3_flavor, '쿨민트',    0),
    (v_oval3_lychee,   v_opt3_flavor, '리치라이치', 1),
    (v_oval3_tobacco,  v_opt3_flavor, '골든토바코', 2),
    (v_oval3_classic,  v_opt3_flavor, '클래식',    3);

  INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "stock", "isActive") VALUES
    (v_var3_coolmint, v_prod3, 'JUUL-POD-쿨민트',    8000, 45, TRUE),
    (v_var3_lychee,   v_prod3, 'JUUL-POD-리치라이치', 8000, 30, TRUE),
    (v_var3_tobacco,  v_prod3, 'JUUL-POD-골든토바코', 8000, 60, TRUE),
    (v_var3_classic,  v_prod3, 'JUUL-POD-클래식',    8000, 25, TRUE);

  INSERT INTO "VariantOptionValue" ("variantId", "optionValueId") VALUES
    (v_var3_coolmint, v_oval3_coolmint),
    (v_var3_lychee,   v_oval3_lychee),
    (v_var3_tobacco,  v_oval3_tobacco),
    (v_var3_classic,  v_oval3_classic);

  -- Product 4: 무니코틴 프리미엄 액상
  INSERT INTO "Product" (
    "id", "name", "slug", "description", "categoryId",
    "basePrice", "badges",
    "isActive", "isAdult", "isRestricted", "sortOrder", "createdAt", "updatedAt"
  ) VALUES (
    v_prod4,
    '무니코틴 프리미엄 액상',
    'nicotine-free-premium-liquid',
    '니코틴 없는 프리미엄 액상. 풍부한 과일향으로 즐기는 건강한 베이핑.',
    v_cat_nicotine_free,
    12000, 'NEW',
    TRUE, TRUE, FALSE, 4, v_now, v_now
  );

  INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder") VALUES
    (gen_random_uuid()::TEXT, v_prod4, '/images/products/product-4-1.jpg', '무니코틴 프리미엄 액상 메인', 0),
    (gen_random_uuid()::TEXT, v_prod4, '/images/products/product-4-2.jpg', '무니코틴 프리미엄 액상 상세', 1);

  INSERT INTO "ProductOption" ("id", "productId", "name", "sortOrder") VALUES
    (v_opt4_volume, v_prod4, '용량', 0),
    (v_opt4_flavor, v_prod4, '맛',   1);

  -- volumes4 = ['30ml','60ml'], flavors4 = ['블루베리','멜론','복숭아']
  -- volumePrices4 = [12000, 20000], stocks4 = [20,15,30,10,25,18]
  INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "sortOrder") VALUES
    (v_oval4_30ml,      v_opt4_volume, '30ml',   0),
    (v_oval4_60ml,      v_opt4_volume, '60ml',   1),
    (v_oval4_blueberry, v_opt4_flavor, '블루베리', 0),
    (v_oval4_melon,     v_opt4_flavor, '멜론',    1),
    (v_oval4_peach,     v_opt4_flavor, '복숭아',  2);

  INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "stock", "isActive") VALUES
    (v_var4_30ml_blueberry, v_prod4, 'NF-LIQ-30ml-블루베리', 12000, 20, TRUE),
    (v_var4_30ml_melon,     v_prod4, 'NF-LIQ-30ml-멜론',    12000, 15, TRUE),
    (v_var4_30ml_peach,     v_prod4, 'NF-LIQ-30ml-복숭아',  12000, 30, TRUE),
    (v_var4_60ml_blueberry, v_prod4, 'NF-LIQ-60ml-블루베리', 20000, 10, TRUE),
    (v_var4_60ml_melon,     v_prod4, 'NF-LIQ-60ml-멜론',    20000, 25, TRUE),
    (v_var4_60ml_peach,     v_prod4, 'NF-LIQ-60ml-복숭아',  20000, 18, TRUE);

  INSERT INTO "VariantOptionValue" ("variantId", "optionValueId") VALUES
    (v_var4_30ml_blueberry, v_oval4_30ml),
    (v_var4_30ml_blueberry, v_oval4_blueberry),
    (v_var4_30ml_melon,     v_oval4_30ml),
    (v_var4_30ml_melon,     v_oval4_melon),
    (v_var4_30ml_peach,     v_oval4_30ml),
    (v_var4_30ml_peach,     v_oval4_peach),
    (v_var4_60ml_blueberry, v_oval4_60ml),
    (v_var4_60ml_blueberry, v_oval4_blueberry),
    (v_var4_60ml_melon,     v_oval4_60ml),
    (v_var4_60ml_melon,     v_oval4_melon),
    (v_var4_60ml_peach,     v_oval4_60ml),
    (v_var4_60ml_peach,     v_oval4_peach);

  -- Product 5: 전자담배 휴대용 파우치
  INSERT INTO "Product" (
    "id", "name", "slug", "description", "categoryId",
    "basePrice",
    "isActive", "isAdult", "isRestricted", "sortOrder", "createdAt", "updatedAt"
  ) VALUES (
    v_prod5,
    '전자담배 휴대용 파우치',
    'vape-portable-pouch',
    '전자담배와 액상을 함께 보관할 수 있는 실용적인 파우치.',
    v_cat_lifestyle,
    9900,
    TRUE, FALSE, FALSE, 5, v_now, v_now
  );

  INSERT INTO "ProductImage" ("id", "productId", "url", "alt", "sortOrder") VALUES
    (gen_random_uuid()::TEXT, v_prod5, '/images/products/product-5-1.jpg', '전자담배 휴대용 파우치 메인', 0),
    (gen_random_uuid()::TEXT, v_prod5, '/images/products/product-5-2.jpg', '전자담배 휴대용 파우치 상세', 1);

  INSERT INTO "ProductOption" ("id", "productId", "name", "sortOrder") VALUES
    (v_opt5_color, v_prod5, '컬러', 0);

  -- colors5 = ['블랙','네이비'], stocks5 = [80,60]
  INSERT INTO "ProductOptionValue" ("id", "optionId", "value", "sortOrder") VALUES
    (v_oval5_black, v_opt5_color, '블랙',  0),
    (v_oval5_navy,  v_opt5_color, '네이비', 1);

  INSERT INTO "ProductVariant" ("id", "productId", "sku", "price", "stock", "isActive") VALUES
    (v_var5_black, v_prod5, 'POUCH-블랙',  9900, 80, TRUE),
    (v_var5_navy,  v_prod5, 'POUCH-네이비', 9900, 60, TRUE);

  INSERT INTO "VariantOptionValue" ("variantId", "optionValueId") VALUES
    (v_var5_black, v_oval5_black),
    (v_var5_navy,  v_oval5_navy);

  -- ─────────────────────────────────────────────
  -- 9. Customers
  -- ─────────────────────────────────────────────
  INSERT INTO "Customer" (
    "id", "email", "name", "provider", "providerId",
    "ageVerified", "ageVerifiedAt", "ageVerifyMethod",
    "gradeId", "createdAt", "updatedAt"
  ) VALUES
    (v_cust1, 'test@naver.com',  '김철수', 'naver', 'naver_user_001', TRUE, v_now, 'PASS', v_grade_silver, v_now, v_now),
    (v_cust2, 'test2@naver.com', '이영희', 'kakao', 'kakao_user_002', TRUE, v_now, 'PASS', v_grade_normal, v_now, v_now),
    (v_cust3, 'test3@naver.com', '박지민', 'naver', 'naver_user_003', TRUE, v_now, 'PASS', v_grade_gold,   v_now, v_now);

  -- ─────────────────────────────────────────────
  -- 10. Orders
  -- ─────────────────────────────────────────────

  -- Order 1: AWAITING_DEPOSIT (customer1, relx variant = v_var1_black, first variant)
  INSERT INTO "Order" (
    "id", "orderNumber", "customerId", "status",
    "subtotal", "shippingFee", "discountAmount", "totalAmount",
    "shippingAddress", "createdAt", "updatedAt"
  ) VALUES (
    v_order1,
    'ORD-20260101-001',
    v_cust1,
    'AWAITING_DEPOSIT'::"OrderStatus",
    35000, 2500, 0, 37500,
    '{"recipient":"김철수","phone":"010-1234-5678","zipCode":"12345","address1":"경기도 수원시 영통구 매탄동","address2":"101동 501호"}'::JSONB,
    v_now, v_now
  );

  INSERT INTO "OrderItem" (
    "id", "orderId", "productId", "variantId",
    "productName", "variantName", "price", "quantity", "subtotal"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order1, v_prod1, v_var1_black,
    'RELX 인피니티 플러스 기기', '블랙',
    35000, 1, 35000
  );

  INSERT INTO "Payment" (
    "id", "orderId", "method", "amount", "status",
    "bankName", "accountNumber", "depositorName", "depositDeadline",
    "createdAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order1,
    'BANK_TRANSFER'::"PaymentMethod",
    37500,
    'AWAITING_DEPOSIT'::"PaymentStatus",
    '국민은행',
    '123456-78-901234',
    '김철수',
    v_now + INTERVAL '3 days',
    v_now
  );

  -- Order 2: PAID (customer2, salt variant = v_var2_9mg_mint)
  INSERT INTO "Order" (
    "id", "orderNumber", "customerId", "status",
    "subtotal", "shippingFee", "discountAmount", "totalAmount",
    "shippingAddress", "createdAt", "updatedAt"
  ) VALUES (
    v_order2,
    'ORD-20260102-001',
    v_cust2,
    'PAID'::"OrderStatus",
    30000, 0, 0, 30000,
    '{"recipient":"이영희","phone":"010-9876-5432","zipCode":"54321","address1":"서울특별시 강남구 역삼동","address2":"202동 302호"}'::JSONB,
    v_now, v_now
  );

  INSERT INTO "OrderItem" (
    "id", "orderId", "productId", "variantId",
    "productName", "variantName", "price", "quantity", "subtotal"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order2, v_prod2, v_var2_9mg_mint,
    '솔트 니코틴 액상 30ml', '9.8mg / 민트',
    15000, 2, 30000
  );

  INSERT INTO "Payment" (
    "id", "orderId", "method", "amount", "status",
    "pgProvider", "pgTxId", "paidAt",
    "createdAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order2,
    'KAKAOPAY'::"PaymentMethod",
    30000,
    'COMPLETED'::"PaymentStatus",
    'kakaopay',
    'KAKAO-TX-20260102-001',
    v_now,
    v_now
  );

  -- Order 3: DELIVERED (customer3, juul variant = v_var3_coolmint)
  INSERT INTO "Order" (
    "id", "orderNumber", "customerId", "status",
    "subtotal", "shippingFee", "discountAmount", "totalAmount",
    "shippingAddress", "createdAt", "updatedAt"
  ) VALUES (
    v_order3,
    'ORD-20260103-001',
    v_cust3,
    'DELIVERED'::"OrderStatus",
    24000, 2500, 0, 26500,
    '{"recipient":"박지민","phone":"010-5555-7777","zipCode":"67890","address1":"부산광역시 해운대구 우동","address2":"303동 101호"}'::JSONB,
    v_now, v_now
  );

  INSERT INTO "OrderItem" (
    "id", "orderId", "productId", "variantId",
    "productName", "variantName", "price", "quantity", "subtotal"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order3, v_prod3, v_var3_coolmint,
    'JUUL 호환 팟 카트리지', '쿨민트',
    8000, 3, 24000
  );

  INSERT INTO "Payment" (
    "id", "orderId", "method", "amount", "status",
    "pgProvider", "pgTxId", "paidAt",
    "createdAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order3,
    'TOSSPAY'::"PaymentMethod",
    26500,
    'COMPLETED'::"PaymentStatus",
    'tosspay',
    'TOSS-TX-20260103-001',
    v_now - INTERVAL '7 days',
    v_now
  );

  INSERT INTO "Shipment" (
    "id", "orderId", "carrier", "trackingNumber", "status",
    "shippedAt", "deliveredAt", "createdAt", "updatedAt"
  ) VALUES (
    gen_random_uuid()::TEXT,
    v_order3,
    '우체국택배',
    '1234567890',
    'DELIVERED'::"ShipmentStatus",
    v_now - INTERVAL '6 days',
    v_now - INTERVAL '4 days',
    v_now,
    v_now
  );

  -- ─────────────────────────────────────────────
  -- 11. Banners
  -- ─────────────────────────────────────────────
  INSERT INTO "Banner" ("id", "title", "imageUrl", "linkUrl", "position", "sortOrder", "isActive") VALUES
    (gen_random_uuid()::TEXT, '신규 회원 10% 할인',  '/images/banners/hero-1.jpg', '/signup',                  'HERO'::"BannerPosition", 0, TRUE),
    (gen_random_uuid()::TEXT, '봄맞이 특가전',       '/images/banners/hero-2.jpg', '/collections/sale',         'HERO'::"BannerPosition", 1, TRUE),
    (gen_random_uuid()::TEXT, '무니코틴 라인업 출시', '/images/banners/hero-3.jpg', '/category/nicotine-free',   'HERO'::"BannerPosition", 2, TRUE);

END $$;

COMMIT;
