"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, CartAddOn, WCProduct } from "@/types/woocommerce";

function addOnsMatch(a?: CartAddOn[], b?: CartAddOn[]): boolean {
  const aSorted = (a || []).map((x) => x.name).sort().join(",");
  const bSorted = (b || []).map((x) => x.name).sort().join(",");
  return aSorted === bSorted;
}

interface CartStore {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (product: WCProduct, quantity?: number, addOns?: CartAddOn[]) => void;
  removeItem: (productId: number, addOns?: CartAddOn[]) => void;
  updateQuantity: (productId: number, quantity: number, addOns?: CartAddOn[]) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (product, quantity = 1, addOns) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && addOnsMatch(item.addOns, addOns)
          );
          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems, isDrawerOpen: true };
          }
          return {
            items: [...state.items, { product, quantity, addOns: addOns?.length ? addOns : undefined }],
            isDrawerOpen: true,
          };
        });
      },

      removeItem: (productId, addOns) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && addOnsMatch(item.addOns, addOns))
          ),
        }));
      },

      updateQuantity: (productId, quantity, addOns) => {
        if (quantity <= 0) {
          get().removeItem(productId, addOns);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && addOnsMatch(item.addOns, addOns)
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const productTotal = parseFloat(item.product.price) * item.quantity;
          const addOnsTotal = (item.addOns || []).reduce((sum, a) => sum + a.price, 0) * item.quantity;
          return total + productTotal + addOnsTotal;
        }, 0);
      },
    }),
    {
      name: "beyond-gaming-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
