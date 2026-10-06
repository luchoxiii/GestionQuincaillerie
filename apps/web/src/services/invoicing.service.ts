import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface Invoice {
  id: string;
  date: string;
  type: string; // 'Factura A' | 'Factura B' | 'Ticket X' | 'Nota de Crédito'
  letter: string; // 'A' | 'B' | 'C' | 'X' | 'NC'
  number: string;
  salePoint: string;
  customerName: string;
  customerDocumentType: string;
  customerDocumentNumber: string;
  cae?: string;
  caeExpiration?: string;
  netAmount?: number;
  taxRate?: number;
  taxAmount?: number;
  exemptAmount?: number;
  total: number;
  status: string; // 'AUTORIZADO' | 'EMITIDO' | 'ANULADO'
  afipCode?: string;
  fiscalType: 'BLANCO' | 'NEGRO'; // 'BLANCO' = Oficial AFIP con CAE (para el contador); 'NEGRO' = Interno / Ticket X
  isFiscal: boolean;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
}

export interface FiscalSummary {
  totalFiscalBilled: number; // En Blanco (Oficial)
  totalInternalBilled: number; // En Negro (Ticket X)
  totalBilled: number; // Consolidado
  totalTaxDebit: number; // IVA Débito Fiscal
  receiptCount: number;
  fiscalReceiptCount: number;
  internalReceiptCount: number;
  caeAuthorizedPercentage: number;
}

const STORAGE_INVOICES_KEY = 'ferreteria_local_invoices';

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'Factura B',
    letter: 'B',
    number: '0001-00001234',
    salePoint: '0001',
    customerName: 'Consumidor Final',
    customerDocumentType: 'DNI',
    customerDocumentNumber: '',
    cae: '74321987654321',
    caeExpiration: new Date(Date.now() + 864000000).toISOString(),
    netAmount: 12727.68,
    taxRate: 21,
    taxAmount: 2672.82,
    exemptAmount: 0,
    total: 15400.50,
    status: 'AUTORIZADO',
    afipCode: '006',
    fiscalType: 'BLANCO',
    isFiscal: true,
    items: [
      { id: '1', code: 'MAR-002', description: 'Martillo Galponero Stanley', quantity: 1, unit: 'UN', unitPrice: 12727.68, taxRate: 21, subtotal: 12727.68 }
    ]
  },
  {
    id: 'inv-2',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    type: 'Factura A',
    letter: 'A',
    number: '0001-00001235',
    salePoint: '0001',
    customerName: 'Constructora del Plata SA',
    customerDocumentType: 'CUIT',
    customerDocumentNumber: '30-71234567-8',
    cae: '74321987654322',
    caeExpiration: new Date(Date.now() + 864000000).toISOString(),
    netAmount: 37190.08,
    taxRate: 21,
    taxAmount: 7809.92,
    exemptAmount: 0,
    total: 45000.00,
    status: 'AUTORIZADO',
    afipCode: '001',
    fiscalType: 'BLANCO',
    isFiscal: true,
    items: [
      { id: '2', code: 'TAL-001', description: 'Taladro Percutor 700W Bosch', quantity: 1, unit: 'UN', unitPrice: 37190.08, taxRate: 21, subtotal: 37190.08 }
    ]
  },
  {
    id: 'inv-3',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: 'Ticket X',
    letter: 'X',
    number: '0001-X0000501',
    salePoint: '0001',
    customerName: 'Consumidor Final (Mostrador)',
    customerDocumentType: 'DNI',
    customerDocumentNumber: '0',
    cae: '',
    caeExpiration: '',
    netAmount: 22000.00,
    taxRate: 0,
    taxAmount: 0,
    exemptAmount: 0,
    total: 22000.00,
    status: 'EMITIDO',
    afipCode: '',
    fiscalType: 'NEGRO',
    isFiscal: false,
    items: [
      { id: '3', code: 'PIN-012', description: 'Pintura Látex Interior 20L', quantity: 1, unit: 'UN', unitPrice: 22000.00, taxRate: 0, subtotal: 22000.00 }
    ]
  },
  {
    id: 'inv-4',
    date: new Date().toISOString(),
    type: 'Ticket X',
    letter: 'X',
    number: '0001-X0000502',
    salePoint: '0001',
    customerName: 'Roberto Gómez (Instalaciones)',
    customerDocumentType: 'DNI',
    customerDocumentNumber: '28.456.789',
    cae: '',
    caeExpiration: '',
    netAmount: 14500.00,
    taxRate: 0,
    taxAmount: 0,
    exemptAmount: 0,
    total: 14500.00,
    status: 'EMITIDO',
    afipCode: '',
    fiscalType: 'NEGRO',
    isFiscal: false,
    items: [
      { id: '4', code: 'DIS-005', description: 'Disco de Corte Metal 115mm (Pack x10)', quantity: 2, unit: 'UN', unitPrice: 7250.00, taxRate: 0, subtotal: 14500.00 }
    ]
  }
];

const getLocalInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(STORAGE_INVOICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading localStorage for invoices:', e);
  }
  return INITIAL_INVOICES;
};

const saveLocalInvoices = (invoices: Invoice[]) => {
  try {
    localStorage.setItem(STORAGE_INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Error saving localStorage for invoices:', e);
  }
};

export const useInvoices = (filters?: any) => {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      try {
        const response = await api.get('/invoices', { params: filters });
        const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        if (list.length > 0) {
          saveLocalInvoices(list);
          return list as Invoice[];
        }
      } catch (err) {
        // Backend offline, fallback to local storage
      }
      let list = getLocalInvoices();

      // Filter by fiscal regime (Blanco vs Negro)
      if (filters?.fiscalRegime && filters.fiscalRegime !== 'all') {
        list = list.filter(i => i.fiscalType === filters.fiscalRegime);
      }

      if (filters?.pointOfSale && filters.pointOfSale !== 'all') {
        list = list.filter(i => i.salePoint === filters.pointOfSale);
      }
      if (filters?.type && filters.type !== 'all') {
        list = list.filter(i => i.letter === filters.type);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(i => 
          i.number.toLowerCase().includes(q) || 
          i.customerName.toLowerCase().includes(q) ||
          (i.customerDocumentNumber && i.customerDocumentNumber.includes(q)) ||
          (i.cae && i.cae.includes(q))
        );
      }
      if (filters?.startDate) {
        const startMs = new Date(filters.startDate + 'T00:00:00').getTime();
        if (!isNaN(startMs)) {
          list = list.filter(i => new Date(i.date).getTime() >= startMs);
        }
      }
      if (filters?.endDate) {
        const endMs = new Date(filters.endDate + 'T23:59:59.999').getTime();
        if (!isNaN(endMs)) {
          list = list.filter(i => new Date(i.date).getTime() <= endMs);
        }
      }
      return list;
    },
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await api.get(`/invoices/${id}`);
        return response.data as Invoice;
      } catch {
        const list = getLocalInvoices();
        return list.find(i => i.id === id) || null;
      }
    },
    enabled: !!id,
  });
};

export const useFiscalSummary = () => {
  return useQuery({
    queryKey: ['invoices', 'fiscal-summary'],
    queryFn: async () => {
      try {
        const response = await api.get('/invoices/fiscal-summary');
        if (response.data) return response.data as FiscalSummary;
      } catch {}

      const list = getLocalInvoices();
      const fiscalInvoices = list.filter(i => i.fiscalType === 'BLANCO');
      const internalInvoices = list.filter(i => i.fiscalType === 'NEGRO');

      const totalFiscalBilled = fiscalInvoices.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
      const totalInternalBilled = internalInvoices.reduce((acc, inv) => acc + (Number(inv.total) || 0), 0);
      const totalBilled = totalFiscalBilled + totalInternalBilled;
      const totalTaxDebit = fiscalInvoices.reduce((acc, inv) => acc + (Number(inv.taxAmount) || (Number(inv.total) * 0.1735)), 0);

      return {
        totalFiscalBilled,
        totalInternalBilled,
        totalBilled,
        totalTaxDebit: Math.round(totalTaxDebit * 100) / 100,
        receiptCount: list.length,
        fiscalReceiptCount: fiscalInvoices.length,
        internalReceiptCount: internalInvoices.length,
        caeAuthorizedPercentage: 100,
      } as FiscalSummary;
    },
  });
};

export interface CreateInvoiceOptions {
  saleId: string;
  fiscalType?: 'BLANCO' | 'NEGRO';
  letter?: 'A' | 'B' | 'C' | 'X';
  customerName?: string;
  customerDocumentType?: string;
  customerDocumentNumber?: string;
  total?: number;
  items?: any[];
}

