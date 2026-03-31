"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Package,
} from "lucide-react";
import { deleteProduct, toggleProductStatus } from "./actions";
import type { Category } from "@/generated/prisma/client";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  isActive: boolean;
  createdAt: Date;
  category: Category | null;
  thumbnailUrl: string | null;
  totalStock: number;
  variantCount: number;
}

interface Props {
  products: ProductItem[];
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  initialSearch: string;
  initialCategory: string;
  initialStatus: string;
}

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ProductListClient({
  products,
  categories,
  total,
  page,
  totalPages,
  limit,
  initialSearch,
  initialCategory,
  initialStatus,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.category) sp.set("category", params.category);
    if (params.status) sp.set("status", params.status);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    const qs = sp.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  function navigate(overrides: Record<string, string>) {
    const merged = {
      search: initialSearch,
      category: initialCategory,
      status: initialStatus,
      page: "1",
      ...overrides,
    };
    startTransition(() => {
      router.push(buildUrl(merged));
    });
  }

  let searchTimeout: ReturnType<typeof setTimeout>;

  function handleSearch(value: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      navigate({ search: value, page: "1" });
    }, 300);
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;
    await deleteProduct(id);
  }

  async function handleToggle(id: string, current: boolean) {
    await toggleProductStatus(id, !current);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="상품명 검색..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={initialCategory}
            onChange={(e) => navigate({ category: e.target.value })}
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 카테고리</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={initialStatus}
            onChange={(e) => navigate({ status: e.target.value })}
            className="h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`bg-white rounded-xl border border-slate-200 ${isPending ? "opacity-60" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-500 uppercase w-[60px]">
                이미지
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                상품명
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                카테고리
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-right">
                판매가
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">
                재고
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase text-center">
                상태
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                등록일
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-500 uppercase w-[60px]">
                액션
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                    {product.thumbnailUrl ? (
                      <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {product.variantCount}개 옵션
                  </p>
                </TableCell>
                <TableCell>
                  {product.category ? (
                    <Badge variant="secondary" className="text-xs">
                      {product.category.name}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">미지정</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatPrice(product.basePrice)}
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`text-sm font-medium tabular-nums ${
                      product.totalStock === 0
                        ? "text-red-500"
                        : product.totalStock < 10
                          ? "text-amber-500"
                          : "text-slate-700"
                    }`}
                  >
                    {product.totalStock}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                      product.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {product.isActive ? "활성" : "비활성"}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(product.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          router.push(`/admin/products/${product.id}`)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleToggle(product.id, product.isActive)
                        }
                      >
                        {product.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            비활성화
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            활성화
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-slate-400 py-12"
                >
                  <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <span className="text-sm text-slate-500">
              {total}건 중 {(page - 1) * limit + 1}–
              {Math.min(page * limit, total)}건
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === 1}
                onClick={() => navigate({ page: String(page - 1) })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page === totalPages}
                onClick={() => navigate({ page: String(page + 1) })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
