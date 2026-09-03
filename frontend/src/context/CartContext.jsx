import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mjc_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      const maxQty = product.stock ?? 99;
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, maxQty) }
            : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.images?.[0]?.url || "",
          quantity: Math.min(quantity, maxQty),
          maxQty,
        },
      ];
    });
    setIsOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQty ?? 99)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount,
    isOpen,
    setIsOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
