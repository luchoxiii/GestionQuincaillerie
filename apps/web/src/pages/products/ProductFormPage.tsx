import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Barcode, 
  Sparkles, 
  Package, 
  DollarSign, 
  Layers, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  useProduct, 
  useCreateProduct, 
  useUpdateProduct, 
  useBrands, 
  useUnits, 
  useTaxes 
} from '@/services/products.service';
import { useCategories } from '@/services/categories.service';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'nuevo');
  const navigate = useNavigate();

  const { data: existingProduct, isLoading: isLoadingProduct } = useProduct(id || '');
  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { data: units = [] } = useUnits();
  const { data: taxes = [] } = useTaxes();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Form State
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Pricing State
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [profitMargin, setProfitMargin] = useState<number | ''>(35);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [selectedTaxId, setSelectedTaxId] = useState<string>('');

  // Stock alerts
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [maxStock, setMaxStock] = useState<number | ''>(100);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate data when editing
  useEffect(() => {
    if (isEditing && existingProduct) {
      setCode(existingProduct.code || existingProduct.sku || '');
      setBarcode(existingProduct.barcodes?.[0]?.barcode || '');
      setName(existingProduct.name || '');
      setDescription(existingProduct.description || '');
      setCategoryId(existingProduct.categoryId || '');
      setBrandId(existingProduct.brandId || '');
      setUnitId(existingProduct.unitId || '');
      setIsActive(existingProduct.isActive !== false);

      const cost = Number(existingProduct.costPrice || 0);
      const sale = Number(existingProduct.salePrice || 0);
      setCostPrice(cost);
      setSalePrice(sale);

      if (existingProduct.profitMargin !== null && existingProduct.profitMargin !== undefined) {
        setProfitMargin(Number(existingProduct.profitMargin));
      } else if (cost > 0) {
        setProfitMargin(Number((((sale - cost) / cost) * 100).toFixed(2)));
      }

      if (existingProduct.taxes?.[0]?.taxId) {
        setSelectedTaxId(existingProduct.taxes[0].taxId);
      }

      setMinStock(existingProduct.minStock ?? 5);
      setMaxStock(existingProduct.maxStock ?? 100);
    }
  }, [isEditing, existingProduct]);

  // Set default unit, tax and initial SKU when lists load in create mode
  useEffect(() => {
    if (!isEditing) {
      if (!code) {
        setCode(`ART-${Math.floor(1000 + Math.random() * 9000)}`);
      }
      if (!unitId && units.length > 0) {
        const defaultUnit = units.find(u => u.abbreviation === 'UN') || units[0];
        setUnitId(defaultUnit.id);
      }
      if (!selectedTaxId && taxes.length > 0) {
        const defaultTax = taxes.find(t => t.rate === 21) || taxes[0];
        setSelectedTaxId(defaultTax.id);
      }
    }
  }, [isEditing, units, taxes, unitId, selectedTaxId, code]);

  // Calculate prices dynamically
  const handleCostChange = (newCostVal: number | '') => {
    setCostPrice(newCostVal);
    if (typeof newCostVal === 'number' && newCostVal > 0 && typeof profitMargin === 'number') {
      const calculated = newCostVal * (1 + profitMargin / 100);
      setSalePrice(Math.round(calculated * 100) / 100);
    }
  };

  const handleMarginChange = (newMarginVal: number | '') => {
    setProfitMargin(newMarginVal);
    if (typeof costPrice === 'number' && costPrice > 0 && typeof newMarginVal === 'number') {
      const calculated = costPrice * (1 + newMarginVal / 100);
      setSalePrice(Math.round(calculated * 100) / 100);
    }
  };

  const handleSalePriceChange = (newSaleVal: number | '') => {
    setSalePrice(newSaleVal);
    if (typeof costPrice === 'number' && costPrice > 0 && typeof newSaleVal === 'number') {
      const calculatedMargin = ((newSaleVal - costPrice) / costPrice) * 100;
      setProfitMargin(Math.round(calculatedMargin * 100) / 100);
    }
  };

  // Helper generators
  const generateRandomSKU = () => {
    const prefix = name ? name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ART') : 'ART';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setCode(`${prefix}-${rand}`);
  };

  const generateRandomEAN = () => {
    // 779 = Argentine EAN prefix
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    setBarcode(`779${rand}`);
  };

  // Selected tax object
  const activeTax = taxes.find(t => t.id === selectedTaxId);
  const taxRate = activeTax ? activeTax.rate : 21;
  const numSalePrice = typeof salePrice === 'number' ? salePrice : 0;
  const priceWithTax = numSalePrice * (1 + taxRate / 100);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'El código / SKU es obligatorio';
    if (!name.trim()) newErrors.name = 'El nombre del producto es obligatorio';
    if (typeof costPrice !== 'number' || costPrice < 0) {
      newErrors.costPrice = 'El precio de costo debe ser mayor o igual a 0';
    }
    if (typeof salePrice !== 'number' || salePrice <= 0) {
      newErrors.salePrice = 'El precio de venta debe ser mayor a 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-fill SKU if empty
    let finalCode = code.trim();
    if (!finalCode) {
      finalCode = `ART-${Math.floor(1000 + Math.random() * 9000)}`;
      setCode(finalCode);
    }

    // Auto-calculate prices if only one was entered
    let currentCost = typeof costPrice === 'number' ? costPrice : 0;
    let currentSale = typeof salePrice === 'number' ? salePrice : 0;

    if (currentCost > 0 && currentSale <= 0) {
      currentSale = Math.round(currentCost * 1.35 * 100) / 100;
      setSalePrice(currentSale);
    } else if (currentSale > 0 && currentCost <= 0) {
      currentCost = Math.round((currentSale / 1.35) * 100) / 100;
      setCostPrice(currentCost);
    }

    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'El nombre del producto es obligatorio' }));
      toast.error('Por favor ingrese el nombre del producto');
      return;
    }

    if (currentSale <= 0) {
      setErrors(prev => ({ ...prev, salePrice: 'El precio debe ser mayor a 0' }));
      toast.error('Ingrese un precio de venta válido');
      return;
    }

    const payload: any = {
      code: finalCode,
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      unitId: unitId || undefined,
      isActive,
      costPrice: currentCost,
      profitMargin: typeof profitMargin === 'number' ? profitMargin : undefined,
      salePrice: currentSale,
      minStock: typeof minStock === 'number' ? minStock : undefined,
      maxStock: typeof maxStock === 'number' ? maxStock : undefined,
      barcodes: barcode.trim() ? [{ barcode: barcode.trim(), type: 'EAN13' }] : undefined,
      taxIds: selectedTaxId ? [selectedTaxId] : undefined,
    };

    try {
      if (isEditing && id) {
        await updateProductMutation.mutateAsync({ id, ...payload });
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProductMutation.mutateAsync(payload);
        toast.success('Producto creado exitosamente');
      }
      navigate('/productos');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar el producto';
      toast.error(typeof msg === 'string' ? msg : 'Error de validación al guardar');
    }
  };

  const isSubmitting = createProductMutation.isPending || updateProductMutation.isPending;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
              <Link to="/productos">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver a Productos
              </Link>
            </Button>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {isEditing ? `Editar: ${name || 'Producto'}` : 'Nuevo Producto'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing 
              ? 'Actualice los datos comerciales, costos o márgenes de venta del producto.' 
              : 'Complete la ficha técnica, precios y depósito para dar de alta en el catálogo.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" asChild disabled={isSubmitting}>
            <Link to="/productos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                <span>Guardando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content (2 Columns) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card: Información General */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Información General</CardTitle>
              </div>
              <CardDescription>
                Identificación técnica y catálogo comercial del producto.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* SKU */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none">
                      Código / SKU <span className="text-destructive">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomSKU}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Auto
                    </button>
                  </div>
                  <Input
                    placeholder="Ej. TAL-001"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className={errors.code ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                </div>

                {/* Barcode EAN */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium leading-none flex items-center gap-1">
                      <Barcode className="h-4 w-4 text-muted-foreground" />
                      Código de Barras (EAN13)
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomEAN}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3" /> Generar EAN
                    </button>
                  </div>
                  <Input
                    placeholder="Ej. 7791234567890"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                  />
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Nombre Comercial del Producto <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Ej. Taladro Percutor Bosch 700W GSB 13 RE Mandril 13mm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Categoría, Marca y Unidad */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Categoría */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Categoría</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Marca */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Marca</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                  >
                    <option value="">Seleccionar marca...</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unidad */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Unidad de Medida</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                  >
                    <option value="">Seleccionar unidad...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">Descripción Técnica</label>
                <Textarea
                  placeholder="Detalles sobre especificaciones, compatibilidades, potencia o instrucciones de uso..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Precios y Rentabilidad */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg">Precios y Rentabilidad</CardTitle>
              </div>
              <CardDescription>
                Determine el costo de adquisición, margen comercial y precio sugerido.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Cost Price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Precio de Costo ($) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`pl-7 ${errors.costPrice ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={costPrice}
                      onChange={(e) => handleCostChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                  {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice}</p>}
                </div>

                {/* Margin % */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Margen de Ganancia (%)</label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="35.0"
                      className="pr-7"
                      value={profitMargin}
                      onChange={(e) => handleMarginChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Calcula precio neto sugerido</p>
                </div>

                {/* Sale Price */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Precio de Venta (Neto) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className={`pl-7 font-semibold text-primary ${errors.salePrice ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={salePrice}
                      onChange={(e) => handleSalePriceChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                  </div>
                  {errors.salePrice && <p className="text-xs text-destructive">{errors.salePrice}</p>}
                </div>
              </div>

              {/* Tax Aliquot */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">Alícuota de IVA</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedTaxId}
                    onChange={(e) => setSelectedTaxId(e.target.value)}
                  >
                    {taxes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.rate}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Breakdown Banner */}
                <div className="rounded-lg border bg-muted/40 p-3 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Precio Final con IVA ({taxRate}%):</span>
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      Consumidor Final
                    </Badge>
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                    ${priceWithTax.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Controls (1 Column) */}
        <div className="space-y-6">
          {/* Card: Estado y Visibilidad */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estado del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Habilitado para Venta</div>
                  <div className="text-xs text-muted-foreground">
                    {isActive ? 'Visible en catálogo y POS' : 'Oculto para ventas'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              <div className="rounded-md border p-3 text-xs space-y-2 bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Control de stock automatizado</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Historial de auditoría de precios</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Control de Stock */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Umbrales de Inventario</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Alertas tempranas de reposición y stock crítico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Stock Mínimo (Alerta Crítica)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
                <p className="text-[11px] text-muted-foreground">
                  Genera alerta en el panel cuando el stock sea menor.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Stock Máximo (Capacidad)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="100"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-medium">Código de Barras</p>
                <p className="leading-relaxed opacity-90">
                  Puede utilizar un lector de código de barras USB/Bluetooth directamente en el campo EAN13 para agilizar la carga.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
