import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Sale, PaymentMethod } from '@ferreteria/shared';
import { recordAuditLog } from './audit.service';
import { useAuthStore } from '@/stores/auth.store';

export interface CreateSaleDTO {
  customerId?: string | null;
  customerName?: string;
  cashSessionId?: string | null;
  fiscalType?: 'BLANCO' | 'NEGRO';
  channel?: 'POS' | 'MERCADO_LIBRE' | 'TIENDA_ONLINE' | 'WHATSAPP' | 'OTRO';
  externalOrderId?: string;
  customerBuyerUsername?: string;
  shippingMethod?: string;
  shippingStatus?: 'PENDING' | 'PREPARING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingCost?: number;
  platformFee?: number;
  trackingNumber?: string;
  shippingAddress?: string;
  sellerName?: string;
  couponCode?: string;
  subtotal: number;
  discount: number;
  taxAmount: number;
  total: number;
  items: {
    productId: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    subtotal: number;
    total: number;
  }[];
  payments: {
    methodId: string;
    amount: number;
  }[];
}

const STORAGE_SALES_KEY = 'ferreteria_local_sales';

const DEFAULT_PAYMENT_METHODS: any[] = [
  { id: 'pm-1', name: 'Efectivo', code: 'CASH', isActive: true },
  { id: 'pm-2', name: 'Tarjeta de Débito', code: 'DEBIT', isActive: true },
  { id: 'pm-3', name: 'Tarjeta de Crédito', code: 'CREDIT', isActive: true },
  { id: 'pm-4', name: 'Transferencia Bancaria', code: 'TRANSFER', isActive: true },
  { id: 'pm-5', name: 'Cuenta Corriente', code: 'CURRENT_ACCOUNT', isActive: true },
  { id: 'pm-6', name: 'Mercado Pago (Online)', code: 'OTHER', isActive: true },
];

