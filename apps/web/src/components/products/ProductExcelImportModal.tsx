import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Package,
} from 'lucide-react';
import {
  parseExcelFile,
  validateAndNormalizeProducts,
  downloadProductTemplate,
  ParsedProductRow,
} from '@/services/excel-import.service';
import { useProducts, Product } from '@/services/products.service';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProductExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function ProductExcelImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ProductExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const { data: existingProducts = [] } = useProducts();
  const queryClient = useQueryClient();

  const resetState = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setIsLoadingFile(false);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setIsLoadingFile(true);

    try {
      const rawRows = await parseExcelFile(file);
      if (rawRows.length === 0) {
        toast.error('El archivo no contiene filas de datos o está vacío.');
        setIsLoadingFile(false);
        return;
      }

      const validated = validateAndNormalizeProducts(rawRows, existingProducts as Product[]);
      setParsedRows(validated);
      toast.success(`Se detectaron ${validated.length} filas en la planilla`);
    } catch (err: any) {
      toast.error('Error al procesar el archivo Excel: ' + (err.message || 'Formato no soportado'));
      setSelectedFile(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const errorCount = parsedRows.filter((r) => !r.isValid).length;
  const existingCount = parsedRows.filter((r) => r.isExisting).length;

  const handleConfirmImport = async () => {
    const rowsToImport = parsedRows.filter((r) => r.isValid);
    if (rowsToImport.length === 0) {
      toast.error('No hay productos válidos para importar.');
      return;
    }

    setIsImporting(true);

    try {
      // 1. Obtener catálogo actual
      let currentList = [...existingProducts];
      let added = 0;
      let updated = 0;

      rowsToImport.forEach((row) => {
        const existingIndex = currentList.findIndex(
          (p) =>
            p.sku?.toLowerCase() === row.sku.toLowerCase() ||
            p.code?.toLowerCase() === row.sku.toLowerCase() ||
            (row.barcode && p.barcodes?.some((b) => b.barcode === row.barcode))
        );

        if (existingIndex >= 0 && updateExisting) {
          // Actualizar existente
          const prev = currentList[existingIndex];
          currentList[existingIndex] = {
            ...prev,
            name: row.name,
            costPrice: row.costPrice > 0 ? row.costPrice : prev.costPrice,
            profitMargin: row.profitMargin > 0 ? row.profitMargin : prev.profitMargin,
            salePrice: row.salePrice > 0 ? row.salePrice : prev.salePrice,
            price: row.salePrice > 0 ? row.salePrice : prev.price,
            stock: row.stock !== undefined ? row.stock : prev.stock,
            totalStock: row.stock !== undefined ? row.stock : prev.totalStock,
            minStock: row.minStock > 0 ? row.minStock : prev.minStock,
            taxes: row.taxRate !== undefined
              ? [{ taxId: 't1', tax: { id: 't1', name: `IVA ${row.taxRate}%`, rate: row.taxRate } }]
              : prev.taxes,
            barcodes: row.barcode
              ? [{ barcode: row.barcode }]
              : prev.barcodes,
          };
          updated++;
        } else if (existingIndex < 0) {
          // Crear nuevo
          const newProduct: Product = {
            id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            code: row.sku,
            sku: row.sku,
            name: row.name,
            costPrice: row.costPrice,
            profitMargin: row.profitMargin,
            salePrice: row.salePrice,
            price: row.salePrice,
            stock: row.stock,
            totalStock: row.stock,
            minStock: row.minStock,
            isActive: true,
            status: 'ACTIVE',
            unitId: 'u1',
            barcodes: row.barcode ? [{ barcode: row.barcode }] : [],
            taxes: [{ taxId: 't1', tax: { id: 't1', name: `IVA ${row.taxRate}%`, rate: row.taxRate } }],
          };
          currentList.unshift(newProduct);
          added++;
        }
      });

      // Guardar en persistencia local
      localStorage.setItem('ferreteria_local_products', JSON.stringify(currentList));

      // Actualizar React Query
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      toast.success(`Importación finalizada: ${added} creados, ${updated} actualizados.`);
      onImportSuccess?.();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error('Error al guardar los productos: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Cargar Catálogo de Productos desde Excel
          </DialogTitle>
          <DialogDescription>
            Importe listas masivas de productos, precios y existencias desde archivos <code>.xlsx</code>, <code>.xls</code> o <code>.csv</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Zona de Descarga de Plantilla Modelo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/40 border rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Package className="h-4 w-4 text-primary" /> ¿No tienes una plantilla?
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Descarga la planilla modelo con las columnas requeridas (SKU, Nombre, Costo, Margen, IVA, Stock).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadProductTemplate('xlsx')}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" /> Plantilla Excel (.xlsx)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadProductTemplate('csv')}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                CSV
              </Button>
            </div>
          </div>

          {/* Selector de Archivo o Drag & Drop */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/20 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium text-sm text-foreground">
                Arrastre su archivo Excel aquí o haga clic para seleccionarlo
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formatos compatibles: Microsoft Excel (.xlsx, .xls) o texto separado por comas (.csv)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Archivo Seleccionado y Estadísticas */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-md">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{selectedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} filas analizadas
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="text-destructive hover:bg-destructive/10 self-end sm:self-auto"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" /> Cambiar archivo
                </Button>
              </div>

              {/* Resumen de Validación */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 bg-card border flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <div className="text-xl font-bold text-foreground">{validCount}</div>
                    <div className="text-xs text-muted-foreground">Listos para importar</div>
                  </div>
                </Card>
                <Card className="p-3 bg-card border flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <div className="text-xl font-bold text-foreground">{existingCount}</div>
                    <div className="text-xs text-muted-foreground">Existentes (se actualizarán)</div>
                  </div>
                </Card>
                <Card className="p-3 bg-card border flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 shrink-0 ${errorCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <div>
                    <div className="text-xl font-bold text-foreground">{errorCount}</div>
                    <div className="text-xs text-muted-foreground">Con errores (se omitirán)</div>
                  </div>
                </Card>
              </div>

              {/* Opciones de Importación */}
              <div className="flex items-center gap-2 px-1">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span>Actualizar precios y existencias de productos existentes (coincidencia por SKU o Código de Barras)</span>
                </label>
              </div>

              {/* Tabla de Previsualización */}
              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted sticky top-0 border-b font-medium text-muted-foreground">
                    <tr>
                      <th className="p-2 w-12">Fila</th>
                      <th className="p-2">Código SKU</th>
                      <th className="p-2">Nombre</th>
                      <th className="p-2">Costo ($)</th>
                      <th className="p-2">Margen (%)</th>
                      <th className="p-2">Precio Venta ($)</th>
                      <th className="p-2">Stock</th>
                      <th className="p-2">Alícuota IVA</th>
                      <th className="p-2 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedRows.slice(0, 50).map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={!row.isValid ? 'bg-destructive/5' : row.isExisting ? 'bg-blue-500/5' : ''}
                      >
                        <td className="p-2 text-muted-foreground">#{row.rowNumber}</td>
                        <td className="p-2 font-mono font-medium">{row.sku}</td>
                        <td className="p-2 font-medium max-w-[200px] truncate" title={row.name}>
                          {row.name}
                        </td>
                        <td className="p-2 font-mono">${row.costPrice.toLocaleString('es-AR')}</td>
                        <td className="p-2 font-mono">{row.profitMargin}%</td>
                        <td className="p-2 font-mono font-semibold">${row.salePrice.toLocaleString('es-AR')}</td>
                        <td className="p-2 font-mono">{row.stock} {row.unit}</td>
                        <td className="p-2">{row.taxRate}%</td>
                        <td className="p-2 text-center">
                          {!row.isValid ? (
                            <Badge variant="destructive" className="text-[10px] py-0">
                              Error
                            </Badge>
                          ) : row.isExisting ? (
                            <Badge variant="outline" className="text-[10px] py-0 border-blue-400 text-blue-600 dark:text-blue-400">
                              Actualizar
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px] py-0 bg-emerald-600">
                              Nuevo
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="text-xs text-muted-foreground text-center">
                  Mostrando las primeras 50 filas de {parsedRows.length} totales.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={validCount === 0 || isImporting || isLoadingFile}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isImporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Importando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Importar {validCount} Productos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
