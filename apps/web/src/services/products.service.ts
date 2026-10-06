import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { matchProductNatural } from '@ferreteria/shared';

export interface ProductBarcode {
  id?: string;
  barcode: string;
  type?: string;
}

export interface ProductTax {
  id?: string;
  taxId: string;
  tax?: {
    id: string;
    name: string;
    rate: number;
  };
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
}

export interface Product {
  id: string;
  code: string;
  sku?: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  unitId?: string | null;
  isActive: boolean;
  costPrice: number;
  profitMargin?: number | null;
  salePrice: number;
  price?: number;
  minStock?: number | null;
  maxStock?: number | null;
  totalStock?: number;
  stock?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  category?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  unit?: { id: string; name: string; abbreviation: string } | null;
  barcodes?: ProductBarcode[];
  taxes?: ProductTax[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductInput {
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  isActive?: boolean;
  costPrice: number;
  profitMargin?: number;
  salePrice: number;
  minStock?: number;
  maxStock?: number;
  barcodes?: { barcode: string; type?: string }[];
  taxIds?: string[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string;
}

export interface MassPriceUpdatePayload {
  categoryId?: string;
  brandId?: string;
  percentage?: number;
  percentageChange?: number;
  round?: boolean;
  roundTo?: number;
}

const STORAGE_KEY = 'ferreteria_local_products';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'TAL-001',
    sku: 'TAL-001',
    name: 'Taladro Percutor 700W Bosch GSB 13 RE',
    description: 'Taladro percutor profesional con mandril de 13mm, velocidad variable y reversa.',
    categoryId: 'cat1',
    brandId: 'b1',
    unitId: 'u1',
    costPrice: 32000,
    profitMargin: 40.62,
    salePrice: 45000,
    price: 45000,
    minStock: 5,
    maxStock: 50,
    stock: 15,
    totalStock: 15,
    isActive: true,
    status: 'ACTIVE',
    barcodes: [{ barcode: '7791234567890' }],
    taxes: [{ taxId: 't1', tax: { id: 't1', name: 'IVA 21%', rate: 21 } }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    code: 'MAR-002',
    sku: 'MAR-002',
    name: 'Martillo Galponero Stanley Mango Fibra',
    description: 'Martillo de uña curva 450g con mango ergonómico antideslizante.',
    categoryId: 'cat2',
    brandId: 'b2',
    unitId: 'u1',
    costPrice: 5500,
    profitMargin: 54.54,
    salePrice: 8500,
    price: 8500,
    minStock: 5,
    maxStock: 40,
    stock: 4,
    totalStock: 4,
    isActive: true,
    status: 'ACTIVE',
    barcodes: [{ barcode: '7799876543210' }],
    taxes: [{ taxId: 't1', tax: { id: 't1', name: 'IVA 21%', rate: 21 } }],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    code: 'AMO-003',
    sku: 'AMO-003',
    name: 'Amoladora Angular 4 1/2 DeWalt 820W DWE4010',
    description: 'Motor potente de 820W para corte y desbaste en metal y mampostería.',
    categoryId: 'cat1',
    brandId: 'b3',
    unitId: 'u1',
    costPrice: 42000,
    profitMargin: 42.85,
    salePrice: 60000,
    price: 60000,
    minStock: 3,
    maxStock: 30,
    stock: 8,
    totalStock: 8,
    isActive: true,
    status: 'ACTIVE',
    barcodes: [{ barcode: '7795551234567' }],
    taxes: [{ taxId: 't1', tax: { id: 't1', name: 'IVA 21%', rate: 21 } }],
    createdAt: new Date().toISOString(),
  },
];

const getLocalProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return INITIAL_PRODUCTS;
};

const saveLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error writing localStorage:', e);
  }
};

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (filters: any) => [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
  brands: () => [...PRODUCT_KEYS.all, 'brands'] as const,
  units: () => [...PRODUCT_KEYS.all, 'units'] as const,
  taxes: () => [...PRODUCT_KEYS.all, 'taxes'] as const,
};

