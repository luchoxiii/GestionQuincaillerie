import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'EXPIRED' | 'CONVERTED' | 'CANCELLED';

export interface QuoteItem {
  id: string;
  productId: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface Quote {
  id: string;
  number: string;
  createdAt: string;
  validUntil: string;
  validityHours: number;
  status: QuoteStatus;
  customerId?: string | null;
  customerName: string;
  customerDocument?: string;
  customerPhone?: string;
  customerEmail?: string;
  currency?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  totalSecondary?: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  items: QuoteItem[];
  notes?: string;
  termsAndConditions?: string;
  convertedSaleId?: string | null;
  convertedAt?: string | null;
  createdBy?: string;
}

export interface CreateQuoteInput {
  customerId?: string | null;
  customerName: string;
  customerDocument?: string;
  customerPhone?: string;
  customerEmail?: string;
  validityHours: number;
  validUntil?: string;
  currency?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  items: Array<{
    productId: string;
    code: string;
    name: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    discountPct?: number;
    taxRate?: number;
  }>;
  notes?: string;
  termsAndConditions?: string;
}

const STORAGE_KEY_QUOTES = 'ferreteria_local_quotes';

const INITIAL_QUOTES: Quote[] = [
  {
    id: 'cot-1001',
    number: 'COT-2026-001',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 46 * 3600 * 1000).toISOString(),
    validityHours: 48,
    status: 'SENT',
    customerId: 'cust-1',
    customerName: 'Constructora del Plata SA',
    customerDocument: '30-71234567-8',
    customerPhone: '+54 9 11 4567-8901',
    customerEmail: 'compras@constructoradelplata.com',
    currency: 'ARS',
    currencySymbol: '$',
    exchangeRate: 1350,
    subtotal: 185000,
    discountTotal: 9250,
    taxTotal: 36907.5,
    total: 212657.5,
    totalSecondary: 157.52,
    items: [
      {
        id: 'item-1',
        productId: 'prod-cemento-1',
        code: 'CEM-LOM-50',
        name: 'Cemento Loma Negra Portland 50kg',
        unit: 'BOLSA',
        quantity: 20,
        unitPrice: 7500,
        discountPct: 5,
        taxRate: 21,
        subtotal: 142500,
        taxAmount: 29925,
        total: 172425,
      },
      {
        id: 'item-2',
        productId: 'prod-varilla-1',
        code: 'ACER-VAR-12',
        name: 'Varilla de Hierro Nervado Acindar 12mm x 12m',
        unit: 'UNID',
        quantity: 10,
        unitPrice: 4250,
        discountPct: 5,
        taxRate: 21,
        subtotal: 40375,
        taxAmount: 8478.75,
        total: 48853.75,
      },
    ],
    notes: 'Materiales para inicio de obra en Olivos. Entregar en acoplado.',
    termsAndConditions: 'Precios válidos por 48 hs sujeto a stock disponible. Flete sin cargo en CABA y GBA Norte.',
    createdBy: 'Martín Rodríguez',
  },
  {
    id: 'cot-1002',
    number: 'COT-2026-002',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 156 * 3600 * 1000).toISOString(),
    validityHours: 168, // 7 días
    status: 'ACCEPTED',
    customerId: 'cust-2',
    customerName: 'Instalaciones Martinez SRL',
    customerDocument: '30-68492012-3',
    customerPhone: '+54 9 11 3456-7890',
    customerEmail: 'info@instalacionesmartinez.com',
    subtotal: 94800,
    discountTotal: 4740,
    taxTotal: 18912.6,
    total: 108972.6,
    items: [
      {
        id: 'item-3',
        productId: 'prod-amoladora-1',
        code: 'MAQ-AMO-DEW',
        name: 'Amoladora Angular DeWalt 4 1/2" 820W DWE4010',
        unit: 'UNID',
        quantity: 1,
        unitPrice: 65000,
        discountPct: 5,
        taxRate: 21,
        subtotal: 61750,
        taxAmount: 12967.5,
        total: 74717.5,
      },
      {
        id: 'item-4',
        productId: 'prod-disco-1',
        code: 'DIS-COR-TYR',
        name: 'Disco de Corte Fino Tyrolit 115 x 1.0mm (Caja x 25)',
        unit: 'CAJA',
        quantity: 2,
        unitPrice: 14900,
        discountPct: 5,
        taxRate: 21,
        subtotal: 28310,
        taxAmount: 5945.1,
        total: 34255.1,
      },
    ],
    notes: 'Cliente aprobó vía WhatsApp, retira por mostrador central.',
    termsAndConditions: 'Garantía oficial DeWalt 3 años. 5% de bonificación por pago contado/transferencia.',
    createdBy: 'Laura Gómez',
  },
  {
    id: 'cot-1003',
    number: 'COT-2026-003',
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    validUntil: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    validityHours: 48,
    status: 'EXPIRED',
    customerId: null,
    customerName: 'Roberto Carlos Díaz (Paso)',
    customerPhone: '+54 9 11 6789-0123',
    subtotal: 58000,
    discountTotal: 0,
    taxTotal: 12180,
    total: 70180,
    items: [
      {
        id: 'item-5',
        productId: 'prod-latex-1',
        code: 'PIN-LAT-ALBA',
        name: 'Pintura Látex Interior Alba Albalatex 20 Lts Blanco',
        unit: 'BALDE',
        quantity: 1,
        unitPrice: 58000,
        discountPct: 0,
        taxRate: 21,
        subtotal: 58000,
        taxAmount: 12180,
        total: 70180,
      },
    ],
    notes: 'Presupuesto de mostrador solicitado verbalmente.',
    termsAndConditions: 'Validez 48 horas. Vencido.',
    createdBy: 'Martín Rodríguez',
  },
  {
    id: 'cot-1004',
    number: 'COT-2026-004',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    validityHours: 48,
    status: 'CONVERTED',
    customerId: 'cust-3',
    customerName: 'Juan Pérez (Electricista)',
    customerDocument: '20-33445566-7',
    customerPhone: '+54 9 11 2233-4455',
    subtotal: 38400,
    discountTotal: 0,
    taxTotal: 8064,
    total: 46464,
    items: [
      {
        id: 'item-6',
        productId: 'prod-cable-1',
        code: 'ELE-CAB-PRYS',
        name: 'Cable Unipolar Prysmian 2.5 mm² Rollo 100m Celeste',
        unit: 'ROLLO',
        quantity: 1,
        unitPrice: 38400,
        discountPct: 0,
        taxRate: 21,
        subtotal: 38400,
        taxAmount: 8064,
        total: 46464,
      },
    ],
    convertedSaleId: 'sale-101',
    convertedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notes: 'Convertido en caja principal ticket #9823.',
    createdBy: 'Lucas Vendedor',
  },
  {
    id: 'cot-1005',
    number: 'COT-2026-005',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 68 * 3600 * 1000).toISOString(),
    validityHours: 72,
    status: 'SENT',
    customerId: 'cust-1',
    customerName: 'Constructora del Plata SA',
    customerDocument: '30-71234567-8',
    customerPhone: '+54 9 11 4567-8901',
    customerEmail: 'compras@constructoradelplata.com',
    currency: 'USD',
    currencySymbol: 'US$',
    exchangeRate: 1350,
    subtotal: 280,
    discountTotal: 14,
    taxTotal: 55.86,
    total: 321.86,
    totalSecondary: 434511,
    items: [
      {
        id: 'item-usd-1',
        productId: 'prod-dewalt-rotomartillo',
        code: 'MAQ-ROT-DEW',
        name: 'Rotomartillo Electroneumático DeWalt SDS Plus 800W',
        unit: 'UNID',
        quantity: 2,
        unitPrice: 140,
        discountPct: 5,
        taxRate: 21,
        subtotal: 266,
        taxAmount: 55.86,
        total: 321.86,
      },
    ],
    notes: 'Presupuesto solicitado en Dólares Estadounidenses para compra mayorista.',
    termsAndConditions: 'Precios cotizados en USD. Pagadero en billete dólar o en pesos según tipo de cambio congelado de $1.350.',
    createdBy: 'Martín Rodríguez',
  },
];

function getStoredQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(INITIAL_QUOTES));
      return INITIAL_QUOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_QUOTES;
  } catch (e) {
    return INITIAL_QUOTES;
  }
}

function saveStoredQuotes(quotes: Quote[]) {
  try {
    localStorage.setItem(STORAGE_KEY_QUOTES, JSON.stringify(quotes));
  } catch (e) {
    console.error('Error saving quotes to localStorage', e);
  }
}

export function computeQuoteValidityStatus(quote: Quote): {
  isExpired: boolean;
  isExpiringSoon: boolean; // < 12 hours
  hoursRemaining: number;
  formattedRemaining: string;
} {
  const now = new Date().getTime();
  const validUntilTime = new Date(quote.validUntil).getTime();
  const diffMs = validUntilTime - now;
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs <= 0) {
    return {
      isExpired: true,
      isExpiringSoon: false,
      hoursRemaining: 0,
      formattedRemaining: 'Vencido',
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else {
    formatted = `${hours}h restantes`;
  }

  return {
    isExpired: false,
    isExpiringSoon: hoursRemaining <= 12,
    hoursRemaining,
    formattedRemaining: formatted,
  };
}

export interface QuoteFilters {
  search?: string;
  status?: string;
}

export function useQuotes(filters?: QuoteFilters) {
  return useQuery({
    queryKey: ['quotes', filters],
    queryFn: async () => {
      try {
        const res = await api.get('/quotes', { params: filters });
        if (res.data && Array.isArray(res.data)) {
          return res.data as Quote[];
        }
      } catch (err) {
        // Fallback to localStorage
      }

      let quotes = getStoredQuotes();

      // Dynamically reflect expired status if it hasn't been explicitly converted/cancelled
      quotes = quotes.map((q) => {
        if ((q.status === 'SENT' || q.status === 'DRAFT' || q.status === 'ACCEPTED') && new Date() > new Date(q.validUntil)) {
          return { ...q, status: 'EXPIRED' as QuoteStatus };
        }
        return q;
      });

      if (filters?.status && filters.status !== 'ALL') {
        quotes = quotes.filter((q) => q.status === filters.status);
      }

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        quotes = quotes.filter(
          (q) =>
            q.number.toLowerCase().includes(s) ||
            q.customerName.toLowerCase().includes(s) ||
            (q.customerDocument && q.customerDocument.toLowerCase().includes(s)) ||
            (q.customerPhone && q.customerPhone.toLowerCase().includes(s)) ||
            q.items.some((it) => it.name.toLowerCase().includes(s) || it.code.toLowerCase().includes(s))
        );
      }

      // Sort by createdAt descending
      return [...quotes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });
}

export function useQuote(id: string | null) {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await api.get(`/quotes/${id}`);
        if (res.data) return res.data as Quote;
      } catch (e) {
        // Fallback
      }
      const quotes = getStoredQuotes();
      return quotes.find((q) => q.id === id) || null;
    },
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuoteInput) => {
      try {
        const res = await api.post('/quotes', input);
        if (res.data) return res.data as Quote;
      } catch (e) {
        // Fallback to localStorage
      }

      const quotes = getStoredQuotes();
      const nextNum = quotes.length + 1;
      const formattedNum = `COT-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;

      const now = new Date();
      const validUntil =
        input.validUntil ||
        new Date(now.getTime() + input.validityHours * 3600 * 1000).toISOString();

      let subtotal = 0;
      let discountTotal = 0;
      let taxTotal = 0;

      const items: QuoteItem[] = input.items.map((item, idx) => {
        const itemQty = item.quantity || 1;
        const itemPrice = item.unitPrice || 0;
        const itemDiscPct = item.discountPct || 0;
        const itemTaxRate = item.taxRate !== undefined ? item.taxRate : 21;

        const baseSubtotal = itemPrice * itemQty;
        const discAmount = baseSubtotal * (itemDiscPct / 100);
        const subtotalAfterDisc = baseSubtotal - discAmount;
        const taxAmount = subtotalAfterDisc * (itemTaxRate / 100);
        const lineTotal = subtotalAfterDisc + taxAmount;

        subtotal += baseSubtotal;
        discountTotal += discAmount;
        taxTotal += taxAmount;

        return {
          id: `item-${Date.now()}-${idx}`,
          productId: item.productId,
          code: item.code,
          name: item.name,
          unit: item.unit || 'UNID',
          quantity: itemQty,
          unitPrice: itemPrice,
          discountPct: itemDiscPct,
          taxRate: itemTaxRate,
          subtotal: subtotalAfterDisc,
          taxAmount,
          total: lineTotal,
        };
      });

      const total = subtotal - discountTotal + taxTotal;

      const quoteCurrency = input.currency || 'ARS';
      const quoteSymbol = input.currencySymbol || (quoteCurrency === 'USD' ? 'US$' : '$');
      const quoteExchangeRate = input.exchangeRate || 1350;
      let totalSecondary = 0;
      if (quoteCurrency === 'USD') {
        totalSecondary = Math.round(total * quoteExchangeRate * 100) / 100;
      } else {
        totalSecondary = Math.round((total / quoteExchangeRate) * 100) / 100;
      }

      const newQuote: Quote = {
        id: `cot-${Date.now()}`,
        number: formattedNum,
        createdAt: now.toISOString(),
        validUntil,
        validityHours: input.validityHours,
        status: 'SENT',
        customerId: input.customerId || null,
        customerName: input.customerName,
        customerDocument: input.customerDocument,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        currency: quoteCurrency,
        currencySymbol: quoteSymbol,
        exchangeRate: quoteExchangeRate,
        totalSecondary,
        subtotal,
        discountTotal,
        taxTotal,
        total,
        items,
        notes: input.notes,
        termsAndConditions:
          input.termsAndConditions ||
          `Precios congelados por ${input.validityHours} hs hábiles sujeto a stock. Flete a convenir.`,
        createdBy: 'Vendedor en Turno',
      };

      quotes.unshift(newQuote);
      saveStoredQuotes(quotes);
      return newQuote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: QuoteStatus }) => {
      try {
        await api.patch(`/quotes/${id}/status`, { status });
      } catch (e) {
        // Fallback
      }

      const quotes = getStoredQuotes();
      const updated = quotes.map((q) => (q.id === id ? { ...q, status } : q));
      saveStoredQuotes(updated);
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useUpdateQuoteExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newExchangeRate }: { id: string; newExchangeRate: number }) => {
      try {
        await api.patch(`/quotes/${id}/exchange-rate`, { exchangeRate: newExchangeRate });
      } catch (e) {
        // Fallback
      }

      const quotes = getStoredQuotes();
      const updated = quotes.map((q) => {
        if (q.id === id) {
          const totalSecondary =
            q.currency === 'USD'
              ? Math.round(q.total * newExchangeRate * 100) / 100
              : Math.round((q.total / newExchangeRate) * 100) / 100;
          return {
            ...q,
            exchangeRate: newExchangeRate,
            totalSecondary,
          };
        }
        return q;
      });
      saveStoredQuotes(updated);
      return { id, newExchangeRate };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function useConvertQuoteToSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ quoteId, saleId }: { quoteId: string; saleId: string }) => {
      try {
        await api.post(`/quotes/${quoteId}/convert`, { saleId });
      } catch (e) {
        // Fallback
      }

      const quotes = getStoredQuotes();
      const updated = quotes.map((q) =>
        q.id === quoteId
          ? {
              ...q,
              status: 'CONVERTED' as QuoteStatus,
              convertedSaleId: saleId,
              convertedAt: new Date().toISOString(),
            }
          : q
      );
      saveStoredQuotes(updated);
      return { quoteId, saleId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
  });
}

export function convertQuoteToSaleDirect(quoteId: string, saleId: string) {
  const quotes = getStoredQuotes();
  const updated = quotes.map((q) =>
    q.id === quoteId
      ? {
          ...q,
          status: 'CONVERTED' as QuoteStatus,
          convertedSaleId: saleId,
          convertedAt: new Date().toISOString(),
        }
      : q
  );
  saveStoredQuotes(updated);
}

export function generateWhatsAppMessage(quote: Quote): string {
  const dateStr = new Date(quote.createdAt).toLocaleDateString('es-AR');
  const validDateStr = new Date(quote.validUntil).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isUSD = quote.currency === 'USD';
  const sym = isUSD ? 'US$' : '$';
  const rate = quote.exchangeRate || 1350;

  const lines = [
    `*PRESUPUESTO ${quote.number} - FERRETERÍA & CORRALÓN* 🏗️`,
    `📅 Fecha: ${dateStr}`,
    `👤 Cliente: *${quote.customerName}*`,
    `⏳ *Válido hasta:* ${validDateStr} (${quote.validityHours} hs)`,
  ];

  if (isUSD || quote.exchangeRate) {
    lines.push(`💵 *Moneda de Cotización:* ${isUSD ? 'Dólares Estadounidenses (USD)' : 'Pesos (ARS)'}`);
    lines.push(`📈 *Tipo de Cambio Pactado:* $${rate.toLocaleString('es-AR')} por USD`);
  }

  lines.push(`----------------------------------------`);
  lines.push(`*DETALLE DE MATERIALES:*`);

  quote.items.forEach((item, index) => {
    const qtyStr = `${item.quantity} ${item.unit}`;
    const priceStr = `${sym}${item.unitPrice.toLocaleString('es-AR')}`;
    const totStr = `${sym}${item.total.toLocaleString('es-AR')}`;
    lines.push(`${index + 1}. *${item.name}*`);
    lines.push(`   Cant: ${qtyStr} x ${priceStr} = *${totStr}*`);
  });

  lines.push(`----------------------------------------`);
  if (quote.discountTotal > 0) {
    lines.push(`Subtotal: ${sym}${quote.subtotal.toLocaleString('es-AR')}`);
    lines.push(`Descuento Bonificado: -${sym}${quote.discountTotal.toLocaleString('es-AR')}`);
  }

  if (isUSD) {
    const equivARS = quote.totalSecondary || (quote.total * rate);
    lines.push(`*TOTAL FINAL (IVA inc.): US$ ${quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}* 💵`);
    lines.push(`*Equivalente en Pesos:* $${equivARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (TC: $${rate.toLocaleString('es-AR')})`);
  } else {
    lines.push(`*TOTAL FINAL (IVA inc.): $${quote.total.toLocaleString('es-AR')}* 💵`);
    if (quote.exchangeRate) {
      const equivUSD = quote.totalSecondary || (quote.total / rate);
      lines.push(`*Equivalente en Dólares:* US$ ${equivUSD.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (TC: $${rate.toLocaleString('es-AR')})`);
    }
  }

  lines.push(``);
  lines.push(`⚠️ *IMPORTANTE:* Los precios y el stock están reservados exclusivamente hasta la fecha indicada de vencimiento.`);
  if (isUSD || quote.exchangeRate) {
    lines.push(`🔒 *Cotización Congelada:* $${rate.toLocaleString('es-AR')} garantizada por el plazo de validez.`);
  }
  if (quote.notes) {
    lines.push(`📝 *Observaciones:* ${quote.notes}`);
  }
  lines.push(``);
  lines.push(`Para confirmar tu pedido y congelar los materiales, podés responder a este WhatsApp o visitarnos en nuestro local.`);

  return lines.join('\n');
}

export function exportQuotesCsv(quotes: Quote[]) {
  const headers = [
    'Numero',
    'Fecha Emision',
    'Valido Hasta',
    'Estado',
    'Cliente',
    'Documento',
    'Telefono',
    'Moneda',
    'Tipo de Cambio',
    'Cant Items',
    'Subtotal',
    'Descuento',
    'IVA',
    'Total',
    'Total Secundario',
    'ID Venta Convertida',
  ];

  const rows = quotes.map((q) => [
    `"${q.number}"`,
    `"${new Date(q.createdAt).toLocaleDateString('es-AR')}"`,
    `"${new Date(q.validUntil).toLocaleString('es-AR')}"`,
    `"${q.status}"`,
    `"${q.customerName.replace(/"/g, '""')}"`,
    `"${q.customerDocument || ''}"`,
    `"${q.customerPhone || ''}"`,
    `"${q.currency || 'ARS'}"`,
    q.exchangeRate || 1350,
    q.items.length,
    q.subtotal.toFixed(2),
    q.discountTotal.toFixed(2),
    q.taxTotal.toFixed(2),
    q.total.toFixed(2),
    (q.totalSecondary || 0).toFixed(2),
    `"${q.convertedSaleId || ''}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `presupuestos_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
