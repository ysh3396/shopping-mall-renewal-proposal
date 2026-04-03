"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { getCart, type CartItem } from "@/lib/cart";

function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartDrawer({ open, onOpenChange }: Props) {
  const items: CartItem[] = useMemo(() => (open ? getCart() : []), [open]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2">
            장바구니
            {itemCount > 0 && (
              <span className="text-xs font-bold bg-gray-900 text-white rounded-full px-2 py-0.5">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">장바구니가 비어있습니다</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                    <Image
                      src={item.image || "/placeholder-product.png"}
                      alt={item.productName}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {item.variantName}
                    </p>
                    <p className="text-xs font-bold text-gray-900 mt-1">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SheetFooter className="border-t border-gray-100 p-4 flex flex-col gap-3">
          {items.length > 0 && (
            <div className="flex justify-between text-sm font-bold">
              <span>합계</span>
              <span>{formatPrice(total)}</span>
            </div>
          )}
          <Link
            href="/cart"
            onClick={() => onOpenChange(false)}
            className="block w-full text-center py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
          >
            장바구니 보기
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
