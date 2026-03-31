// Client-side cart management using localStorage

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
};

const CART_KEY = "theborntobi_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(item: CartItem): void {
  const cart = getCart();
  const existing = cart.findIndex((i) => i.variantId === item.variantId);
  if (existing >= 0) {
    cart[existing].quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function updateCartQuantity(variantId: string, quantity: number): void {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.variantId === variantId);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
    saveCart(cart);
  }
}

export function removeFromCart(variantId: string): void {
  const cart = getCart().filter((i) => i.variantId !== variantId);
  saveCart(cart);
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(): number {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
