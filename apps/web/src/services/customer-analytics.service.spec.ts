import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildCustomerProfile,
  CustomerProfile,
} from './customer-analytics.service';
import { Customer } from '@ferreteria/shared';

describe('Customer Analytics Service — RFM & Churn Scoring 🧠', () => {
  const baseCustomer: Customer = {
    id: 'cust-test-1',
    name: 'Constructora Central SA',
    documentType: 'CUIT',
    documentNum: '30-12345678-9',
    taxCondition: 'RESPONSABLE_INSCRIPTO',
    email: 'contacto@constructora.com',
    phone: '11-1234-5678',
    creditLimit: 500000,
    balance: 0,
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 86400000),
    updatedAt: new Date(),
  };

  describe('Cálculo de Perfil RFM y Churn para Clientes Frecuentes', () => {
    it('debería calcular métricas de comprador leal/frecuente con bajo riesgo de abandono', () => {
      const now = Date.now();
      const mockSales = [
        {
          id: 'sale-1',
          customerId: 'cust-test-1',
          total: 150000,
          createdAt: new Date(now - 3 * 86400000).toISOString(), // Hace 3 días
          items: [{ category: 'Herramientas', quantity: 2 }],
        },
        {
          id: 'sale-2',
          customerId: 'cust-test-1',
          total: 80000,
          createdAt: new Date(now - 15 * 86400000).toISOString(), // Hace 15 días
          items: [{ category: 'Herramientas', quantity: 1 }],
        },
        {
          id: 'sale-3',
          customerId: 'cust-test-1',
          total: 120000,
          createdAt: new Date(now - 30 * 86400000).toISOString(), // Hace 30 días
          items: [{ category: 'Materiales', quantity: 5 }],
        },
      ];

      const profile = buildCustomerProfile(baseCustomer as any, mockSales);

      // Métricas RFM
      expect(profile.rfm.frequency).toBe(3);
      expect(profile.rfm.monetaryLtv).toBe(350000);
      expect(profile.rfm.averageOrderValue).toBeCloseTo(350000 / 3, 1);
      expect(profile.rfm.maxOrderValue).toBe(150000);
      expect(profile.rfm.recencyDays).toBeLessThanOrEqual(4);

      // Evaluación de Churn
      expect(profile.churn.score).toBeLessThan(40);
      expect(['LOW', 'MEDIUM']).toContain(profile.churn.riskLevel);
      expect(profile.churn.isChurned).toBe(false);

      // Segmentación de Marketing
      expect(['VIP', 'LOYAL_POTENTIAL', 'BIG_BUILDER']).toContain(profile.marketing.segment);
    });
  });

  describe('Detección de Riesgo de Abandono (Churn)', () => {
    it('debería clasificar con alto riesgo de abandono a un cliente con inactividad prolongada (>90 días)', () => {
      const now = Date.now();
      const mockSales = [
        {
          id: 'sale-old',
          customerId: 'cust-test-1',
          total: 50000,
          createdAt: new Date(now - 110 * 86400000).toISOString(), // Hace 110 días
        },
      ];

      const profile = buildCustomerProfile(baseCustomer as any, mockSales);

      expect(profile.rfm.recencyDays).toBeGreaterThanOrEqual(100);
      expect(profile.churn.score).toBeGreaterThanOrEqual(70);
      expect(['HIGH', 'CHURNED']).toContain(profile.churn.riskLevel);
      expect(profile.churn.churnFactors.some((f) => f.includes('Inactividad'))).toBe(true);
    });

    it('debería asignar score de abandono máximo (95) y sugerir acción restrictiva a clientes vetados', () => {
      const bannedCustomer = {
        ...baseCustomer,
        isBanned: true,
        banReason: 'Cheques rechazados sin fondos',
      };

      const profile = buildCustomerProfile(bannedCustomer as any, []);

      expect(profile.churn.score).toBe(95);
      expect(profile.churn.riskLevel).toBe('CHURNED');
      expect(profile.churn.churnFactors.some((f) => f.includes('vetado'))).toBe(true);
    });

    it('debería manejar clientes nuevos sin compras sin arrojar errores ni valores NaN', () => {
      const profile = buildCustomerProfile(baseCustomer as any, []);

      expect(profile.rfm.frequency).toBe(0);
      expect(profile.rfm.monetaryLtv).toBe(0);
      expect(profile.rfm.averageOrderValue).toBe(0);
      expect(isNaN(profile.rfm.averageOrderValue)).toBe(false);
      expect(isNaN(profile.churn.score)).toBe(false);
    });
  });

  describe('Filtro por Rango Temporal', () => {
    it('debería computar RFM únicamente con las ventas dentro de la ventana de fechas especificada', () => {
      const mockSales = [
        {
          id: 'sale-jan',
          customerId: 'cust-test-1',
          total: 20000,
          createdAt: '2026-01-15T10:00:00Z',
        },
        {
          id: 'sale-feb',
          customerId: 'cust-test-1',
          total: 30000,
          createdAt: '2026-02-15T10:00:00Z',
        },
        {
          id: 'sale-mar',
          customerId: 'cust-test-1',
          total: 40000,
          createdAt: '2026-03-15T10:00:00Z',
        },
      ];

      // Filtrar solo febrero
      const profile = buildCustomerProfile(baseCustomer as any, mockSales, {
        startDate: '2026-02-01',
        endDate: '2026-02-28',
      });

      expect(profile.rfm.frequency).toBe(1);
      expect(profile.rfm.monetaryLtv).toBe(30000);
    });
  });
});
