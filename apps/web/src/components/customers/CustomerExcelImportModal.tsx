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
  Users,
} from 'lucide-react';
import {
  parseExcelFile,
  validateAndNormalizeCustomers,
  downloadCustomerTemplate,
  ParsedCustomerRow,
} from '@/services/excel-import.service';
import { useCustomers } from '@/services/customers.service';
import { Customer } from '@ferreteria/shared';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface CustomerExcelImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: () => void;
}

export function CustomerExcelImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: CustomerExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedCustomerRow[]>([]);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const { data: customersData } = useCustomers({ limit: 1000 });
  const existingCustomers: Customer[] = customersData?.data || [];
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

      const validated = validateAndNormalizeCustomers(rawRows, existingCustomers);
      setParsedRows(validated);
      toast.success(`Se detectaron ${validated.length} clientes en la planilla`);
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
      toast.error('No hay clientes válidos para importar.');
      return;
    }

    setIsImporting(true);

    try {
      // 1. Obtener lista actual de clientes
      const rawStored = localStorage.getItem('ferreteria_local_customers');
      let currentList: any[] = rawStored ? JSON.parse(rawStored) : [...existingCustomers];
      let added = 0;
      let updated = 0;

      rowsToImport.forEach((row) => {
        const cleanDoc = row.documentNum.replace(/[^0-9]/g, '');
        const existingIndex = currentList.findIndex((c) => {
          const cDoc = (c.documentNum || c.documentNumber || '').replace(/[^0-9]/g, '');
          return cleanDoc && cDoc && cleanDoc === cDoc;
        });

        if (existingIndex >= 0 && updateExisting) {
          // Actualizar cliente existente
          const prev = currentList[existingIndex];
          currentList[existingIndex] = {
            ...prev,
            name: row.name || prev.name,
            taxCondition: row.taxCondition || prev.taxCondition,
            phone: row.phone || prev.phone,
            email: row.email || prev.email,
            address: row.address || prev.address,
            city: row.city || prev.city,
            creditLimit: row.creditLimit > 0 ? row.creditLimit : prev.creditLimit,
          };
          updated++;
        } else if (existingIndex < 0) {
          // Crear nuevo cliente
          const newCustomer: any = {
            id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: row.name,
            documentType: row.documentType,
            documentNumber: row.documentNum,
            documentNum: row.documentNum,
            taxCondition: row.taxCondition,
            phone: row.phone,
            email: row.email,
            address: row.address,
            city: row.city,
            creditLimit: row.creditLimit,
            currentBalance: row.balance,
            balance: row.balance,
            isActive: true,
            isBanned: false,
            createdAt: new Date().toISOString(),
          };
          currentList.unshift(newCustomer);
          added++;
        }
      });

      // Guardar en persistencia local
      localStorage.setItem('ferreteria_local_customers', JSON.stringify(currentList));

      // Actualizar React Query
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['debtors'] });

      toast.success(`Importación finalizada: ${added} creados, ${updated} actualizados.`);
      onImportSuccess?.();
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error('Error al guardar los clientes: ' + err.message);
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
            <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
            Cargar Base de Clientes desde Excel
          </DialogTitle>
          <DialogDescription>
            Importe listas masivas de clientes, cuentas corrientes y datos fiscales desde archivos <code>.xlsx</code>, <code>.xls</code> o <code>.csv</code>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Zona de Descarga de Plantilla Modelo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/40 border rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" /> Plantilla de Clientes Modelo
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Descargue la planilla con columnas para Razón Social, CUIT/DNI, Condición IVA, Teléfono, Límite de Crédito y Dirección.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCustomerTemplate('xlsx')}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5 text-indigo-600" /> Plantilla Excel (.xlsx)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadCustomerTemplate('csv')}
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
              className="border-2 border-dashed border-muted-foreground/30 hover:border-indigo-500/60 hover:bg-muted/20 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer text-center"
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium text-sm text-foreground">
                Arrastre la lista de clientes aquí o haga clic para seleccionarla
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
              {/* Archivo Seleccionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-md">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">{selectedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} clientes analizados
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
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-xl font-bold text-foreground">{validCount}</div>
                    <div className="text-xs text-muted-foreground">Válidos para importar</div>
                  </div>
                </Card>
                <Card className="p-3 bg-card border flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <div className="text-xl font-bold text-foreground">{existingCount}</div>
                    <div className="text-xs text-muted-foreground">Ya existen (se actualizarán)</div>
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
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Actualizar datos de clientes existentes si el CUIT o DNI coincide</span>
                </label>
              </div>

              {/* Tabla de Previsualización */}
              <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-muted sticky top-0 border-b font-medium text-muted-foreground">
                    <tr>
                      <th className="p-2 w-12">Fila</th>
                      <th className="p-2">Nombre / Razón Social</th>
                      <th className="p-2">Documento</th>
                      <th className="p-2">Condición IVA</th>
                      <th className="p-2">Teléfono</th>
                      <th className="p-2">Límite Crédito ($)</th>
                      <th className="p-2">Saldo Inicial ($)</th>
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
                        <td className="p-2 font-semibold max-w-[200px] truncate" title={row.name}>
                          {row.name}
                        </td>
                        <td className="p-2 font-mono">
                          {row.documentType}: {row.documentNum || 'S/N'}
                        </td>
                        <td className="p-2">
                          <span className="text-[11px] text-muted-foreground">
                            {row.taxCondition.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-2">{row.phone || '-'}</td>
                        <td className="p-2 font-mono font-medium">${row.creditLimit.toLocaleString('es-AR')}</td>
                        <td className="p-2 font-mono">${row.balance.toLocaleString('es-AR')}</td>
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
                            <Badge variant="default" className="text-[10px] py-0 bg-indigo-600">
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
                  Mostrando los primeros 50 clientes de {parsedRows.length} totales.
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {isImporting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Importando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Importar {validCount} Clientes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
