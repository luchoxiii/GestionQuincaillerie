import { api } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children?: Category[];
  _count?: { products: number; children: number };
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

const STORAGE_KEY_CATEGORIES = "ferreteria_local_categories";

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat1", name: "Herramientas Eléctricas", description: "Taladros, amoladoras, sierras", _count: { products: 12, children: 0 } },
  { id: "cat2", name: "Herramientas Manuales", description: "Martillos, pinzas, destornilladores", _count: { products: 28, children: 0 } },
  { id: "cat3", name: "Fijaciones y Tornillería", description: "Tornillos, tarugos, tuercas, bulones", _count: { products: 154, children: 0 } },
  { id: "cat4", name: "Pinturas y Accesorios", description: "Látex, sintéticos, pinceles, rodillos", _count: { products: 45, children: 0 } },
  { id: "cat5", name: "Electricidad e Iluminación", description: "Cables, térmicas, lámparas LED", _count: { products: 67, children: 0 } },
  { id: "cat6", name: "Plomería y Gas", description: "Caños termofusión, accesorios, llaves", _count: { products: 39, children: 0 } },
];

const getLocalCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading localStorage for categories:", e);
  }
  return INITIAL_CATEGORIES;
};

const saveLocalCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error("Error saving localStorage for categories:", e);
  }
};

const CATEGORY_KEYS = {
  all: ["categories"] as const,
  tree: () => [...CATEGORY_KEYS.all, "tree"] as const,
  lists: () => [...CATEGORY_KEYS.all, "list"] as const,
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: CATEGORY_KEYS.lists(),
    queryFn: async (): Promise<Category[]> => {
      try {
        const res = await api.get<Category[]>("/categories");
        if (Array.isArray(res.data) && res.data.length > 0) {
          saveLocalCategories(res.data);
          return res.data;
        }
      } catch (err) {
        // Backend offline, fallback to local storage
      }
      return getLocalCategories();
    },
  });
};

export const useCategoryTree = () => {
  return useQuery<Category[]>({
    queryKey: CATEGORY_KEYS.tree(),
    queryFn: async (): Promise<Category[]> => {
      try {
        const res = await api.get<Category[]>("/categories/tree");
        if (Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch {}
      return getLocalCategories();
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      let created: any = null;
      try {
        const res = await api.post("/categories", data);
        created = res.data;
      } catch (err) {
        console.warn("Backend offline, saving category to browser storage");
      }

      const list = getLocalCategories();
      const parent = data.parentId ? list.find((c) => c.id === data.parentId) : null;
      const newCat: Category = {
        id: created?.id || "cat-" + Date.now(),
        name: data.name,
        description: data.description || "",
        parentId: data.parentId || null,
        parent: parent ? { id: parent.id, name: parent.name } : null,
        _count: { products: 0, children: 0 },
      };

      saveLocalCategories([newCat, ...list]);
      return created || newCat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCategoryInput) => {
      try {
        await api.put(`/categories/${id}`, data);
      } catch (err) {
        console.warn("Backend offline, updating category in browser storage");
      }

      const list = getLocalCategories();
      const index = list.findIndex((c) => c.id === id);
      if (index !== -1) {
        const current = list[index];
        const parent = data.parentId ? list.find((c) => c.id === data.parentId) : null;
        list[index] = {
          ...current,
          ...data,
          name: data.name || current.name,
          description: data.description !== undefined ? data.description : current.description,
          parentId: data.parentId !== undefined ? data.parentId : current.parentId,
          parent: parent ? { id: parent.id, name: parent.name } : current.parent,
        };
        saveLocalCategories([...list]);
      }
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/categories/${id}`);
      } catch (err) {
        console.warn("Backend offline, deleting category from browser storage");
      }

      const list = getLocalCategories();
      const updated = list.filter((c) => c.id !== id);
      saveLocalCategories(updated);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
};
