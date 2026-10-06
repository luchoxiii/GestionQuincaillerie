import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exportToCsv, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // e.g. 15 for 15% or 5000 for $5000
  minPurchaseAmount?: number;
  maxDiscountAmount?: number; // tope máximo de descuento
  targetSegment?: string; // 'ALL' | 'VIP' | 'LOYAL_POTENTIAL' | 'AT_RISK' | 'HIBERNATING' | 'NEW' | 'BIG_BUILDER' | 'OCCASIONAL'
  expirationDate?: string; // YYYY-MM-DD
  maxUses?: number;
  usedCount: number;
  totalDiscountGiven: number;
  totalRevenueGenerated: number;
  isActive: boolean;
  createdAt: string;
}

const STORAGE_COUPONS_KEY = 'ferreteria_marketing_coupons';

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'BIENVENIDO10',
    description: 'Kit de bienvenida comercial: 10% OFF en la segunda compra.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchaseAmount: 5000,
    maxDiscountAmount: 15000,
    targetSegment: 'NEW',
    expirationDate: '2026-12-31',
    maxUses: 100,
    usedCount: 14,
    totalDiscountGiven: 18450,
    totalRevenueGenerated: 184500,
    isActive: true,
    createdAt: '2026-08-01T10:00:00.000Z'
  },
  {
    id: 'coup-2',
    code: 'LEALTAD15',
    description: 'Beneficio de fidelización para compradores recurrentes.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minPurchaseAmount: 10000,
    maxDiscountAmount: 25000,
    targetSegment: 'LOYAL_POTENTIAL',
    expirationDate: '2026-12-31',
    maxUses: 80,
    usedCount: 22,
    totalDiscountGiven: 48600,
    totalRevenueGenerated: 324000,
    isActive: true,
    createdAt: '2026-08-05T14:30:00.000Z'
  },
  {
    id: 'coup-3',
    code: 'VIP_EXCLUSIVE',
    description: 'Bonificación preferencial exclusiva para clientes VIP y campeones.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minPurchaseAmount: 20000,
    maxDiscountAmount: 50000,
    targetSegment: 'VIP',
    expirationDate: '2026-12-31',
    maxUses: 50,
    usedCount: 9,
    totalDiscountGiven: 64800,
    totalRevenueGenerated: 324000,
    isActive: true,
    createdAt: '2026-08-10T09:15:00.000Z'
  },
  {
    id: 'coup-4',
    code: 'CORRALON_VIP',
    description: 'Tarifa preferencial para corralones, constructoras y obras B2B.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minPurchaseAmount: 50000,
    maxDiscountAmount: 100000,
    targetSegment: 'BIG_BUILDER',
    expirationDate: '2026-12-31',
    maxUses: 40,
    usedCount: 6,
    totalDiscountGiven: 82500,
    totalRevenueGenerated: 550000,
    isActive: true,
    createdAt: '2026-08-12T11:00:00.000Z'
  },
  {
    id: 'coup-5',
    code: 'TE_EXTRANAMOS',
    description: 'Retención preventiva para clientes valiosos con signos de inactividad.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minPurchaseAmount: 8000,
    maxDiscountAmount: 20000,
    targetSegment: 'AT_RISK',
    expirationDate: '2026-12-31',
    maxUses: 60,
    usedCount: 11,
    totalDiscountGiven: 26400,
    totalRevenueGenerated: 176000,
    isActive: true,
    createdAt: '2026-08-15T16:00:00.000Z'
  },
  {
    id: 'coup-6',
    code: 'VUELVE20',
    description: 'Campaña de rescate y reactivación de cuentas hibernando (>90 días sin comprar).',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minPurchaseAmount: 5000,
    maxDiscountAmount: 30000,
    targetSegment: 'HIBERNATING',
    expirationDate: '2026-12-31',
    maxUses: 50,
    usedCount: 8,
    totalDiscountGiven: 31200,
    totalRevenueGenerated: 156000,
    isActive: true,
    createdAt: '2026-08-18T12:00:00.000Z'
  },
  {
    id: 'coup-7',
    code: 'FERRETERIA10',
    description: 'Descuento general para mostrador y tienda online.',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minPurchaseAmount: 3000,
    maxDiscountAmount: 10000,
    targetSegment: 'ALL',
    expirationDate: '2026-12-31',
    maxUses: 200,
    usedCount: 45,
    totalDiscountGiven: 42300,
    totalRevenueGenerated: 423000,
    isActive: true,
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'coup-8',
    code: 'AHORRO5000',
    description: '$5.000 de descuento fijo en compras superiores a $30.000.',
    discountType: 'FIXED',
    discountValue: 5000,
    minPurchaseAmount: 30000,
    maxDiscountAmount: 5000,
    targetSegment: 'ALL',
    expirationDate: '2026-12-31',
    maxUses: 100,
    usedCount: 16,
    totalDiscountGiven: 80000,
    totalRevenueGenerated: 576000,
    isActive: true,
    createdAt: '2026-08-25T15:00:00.000Z'
  }
];

