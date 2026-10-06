import { describe, it, expect, vi } from 'vitest';
import {
  buildCustomerProfile,
  exportMLDatasetCsv,
  exportMarketingAudienceCsv,
} from './customer-analytics.service';
import { Customer } from '@ferreteria/shared';

// Mock exportToCsv to avoid DOM Blob/link clicks during stress test
vi.mock('@/lib/utils', () => ({
  exportToCsv: vi.fn(),
  cn: (...inputs: any[]) => inputs.join(' '),
}));

describe('Customer Analytics Service — Pruebas de Estrés y Gran Escala 🔥', () => {
  it('debería calcular el perfil RFM y score Churn de 5,000 clientes en menos de 3,500ms', () => {
    const now = Date.now();

    const mockSales = Array.from({ length: 50 }, (_, i) => ({
      id: `sale-stress-${i}`,
      customerId: '',
      total: 15000 + (i * 1000),
      createdAt: new Date(now - (i * 2) * 86400000).toISOString(),
      items: [{ category: i % 2 === 0 ? 'Fijaciones' : 'Herramientas', quantity: 2 }],
      paymentMethod: i % 3 === 0 ? 'CASH' : 'TRANSFER',
    }));

    const startTime = performance.now();

    for (let c = 0; c < 5000; c++) {
      const customer: Customer = {
        id: `cust-stress-${c}`,
        name: `Cliente Estrés ${c}`,
        documentType: 'DNI',
        documentNum: `${30000000 + c}`,
        taxCondition: 'CONSUMIDOR_FINAL',
        creditLimit: 100000,
        balance: 0,
        isActive: true,
        createdAt: new Date(now - 180 * 86400000),
        updatedAt: new Date(),
      };

      const customerSales = mockSales.slice(0, 1 + (c % 4)).map((s) => ({
        ...s,
        customerId: customer.id,
      }));

      const profile = buildCustomerProfile(customer, customerSales);
      expect(profile.churn.score).toBeGreaterThanOrEqual(0);
      expect(profile.churn.score).toBeLessThanOrEqual(100);
      expect(profile.marketing.segment).toBeDefined();
    }

    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(3500);
  });

  it('debería procesar y estructurar un dataset masivo de 5,000 clientes para Machine Learning y Marketing en menos de 500ms', () => {
    const mockProfiles = Array.from({ length: 5000 }, (_, i) => ({
      customer: {
        id: `c-${i}`,
        name: `Customer ${i}`,
        documentType: 'CUIT',
        documentNum: `30-${i}-9`,
        taxCondition: 'RESPONSABLE_INSCRIPTO',
      } as Customer,
      rfm: {
        recencyDays: i % 120,
        frequency: 1 + (i % 20),
        monetaryLtv: 50000 + i * 100,
        averageOrderValue: 5000,
        maxOrderValue: 20000,
        monthlyFrequency: 1.5,
        avgDaysBetweenPurchases: 15,
        lastPurchaseDate: new Date().toISOString(),
      },
      churn: {
        score: i % 100,
        riskLevel: 'MEDIUM' as const,
        label: 'Medio',
        isChurned: (i % 100) > 70,
        predictedChurnDays: 30,
        churnFactors: [],
        suggestedAction: 'Campaña',
      },
      marketing: {
        segment: 'VIP' as const,
        segmentLabel: 'VIP',
        segmentDescription: 'VIP customer',
        preferredCategory: 'Herramientas',
        preferredPaymentMethod: 'CASH',
        discountSensitivity: 'LOW' as const,
        recommendedCampaign: 'VIP Exclusive',
        suggestedCouponCode: 'VIP10',
      },
      monthlyTrend: [],
      categorySpend: [],
    }));

    const startTime = performance.now();
    exportMLDatasetCsv(mockProfiles as any);
    exportMarketingAudienceCsv(mockProfiles as any);
    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(500);
  });
});
