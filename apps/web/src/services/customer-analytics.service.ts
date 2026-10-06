import { useQuery } from '@tanstack/react-query';
import { Customer, matchCustomerNatural } from '@ferreteria/shared';
import { exportToCsv } from '@/lib/utils';

export type ChurnRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CHURNED';

export type MarketingSegmentType = 
  | 'VIP' 
  | 'LOYAL_POTENTIAL' 
  | 'AT_RISK' 
  | 'HIBERNATING' 
  | 'NEW' 
  | 'BIG_BUILDER' 
  | 'OCCASIONAL';

export interface RFMMetrics {
  recencyDays: number;            // Días transcurridos desde la última compra
  lastPurchaseDate: string | null;// Fecha de última compra
  frequency: number;              // Cantidad total de órdenes
  monthlyFrequency: number;       // Promedio mensual de compras
  monetaryLtv: number;            // LTV: Total gastado acumulado
  averageOrderValue: number;      // Ticket promedio (AOV)
  maxOrderValue: number;          // Mayor compra registrada
  avgDaysBetweenPurchases: number;// Ciclo de recompra promedio
}

export interface ChurnAnalysis {
  score: number;                  // 0 a 100% (100 = Churn inminente/confirmado)
  riskLevel: ChurnRiskLevel;
  label: string;
  isChurned: boolean;             // Target binario para modelos supervisados (1/0)
  predictedChurnDays: number;     // Estimación de días hasta inactividad irreversible
  churnFactors: string[];         // Explicación de los factores que influyen en el score
  suggestedAction: string;        // Acción sugerida para retención
}

export interface MarketingProfile {
  segment: MarketingSegmentType;
  segmentLabel: string;
  segmentDescription: string;
  preferredCategory: string;      // Categoría con mayor volumen de compra
  preferredPaymentMethod: string; // Medio de pago preferido
  discountSensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedCampaign: string;    // Estrategia de marketing recomendada
  suggestedCouponCode: string;    // Cupón promocional sugerido
}

export interface MonthlySpend {
  month: string;
  amount: number;
  orders: number;
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
}

export interface CustomerProfile {
  customer: Customer;
  rfm: RFMMetrics;
  churn: ChurnAnalysis;
  marketing: MarketingProfile;
  monthlyHistory: MonthlySpend[];
  topCategories: CategorySpend[];
  recentPurchases: {
    id: string;
    date: string;
    total: number;
    itemsCount: number;
  }[];
}

export interface CustomerProfilesFilter {
  search?: string;
  segment?: string;
  riskLevel?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface MLDatasetRow {
  customer_id: string;
  customer_name: string;
  tax_condition: string;
  is_banned: number;
  credit_limit: number;
  current_balance: number;
  credit_used_ratio: number;
  registration_days: number;
  recency_days: number;
  frequency_total_orders: number;
  monetary_ltv: number;
  average_ticket: number;
  max_ticket: number;
  monthly_order_frequency: number;
  avg_days_between_purchases: number;
  discount_applied_count: number;
  preferred_category: string;
  preferred_payment_method: string;
  churn_risk_score: number;
  segment_cluster: string;
  is_churned_target: number; // 0 = Activo/Retenido, 1 = Abandonó/Churned (Variable Target para ML)
}

// Helper to pull customers from storage or API
const getRawCustomers = (): any[] => {
  try {
    const raw = localStorage.getItem('ferreteria_local_customers');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'cust-1',
      name: 'Constructora del Plata SA',
      documentType: 'CUIT',
      documentNumber: '30-71234567-8',
      taxCondition: 'RESPONSABLE_INSCRIPTO',
      email: 'compras@constructoradelplata.com',
      phone: '11-4567-8901',
      creditLimit: 500000,
      currentBalance: 85000,
      createdAt: new Date(Date.now() - 180 * 86400000).toISOString(),
    },
    {
      id: 'cust-2',
      name: 'Roberto Gómez (Instalaciones)',
      documentType: 'DNI',
      documentNumber: '28.456.789',
      taxCondition: 'MONOTRIBUTO',
      email: 'rgomez.instalaciones@gmail.com',
      phone: '11-5678-9012',
      creditLimit: 150000,
      currentBalance: 0,
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    },
    {
      id: 'cust-3',
      name: 'Consumidor Final Mostrador',
      documentType: 'DNI',
      documentNumber: '0',
      taxCondition: 'CONSUMIDOR_FINAL',
      email: 'cliente.mostrador@ferreteria.com',
      phone: '11-9999-0000',
      creditLimit: 0,
      currentBalance: 0,
      createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
    },
    {
      id: 'cust-4',
      name: 'Distribuidora del Sur SRL (Inhabilitada)',
      documentType: 'CUIT',
      documentNumber: '30-65432109-7',
      taxCondition: 'RESPONSABLE_INSCRIPTO',
      email: 'contacto@delsursrl.com',
      phone: '11-3456-7890',
      creditLimit: 200000,
      currentBalance: 120000,
      isBanned: true,
      banReason: 'Cheques rebotados y mora de 90 días',
      createdAt: new Date(Date.now() - 250 * 86400000).toISOString(),
    },
    {
      id: 'cust-5',
      name: 'Taller Metalúrgico San Cayetano',
      documentType: 'CUIT',
      documentNumber: '30-89123456-1',
      taxCondition: 'RESPONSABLE_INSCRIPTO',
      email: 'metalurgica.sancayetano@gmail.com',
      phone: '11-6677-8899',
      creditLimit: 350000,
      currentBalance: 32000,
      createdAt: new Date(Date.now() - 120 * 86400000).toISOString(),
    },
    {
      id: 'cust-6',
      name: 'Pinturería & Acabados del Centro',
      documentType: 'CUIT',
      documentNumber: '30-55443322-0',
      taxCondition: 'MONOTRIBUTO',
      email: 'pedidos@acabadoscentro.com.ar',
      phone: '11-4433-2211',
      creditLimit: 100000,
      currentBalance: 0,
      createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    }
  ];
};

