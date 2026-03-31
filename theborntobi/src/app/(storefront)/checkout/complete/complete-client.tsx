"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart";

export default function CompleteClient() {
  useEffect(() => {
    clearCart();
  }, []);

  return null;
}