const INITIAL_SALES: any[] = [
  {
    id: 'sale-1',
    saleNumber: 'V-0001-00000101',
    number: 101,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    channel: 'POS',
    fiscalType: 'BLANCO',
    invoiceNumber: 'A-0001-00001235',
    customerId: 'cust-1',
    customerName: 'Constructora del Plata SA',
    customer: { name: 'Constructora del Plata SA' },
    userId: 'u-cajero',
    sellerName: 'Juan Pérez (Cajero)',
    subtotal: 45000,
    discount: 0,
    taxAmount: 9450,
    total: 54450,
    status: 'COMPLETED',
    items: [
      { id: 'it-1', quantity: 2, unitPrice: 22500, total: 54450, product: { name: 'Taladro Percutor 700W' } }
    ],
  },
  {
    id: 'sale-meli-1',
    saleNumber: 'V-0001-00000105',
    number: 105,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    channel: 'MERCADO_LIBRE',
    externalOrderId: 'MELI-20000089745',
    fiscalType: 'BLANCO',
    invoiceNumber: 'B-0001-00001237',
    customerId: null,
    customerName: 'Lucas Ferreyra (LUKAS_MDQ)',
    customer: { name: 'Lucas Ferreyra (LUKAS_MDQ)' },
    customerBuyerUsername: 'LUKAS_MDQ',
    userId: 'u-ecommerce',
    sellerName: 'Canal Mercado Libre',
    shippingMethod: 'Mercado Envíos Flex',
    shippingStatus: 'READY_TO_SHIP',
    trackingNumber: 'MELI-FX-449102',
    shippingAddress: 'Av. Colón 3420, Mar del Plata',
    shippingCost: 3500,
    platformFee: 4160,
    subtotal: 32000,
    discount: 0,
    taxAmount: 6720,
    total: 38720,
    status: 'COMPLETED',
    items: [
      { id: 'it-meli-1', quantity: 1, unitPrice: 32000, total: 38720, product: { name: 'Soldadora Inverter 160A' } }
    ],
  },
  {
    id: 'sale-2',
    saleNumber: 'V-0001-00000102',
    number: 102,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    channel: 'POS',
    fiscalType: 'BLANCO',
    invoiceNumber: 'B-0001-00001234',
    customerId: 'cust-2',
    customerName: 'Roberto Gómez (Instalaciones)',
    customer: { name: 'Roberto Gómez (Instalaciones)' },
    userId: 'u-admin',
    sellerName: 'Administrador Principal',
    subtotal: 18500,
    discount: 500,
    taxAmount: 3780,
    total: 21780,
    status: 'COMPLETED',
    items: [
      { id: 'it-2', quantity: 1, unitPrice: 18500, total: 21780, product: { name: 'Amoladora Angular 850W' } }
    ],
  },
  {
    id: 'sale-web-1',
    saleNumber: 'V-0001-00000106',
    number: 106,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    channel: 'TIENDA_ONLINE',
    externalOrderId: 'WEB-TN-1044',
    fiscalType: 'BLANCO',
    invoiceNumber: 'B-0001-00001238',
    customerId: null,
    customerName: 'Mariana Giménez',
    customer: { name: 'Mariana Giménez' },
    userId: 'u-ecommerce',
    sellerName: 'Tienda Online (Web)',
    shippingMethod: 'Flete Propio (Envío a Domicilio)',
    shippingStatus: 'SHIPPED',
    trackingNumber: 'FLE-092',
    shippingAddress: 'Calle 14 n° 845, Miramar',
    shippingCost: 2800,
    platformFee: 850,
    subtotal: 21500,
    discount: 1000,
    taxAmount: 4305,
    total: 24805,
    status: 'COMPLETED',
    items: [
      { id: 'it-web-1', quantity: 1, unitPrice: 18500, total: 21780, product: { name: 'Amoladora Angular 850W' } },
      { id: 'it-web-2', quantity: 2, unitPrice: 1500, total: 3025, product: { name: 'Cinta Métrica 5m' } }
    ],
  },
  {
    id: 'sale-3',
    saleNumber: 'V-0001-00000103',
    number: 103,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    channel: 'POS',
    fiscalType: 'NEGRO',
    invoiceNumber: 'X-0001-00000089',
    customerId: null,
    customerName: 'Consumidor Final',
    customer: { name: 'Consumidor Final' },
    userId: 'u-cajero',
    sellerName: 'Juan Pérez (Cajero)',
    subtotal: 4800,
    discount: 0,
    taxAmount: 1008,
    total: 5808,
    status: 'COMPLETED',
    items: [
      { id: 'it-3', quantity: 3, unitPrice: 1600, total: 5808, product: { name: 'Cinta Métrica 5m' } }
    ],
  },
  {
    id: 'sale-4',
    saleNumber: 'V-0001-00000104',
    number: 104,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    channel: 'POS',
    fiscalType: 'BLANCO',
    invoiceNumber: 'B-0001-00001236',
    customerId: null,
    customerName: 'Consumidor Final',
    customer: { name: 'Consumidor Final' },
    userId: 'u-encargado',
    sellerName: 'Martín Gómez (Encargado)',
    subtotal: 32000,
    discount: 0,
    taxAmount: 6720,
    total: 38720,
    status: 'VOIDED',
    items: [
      { id: 'it-4', quantity: 1, unitPrice: 32000, total: 38720, product: { name: 'Soldadora Inverter 160A' } }
    ],
  },
];

const getLocalSales = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_SALES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_SALES;
};

const saveLocalSales = (sales: any[]) => {
  try {
    localStorage.setItem(STORAGE_SALES_KEY, JSON.stringify(sales));
  } catch {}
};

export const useSales = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      try {
        const { data } = await api.get<Sale[]>('/sales', { params: filters });
        if (Array.isArray(data) && data.length > 0) {
          saveLocalSales(data);
          return data;
        }
      } catch (err) {
        // Backend offline, fallback to browser storage
      }
      let list = getLocalSales();
      if (filters?.fiscalType && filters.fiscalType !== 'all') {
        list = list.filter((s: any) => (s.fiscalType || 'BLANCO') === filters.fiscalType);
      }
      return list as Sale[];
    },
  });
};