// Helper to pull sales from storage
const getRawSales = (): any[] => {
  try {
    const raw = localStorage.getItem('ferreteria_local_sales');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'sale-1',
      customerId: 'cust-1',
      customerName: 'Constructora del Plata SA',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      total: 54450,
      subtotal: 45000,
      items: [{ product: { name: 'Taladro Percutor 700W', category: { name: 'Herramientas Eléctricas' } }, quantity: 2, unitPrice: 22500, total: 54450 }],
      payments: [{ methodId: 'pm-5', method: 'Cuenta Corriente', amount: 54450 }]
    },
    {
      id: 'sale-1b',
      customerId: 'cust-1',
      customerName: 'Constructora del Plata SA',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      total: 128000,
      subtotal: 105785,
      items: [{ product: { name: 'Amoladora Angular 850W', category: { name: 'Herramientas Eléctricas' } }, quantity: 3, unitPrice: 18500, total: 67155 }],
      payments: [{ methodId: 'pm-5', method: 'Cuenta Corriente', amount: 128000 }]
    },
    {
      id: 'sale-1c',
      customerId: 'cust-1',
      customerName: 'Constructora del Plata SA',
      createdAt: new Date(Date.now() - 32 * 86400000).toISOString(),
      total: 94000,
      subtotal: 77685,
      items: [{ product: { name: 'Electrodos Punta Azul 2.5mm', category: { name: 'Soldadura' } }, quantity: 10, unitPrice: 9400, total: 94000 }],
      payments: [{ methodId: 'pm-4', method: 'Transferencia', amount: 94000 }]
    },
    {
      id: 'sale-2',
      customerId: 'cust-2',
      customerName: 'Roberto Gómez (Instalaciones)',
      createdAt: new Date(Date.now() - 65 * 86400000).toISOString(),
      total: 21780,
      subtotal: 18000,
      items: [{ product: { name: 'Amoladora Angular 850W', category: { name: 'Herramientas Eléctricas' } }, quantity: 1, unitPrice: 18500, total: 21780 }],
      payments: [{ methodId: 'pm-1', method: 'Efectivo', amount: 21780 }]
    },
    {
      id: 'sale-5',
      customerId: 'cust-5',
      customerName: 'Taller Metalúrgico San Cayetano',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      total: 78500,
      subtotal: 64876,
      items: [{ product: { name: 'Soldadora Inverter 160A', category: { name: 'Soldadura' } }, quantity: 1, unitPrice: 78500, total: 78500 }],
      payments: [{ methodId: 'pm-4', method: 'Transferencia', amount: 78500 }]
    },
    {
      id: 'sale-6',
      customerId: 'cust-6',
      customerName: 'Pinturería & Acabados del Centro',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      total: 35600,
      subtotal: 29421,
      items: [{ product: { name: 'Látex Profesional Interior 20L', category: { name: 'Pinturería' } }, quantity: 2, unitPrice: 17800, total: 35600 }],
      payments: [{ methodId: 'pm-1', method: 'Efectivo', amount: 35600 }]
    },
    {
      id: 'sale-4',
      customerId: 'cust-4',
      customerName: 'Distribuidora del Sur SRL (Inhabilitada)',
      createdAt: new Date(Date.now() - 110 * 86400000).toISOString(),
      total: 145000,
      subtotal: 119834,
      items: [{ product: { name: 'Compresor de Aire 50L', category: { name: 'Maquinaria' } }, quantity: 1, unitPrice: 145000, total: 145000 }],
      payments: [{ methodId: 'pm-5', method: 'Cuenta Corriente', amount: 145000 }]
    }
  ];
};