export const getStoredCoupons = (): Coupon[] => {
  try {
    const raw = localStorage.getItem(STORAGE_COUPONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
      return INITIAL_COUPONS;
    }
    return parsed;
  } catch {
    return INITIAL_COUPONS;
  }
};

export const saveStoredCoupons = (coupons: Coupon[]): void => {
  try {
    localStorage.setItem(STORAGE_COUPONS_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error('Error saving coupons:', e);
  }
};

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  coupon?: Coupon;
  calculatedDiscount: number;
}

export const validateCoupon = (
  rawCode: string,
  subtotal: number,
  customerSegment?: string
): CouponValidationResult => {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { isValid: false, message: 'Ingrese un código de cupón', calculatedDiscount: 0 };
  }

  const coupons = getStoredCoupons();
  const coupon = coupons.find((c) => c.code.toUpperCase() === code);

  if (!coupon) {
    return { isValid: false, message: `El cupón "${code}" no existe o es inválido`, calculatedDiscount: 0 };
  }

  if (!coupon.isActive) {
    return { isValid: false, message: `El cupón "${code}" se encuentra pausado o inactivo`, calculatedDiscount: 0 };
  }

  // Check expiration date
  if (coupon.expirationDate) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (coupon.expirationDate < todayStr) {
      return { isValid: false, message: `El cupón "${code}" expiró el ${coupon.expirationDate}`, calculatedDiscount: 0 };
    }
  }

  // Check max uses
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { isValid: false, message: `El cupón "${code}" ha alcanzado el límite máximo de canjes`, calculatedDiscount: 0 };
  }

  // Check minimum purchase amount
  if (coupon.minPurchaseAmount && subtotal < coupon.minPurchaseAmount) {
    return {
      isValid: false,
      message: `El cupón "${code}" requiere una compra mínima de ${formatCurrency(coupon.minPurchaseAmount)} (Subtotal actual: ${formatCurrency(subtotal)})`,
      calculatedDiscount: 0
    };
  }

  // Calculate discount
  let calculatedDiscount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    calculatedDiscount = (subtotal * coupon.discountValue) / 100;
  } else {
    calculatedDiscount = Math.min(coupon.discountValue, subtotal);
  }

  // Respect max discount amount cap
  if (coupon.maxDiscountAmount && calculatedDiscount > coupon.maxDiscountAmount) {
    calculatedDiscount = coupon.maxDiscountAmount;
  }

  // Round to 2 decimals
  calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;

  return {
    isValid: true,
    message: `¡Cupón "${coupon.code}" aplicado! Ahorro: ${formatCurrency(calculatedDiscount)}`,
    coupon,
    calculatedDiscount
  };
};

export const recordCouponRedemption = (
  rawCode: string,
  discountGiven: number,
  saleTotal: number
): void => {
  if (!rawCode) return;
  const code = rawCode.trim().toUpperCase();
  const coupons = getStoredCoupons();
  const idx = coupons.findIndex((c) => c.code.toUpperCase() === code);
  if (idx >= 0) {
    coupons[idx].usedCount = (coupons[idx].usedCount || 0) + 1;
    coupons[idx].totalDiscountGiven = (coupons[idx].totalDiscountGiven || 0) + Number(discountGiven || 0);
    coupons[idx].totalRevenueGenerated = (coupons[idx].totalRevenueGenerated || 0) + Number(saleTotal || 0);
    saveStoredCoupons(coupons);
  }
};

