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
  description?: string;
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
    if (existing) {
      const quantity = existing.quantity + 1;
      const subtotal = product.price * quantity;
      const discount = subtotal * (state.discountPct / 100);
      const subtotalAfterDiscount = subtotal - discount;
      const taxAmount = subtotalAfterDiscount * (product.taxRate / 100);
      const total = subtotalAfterDiscount + taxAmount;
      
      return {
        cart: state.cart.map(item => item.product.id === product.id ? {
          ...item,
          quantity,
          subtotal,
          discount,
          taxAmount,
          total,
        } : item)
      };
    }
    
    const quantity = 1;
    const subtotal = product.price * quantity;
    const discount = subtotal * (state.discountPct / 100);
    const subtotalAfterDiscount = subtotal - discount;
    const taxAmount = subtotalAfterDiscount * (product.taxRate / 100);
    const total = subtotalAfterDiscount + taxAmount;
    
    return {
      cart: [...state.cart, {
        product,
        quantity,
        unitPrice: product.price,
        discount,
        subtotal,
        taxRate: product.taxRate,
        taxAmount,
        total,
      }]
    };
  }),
  
  updateQuantity: (productId, qty) => set((state) => ({
    cart: state.cart.map(item => {
      if (item.product.id !== productId) return item;
      const quantity = qty;
      const subtotal = item.product.price * quantity;
      const discount = subtotal * (state.discountPct / 100);
      const subtotalAfterDiscount = subtotal - discount;
      const taxAmount = subtotalAfterDiscount * (item.product.taxRate / 100);
      const total = subtotalAfterDiscount + taxAmount;
      return { ...item, quantity, subtotal, discount, taxAmount, total };
    })
  })),

  removeItem: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId)
  })),

  setCustomer: (customer) => set({ selectedCustomer: customer }),
  
  setDiscount: (pct) => set((state) => {
    const newCart = state.cart.map(item => {
      const discount = item.subtotal * (pct / 100);
      const subtotalAfterDiscount = item.subtotal - discount;
      const taxAmount = subtotalAfterDiscount * (item.product.taxRate / 100);
      const total = subtotalAfterDiscount + taxAmount;
      return { ...item, discount, taxAmount, total };
    });
    return { discountPct: pct, cart: newCart };
  }),

  setWarehouse: (id) => set({ selectedWarehouseId: id }),
  
  applyCoupon: (coupon) => set((state) => {
    if (coupon.discountType === 'PERCENTAGE') {
      const pct = coupon.discountValue;
      const newCart = state.cart.map(item => {
        const discount = item.subtotal * (pct / 100);
        const subtotalAfterDiscount = item.subtotal - discount;
        const taxAmount = subtotalAfterDiscount * (item.product.taxRate / 100);
        const total = subtotalAfterDiscount + taxAmount;
        return { ...item, discount, taxAmount, total };
      });
      return { 
        appliedCoupon: {
          ...coupon,
          discountAmount: state.cart.reduce((sum, item) => sum + (item.subtotal * (pct / 100)), 0)
        }, 
        discountPct: pct, 
        cart: newCart 
      };
    } else {
      const totalSub = state.cart.reduce((sum, it) => sum + it.subtotal, 0);
      const fixedDisc = Math.min(coupon.discountValue, totalSub);
      const ratio = totalSub > 0 ? fixedDisc / totalSub : 0;
      const newCart = state.cart.map(item => {
        const discount = item.subtotal * ratio;
        const subtotalAfterDiscount = item.subtotal - discount;
        const taxAmount = subtotalAfterDiscount * (item.product.taxRate / 100);
        const total = subtotalAfterDiscount + taxAmount;
        return { ...item, discount, taxAmount, total };
      });
      return { 
        appliedCoupon: { ...coupon, discountAmount: fixedDisc }, 
        discountPct: Math.round(ratio * 100 * 10) / 10, 
        cart: newCart 
      };
    }
  }),

  removeCoupon: () => set((state) => {
    const newCart = state.cart.map(item => {
      const discount = 0;
      const subtotalAfterDiscount = item.subtotal;
      const taxAmount = subtotalAfterDiscount * (item.product.taxRate / 100);
      const total = subtotalAfterDiscount + taxAmount;
      return { ...item, discount, taxAmount, total };
    });
    return { appliedCoupon: null, discountPct: 0, cart: newCart };
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
