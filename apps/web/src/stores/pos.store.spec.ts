import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore, PosProduct } from './pos.store';

const mockProductA: PosProduct = {
  id: 'prod-1',
  name: 'Cemento Loma Negra 50kg',
  sku: 'CEM-50',
  price: 10000,
  taxRate: 21,
};

const mockProductB: PosProduct = {
  id: 'prod-2',
  name: 'Tornillo Autoperforante 1" (Caja x 100)',
  sku: 'TOR-100',
  price: 2000,
  taxRate: 21,
};

describe('POS Store (usePosStore)', () => {
  beforeEach(() => {
    usePosStore.getState().clearCart();
  });

  it('debería inicializar con un carrito vacío y valores en cero', () => {
    const state = usePosStore.getState();
    expect(state.cart).toEqual([]);
    expect(state.discountPct).toBe(0);
    expect(state.appliedCoupon).toBeNull();
    expect(state.activeQuoteId).toBeNull();
    expect(state.selectedCustomer).toBeNull();
    expect(state.getSubtotal()).toBe(0);
    expect(state.getTotal()).toBe(0);
  });

  describe('addItem & updateQuantity & removeItem', () => {
    it('debería agregar un nuevo producto con cálculo correcto de IVA y subtotal', () => {
      usePosStore.getState().addItem(mockProductA);

      const state = usePosStore.getState();
      expect(state.cart).toHaveLength(1);
      const item = state.cart[0];
      expect(item.product.id).toBe('prod-1');
      expect(item.quantity).toBe(1);
      expect(item.subtotal).toBe(10000);
      expect(item.discount).toBe(0);
      expect(item.taxAmount).toBe(2100); // 21% de 10000
      expect(item.total).toBe(12100);

      expect(state.getSubtotal()).toBe(10000);
      expect(state.getTotalTax()).toBe(2100);
      expect(state.getTotal()).toBe(12100);
    });

    it('debería incrementar la cantidad y recalcular cuando se agrega el mismo producto dos veces', () => {
      usePosStore.getState().addItem(mockProductA);
      usePosStore.getState().addItem(mockProductA);

      const state = usePosStore.getState();
      expect(state.cart).toHaveLength(1);
      const item = state.cart[0];
      expect(item.quantity).toBe(2);
      expect(item.subtotal).toBe(20000);
      expect(item.taxAmount).toBe(4200);
      expect(item.total).toBe(24200);
    });

    it('debería actualizar la cantidad con updateQuantity()', () => {
      usePosStore.getState().addItem(mockProductA);
      usePosStore.getState().updateQuantity('prod-1', 5);

      const item = usePosStore.getState().cart[0];
      expect(item.quantity).toBe(5);
      expect(item.subtotal).toBe(50000);
      expect(item.taxAmount).toBe(10500);
      expect(item.total).toBe(60500);
    });

    it('debería remover un producto con removeItem()', () => {
      usePosStore.getState().addItem(mockProductA);
      usePosStore.getState().addItem(mockProductB);
      expect(usePosStore.getState().cart).toHaveLength(2);

      usePosStore.getState().removeItem('prod-1');

      const state = usePosStore.getState();
      expect(state.cart).toHaveLength(1);
      expect(state.cart[0].product.id).toBe('prod-2');
    });
  });

  describe('Descuentos y Cupones', () => {
    it('debería aplicar un descuento porcentual global recalculando el IVA sobre el neto con descuento', () => {
      usePosStore.getState().addItem(mockProductA); // $10,000
      usePosStore.getState().setDiscount(10); // 10% OFF

      const state = usePosStore.getState();
      expect(state.discountPct).toBe(10);
      const item = state.cart[0];
      expect(item.subtotal).toBe(10000);
      expect(item.discount).toBe(1000);
      // Base imponible = 10000 - 1000 = 9000
      // IVA = 9000 * 0.21 = 1890
      expect(item.taxAmount).toBe(1890);
      expect(item.total).toBe(10890);

      expect(state.getTotalDiscount()).toBe(1000);
      expect(state.getTotalTax()).toBe(1890);
      expect(state.getTotal()).toBe(10890);
    });

    it('debería aplicar un cupón tipo PERCENTAGE', () => {
      usePosStore.getState().addItem(mockProductA);
      usePosStore.getState().applyCoupon({
        code: 'PROMO15',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        discountAmount: 0,
      });

      const state = usePosStore.getState();
      expect(state.appliedCoupon?.code).toBe('PROMO15');
      expect(state.discountPct).toBe(15);
      expect(state.cart[0].discount).toBe(1500);
    });

    it('debería aplicar un cupón tipo FIXED distribuido proporcionalmente entre los items', () => {
      usePosStore.getState().addItem(mockProductA); // 10,000 subtotal
      usePosStore.getState().addItem(mockProductB); // 2,000 subtotal -> Total subtotal = 12,000

      // Cupón de $3,000 fijo
      usePosStore.getState().applyCoupon({
        code: 'FIJO3000',
        discountType: 'FIXED',
        discountValue: 3000,
        discountAmount: 0,
      });

      const state = usePosStore.getState();
      expect(state.appliedCoupon?.code).toBe('FIJO3000');
      // Proporción = 3000 / 12000 = 0.25 (25%)
      expect(state.discountPct).toBe(25);
      expect(state.cart[0].discount).toBe(2500); // 10000 * 0.25
      expect(state.cart[1].discount).toBe(500);  // 2000 * 0.25
      expect(state.getTotalDiscount()).toBe(3000);
    });

    it('debería remover el cupón y reestablecer precios con removeCoupon()', () => {
      usePosStore.getState().addItem(mockProductA);
      usePosStore.getState().setDiscount(20);
      usePosStore.getState().removeCoupon();

      const state = usePosStore.getState();
      expect(state.appliedCoupon).toBeNull();
      expect(state.discountPct).toBe(0);
      expect(state.cart[0].discount).toBe(0);
      expect(state.cart[0].total).toBe(12100);
    });
  });

  describe('Cotizaciones / Presupuestos en POS', () => {
    it('debería cargar presupuesto al carrito con loadQuoteToCart()', () => {
      const quoteItems = [
        {
          product: mockProductA,
          quantity: 3,
          unitPrice: 9500,
          discount: 0,
          subtotal: 28500,
          taxRate: 21,
          taxAmount: 5985,
          total: 34485,
        },
      ];
      const customer = { id: 'c1', name: 'Corralón San Juan' };

      usePosStore.getState().loadQuoteToCart(quoteItems, customer, 'cot-101', 'COT-2026-101');

      const state = usePosStore.getState();
      expect(state.activeQuoteId).toBe('cot-101');
      expect(state.activeQuoteNumber).toBe('COT-2026-101');
      expect(state.selectedCustomer).toEqual(customer);
      expect(state.cart).toHaveLength(1);
      expect(state.getTotal()).toBe(34485);
    });

    it('debería limpiar referencia al presupuesto activo con clearActiveQuote()', () => {
      usePosStore.getState().loadQuoteToCart([], null, 'cot-1', 'COT-01');
      usePosStore.getState().clearActiveQuote();

      const state = usePosStore.getState();
      expect(state.activeQuoteId).toBeNull();
      expect(state.activeQuoteNumber).toBeNull();
    });
  });
});
