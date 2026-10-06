import { describe, it, expect, beforeEach } from 'vitest';
import { usePosStore, PosProduct } from './pos.store';

describe('POS Store — Pruebas de Estrés y Anti-Cuelgue 🔥', () => {
  beforeEach(() => {
    usePosStore.getState().clearCart();
  });

  it('debería soportar un carrito masivo de 500 artículos diferentes sin degradar rendimiento', () => {
    const startTime = performance.now();

    for (let i = 0; i < 500; i++) {
      const product: PosProduct = {
        id: `prod-${i}`,
        name: `Artículo Ferretería #${i}`,
        sku: `SKU-${i}`,
        price: 100 + (i % 50) * 10,
        taxRate: 21,
      };
      usePosStore.getState().addItem(product);
    }

    const duration = performance.now() - startTime;
    const state = usePosStore.getState();

    expect(state.cart).toHaveLength(500);
    expect(state.getSubtotal()).toBeGreaterThan(0);
    expect(state.getTotal()).toBeGreaterThan(0);
    // 500 inserciones y cálculos deben ocurrir en menos de 500ms
    expect(duration).toBeLessThan(500);
  });

  it('debería soportar una ráfaga de 1,000 actualizaciones de cantidad en < 300ms sin tildarse', () => {
    // Preparar carrito con 10 productos
    for (let i = 0; i < 10; i++) {
      usePosStore.getState().addItem({
        id: `p-${i}`,
        name: `P #${i}`,
        sku: `S-${i}`,
        price: 500,
        taxRate: 21,
      });
    }

    const startTime = performance.now();
    for (let cycle = 0; cycle < 1000; cycle++) {
      const targetProduct = `p-${cycle % 10}`;
      usePosStore.getState().updateQuantity(targetProduct, (cycle % 20) + 1);
    }
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(300);
    expect(usePosStore.getState().getTotal()).toBeGreaterThan(0);
  });

  it('debería soportar 300 ciclos de agregar y quitar productos sin fuga de memoria', () => {
    const startTime = performance.now();

    for (let i = 0; i < 300; i++) {
      const product: PosProduct = {
        id: `temp-${i}`,
        name: `Producto Temporal`,
        sku: `TEMP`,
        price: 1500,
        taxRate: 21,
      };
      usePosStore.getState().addItem(product);
      usePosStore.getState().removeItem(`temp-${i}`);
    }

    const duration = performance.now() - startTime;
    expect(usePosStore.getState().cart).toHaveLength(0);
    expect(usePosStore.getState().getTotal()).toBe(0);
    expect(duration).toBeLessThan(300);
  });

  it('debería calcular descuentos globales en un carrito grande (300 items) en < 50ms', () => {
    for (let i = 0; i < 300; i++) {
      usePosStore.getState().addItem({
        id: `bulk-${i}`,
        name: `Bulk ${i}`,
        sku: `B-${i}`,
        price: 2500,
        taxRate: 21,
      });
    }

    const startDiscount = performance.now();
    usePosStore.getState().setDiscount(15);
    const durationPct = performance.now() - startDiscount;

    expect(usePosStore.getState().discountPct).toBe(15);
    expect(durationPct).toBeLessThan(50);

    const startCoupon = performance.now();
    usePosStore.getState().applyCoupon({
      code: 'FIJO-MASSIVE',
      discountType: 'FIXED',
      discountValue: 50000,
      discountAmount: 0,
    });
    const durationCoupon = performance.now() - startCoupon;

    expect(durationCoupon).toBeLessThan(50);
    expect(usePosStore.getState().getTotalDiscount()).toBeCloseTo(50000, 0);
  });

  it('debería mantener consistencia ante 500 operaciones mezcladas en rápida sucesión', () => {
    const startTime = performance.now();

    for (let step = 0; step < 500; step++) {
      const action = step % 5;
      const pid = `mix-${step % 20}`;

      if (action === 0) {
        usePosStore.getState().addItem({
          id: pid,
          name: `Item ${pid}`,
          sku: `SKU-${pid}`,
          price: 1000 + (step * 5),
          taxRate: 21,
        });
      } else if (action === 1) {
        usePosStore.getState().updateQuantity(pid, (step % 5) + 1);
      } else if (action === 2) {
        usePosStore.getState().setDiscount(step % 30);
      } else if (action === 3) {
        usePosStore.getState().removeItem(pid);
      } else {
        usePosStore.getState().getTotal();
      }
    }

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(500);
    // Verificamos que el estado resultante sea numéricamente válido (sin NaN)
    expect(Number.isNaN(usePosStore.getState().getTotal())).toBe(false);
    expect(Number.isNaN(usePosStore.getState().getSubtotal())).toBe(false);
  });
});