// Core Engine: Calculates Customer Profile with RFM, Churn & Marketing Segment
export const buildCustomerProfile = (
  customer: any, 
  sales: any[],
  dateRange?: { startDate?: string; endDate?: string }
): CustomerProfile => {
  let customerSales = sales.filter((s) => s.customerId === customer.id);
  const now = Date.now();
  const startMs = dateRange?.startDate ? new Date(dateRange.startDate + 'T00:00:00').getTime() : null;
  const endMs = dateRange?.endDate ? new Date(dateRange.endDate + 'T23:59:59.999').getTime() : null;
  const refTime = endMs && !isNaN(endMs) ? endMs : now;

  // Filter sales to date range if provided
  if (startMs !== null && !isNaN(startMs)) {
    customerSales = customerSales.filter((s) => new Date(s.createdAt).getTime() >= startMs);
  }
  if (endMs !== null && !isNaN(endMs)) {
    customerSales = customerSales.filter((s) => new Date(s.createdAt).getTime() <= endMs);
  }

  const regDate = customer.createdAt ? new Date(customer.createdAt).getTime() : refTime - 60 * 86400000;
  const registrationDays = Math.max(1, Math.round((refTime - regDate) / 86400000));

  // Sort sales chronologically (descending)
  customerSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const frequency = customerSales.length;
  const lastSale = customerSales[0] || null;
  const lastSaleTime = lastSale?.createdAt ? new Date(lastSale.createdAt).getTime() : null;
  const recencyDays = lastSaleTime ? Math.max(0, Math.round((refTime - lastSaleTime) / 86400000)) : registrationDays;
  const monetaryLtv = customerSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0);
  const averageOrderValue = frequency > 0 ? monetaryLtv / frequency : 0;
  const maxOrderValue = customerSales.reduce((acc, s) => Math.max(acc, Number(s.total) || 0), 0);
  const monthsActive = Math.max(1, registrationDays / 30);
  const monthlyFrequency = frequency / monthsActive;

  // Cycle calculation: average days between purchases
  let avgDaysBetweenPurchases = 30;
  if (frequency > 1) {
    const oldestSaleTime = new Date(customerSales[customerSales.length - 1].createdAt).getTime();
    avgDaysBetweenPurchases = Math.max(1, Math.round((lastSaleTime! - oldestSaleTime) / 86400000 / (frequency - 1)));
  }

  // Churn Score Calculation (0 to 100)
  // Factors: recency relative to normal cycle, inactivity threshold, account standing
  let churnScore = 0;
  const churnFactors: string[] = [];

  if (customer.isBanned) {
    churnScore = 95;
    churnFactors.push('Cliente vetado/inhabilitado por mora o riesgo crediticio');
  } else if (frequency === 0) {
    churnScore = Math.min(90, Math.round(recencyDays * 0.8));
    churnFactors.push('Sin compras registradas desde el alta');
  } else {
    // Normal cycle factor
    const cycleRatio = recencyDays / Math.max(15, avgDaysBetweenPurchases);
    if (cycleRatio > 2.5 || recencyDays > 90) {
      churnScore = Math.min(98, Math.round(75 + (recencyDays - 90) * 0.25));
      churnFactors.push(`Inactividad severa (${recencyDays} días sin comprar)`);
    } else if (cycleRatio > 1.4 || recencyDays > 45) {
      churnScore = Math.min(74, Math.round(45 + cycleRatio * 15));
      churnFactors.push(`Retraso respecto a su ciclo habitual (${avgDaysBetweenPurchases} días)`);
    } else {
      churnScore = Math.max(5, Math.round(cycleRatio * 18));
      churnFactors.push('Comprador activo dentro del ciclo esperado');
    }

    // High debt penalty
    const creditLimit = Number(customer.creditLimit || 0);
    const balance = Number(customer.currentBalance || customer.balance || 0);
    if (creditLimit > 0 && balance / creditLimit > 0.85) {
      churnScore = Math.min(100, churnScore + 15);
      churnFactors.push('Límite de crédito casi agotado (alta morosidad potencial)');
    }
  }

  churnScore = Math.max(0, Math.min(100, churnScore));

  let riskLevel: ChurnRiskLevel = 'LOW';
  let riskLabel = 'Riesgo Bajo (Cliente Activo)';
  let suggestedAction = 'Mantener programa habitual de fidelización y novedades.';
  let isChurned = false;

  if (churnScore >= 85 || recencyDays >= 90) {
    riskLevel = 'CHURNED';
    riskLabel = 'Churn Confirmado (Inactivo >90d)';
    suggestedAction = 'Campaña de rescate agresiva: llamado del ejecutivo comercial y cupón de reactivación del 20% OFF.';
    isChurned = true;
  } else if (churnScore >= 60) {
    riskLevel = 'HIGH';
    riskLabel = 'Alto Riesgo de Churn';
    suggestedAction = 'Contacto preventivo prioritario: ofrecer bonificación en flete o descuento en su rubro más comprado.';
  } else if (churnScore >= 35) {
    riskLevel = 'MEDIUM';
    riskLabel = 'Riesgo Medio (En Alerta)';
    suggestedAction = 'Enviar catálogo de ofertas mensuales y recordatorio de reposición por WhatsApp/Email.';
  }

  // Marketing Segmentation
  let segment: MarketingSegmentType = 'OCCASIONAL';
  let segmentLabel = 'Comprador Ocasional';
  let segmentDescription = 'Compras esporádicas de bajo a medio monto.';
  let recommendedCampaign = 'Campaña de cross-selling en rubros generales.';
  let suggestedCouponCode = 'FERRETERIA10';

  if (customer.creditLimit >= 300000 || customer.taxCondition === 'RESPONSABLE_INSCRIPTO' && monetaryLtv > 150000) {
    segment = 'BIG_BUILDER';
    segmentLabel = 'Grandes Obras y Empresas';
    segmentDescription = 'Constructoras y talleres con compras industriales y cuenta corriente.';
    recommendedCampaign = 'Lista de precios preferencial gremio y atención personalizada B2B.';
    suggestedCouponCode = 'CORRALON_VIP';
  } else if (monetaryLtv >= 100000 && frequency >= 3 && recencyDays <= 35) {
    segment = 'VIP';
    segmentLabel = 'Cliente VIP / Campeón';
    segmentDescription = 'Compradores de alto valor acumulado con máxima fidelidad.';
    recommendedCampaign = 'Acceso prioritario a stock reservado y bonificación exclusiva en insumos.';
    suggestedCouponCode = 'VIP_EXCLUSIVE';
  } else if (monetaryLtv >= 40000 && recencyDays <= 45) {
    segment = 'LOYAL_POTENTIAL';
    segmentLabel = 'Potencial Leal';
    segmentDescription = 'Volumen creciente de compras con frecuencia constante.';
    recommendedCampaign = 'Programa de fidelización por puntos y beneficios en mostrador.';
    suggestedCouponCode = 'LEALTAD15';
  } else if (riskLevel === 'HIGH' || (monetaryLtv > 30000 && recencyDays > 45)) {
    segment = 'AT_RISK';
    segmentLabel = 'Cliente Valioso en Riesgo';
    segmentDescription = 'Solían comprar seguido pero llevan semanas sin registrar pedidos.';
    recommendedCampaign = 'Oferta especial de reactivación con cupón de descuento temporal.';
    suggestedCouponCode = 'TE_EXTRANAMOS';
  } else if (riskLevel === 'CHURNED' || recencyDays > 90) {
    segment = 'HIBERNATING';
    segmentLabel = 'Hibernando / Inactivo';
    segmentDescription = 'Inactividad prolongada sin respuesta a ofertas corrientes.';
    recommendedCampaign = 'Reactivación de cuentas inactivas con liquidación de temporada.';
    suggestedCouponCode = 'VUELVE20';
  } else if (registrationDays <= 45 && frequency <= 2) {
    segment = 'NEW';
    segmentLabel = 'Nuevo Cliente Prometedor';
    segmentDescription = 'Altas recientes con potencial de desarrollo comercial.';
    recommendedCampaign = 'Kit de bienvenida comercial y descuento en la segunda compra.';
    suggestedCouponCode = 'BIENVENIDO10';
  }

  // Extract Top Categories and Preferred Payment
  const catCount: Record<string, number> = {};
  const payCount: Record<string, number> = {};
  let totalDiscountCount = 0;

  customerSales.forEach((s) => {
    if (s.discount && s.discount > 0) totalDiscountCount++;
    if (Array.isArray(s.items)) {
      s.items.forEach((it: any) => {
        const cat = it.product?.category?.name || it.category || 'Herramientas y Varios';
        catCount[cat] = (catCount[cat] || 0) + (Number(it.total || it.unitPrice * it.quantity) || 0);
      });
    }
    if (Array.isArray(s.payments)) {
      s.payments.forEach((p: any) => {
        const m = p.method || p.methodId || 'Efectivo';
        payCount[m] = (payCount[m] || 0) + 1;
      });
    }
  });

  const preferredCategory = Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || 'Ferretería General';
  const preferredPaymentMethod = Object.keys(payCount).sort((a, b) => payCount[b] - payCount[a])[0] || 'Efectivo';

  const topCategories: CategorySpend[] = Object.entries(catCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monetaryLtv > 0 ? Math.round((amount / monetaryLtv) * 100) : 0,
    }));

  const rfm: RFMMetrics = {
    recencyDays,
    lastPurchaseDate: lastSale?.createdAt || null,
    frequency,
    monthlyFrequency: Math.round(monthlyFrequency * 10) / 10,
    monetaryLtv: Math.round(monetaryLtv * 100) / 100,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    maxOrderValue: Math.round(maxOrderValue * 100) / 100,
    avgDaysBetweenPurchases,
  };

  const churn: ChurnAnalysis = {
    score: churnScore,
    riskLevel,
    label: riskLabel,
    isChurned,
    predictedChurnDays: Math.max(0, 90 - recencyDays),
    churnFactors,
    suggestedAction,
  };

  const marketing: MarketingProfile = {
    segment,
    segmentLabel,
    segmentDescription,
    preferredCategory,
    preferredPaymentMethod,
    discountSensitivity: totalDiscountCount > 0 ? 'HIGH' : 'MEDIUM',
    recommendedCampaign,
    suggestedCouponCode,
  };

  const recentPurchases = customerSales.slice(0, 5).map((s) => ({
    id: s.id,
    date: s.createdAt,
    total: Number(s.total) || 0,
    itemsCount: Array.isArray(s.items) ? s.items.length : 1,
  }));

  // Mock monthly history
  const monthlyHistory: MonthlySpend[] = [
    { month: 'Hace 3 meses', amount: Math.round(monetaryLtv * 0.25), orders: Math.max(1, Math.round(frequency * 0.3)) },
    { month: 'Hace 2 meses', amount: Math.round(monetaryLtv * 0.35), orders: Math.max(1, Math.round(frequency * 0.4)) },
    { month: 'Mes Actual', amount: Math.round(monetaryLtv * 0.40), orders: Math.max(1, Math.round(frequency * 0.3)) },
  ];

  return {
    customer,
    rfm,
    churn,
    marketing,
    monthlyHistory,
    topCategories,
    recentPurchases,
  };
};