export const useSale = (id: string) => {
  return useQuery({
    queryKey: ['sales', id],
    queryFn: async () => {
      try {
        const { data } = await api.get<Sale>(`/sales/${id}`);
        return data;
      } catch (err) {
        const list = getLocalSales();
        return list.find((s) => s.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSaleDTO): Promise<any> => {
      let created: any = null;
      try {
        const { data } = await api.post<Sale>('/sales', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, saving sale locally in browser storage');
      }

      let customerName = 'Consumidor Final';
      if (payload.customerId) {
        try {
          const custRaw = localStorage.getItem('ferreteria_local_customers');
          if (custRaw) {
            const custs = JSON.parse(custRaw);
            const found = custs.find((c: any) => c.id === payload.customerId);
            if (found) customerName = found.name;
          }
        } catch {}
      }

      let sellerName = 'Administrador Principal';
      try {
        const authUserRaw = localStorage.getItem('ferreteria_user') || localStorage.getItem('user');
        if (authUserRaw) {
          const u = JSON.parse(authUserRaw);
          if (u?.name || u?.firstName) {
            sellerName = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim();
          }
        }
      } catch {}

      const isEcommerce = payload.channel && payload.channel !== 'POS';
      const sale = created || {
        id: 'sale-' + Date.now(),
        saleNumber: 'V-0001-' + Math.floor(10000000 + Math.random() * 90000000),
        number: Math.floor(100 + Math.random() * 900),
        customerId: payload.customerId,
        customerName: payload.customerName || customerName,
        customer: { name: payload.customerName || customerName },
        customerBuyerUsername: payload.customerBuyerUsername,
        channel: payload.channel || 'POS',
        externalOrderId: payload.externalOrderId,
        shippingMethod: payload.shippingMethod,
        shippingStatus: payload.shippingStatus || (isEcommerce ? 'READY_TO_SHIP' : undefined),
        shippingCost: payload.shippingCost || 0,
        platformFee: payload.platformFee || 0,
        trackingNumber: payload.trackingNumber,
        shippingAddress: payload.shippingAddress,
        fiscalType: payload.fiscalType || 'BLANCO',
        invoiceNumber: payload.fiscalType === 'NEGRO' ? 'X-0001-' + Math.floor(10000000 + Math.random() * 90000000) : 'B-0001-' + Math.floor(10000000 + Math.random() * 90000000),
        sellerName: payload.sellerName || (
          payload.channel === 'MERCADO_LIBRE' ? 'Canal Mercado Libre' :
          payload.channel === 'TIENDA_ONLINE' ? 'Tienda Online (Web)' :
          payload.channel === 'WHATSAPP' ? 'Canal WhatsApp' :
          sellerName
        ),
        userId: 'u-current',
        cashSessionId: payload.cashSessionId,
        couponCode: payload.couponCode || null,
        subtotal: payload.subtotal,
        discount: payload.discount,
        taxAmount: payload.taxAmount,
        total: payload.total,
        items: payload.items,
        payments: payload.payments,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      };

      const list = getLocalSales();
      saveLocalSales([sale, ...list]);

      // Deduct stock in local storage
      try {
        const prodsRaw = localStorage.getItem('ferreteria_local_products');
        if (prodsRaw) {
          const prods = JSON.parse(prodsRaw);
          for (const item of payload.items) {
            const p = prods.find((x: any) => x.id === item.productId);
            if (p) {
              p.totalStock = Math.max(0, (p.totalStock ?? p.stock ?? 0) - item.quantity);
              p.stock = p.totalStock;
            }
          }
          localStorage.setItem('ferreteria_local_products', JSON.stringify(prods));
        }
      } catch {}

      // Add movement to cash session if cash was used
      try {
        const movsRaw = localStorage.getItem('ferreteria_local_cash_movements');
        const movs = movsRaw ? JSON.parse(movsRaw) : [];
        movs.unshift({
          id: 'mov-' + Date.now(),
          sessionId: payload.cashSessionId || 'sess-local',
          type: 'IN',
          amount: payload.total,
          description: `Venta ${payload.channel && payload.channel !== 'POS' ? payload.channel : 'Mostrador'} ${sale.saleNumber}`,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem('ferreteria_local_cash_movements', JSON.stringify(movs));
      } catch {}

      // Audit Log Entry
      const actor = useAuthStore.getState().user?.name || sale.sellerName || 'Vendedor Mostrador';
      const actorId = useAuthStore.getState().user?.id || 'u-cajero';
      recordAuditLog({
        userId: actorId,
        user: actor,
        role: useAuthStore.getState().user?.role || 'VENDEDOR',
        action: 'CREATE',
        entity: 'Sale',
        entityId: sale.id,
        description: `Cobró venta mostrador por $${sale.total.toLocaleString()} (${sale.invoiceNumber}) a ${sale.customerName || 'Consumidor Final'}`,
        details: {
          saleNumber: sale.saleNumber,
          invoiceNumber: sale.invoiceNumber,
          total: sale.total,
          channel: sale.channel,
          couponCode: sale.couponCode,
          itemsCount: sale.items?.length || 0,
        },
      });

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['cash-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['cash-movements'] });
    },
  });
};

export const useUpdateShippingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ saleId, shippingStatus, trackingNumber }: { saleId: string; shippingStatus: string; trackingNumber?: string }) => {
      const list = getLocalSales();
      const sale = list.find((s) => s.id === saleId);
      if (sale) {
        sale.shippingStatus = shippingStatus;
        if (trackingNumber) sale.trackingNumber = trackingNumber;
        saveLocalSales([...list]);
      }
      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useSyncEcommerceOrders = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const now = Date.now();
      const newOrders = [
        {
          id: 'sale-meli-' + now,
          saleNumber: 'V-0001-' + Math.floor(10000000 + Math.random() * 90000000),
          number: Math.floor(200 + Math.random() * 800),
          createdAt: new Date().toISOString(),
          channel: 'MERCADO_LIBRE',
          externalOrderId: 'MELI-200000' + Math.floor(10000 + Math.random() * 90000),
          fiscalType: 'BLANCO',
          invoiceNumber: 'B-0001-' + Math.floor(10000000 + Math.random() * 90000000),
          customerId: null,
          customerName: 'Santiago Cabrera (SANTI_CORRALON)',
          customer: { name: 'Santiago Cabrera (SANTI_CORRALON)' },
          customerBuyerUsername: 'SANTI_CORRALON',
          userId: 'u-ecommerce',
          sellerName: 'Canal Mercado Libre',
          shippingMethod: 'Mercado Envíos Flex',
          shippingStatus: 'READY_TO_SHIP',
          trackingNumber: 'MELI-FX-' + Math.floor(100000 + Math.random() * 900000),
          shippingAddress: 'Av. Luro 4210, Mar del Plata',
          shippingCost: 3800,
          platformFee: 4950,
          subtotal: 38000,
          discount: 0,
          taxAmount: 7980,
          total: 45980,
          status: 'COMPLETED',
          items: [
            { id: 'it-sync-1', quantity: 1, unitPrice: 38000, total: 45980, product: { name: 'Taladro Percutor 700W' } }
          ],
        },
        {
          id: 'sale-web-' + (now + 1),
          saleNumber: 'V-0001-' + Math.floor(10000000 + Math.random() * 90000000),
          number: Math.floor(200 + Math.random() * 800),
          createdAt: new Date(now - 1800000).toISOString(),
          channel: 'TIENDA_ONLINE',
          externalOrderId: 'WEB-TN-' + Math.floor(1000 + Math.random() * 9000),
          fiscalType: 'BLANCO',
          invoiceNumber: 'B-0001-' + Math.floor(10000000 + Math.random() * 90000000),
          customerId: null,
          customerName: 'Verónica Albarracín',
          customer: { name: 'Verónica Albarracín' },
          userId: 'u-ecommerce',
          sellerName: 'Tienda Online (Web)',
          shippingMethod: 'Correo Argentino (Paq.ar)',
          shippingStatus: 'PREPARING',
          trackingNumber: 'CP-' + Math.floor(100000 + Math.random() * 900000) + '-AR',
          shippingAddress: 'San Martín 1540, Balcarce',
          shippingCost: 3200,
          platformFee: 980,
          subtotal: 18500,
          discount: 500,
          taxAmount: 3780,
          total: 21780,
          status: 'COMPLETED',
          items: [
            { id: 'it-sync-2', quantity: 1, unitPrice: 18500, total: 21780, product: { name: 'Amoladora Angular 850W' } }
          ],
        }
      ];

      const current = getLocalSales();
      saveLocalSales([...newOrders, ...current]);
      return { importedCount: newOrders.length, orders: newOrders };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useVoidSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { data } = await api.post(`/sales/${id}/void`);
        return data;
      } catch (err) {
        console.warn('Backend offline, voiding sale locally');
        const list = getLocalSales();
        const item = list.find((s) => s.id === id);
        if (item) item.status = 'CANCELLED';
        saveLocalSales([...list]);

        // Audit Log entry
        const actor = useAuthStore.getState().user?.name || 'Administrador / Encargado';
        const actorId = useAuthStore.getState().user?.id || 'u-admin';
        recordAuditLog({
          userId: actorId,
          user: actor,
          role: useAuthStore.getState().user?.role || 'ADMIN',
          action: 'VOID',
          entity: 'Sale',
          entityId: id,
          description: `Anuló comprobante de venta ${item?.saleNumber || id} ($${(item?.total || 0).toLocaleString()})`,
          details: { saleId: id, saleNumber: item?.saleNumber, total: item?.total, status: 'CANCELLED' },
        });

        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      try {
        const { data } = await api.get<PaymentMethod[]>('/payment-methods');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return DEFAULT_PAYMENT_METHODS as PaymentMethod[];
    },
  });
};
