import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  useCategories, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory, 
  Category 
} from '@/services/categories.service';
import { 
  Tags, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FolderTree, 
  Package, 
  Save, 
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term)
      );
    });
  }, [categories, searchTerm]);

  const handleOpenCreate = () => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setCategoryToEdit(category);
    setModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    try {
      await deleteCategoryMutation.mutateAsync(category.id);
      toast.success(`Categoría "${category.name}" eliminada correctamente`);
      setCategoryToDelete(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar la categoría';
      toast.error(typeof msg === 'string' ? msg : 'No se pudo eliminar la categoría');
    }
  };

  const totalProducts = categories.reduce((sum, c) => sum + (c._count?.products || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Tags className="h-8 w-8 text-primary" />
            Categorías y Rubros
          </h2>
          <p className="text-muted-foreground">
            Organice y clasifique el catálogo de productos de la ferretería.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <FolderTree className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-xs text-muted-foreground">Categorías Activas</div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <div className="text-xs text-muted-foreground">Artículos Clasificados</div>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Categories Table */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Cargando categorías...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <Layers className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No se encontraron categorías</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchTerm
                  ? 'No hay categorías que coincidan con la búsqueda.'
                  : 'Aún no se han definido categorías en el catálogo.'}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={handleOpenCreate} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Categoría
              </Button>
            )}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Nombre</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Descripción</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Categoría Superior</th>
                  <th className="h-11 px-4 text-center align-middle font-semibold text-muted-foreground">Productos</th>
                  <th className="h-11 px-4 text-right align-middle font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          <Tags className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground">{category.name}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {category.description || '-'}
                    </td>
                    <td className="p-4 align-middle">
                      {category.parent ? (
                        <Badge variant="outline">{category.parent.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Principal (Sin padre)</span>
                      )}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <Badge variant="secondary" className="font-semibold">
                        {category._count?.products ?? 0}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(category)}
                          title="Editar categoría"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setCategoryToDelete(category)}
                          title="Eliminar categoría"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categoryToEdit={categoryToEdit}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border space-y-4">
            <h3 className="text-lg font-bold text-foreground">¿Eliminar categoría?</h3>
            <p className="text-sm text-muted-foreground">
              ¿Está seguro que desea eliminar la categoría{' '}
              <strong className="text-foreground">"{categoryToDelete.name}"</strong>? Asegúrese de que no contenga
              artículos asociados.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleteCategoryMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(categoryToDelete)}
                disabled={deleteCategoryMutation.isPending}
              >
                {deleteCategoryMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit: Category | null;
  categories: Category[];
}

function CategoryModal({ open, onOpenChange, categoryToEdit, categories }: CategoryModalProps) {
  const isEditing = Boolean(categoryToEdit);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setDescription(categoryToEdit.description || '');
        setParentId(categoryToEdit.parentId || '');
      } else {
        setName('');
        setDescription('');
        setParentId('');
      }
      setError('');
    }
  }, [open, categoryToEdit]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      if (isEditing && categoryToEdit) {
        await updateMutation.mutateAsync({
          id: categoryToEdit.id,
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId || null,
        });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId || null,
        });
        toast.success('Categoría creada exitosamente');
      }
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar la categoría';
      toast.error(typeof msg === 'string' ? msg : 'Error de validación');
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar: ${categoryToEdit?.name}` : 'Nueva Categoría'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold">
              Nombre de la Categoría <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ej. Herramientas Neumáticas"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'border-destructive' : ''}
            />
            {error && <p className="text-[11px] text-destructive">{error}</p>}
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold">Categoría Superior (Opcional)</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Ninguna (Categoría Principal)</option>
              {categories
                .filter((c) => !categoryToEdit || c.id !== categoryToEdit.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-semibold">Descripción</label>
            <Textarea
              placeholder="Breve descripción del rubro o tipos de artículos..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