export const useCustomerProfiles = (filters?: CustomerProfilesFilter) => {
  return useQuery({
    queryKey: ['customer-profiles', filters],
    queryFn: async () => {
      const customers = getRawCustomers();
      const sales = getRawSales();

      const dateRange = (filters?.startDate || filters?.endDate)
        ? { startDate: filters?.startDate, endDate: filters?.endDate }
        : undefined;

      let profiles = customers.map((c) => buildCustomerProfile(c, sales, dateRange));

      if (filters?.search) {
        profiles = profiles.filter((p) => matchCustomerNatural(p.customer, filters.search!));
      }

      if (filters?.segment && filters.segment !== 'all') {
        profiles = profiles.filter((p) => p.marketing.segment === filters.segment);
      }

      if (filters?.riskLevel && filters.riskLevel !== 'all') {
        profiles = profiles.filter((p) => p.churn.riskLevel === filters.riskLevel);
      }

      // Sort by churn score descending by default
      profiles.sort((a, b) => b.churn.score - a.churn.score);

      return profiles;
    },
  });
};

export const useCustomerProfile = (customerId?: string | null) => {
  return useQuery({
    queryKey: ['customer-profile', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const customers = getRawCustomers();
      const sales = getRawSales();
      const customer = customers.find((c) => c.id === customerId);
      if (!customer) return null;
      return buildCustomerProfile(customer, sales);
    },
    enabled: !!customerId,
  });
};

