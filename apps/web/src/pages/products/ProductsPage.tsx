import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProducts, useDeleteProduct, Product } from '@/services/products.service';
import { useCategories } from '@/services/categories.service';
import { matchProductNatural } from '@ferreteria/shared';
import { Link } from 'react-router-dom';
import { Plus, Percent, Search, Edit2, Trash2, AlertTriangle, PackageOpen, Download, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MassPriceUpdateModal } from './MassPriceUpdateModal';
import { ProductExcelImportModal } from '@/components/products/ProductExcelImportModal';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [massUpdateOpen, setMassUpdateOpen] = useState(false);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const deleteProductMutation = useDeleteProduct();

  // Filter products by search and category using Natural Language Engine
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const matchSearch = matchProductNatural(product, searchTerm);
      const matchCategory = !selectedCategory || product.categoryId === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleDelete = async (product: Product) => {
    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast.success(`Producto "${product.name}" eliminado correctamente`);
      setProductToDelete(null);
    } catch (err: any) {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error('No hay productos para exportar');
      return;
    }

    const headers = [
      'ID',
      'Código SKU',
      'Nombre del Producto',
      'Categoría',
      'Precio Costo ($)',
      'Margen (%)',
      'Precio Venta ($)',
      'Stock Actual',
      'Stock Mínimo',
      'Alerta de Reposición',
      'Estado'
    ];

    const rows = filteredProducts.map((p: Product) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || 'Sin Categoría';
      const stock = p.stock ?? p.totalStock ?? 0;
      const minStock = p.minStock ?? 5;
      const needsRestock = stock <= minStock ? 'REPONER URGENTE' : 'NORMAL';

      return [
        p.id,
        p.code || p.sku || '',
        p.name,
        cat,
        Number(p.costPrice || 0).toFixed(2),
        Number(p.profitMargin || 0).toFixed(2),
        Number(p.price ?? p.salePrice ?? 0).toFixed(2),
        stock,
        minStock,
        needsRestock,
        p.isActive !== false ? 'Activo' : 'Inactivo'
      ];
    });

    exportToCsv(`catalogo_productos_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Catálogo de productos exportado a CSV con éxito');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Catálogo de Productos</h2>
          <p className="text-muted-foreground">
            Administre artículos, precios, códigos de barras y alertas de stock de la ferretería.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setExcelImportOpen(true)}
            className="border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Importar Excel
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Catálogo CSV
          </Button>
          <Button variant="outline" onClick={() => setMassUpdateOpen(true)}>
            <Percent className="mr-2 h-4 w-4 text-primary" />
            Ajuste Masivo de Precios
          </Button>
          <Button asChild>
            <Link to="/productos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en lenguaje natural (ej. 'cemento 50kg', 'sin stock', '< 15000')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table Card */}
      <Card>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No se encontraron productos</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchTerm || selectedCategory
                  ? 'No hay productos que coincidan con los filtros seleccionados.'
                  : 'Aún no has registrado ningún producto en el catálogo.'}
              </p>
            </div>
            {!searchTerm && !selectedCategory && (
              <Button asChild className="mt-2">
                <Link to="/productos/nuevo">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Primer Producto
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/40">
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">SKU / Código</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Nombre</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Costo</th>
                  <th className="h-11 px-4 text-left align-middle font-semibold text-muted-foreground">Precio Venta</th>
                  <th className="h-11 px-4 text-center align-middle font-semibold text-muted-foreground">Stock</th>
                  <th className="h-11 px-4 text-center align-middle font-semibold text-muted-foreground">Estado</th>
                  <th className="h-11 px-4 text-right align-middle font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0 divide-y">
                {filteredProducts.map((product: Product) => {
                  const sku = product.code || product.sku || '-';
                  const isLowStock =
                    product.minStock !== null &&
                    product.minStock !== undefined &&
                    (product.totalStock ?? product.stock ?? 0) <= product.minStock;

                  return (
                    <tr key={product.id} className="transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle font-mono font-medium text-xs text-muted-foreground">
                        {sku}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium text-foreground">{product.name}</div>
                        {product.barcodes?.[0]?.barcode && (
                          <div className="text-xs text-muted-foreground font-mono">
                            EAN: {product.barcodes[0].barcode}
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        ${(product.costPrice || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 align-middle font-semibold text-primary">
                        ${(product.salePrice || product.price || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 align-middle text-center">
                        <div className="inline-flex items-center gap-1.5 font-medium">
                          {isLowStock && (
                            <span title="Bajo stock mínimo">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                          <span className={isLowStock ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                            {product.totalStock ?? product.stock ?? 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <Badge variant={product.isActive !== false ? 'default' : 'secondary'}>
                          {product.isActive !== false ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/productos/${product.id}`} title="Editar producto">
                              <Edit2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setProductToDelete(product)}
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border space-y-4">
            <h3 className="text-lg font-bold text-foreground">¿Eliminar producto?</h3>
            <p className="text-sm text-muted-foreground">
              ¿Está seguro que desea eliminar el producto{' '}
              <strong className="text-foreground">"{productToDelete.name}"</strong>? El producto se marcará como
              inactivo en el catálogo.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setProductToDelete(null)}
                disabled={deleteProductMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(productToDelete)}
                disabled={deleteProductMutation.isPending}
              >
                {deleteProductMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <MassPriceUpdateModal open={massUpdateOpen} onOpenChange={setMassUpdateOpen} />
      <ProductExcelImportModal open={excelImportOpen} onOpenChange={setExcelImportOpen} />
    </div>
  );
}
