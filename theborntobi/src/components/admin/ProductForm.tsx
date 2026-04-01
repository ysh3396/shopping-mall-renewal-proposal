"use client";

import { useState, useTransition, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  X,
  Trash2,
  GripVertical,
  ImagePlus,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { createProduct, updateProduct } from "@/app/(admin)/admin/products/actions";
import { uploadImage } from "@/app/(admin)/admin/products/upload-action";
import type { Category } from "@/generated/prisma/client";

// ─── Types ───────────────────────────────────────────

interface OptionAxis {
  name: string;
  values: string[];
}

interface VariantRow {
  combination: string;
  optionValueIndices: number[];
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
}

interface ImageEntry {
  url: string;
  alt: string;
}

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  detailHtml?: string | null;
  categoryId?: string | null;
  basePrice: number;
  comparePrice?: number | null;
  costPrice?: number | null;
  badges?: string | null;
  isActive: boolean;
  isAdult: boolean;
  images: { url: string; alt?: string | null; sortOrder: number }[];
  options: {
    name: string;
    sortOrder: number;
    values: { value: string; sortOrder: number }[];
  }[];
  variants: {
    sku?: string | null;
    price: number;
    stock: number;
    isActive: boolean;
    optionValues: {
      optionValue: {
        value: string;
        option: { name: string };
      };
    }[];
  }[];
}

interface Props {
  categories: Category[];
  product?: ProductData | null;
}

const BADGE_OPTIONS = [
  { value: "SALE", label: "SALE" },
  { value: "BEST", label: "BEST" },
  { value: "HOT", label: "HOT" },
  { value: "NEW", label: "NEW" },
];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[가-힣]+/g, (m) => m)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Component ───────────────────────────────────────