// Export 1: Machine Learning Clean Dataset (Supports Date Range Analysis Window)
export const exportMLDatasetCsv = (
  profiles: CustomerProfile[],
  dateRange?: { startDate?: string; endDate?: string }
) => {
  if (!profiles || profiles.length === 0) return;

  const hasRange = Boolean(dateRange?.startDate || dateRange?.endDate);
  const startLabel = dateRange?.startDate || 'HISTORICO';
  const endLabel = dateRange?.endDate || new Date().toISOString().split('T')[0];

  const headers = [
    'customer_id',
    'customer_name',
    'tax_condition',
    'is_banned',
    'credit_limit',
    'current_balance',
    'credit_used_ratio',
    'period_start_date',
    'period_end_date',
    'registration_days',
    'recency_days',
    'frequency_total_orders',
    'monetary_ltv',
    'average_ticket',
    'max_ticket',
    'monthly_order_frequency',
    'avg_days_between_purchases',
    'preferred_category',
    'preferred_payment_method',
    'churn_risk_score',
    'segment_cluster',
    'is_churned_target' // Binary label 0 or 1 for supervised ML
  ];

  const rows = profiles.map((p) => {
    const credLimit = Number(p.customer.creditLimit || 0);
    const balance = Number(p.customer.currentBalance || p.customer.balance || 0);
    const creditRatio = credLimit > 0 ? Math.min(1, balance / credLimit) : 0;

    return [
      p.customer.id,
      `"${p.customer.name.replace(/"/g, '""')}"`,
      p.customer.taxCondition || 'CONSUMIDOR_FINAL',
      p.customer.isBanned ? 1 : 0,
      credLimit.toFixed(2),
      balance.toFixed(2),
      creditRatio.toFixed(3),
      startLabel,
      endLabel,
      p.rfm.recencyDays + 30, // approximate account age
      p.rfm.recencyDays,
      p.rfm.frequency,
      p.rfm.monetaryLtv.toFixed(2),
      p.rfm.averageOrderValue.toFixed(2),
      p.rfm.maxOrderValue.toFixed(2),
      p.rfm.monthlyFrequency.toFixed(2),
      p.rfm.avgDaysBetweenPurchases,
      `"${p.marketing.preferredCategory}"`,
      `"${p.marketing.preferredPaymentMethod}"`,
      p.churn.score,
      p.marketing.segment,
      p.churn.isChurned ? 1 : 0
    ];
  });

  const fileSlug = hasRange 
    ? `dataset_churn_ml_${startLabel}_a_${endLabel}`
    : `dataset_churn_ml_${endLabel}`;
  exportToCsv(fileSlug, [headers, ...rows]);
};

