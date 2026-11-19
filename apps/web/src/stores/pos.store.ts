import { create } from 'zustand';

export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  taxRate: number;
}

export interface PosItem {
  product: PosProduct;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountAmount: number;
  maxDiscountAmount?: number;
  description?: string;
}

function recalculateCart(
  rawCart: PosItem[],
  baseDiscountPct: number,
  appliedCoupon: AppliedCoupon | null
): { cart: PosItem[]; discountPct: number; appliedCoupon: AppliedCoupon | null } {
  const withSubtotals = rawCart.map((item) => {
    const unitPrice = item.unitPrice ?? item.product.price;
    const subtotal = unitPrice * item.quantity;
    const taxRate = item.taxRate ?? item.product.taxRate ?? 21;
    return { ...item, unitPrice, subtotal, taxRate };
  });

  const totalSub = withSubtotals.reduce((sum, it) => sum + it.subtotal, 0);

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'FIXED') {
      const fixedDisc = Math.min(appliedCoupon.discountValue, totalSub);
      const ratio = totalSub > 0 ? fixedDisc / totalSub : 0;
      const newCart = withSubtotals.map((item) => {
        const discount = item.subtotal * ratio;
        const subtotalAfterDiscount = item.subtotal - discount;
        const taxAmount = subtotalAfterDiscount * (item.taxRate / 100);
        const total = subtotalAfterDiscount + taxAmount;
        return { ...item, discount, taxAmount, total };
      });
      return {
        cart: newCart,
        discountPct: Math.round(ratio * 100 * 10) / 10,
        appliedCoupon: { ...appliedCoupon, discountAmount: fixedDisc },
      };
    } else {
      const pct = appliedCoupon.discountValue;
      const rawTotalDisc = totalSub * (pct / 100);
      const cappedDisc =
        appliedCoupon.maxDiscountAmount && rawTotalDisc > appliedCoupon.maxDiscountAmount
          ? appliedCoupon.maxDiscountAmount
          : rawTotalDisc;
      const effectiveRatio =
        appliedCoupon.maxDiscountAmount && rawTotalDisc > appliedCoupon.maxDiscountAmount && totalSub > 0
          ? cappedDisc / totalSub
          : pct / 100;

      const newCart = withSubtotals.map((item) => {
        const discount = item.subtotal * effectiveRatio;
        const subtotalAfterDiscount = item.subtotal - discount;
        const taxAmount = subtotalAfterDiscount * (item.taxRate / 100);
        const total = subtotalAfterDiscount + taxAmount;
        return { ...item, discount, taxAmount, total };
      });
      return {
        cart: newCart,
        discountPct: pct,
        appliedCoupon: { ...appliedCoupon, discountAmount: cappedDisc },
      };
    }
  }

  const pct = Math.max(0, Math.min(100, baseDiscountPct));
  const newCart = withSubtotals.map((item) => {
    const discount = item.subtotal * (pct / 100);
    const subtotalAfterDiscount = item.subtotal - discount;
    const taxAmount = subtotalAfterDiscount * (item.taxRate / 100);
    const total = subtotalAfterDiscount + taxAmount;
    return { ...item, discount, taxAmount, total };
  });

  return {
    cart: newCart,
    discountPct: pct,
    appliedCoupon: null,
  };
}

export interface PosState {
  cart: PosItem[];
  selectedCustomer: any | null;
  selectedWarehouseId: string;
  discountPct: number;
  appliedCoupon: AppliedCoupon | null;
  activeQuoteId: string | null;
  activeQuoteNumber: string | null;

  addItem: (product: PosProduct) => void;
  updateQuantity: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  setCustomer: (customer: any | null) => void;
  setDiscount: (pct: number) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setWarehouse: (id: string) => void;
  loadQuoteToCart: (items: PosItem[], customer?: any, quoteId?: string, quoteNumber?: string) => void;
  clearActiveQuote: () => void;
  clearCart: () => void;

  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getTotalTax: () => number;
  getTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  selectedWarehouseId: '1',
  discountPct: 0,
  appliedCoupon: null,
  activeQuoteId: null,
  activeQuoteNumber: null,

  addItem: (product) => set((state) => {
    const existing = state.cart.find(item => item.product.id === product.id);
    const nextCart: PosItem[] = existing
      ? state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [
          ...state.cart,
          {
            product,
            quantity: 1,
            unitPrice: product.price,
            discount: 0,
            subtotal: product.price,
            taxRate: product.taxRate,
            taxAmount: 0,
            total: 0,
          },
        ];

    return recalculateCart(nextCart, state.discountPct, state.appliedCoupon);
  }),
  
  updateQuantity: (productId, qty) => set((state) => {
    const nextCart =
      qty <= 0
        ? state.cart.filter(item => item.product.id !== productId)
        : state.cart.map(item =>
            item.product.id === productId ? { ...item, quantity: qty } : item
          );
    return recalculateCart(nextCart, state.discountPct, state.appliedCoupon);
  }),

  removeItem: (productId) => set((state) => {
    const nextCart = state.cart.filter(item => item.product.id !== productId);
    return recalculateCart(nextCart, state.discountPct, state.appliedCoupon);
  }),

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  
  setDiscount: (pct) => set((state) => {
    return recalculateCart(state.cart, pct, null);
  }),

  setWarehouse: (id) => set({ selectedWarehouseId: id }),
  
  applyCoupon: (coupon) => set((state) => {
    return recalculateCart(state.cart, state.discountPct, coupon);
  }),

  removeCoupon: () => set((state) => {
    return recalculateCart(state.cart, 0, null);
  }),

  loadQuoteToCart: (items, customer = null, quoteId = undefined, quoteNumber = undefined) => {
    set({
      cart: items,
      selectedCustomer: customer,
      discountPct: 0,
      appliedCoupon: null,
      activeQuoteId: quoteId || null,
      activeQuoteNumber: quoteNumber || null,
    });
  },

  clearActiveQuote: () => set({ activeQuoteId: null, activeQuoteNumber: null }),

  clearCart: () => set({
    cart: [],
    selectedCustomer: null,
    discountPct: 0,
    appliedCoupon: null,
    activeQuoteId: null,
    activeQuoteNumber: null,
  }),
  
  getSubtotal: () => get().cart.reduce((sum, item) => sum + item.subtotal, 0),
  getTotalDiscount: () => get().cart.reduce((sum, item) => sum + item.discount, 0),
  getTotalTax: () => get().cart.reduce((sum, item) => sum + item.taxAmount, 0),
  getTotal: () => get().cart.reduce((sum, item) => sum + item.total, 0),
}));
