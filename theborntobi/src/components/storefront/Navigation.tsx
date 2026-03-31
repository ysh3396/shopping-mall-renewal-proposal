import Link from "next/link";
import { db } from "@/lib/db";

export default async function Navigation() {
  let categories: { id: string; name: string; slug: string }[] = [];

  try {
    categories = await db.category.findMany({
      where: { isActive: true, isRestricted: false, parentId: null },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch {
    // DB connection not available yet - show static fallback
    categories = [
      { id: "1", name: "기기&악세사리", slug: "devices" },
      { id: "2", name: "팟/카트리지/코일", slug: "pods" },
      { id: "3", name: "무니코틴", slug: "nicotine-free" },
      { id: "4", name: "생활용품", slug: "lifestyle" },
      { id: "5", name: "앵그리", slug: "angry" },
      { id: "6", name: "기성 액상", slug: "ready-liquid" },
      { id: "7", name: "모드 액상", slug: "mod-liquid" },
    ];
  }

  return (
    <nav className="border-t border-gray-200 bg-white hidden md:block">
      <div className="max-w-screen-xl mx-auto px-4">
        <ul className="flex items-center gap-0">
          <li>
            <Link
              href="/"
              className="relative block px-4 py-3 text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 after:scale-x-0 after:transition-transform hover:after:scale-x-100"
            >
              HOME
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="relative block px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gray-900 after:scale-x-0 after:transition-transform hover:after:scale-x-100"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