// Export 2: Marketing Campaigns & Retention Audience (Supports Date Range)
export const exportMarketingAudienceCsv = (
  profiles: CustomerProfile[],
  dateRange?: { startDate?: string; endDate?: string }
) => {
  if (!profiles || profiles.length === 0) return;

  const hasRange = Boolean(dateRange?.startDate || dateRange?.endDate);
  const startLabel = dateRange?.startDate || 'Historico';
  const endLabel = dateRange?.endDate || new Date().toISOString().split('T')[0];

  const headers = [
    'ID Cliente',
    'Nombre / Razón Social',
    'Segmento Marketing',
    'Nivel Riesgo Churn',
    'Score Churn (%)',
    'Periodo Desde',
    'Periodo Hasta',
    'Días Sin Comprar',
    'Total Gastado LTV ($)',
    'Rubro Favorito',
    'Email de Contacto',
    'Teléfono / WhatsApp',
    'Estrategia de Retención',
    'Cupón Sugerido'
  ];

  const rows = profiles.map((p) => [
    p.customer.id,
    p.customer.name,
    p.marketing.segmentLabel,
    p.churn.label,
    `${p.churn.score}%`,
    startLabel,
    endLabel,
    p.rfm.recencyDays,
    p.rfm.monetaryLtv.toFixed(2),
    p.marketing.preferredCategory,
    p.customer.email || 'Sin email registrado',
    p.customer.phone || 'Sin teléfono',
    p.marketing.recommendedCampaign,
    p.marketing.suggestedCouponCode
  ]);

  const fileSlug = hasRange 
    ? `audiencia_marketing_${startLabel}_a_${endLabel}`
    : `audiencia_marketing_${endLabel}`;
  exportToCsv(fileSlug, [headers, ...rows]);
};