const mapProduct = (p: any): Product => ({
  ...p,
  sku: p.code || p.sku,
  price: Number(p.salePrice ?? p.price ?? 0),
  costPrice: Number(p.costPrice ?? 0),
  profitMargin: p.profitMargin !== null && p.profitMargin !== undefined ? Number(p.profitMargin) : null,
  salePrice: Number(p.salePrice ?? 0),
  minStock: p.minStock !== null && p.minStock !== undefined ? Number(p.minStock) : null,
  maxStock: p.maxStock !== null && p.maxStock !== undefined ? Number(p.maxStock) : null,
  stock: Number(p.totalStock ?? p.stock ?? 0),
  totalStock: Number(p.totalStock ?? p.stock ?? 0),
  status: p.isActive !== false ? 'ACTIVE' : 'INACTIVE',
});

export const useProducts = (filters?: { search?: string; categoryId?: string; brandId?: string; page?: number; limit?: number }) => {
  return useQuery<Product[]>({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: async (): Promise<Product[]> => {
      try {
        const { data } = await api.get('/products', { params: filters });
        const list = Array.isArray(data) ? data : (data.data || []);
        if (list.length > 0) {
          const mapped = list.map(mapProduct);
          saveLocalProducts(mapped);
          return mapped;
        }
      } catch (err) {
        // Backend offline or unreachable, fallback to local storage
      }

      let local = getLocalProducts();
      if (filters?.search) {
        local = local.filter((p) => matchProductNatural(p, filters.search!));
      }
      if (filters?.categoryId) {
        local = local.filter((p) => p.categoryId === filters.categoryId);
      }
      return local;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery<Product>({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: async (): Promise<Product> => {
      try {
        const { data } = await api.get(`/products/${id}`);
        return mapProduct(data);
      } catch (err) {
        const list = getLocalProducts();
        const found = list.find((p) => p.id === id);
        if (found) return found;
        throw new Error('Producto no encontrado');
      }
    },
    enabled: !!id && id !== 'nuevo',
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateProductInput): Promise<Product> => {
      let created: any = null;
      try {
        const { data } = await api.post('/products', payload);
        created = data;
      } catch (err) {
        console.warn('Backend offline, saving product to browser storage');
      }

      const newProduct: Product = {
        id: created?.id || 'prod-' + Date.now(),
        code: payload.code,
        sku: payload.code,
        name: payload.name,
        description: payload.description || '',
        categoryId: payload.categoryId,
        brandId: payload.brandId,
        unitId: payload.unitId,
        costPrice: Number(payload.costPrice),
        profitMargin: payload.profitMargin !== undefined ? Number(payload.profitMargin) : null,
        salePrice: Number(payload.salePrice),
        price: Number(payload.salePrice),
        minStock: payload.minStock !== undefined ? Number(payload.minStock) : 5,
        maxStock: payload.maxStock !== undefined ? Number(payload.maxStock) : 100,
        stock: 10,
        totalStock: 10,
        isActive: payload.isActive !== false,
        status: payload.isActive !== false ? 'ACTIVE' : 'INACTIVE',
        barcodes: payload.barcodes || [],
        createdAt: new Date().toISOString(),
      };

      const list = getLocalProducts();
      const updated = [newProduct, ...list.filter((p) => p.id !== newProduct.id)];
      saveLocalProducts(updated);

      return created ? mapProduct(created) : newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateProductInput) => {
      try {
        await api.put(`/products/${id}`, payload);
      } catch (err) {
        console.warn('Backend offline, updating product in browser storage');
      }

      const list = getLocalProducts();
      const index = list.findIndex((p) => p.id === id);
      if (index !== -1) {
        const current = list[index];
        const updatedProduct: Product = {
          ...current,
          ...payload,
          code: payload.code || current.code,
          sku: payload.code || current.sku,
          name: payload.name || current.name,
          description: payload.description !== undefined ? payload.description : current.description,
          costPrice: payload.costPrice !== undefined ? Number(payload.costPrice) : current.costPrice,
          profitMargin: payload.profitMargin !== undefined ? Number(payload.profitMargin) : current.profitMargin,
          salePrice: payload.salePrice !== undefined ? Number(payload.salePrice) : current.salePrice,
          price: payload.salePrice !== undefined ? Number(payload.salePrice) : current.price,
          minStock: payload.minStock !== undefined ? Number(payload.minStock) : current.minStock,
          maxStock: payload.maxStock !== undefined ? Number(payload.maxStock) : current.maxStock,
          isActive: payload.isActive !== undefined ? payload.isActive : current.isActive,
          status: (payload.isActive !== undefined ? payload.isActive : current.isActive) ? 'ACTIVE' : 'INACTIVE',
          barcodes: payload.barcodes || current.barcodes,
        };
        list[index] = updatedProduct;
        saveLocalProducts([...list]);
      }
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/products/${id}`);
      } catch (err) {
        console.warn('Backend offline, deleting product from browser storage');
      }

      const list = getLocalProducts();
      const updated = list.filter((p) => p.id !== id);
      saveLocalProducts(updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useBrands = () => {
  return useQuery<Brand[]>({
    queryKey: PRODUCT_KEYS.brands(),
    queryFn: async (): Promise<Brand[]> => {
      try {
        const { data } = await api.get('/products/brands');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return [
        { id: 'b1', name: 'Bosch' },
        { id: 'b2', name: 'Stanley' },
        { id: 'b3', name: 'DeWalt' },
        { id: 'b4', name: 'Makita' },
        { id: 'b5', name: 'Black+Decker' },
        { id: 'b6', name: 'Bahco' },
      ] as Brand[];
    },
  });
};

export const useUnits = () => {
  return useQuery<UnitOfMeasure[]>({
    queryKey: PRODUCT_KEYS.units(),
    queryFn: async (): Promise<UnitOfMeasure[]> => {
      try {
        const { data } = await api.get('/products/units');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return [
        { id: 'u1', name: 'Unidad', abbreviation: 'UN' },
        { id: 'u2', name: 'Metro', abbreviation: 'M' },
        { id: 'u3', name: 'Kilogramo', abbreviation: 'KG' },
        { id: 'u4', name: 'Litro', abbreviation: 'LT' },
        { id: 'u5', name: 'Juego / Set', abbreviation: 'SET' },
        { id: 'u6', name: 'Caja', abbreviation: 'CJ' },
      ] as UnitOfMeasure[];
    },
  });
};

export const useTaxes = () => {
  return useQuery<Tax[]>({
    queryKey: PRODUCT_KEYS.taxes(),
    queryFn: async (): Promise<Tax[]> => {
      try {
        const { data } = await api.get('/products/taxes');
        if (Array.isArray(data) && data.length > 0) return data;
      } catch {}
      return [
        { id: 't1', name: 'IVA 21%', rate: 21.0 },
        { id: 't2', name: 'IVA 10.5%', rate: 10.5 },
        { id: 't3', name: 'IVA 27%', rate: 27.0 },
        { id: 't4', name: 'Exento 0%', rate: 0.0 },
      ] as Tax[];
    },
  });
};

export const useMassPriceUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MassPriceUpdatePayload) => {
      const percentageChange = payload.percentageChange ?? payload.percentage ?? 0;
      const roundTo = payload.roundTo ?? (payload.round ? 0 : 2);
      try {
        const { data } = await api.post('/products/mass-price-update', {
          categoryId: payload.categoryId,
          brandId: payload.brandId,
          percentageChange,
          roundTo,
        });
        return data;
      } catch (err) {
        console.warn('Backend offline, mass price update locally');
        const list = getLocalProducts();
        const factor = Math.pow(10, roundTo);
        const updated = list.map((p) => {
          if (payload.categoryId && p.categoryId !== payload.categoryId) return p;
          if (payload.brandId && p.brandId !== payload.brandId) return p;
          let newPrice = p.salePrice * (1 + percentageChange / 100);
          newPrice = Math.round(newPrice * factor) / factor;
          return { ...p, salePrice: newPrice, price: newPrice };
        });
        saveLocalProducts(updated);
        return { updatedCount: updated.length };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};

export const useExportProducts = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get('/products/export', { responseType: 'blob' });
      return data;
    },
  });
};

export const useImportProducts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
};