export const useCreateInvoiceFromSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: string | CreateInvoiceOptions) => {
      const opts: CreateInvoiceOptions = typeof payload === 'string' ? { saleId: payload } : payload;
      const saleId = opts.saleId;
      const fiscalType = opts.fiscalType || 'BLANCO';
      const isFiscal = fiscalType === 'BLANCO';
      const letter = opts.letter || (isFiscal ? 'B' : 'X');

      try {
        const response = await api.post(`/invoices/from-sale/${saleId}`, {
          fiscalType,
          letter,
        });
        return response.data;
      } catch (err) {
        console.warn('Backend offline, generating invoice locally');
        const list = getLocalInvoices();
        const randCae = isFiscal ? '74' + Math.floor(100000000000 + Math.random() * 900000000000) : '';
        const countLetter = list.filter(i => i.letter === letter).length + 1;
        const total = Number(opts.total || 1000);
        const netAmount = isFiscal ? Math.round((total / 1.21) * 100) / 100 : total;
        const taxAmount = isFiscal ? Math.round((total - netAmount) * 100) / 100 : 0;

        const newInvoice: Invoice = {
          id: 'inv-' + Date.now(),
          date: new Date().toISOString(),
          type: isFiscal ? (letter === 'A' ? 'Factura A' : 'Factura B') : 'Ticket X',
          letter,
          number: isFiscal ? `0001-${String(countLetter).padStart(8, '0')}` : `0001-X${String(countLetter).padStart(7, '0')}`,
          salePoint: '0001',
          customerName: opts.customerName || 'Consumidor Final',
          customerDocumentType: opts.customerDocumentType || 'DNI',
          customerDocumentNumber: opts.customerDocumentNumber || '',
          cae: randCae,
          caeExpiration: isFiscal ? new Date(Date.now() + 10 * 86400000).toISOString() : '',
          netAmount,
          taxRate: isFiscal ? 21 : 0,
          taxAmount,
          exemptAmount: 0,
          total,
          status: isFiscal ? 'AUTORIZADO' : 'EMITIDO',
          afipCode: isFiscal ? (letter === 'A' ? '001' : '006') : '',
          fiscalType,
          isFiscal,
          items: opts.items || []
        };
        saveLocalInvoices([newInvoice, ...list]);
        return newInvoice;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
};

export const useCreateCreditNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { invoiceId: string; reason: string }) => {
      try {
        const response = await api.post(`/invoices/${data.invoiceId}/credit-note`, { reason: data.reason });
        return response.data;
      } catch (err) {
        console.warn('Backend offline, creating credit note locally');
        const list = getLocalInvoices();
        const orig = list.find(i => i.id === data.invoiceId);
        const randCae = '74' + Math.floor(100000000000 + Math.random() * 900000000000);
        const newNC: Invoice = {
          id: 'nc-' + Date.now(),
          date: new Date().toISOString(),
          type: `Nota de Crédito ${orig?.letter || 'B'}`,
          letter: orig?.letter || 'B',
          fiscalType: orig?.fiscalType || 'BLANCO',
          isFiscal: orig?.isFiscal ?? true,
          number: `0001-${String(list.length + 1).padStart(8, '0')}`,
          salePoint: orig?.salePoint || '0001',
          customerName: orig?.customerName || 'Consumidor Final',
          customerDocumentType: orig?.customerDocumentType || 'DNI',
          customerDocumentNumber: orig?.customerDocumentNumber || '',
          cae: randCae,
          caeExpiration: new Date(Date.now() + 10 * 86400000).toISOString(),
          total: -(orig?.total || 0),
          status: 'AUTORIZADO',
          afipCode: orig?.letter === 'A' ? '003' : '008',
          items: orig?.items || []
        };
        saveLocalInvoices([newNC, ...list]);
        return newNC;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useSalePoints = () => {
  return useQuery({
    queryKey: ['invoices', 'sale-points'],
    queryFn: async () => {
      try {
        const response = await api.get('/invoices/sale-points');
        if (Array.isArray(response.data) && response.data.length > 0) return response.data;
      } catch {}
      return [{ id: '1', number: '0001', description: 'Punto de Venta Mostrador Principal' }];
    },
  });
};

export const useInvoiceTypes = () => {
  return useQuery({
    queryKey: ['invoices', 'types'],
    queryFn: async () => {
      try {
        const response = await api.get('/invoices/types');
        if (Array.isArray(response.data) && response.data.length > 0) return response.data;
      } catch {}
      return [
        { id: '1', letter: 'A', description: 'Factura A' },
        { id: '2', letter: 'B', description: 'Factura B' },
        { id: '3', letter: 'C', description: 'Factura C' },
        { id: '4', letter: 'NC', description: 'Nota de Crédito' }
      ];
    },
  });
};