export function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!product?.id;

  // Basic info
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugManual, setSlugManual] = useState(false);
  const [description, setDescription] = useState(product?.description ?? "");
  const [detailHtml, setDetailHtml] = useState(product?.detailHtml ?? "");

  // Pricing
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 0);
  const [comparePrice, setComparePrice] = useState(product?.comparePrice ?? 0);
  const [costPrice, setCostPrice] = useState(product?.costPrice ?? 0);

  // Category & Status
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isAdult, setIsAdult] = useState(product?.isAdult ?? true);
  const [badges, setBadges] = useState<string[]>(
    product?.badges ? product.badges.split(",").filter(Boolean) : []
  );

  // Images
  const [images, setImages] = useState<ImageEntry[]>(
    product?.images?.map((img) => ({ url: img.url, alt: img.alt ?? "" })) ?? []
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // Options (multi-axis)
  const [options, setOptions] = useState<OptionAxis[]>(() => {
    if (product?.options?.length) {
      return product.options.map((o) => ({
        name: o.name,
        values: o.values.map((v) => v.value),
      }));
    }
    return [];
  });

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>(() => {
    if (product?.variants?.length && product.options?.length) {
      return product.variants.map((v) => {
        const combo = v.optionValues
          .map((ov) => ov.optionValue.value)
          .join(" / ");
        return {
          combination: combo,
          optionValueIndices: [],
          sku: (v.sku as string) ?? "",
          price: v.price,
          stock: v.stock,
          isActive: v.isActive,
        };
      });
    }
    return [];
  });

  const [optionInputValues, setOptionInputValues] = useState<string[]>(
    options.map(() => "")
  );

  // Error
  const [error, setError] = useState("");

  // ─── Name -> Slug auto-generation ───────────────

  function handleNameChange(val: string) {
    setName(val);
    if (!slugManual) {
      setSlug(toSlug(val));
    }
  }

  // ─── Option Management ─────────────────────────

  function addOption() {
    setOptions([...options, { name: "", values: [] }]);
    setOptionInputValues([...optionInputValues, ""]);
  }

  function removeOption(idx: number) {
    const next = options.filter((_, i) => i !== idx);
    setOptions(next);
    setOptionInputValues(optionInputValues.filter((_, i) => i !== idx));
    regenerateVariants(next);
  }

  function updateOptionName(idx: number, name: string) {
    const next = [...options];
    next[idx] = { ...next[idx], name };
    setOptions(next);
  }

  function addOptionValue(optIdx: number, value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (options[optIdx].values.includes(trimmed)) return;

    const next = [...options];
    next[optIdx] = {
      ...next[optIdx],
      values: [...next[optIdx].values, trimmed],
    };
    setOptions(next);
    regenerateVariants(next);
  }

  function removeOptionValue(optIdx: number, valIdx: number) {
    const next = [...options];
    next[optIdx] = {
      ...next[optIdx],
      values: next[optIdx].values.filter((_, i) => i !== valIdx),
    };
    setOptions(next);
    regenerateVariants(next);
  }

  function handleOptionInputKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    optIdx: number
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      addOptionValue(optIdx, optionInputValues[optIdx]);
      const next = [...optionInputValues];
      next[optIdx] = "";
      setOptionInputValues(next);
    }
  }

  // ─── Variant Matrix Generation ──────────────────

  const regenerateVariants = useCallback(
    (opts: OptionAxis[]) => {
      const validOpts = opts.filter(
        (o) => o.name.trim() && o.values.length > 0
      );

      if (validOpts.length === 0) {
        setVariants([]);
        return;
      }

      // Generate cartesian product
      function cartesian(arrays: string[][]): string[][] {
        return arrays.reduce<string[][]>(
          (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
          [[]]
        );
      }

      const valueArrays = validOpts.map((o) => o.values);
      const combos = cartesian(valueArrays);

      // Build a flat index map: for each option axis, track the global index of each value
      let globalIdx = 0;
      const indexMap: number[][] = [];
      for (const opt of opts) {
        const indices: number[] = [];
        for (let i = 0; i < opt.values.length; i++) {
          indices.push(globalIdx++);
        }
        indexMap.push(indices);
      }

      const newVariants: VariantRow[] = combos.map((combo) => {
        const combination = combo.join(" / ");

        // Find matching existing variant to preserve edits
        const existing = variants.find((v) => v.combination === combination);

        // Map combo values to global indices
        const optionValueIndices: number[] = [];
        const validOptIndices = opts
          .map((o, i) => ({ opt: o, origIdx: i }))
          .filter((x) => x.opt.name.trim() && x.opt.values.length > 0);

        combo.forEach((val, comboIdx) => {
          const origIdx = validOptIndices[comboIdx].origIdx;
          const valIdx = opts[origIdx].values.indexOf(val);
          if (indexMap[origIdx] && valIdx >= 0) {
            optionValueIndices.push(indexMap[origIdx][valIdx]);
          }
        });

        return {
          combination,
          optionValueIndices,
          sku: existing?.sku ?? "",
          price: existing?.price ?? basePrice,
          stock: existing?.stock ?? 0,
          isActive: existing?.isActive ?? true,
        };
      });

      setVariants(newVariants);
    },
    [variants, basePrice]
  );

  function updateVariant(idx: number, field: keyof VariantRow, value: unknown) {
    const next = [...variants];
    next[idx] = { ...next[idx], [field]: value };
    setVariants(next);
  }

  // ─── Image Management ──────────────────────────

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function addImage() {
    const trimmed = newImageUrl.trim();
    if (!trimmed) return;
    setImages([...images, { url: trimmed, alt: "" }]);
    setNewImageUrl("");
  }

  function removeImage(idx: number) {
    setImages(images.filter((_, i) => i !== idx));
  }

  async function handleFileUpload(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    const newImages: ImageEntry[] = [];

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);

      if (result.error) {
        setUploadError(result.error);
        break;
      }
      if (result.url) {
        newImages.push({ url: result.url, alt: "" });
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
    setIsUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  // ─── Badge toggle ──────────────────────────────

  function toggleBadge(badge: string) {
    setBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : [...prev, badge]
    );
  }

  // ─── Submit ────────────────────────────────────

  function handleSubmit() {
    setError("");

    if (!name.trim()) {
      setError("상품명을 입력해주세요.");
      return;
    }
    if (!slug.trim()) {
      setError("슬러그를 입력해주세요.");
      return;
    }
    if (basePrice <= 0) {
      setError("판매가를 입력해주세요.");
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      detailHtml: detailHtml.trim(),
      categoryId: categoryId || undefined,
      basePrice,
      comparePrice: comparePrice || undefined,
      costPrice: costPrice || undefined,
      badges: badges.join(",") || undefined,
      isActive,
      isAdult,
      images: images.map((img, i) => ({
        url: img.url,
        alt: img.alt || undefined,
        sortOrder: i,
      })),
      options: options
        .filter((o) => o.name.trim() && o.values.length > 0)
        .map((o, i) => ({
          name: o.name.trim(),
          sortOrder: i,
          values: o.values.map((v, vi) => ({
            value: v,
            sortOrder: vi,
          })),
        })),
      variants: variants.map((v) => ({
        sku: v.sku || undefined,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
        optionValueIndices: v.optionValueIndices,
      })),
    };

    startTransition(async () => {
      try {
        if (isEdit && product?.id) {
          await updateProduct(product.id, JSON.stringify(payload));
        } else {
          await createProduct(JSON.stringify(payload));
        }
      } catch (e) {
        if (e instanceof Error && e.message !== "NEXT_REDIRECT") {
          setError(e.message || "저장 중 오류가 발생했습니다.");
        }
      }
    });
  }

  // ─── Render ────────────────────────────────────

  return (
    <div className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Section 1: Basic Info */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">상품명 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="상품명을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">슬러그 *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlugManual(true);
                setSlug(e.target.value);
              }}
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-slate-400">
              URL에 사용됩니다. 자동 생성되며 직접 수정할 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품 간단 설명"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detailHtml">상세 설명</Label>
            <Textarea
              id="detailHtml"
              value={detailHtml}
              onChange={(e) => setDetailHtml(e.target.value)}
              placeholder="상품 상세 설명 (HTML 가능)"
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Pricing */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>가격 설정</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">판매가 *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₩
                </span>
                <Input
                  id="basePrice"
                  type="number"
                  value={basePrice || ""}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comparePrice">비교가 (할인 전)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₩
                </span>
                <Input
                  id="comparePrice"
                  type="number"
                  value={comparePrice || ""}
                  onChange={(e) => setComparePrice(Number(e.target.value))}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">원가</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₩
                </span>
                <Input
                  id="costPrice"
                  type="number"
                  value={costPrice || ""}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Category & Status */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>카테고리 및 상태</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label className="cursor-pointer">상품 활성화</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isAdult}
                onCheckedChange={setIsAdult}
              />
              <Label className="cursor-pointer">성인상품</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>뱃지</Label>
            <div className="flex items-center gap-4">
              {BADGE_OPTIONS.map((badge) => (
                <label
                  key={badge.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={badges.includes(badge.value)}
                    onCheckedChange={() => toggleBadge(badge.value)}
                  />
                  <span className="text-sm">{badge.label}</span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Product Options (Multi-Axis) */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <span>상품 옵션</span>
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
            >
              <Plus className="w-4 h-4" />
              옵션 추가
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {options.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              옵션을 추가하면 옵션 조합으로 상품 옵션(Variant)이 자동 생성됩니다.
            </p>
          )}

          {options.map((opt, optIdx) => (
            <div
              key={optIdx}
              className="border border-slate-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <Input
                  value={opt.name}
                  onChange={(e) => updateOptionName(optIdx, e.target.value)}
                  placeholder='옵션명 (예: "니코틴 함량", "용량")'
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeOption(optIdx)}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {opt.values.map((val, valIdx) => (
                  <span
                    key={valIdx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => removeOptionValue(optIdx, valIdx)}
                      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Value input */}
              <Input
                value={optionInputValues[optIdx] ?? ""}
                onChange={(e) => {
                  const next = [...optionInputValues];
                  next[optIdx] = e.target.value;
                  setOptionInputValues(next);
                }}
                onKeyDown={(e) => handleOptionInputKeyDown(e, optIdx)}
                placeholder="값을 입력하고 Enter (예: 9.8mg, 20mg)"
                className="text-sm"
              />
            </div>
          ))}

          {/* Variant Matrix */}
          {variants.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                옵션 조합 ({variants.length}개)
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-500">
                        조합
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 w-[140px]">
                        SKU
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 w-[120px]">
                        가격
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 w-[100px]">
                        재고
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 w-[60px] text-center">
                        활성
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((v, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-sm font-medium text-slate-700">
                          {v.combination}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={v.sku}
                            onChange={(e) =>
                              updateVariant(idx, "sku", e.target.value)
                            }
                            placeholder="SKU"
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={v.price || ""}
                            onChange={(e) =>
                              updateVariant(
                                idx,
                                "price",
                                Number(e.target.value)
                              )
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={v.stock || ""}
                            onChange={(e) =>
                              updateVariant(
                                idx,
                                "stock",
                                Number(e.target.value)
                              )
                            }
                            className="h-7 text-xs"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={v.isActive}
                            onCheckedChange={(val) =>
                              updateVariant(idx, "isActive", val)
                            }
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 5: Images */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>상품 이미지</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Drag & drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-blue-400 bg-blue-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                if (e.target.files) handleFileUpload(e.target.files);
                e.target.value = "";
              }}
            />
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <p className="text-sm text-slate-500">업로드 중...</p>
                </>
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-slate-400">
                    JPG, PNG, WebP, GIF (최대 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <p className="text-sm text-red-500">{uploadError}</p>
          )}

          {/* Image list */}
          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg"
                >
                  <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                  <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="flex-1 text-sm text-slate-600 truncate">
                    {img.url}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeImage(idx)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* URL manual input (fallback) */}
          <details className="text-sm">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-600">
              URL로 직접 추가
            </summary>
            <div className="flex items-center gap-2 mt-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImage();
                  }
                }}
                placeholder="이미지 URL을 입력하세요"
                className="flex-1"
              />
              <Button variant="outline" onClick={addImage}>
                <ImagePlus className="w-4 h-4" />
                추가
              </Button>
            </div>
          </details>
          <p className="text-xs text-slate-400">
            파일을 업로드하면 Supabase Storage에 자동 저장됩니다.
          </p>
        </CardContent>
      </Card>

      {/* Section 6: Submit */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          <ArrowLeft className="w-4 h-4" />
          취소
        </Button>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white min-w-[120px]"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </div>
  );
}