export const exportCouponsCsv = (coupons: Coupon[]): void => {
  const headers = [
    'Código Cupón',
    'Descripción / Estrategia',
    'Tipo Descuento',
    'Valor Descuento',
    'Compra Mínima ($)',
    'Tope Máximo ($)',
    'Segmento Objetivo',
    'Fecha Vencimiento',
    'Usos Registrados',
    'Límite de Usos',
    'Total Descontado ($)',
    'Facturación Generada ($)',
    'Ticket Promedio con Cupón ($)',
    'Tasa de Redención (%)',
    'Estado'
  ];

  const rows = coupons.map((c) => {
    const discountStr = c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `$${c.discountValue}`;
    const avgTicket = c.usedCount > 0 ? (c.totalRevenueGenerated / c.usedCount).toFixed(2) : '0.00';
    const redemptionRate = c.maxUses ? `${((c.usedCount / c.maxUses) * 100).toFixed(1)}%` : 'N/A';
    return [
      c.code,
      c.description,
      c.discountType === 'PERCENTAGE' ? 'Porcentaje' : 'Monto Fijo',
      discountStr,
      c.minPurchaseAmount ? c.minPurchaseAmount.toFixed(2) : '0.00',
      c.maxDiscountAmount ? c.maxDiscountAmount.toFixed(2) : 'Sin tope',
      c.targetSegment || 'ALL',
      c.expirationDate || 'Sin vencimiento',
      c.usedCount.toString(),
      c.maxUses ? c.maxUses.toString() : 'Ilimitado',
      c.totalDiscountGiven.toFixed(2),
      c.totalRevenueGenerated.toFixed(2),
      avgTicket,
      redemptionRate,
      c.isActive ? 'Activo' : 'Pausado'
    ];
  });

  const dateSlug = new Date().toISOString().split('T')[0];
  exportToCsv(`cupones_promociones_${dateSlug}`, [headers, ...rows]);
  toast.success(`Reporte de cupones exportado con éxito (${coupons.length} promociones)`);
};

// React Query Hooks
export const useCoupons = () => {
  return useQuery<Coupon[]>({
    queryKey: ['marketing-coupons'],
    queryFn: async () => {
      return getStoredCoupons();
    }
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newCouponData: Omit<Coupon, 'id' | 'usedCount' | 'totalDiscountGiven' | 'totalRevenueGenerated' | 'createdAt'>) => {
      const coupons = getStoredCoupons();
      const codeUpper = newCouponData.code.trim().toUpperCase();

      if (coupons.some(c => c.code.toUpperCase() === codeUpper)) {
        throw new Error(`Ya existe un cupón con el código "${codeUpper}"`);
      }

      const createdCoupon: Coupon = {
        ...newCouponData,
        id: `coup-${Date.now()}`,
        code: codeUpper,
        usedCount: 0,
        totalDiscountGiven: 0,
        totalRevenueGenerated: 0,
        createdAt: new Date().toISOString()
      };

      const updated = [createdCoupon, ...coupons];
      saveStoredCoupons(updated);
      return createdCoupon;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success(`Cupón "${created.code}" creado con éxito`);
    }
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Coupon> }) => {
      const coupons = getStoredCoupons();
      const idx = coupons.findIndex(c => c.id === id);
      if (idx === -1) throw new Error('Cupón no encontrado');

      coupons[idx] = { ...coupons[idx], ...data };
      saveStoredCoupons(coupons);
      return coupons[idx];
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success(`Cupón "${updated.code}" actualizado`);
    }
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const coupons = getStoredCoupons();
      const filtered = coupons.filter(c => c.id !== id);
      saveStoredCoupons(filtered);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-coupons'] });
      toast.success('Cupón eliminado correctamente');
    }
  });
};
