"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { FulfilmentMode } from "@/lib/types";

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  category: string;
  fabric: "merino" | "lyocell";
  composition: string;
  size: string;
  colour: string;
  colourHex: string;
  imageUrl?: string | null;
  qty: number;
  unitPrice: number;
  fulfilment: FulfilmentMode;
  customDesignId?: string;
  customSummary?: string;
}

interface CartContextValue {
  lines: CartLine[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "key">) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "butterfly-cart-v1";

export function lineKey(line: Omit<CartLine, "key">) {
  return [line.productId, line.size, line.colour, line.customDesignId ?? "standard"].join("::");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) setLines(parsed.filter((line) => line && line.productId));
      }
    } catch {
      /* corrupt cart: start empty */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, ready]);

  const add = useCallback((incoming: Omit<CartLine, "key">) => {
    const key = lineKey(incoming);
    setLines((current) => {
      const existing = current.find((line) => line.key === key);
      if (existing) {
        return current.map((line) =>
          line.key === key ? { ...line, qty: Math.min(line.qty + incoming.qty, 20) } : line,
        );
      }
      return [...current, { ...incoming, key }];
    });
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, qty: Math.max(1, Math.min(qty, 20)) } : line)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    return { lines, ready, count, subtotal, add, remove, setQty, clear };
  }, [lines, ready, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
