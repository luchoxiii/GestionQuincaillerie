import React, { useState } from 'react';
import { useInvoices, useFiscalSummary, Invoice } from '../../services/invoicing.service';
import { InvoiceDetailModal } from './InvoiceDetailModal';
import { CreditNoteModal } from './CreditNoteModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, FileX, Download, FileSpreadsheet, ShieldCheck, Receipt, Calendar } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InvoicingPage() {
  const [filters, setFilters] = useState({ 
    fiscalRegime: 'all', 
    pointOfSale: 'all', 
    type: 'all', 
    search: '',
    startDate: '',
    endDate: '',
  });
  
  const { data: invoices = [], isLoading } = useInvoices(filters);
  const { data: summary } = useFiscalSummary();
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState(false);

  const openDetail = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const openCreditNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsCreditNoteOpen(true);
  };

  const displayInvoices = invoices;

  const applyInvoicingDatePreset = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setFilters({ ...filters, startDate: '', endDate: '' });
    } else if (preset === 'month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const start = `${year}-${month}-01`;
      setFilters({ ...filters, startDate: start, endDate: todayStr });
    } else if (preset === 'lastMonth') {
      const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0);
      const start = prevDate.toISOString().split('T')[0];
      const end = lastDayPrev.toISOString().split('T')[0];
      setFilters({ ...filters, startDate: start, endDate: end });
    } else if (preset === '30d') {
      const past = new Date(today.getTime() - 30 * 86400000);
      setFilters({ ...filters, startDate: past.toISOString().split('T')[0], endDate: todayStr });
    }
  };

  // Export 1: Official Libro IVA Ventas for the Accountant (Strictly BLANCO only)
  const handleExportLibroIVAFiscal = () => {
    const fiscalList = displayInvoices.filter((inv) => (inv.fiscalType || 'BLANCO') === 'BLANCO');

    if (fiscalList.length === 0) {
      toast.error('No se encontraron facturas fiscales oficiales (En Blanco) para exportar en este período');
      return;
    }

    const headers = [
      'Fecha Emisión',
      'Tipo Comprobante',
      'Punto Venta',
      'Número',
      'Tipo Doc',
      'Número CUIT / DNI',
      'Denominación / Razón Social',
      'Neto Gravado ($)',
      'Alícuota IVA (%)',
      'Débito Fiscal IVA ($)',
      'Exento / No Gravado ($)',
      'Total Facturado ($)',
      'Código CAE AFIP',
      'Vencimiento CAE',
      'Estado AFIP'
    ];

    const rows = fiscalList.map((inv: any) => {
      const total = Number(inv.total || 0);
      const taxAmount = Number(inv.taxAmount ?? (total * 0.17355));
      const netAmount = Number(inv.netAmount ?? (total - taxAmount));
      const taxRate = inv.taxRate ?? (inv.letter === 'A' || inv.letter === 'B' ? 21 : 0);

      return [
        inv.date ? new Date(inv.date).toLocaleDateString('es-AR') : '-',
        inv.type || `Factura ${inv.letter || 'B'}`,
        inv.salePoint || '0001',
        inv.number || '',
        inv.customerDocumentType || (inv.customerDocumentNumber ? 'CUIT' : 'DNI'),
        inv.customerDocumentNumber || 'Consumidor Final',
        inv.customerName || 'Consumidor Final',
        netAmount.toFixed(2),
        `${taxRate}%`,
        taxAmount.toFixed(2),
        '0.00',
        total.toFixed(2),
        inv.cae || '',
        inv.caeExpiration ? new Date(inv.caeExpiration).toLocaleDateString('es-AR') : '-',
        inv.status || 'AUTORIZADO'
      ];
    });

    const dateSlug = new Date().toISOString().split('T')[0];
    const fileSlug = (filters.startDate || filters.endDate)
      ? `Libro_IVA_Ventas_AFIP_${filters.startDate || 'inicio'}_a_${filters.endDate || 'hoy'}`
      : `Libro_IVA_Ventas_AFIP_Contador_${dateSlug}`;
    exportToCsv(fileSlug, [headers, ...rows]);
    const periodMsg = (filters.startDate || filters.endDate)
      ? ` (Período: ${filters.startDate || 'Inicio'} al ${filters.endDate || 'Hoy'})`
      : '';
    toast.success(`Libro IVA Ventas exportado con éxito (${fiscalList.length} comprobantes oficiales con CAE)${periodMsg}`);
  };

  // Export 2: Internal receipts (Ticket X / Remito Interno - NEGRO)
  const handleExportComprobantesInternos = () => {
    const internalList = displayInvoices.filter((inv) => inv.fiscalType === 'NEGRO');

    if (internalList.length === 0) {
      toast.error('No hay comprobantes internos (Ticket X) para exportar en este período');
      return;
    }

    const headers = [
      'Fecha Emisión',
      'Tipo Comprobante',
      'Número de Control Interno',
      'Cliente / Mostrador',
      'Condición Fiscal',
      'Total Cobrado ($)',
      'Destino Contable',
      'Estado'
    ];

    const rows = internalList.map((inv: any) => [
      inv.date ? new Date(inv.date).toLocaleDateString('es-AR') : '-',
      inv.type || 'Ticket X (Interno)',
      inv.number || '',
      inv.customerName || 'Consumidor Final',
      'No Fiscal / Comprobante X',
      Number(inv.total || 0).toFixed(2),
      'Caja Física (Excluido de AFIP)',
      inv.status || 'EMITIDO'
    ]);

    const dateSlug = new Date().toISOString().split('T')[0];
    const fileSlug = (filters.startDate || filters.endDate)
      ? `Comprobantes_Internos_TicketX_${filters.startDate || 'inicio'}_a_${filters.endDate || 'hoy'}`
      : `Comprobantes_Internos_TicketX_${dateSlug}`;
    exportToCsv(fileSlug, [headers, ...rows]);
    const periodMsg = (filters.startDate || filters.endDate)
      ? ` (Período: ${filters.startDate || 'Inicio'} al ${filters.endDate || 'Hoy'})`
      : '';
    toast.success(`Comprobantes internos exportados (${internalList.length} tickets de mostrador)${periodMsg}`);
  };

  // Export 3: Complete list
  const handleExportConsolidado = () => {
    if (displayInvoices.length === 0) {
      toast.error('No hay comprobantes para exportar en este período');
      return;
    }

    const headers = [
      'Régimen',
      'Punto Venta',
      'Tipo Comprobante',
      'Número',
      'Fecha',
      'Cliente',
      'Doc Receptor',
      'Neto ($)',
      'IVA ($)',
      'Total ($)',
      'CAE AFIP',
      'Estado'
    ];

    const rows = displayInvoices.map((inv: any) => [
      inv.fiscalType === 'BLANCO' ? 'En Blanco (AFIP)' : 'En Negro (Interno)',
      inv.salePoint || '0001',
      inv.type || 'Comprobante',
      inv.number || '',
      inv.date ? new Date(inv.date).toLocaleDateString('es-AR') : '-',
      inv.customerName || 'Consumidor Final',
      inv.customerDocumentNumber || '-',
      Number(inv.netAmount || (Number(inv.total || 0) * 0.8264)).toFixed(2),
      Number(inv.taxAmount || (Number(inv.total || 0) * 0.1735)).toFixed(2),
      Number(inv.total || 0).toFixed(2),
      inv.cae || 'No aplica (Interno)',
      inv.status || 'AUTORIZADO'
    ]);

    const dateSlug = new Date().toISOString().split('T')[0];
    const fileSlug = (filters.startDate || filters.endDate)
      ? `facturacion_consolidada_${filters.startDate || 'inicio'}_a_${filters.endDate || 'hoy'}`
      : `facturacion_consolidada_${dateSlug}`;
    exportToCsv(fileSlug, [headers, ...rows]);
    const periodMsg = (filters.startDate || filters.endDate)
      ? ` (Período: ${filters.startDate || 'Inicio'} al ${filters.endDate || 'Hoy'})`
      : '';
    toast.success(`Listado consolidado exportado a CSV con éxito${periodMsg}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Facturación y Gestión Impositiva</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control de Facturas Oficiales AFIP (En Blanco con CAE) y Comprobantes Internos de Mostrador (Ticket X).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Action: Export for Accountant */}
          <Button 
            onClick={handleExportLibroIVAFiscal} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Descargar Libro IVA (Para el Contador)
          </Button>

          {/* Secondary Action: Export Internal Tickets */}
          <Button 
            variant="outline" 
            onClick={handleExportComprobantesInternos}
            className="border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100 font-medium"
          >
            <Receipt className="mr-2 h-4 w-4 text-amber-700" />
            Descargar Tickets X (Internos)
          </Button>

          {/* Tertiary: Consolidated */}
          <Button variant="outline" onClick={handleExportConsolidado}>
            <Download className="mr-2 h-4 w-4" />
            Exportar Todo CSV
          </Button>
        </div>
      </div>

      {/* Split KPIs for Financial and Tax clarity */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-900">
              🏛️ Facturado Oficial (En Blanco)
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-blue-950">
              ${summary?.totalFiscalBilled.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {summary?.fiscalReceiptCount || 0} comprobantes con CAE (Declarables)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Débito Fiscal IVA Liquidado
            </CardTitle>
            <span className="text-xs font-bold text-indigo-600">AFIP</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-950">
              ${summary?.totalTaxDebit.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-indigo-700 mt-1">
              Impuesto a ingresar por ventas oficiales
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-900">
              📋 Ventas Internas (En Negro)
            </CardTitle>
            <Receipt className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-950">
              ${summary?.totalInternalBilled.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-amber-700 mt-1">
              {summary?.internalReceiptCount || 0} comprobantes Ticket X (Sin IVA)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-slate-700 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Caja Total Consolidada
            </CardTitle>
            <span className="text-xs font-bold text-slate-500">Blanco + Negro</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              ${summary?.totalBilled.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {summary?.receiptCount || 0} operaciones totales de facturación
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold">Comprobantes Registrados</CardTitle>
            {/* Quick regime filter pill buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilters({ ...filters, fiscalRegime: 'all' })}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filters.fiscalRegime === 'all'
                    ? 'bg-white shadow-xs font-bold text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({summary?.receiptCount || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, fiscalRegime: 'BLANCO' })}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filters.fiscalRegime === 'BLANCO'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                🏛️ En Blanco / Contador ({summary?.fiscalReceiptCount || 0})
              </button>
              <button
                type="button"
                onClick={() => setFilters({ ...filters, fiscalRegime: 'NEGRO' })}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filters.fiscalRegime === 'NEGRO'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                📋 En Negro / Ticket X ({summary?.internalReceiptCount || 0})
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Detailed Filters row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
            <div>
              <Label className="text-xs">Régimen Fiscal</Label>
              <Select 
                value={filters.fiscalRegime} 
                onValueChange={v => setFilters({ ...filters, fiscalRegime: v })}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los regímenes</SelectItem>
                  <SelectItem value="BLANCO">🏛️ En Blanco (Oficial AFIP)</SelectItem>
                  <SelectItem value="NEGRO">📋 En Negro (Ticket X Interno)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Punto de Venta</Label>
              <Select 
                value={filters.pointOfSale} 
                onValueChange={v => setFilters({ ...filters, pointOfSale: v })}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="0001">PV 0001 (Mostrador Central)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo de Comprobante</Label>
              <Select 
                value={filters.type} 
                onValueChange={v => setFilters({ ...filters, type: v })}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="A">Factura A (CUIT)</SelectItem>
                  <SelectItem value="B">Factura B (Consumidor Final)</SelectItem>
                  <SelectItem value="C">Factura C (Monotributo)</SelectItem>
                  <SelectItem value="X">Ticket X (Remito Interno)</SelectItem>
                  <SelectItem value="NC">Nota de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Buscar comprobante, CUIT o cliente</Label>
              <Input 
                className="h-9 text-xs"
                placeholder="Ej. 0001-00001234, CUIT o nombre..." 
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range for Invoicing & Exports */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 mb-5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  Período Fiscal para Reporte & Descargas:
                </span>
                {(filters.startDate || filters.endDate) ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-xs font-semibold">
                    📅 Desde {filters.startDate ? new Date(filters.startDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Inicio'} hasta {filters.endDate ? new Date(filters.endDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Hoy'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 text-xs font-medium">
                    Histórico Completo
                  </Badge>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant={!filters.startDate && !filters.endDate ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyInvoicingDatePreset('all')}
                >
                  Histórico
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyInvoicingDatePreset('month')}
                >
                  Este Mes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyInvoicingDatePreset('lastMonth')}
                >
                  Mes Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyInvoicingDatePreset('30d')}
                >
                  Últimos 30d
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <Label className="text-xs text-slate-600 font-medium">Fecha Desde</Label>
                <Input
                  type="date"
                  className="h-8 text-xs mt-1 bg-white"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 font-medium">Fecha Hasta</Label>
                <Input
                  type="date"
                  className="h-8 text-xs mt-1 bg-white"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                {(filters.startDate || filters.endDate) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-slate-600 hover:text-slate-900"
                    onClick={() => applyInvoicingDatePreset('all')}
                  >
                    Restablecer Fechas
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Régimen</TableHead>
                  <TableHead>Comprobante</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente / Razón Social</TableHead>
                  <TableHead>CUIT / DNI</TableHead>
                  <TableHead>CAE AFIP</TableHead>
                  <TableHead className="text-right">Total ($)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayInvoices.map((inv) => {
                  const isBlanco = (inv.fiscalType || 'BLANCO') === 'BLANCO';
                  return (
                    <TableRow key={inv.id} className={!isBlanco ? 'bg-amber-50/30' : undefined}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {inv.date ? new Date(inv.date).toLocaleDateString('es-AR') : '-'}
                      </TableCell>
                      <TableCell>
                        {isBlanco ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-semibold hover:bg-blue-100">
                            🏛️ AFIP (Blanco)
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-semibold hover:bg-amber-100">
                            📋 Ticket X (Negro)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={`mr-1 font-bold ${
                            inv.letter === 'A' 
                              ? 'bg-blue-50 text-blue-700 border-blue-300' 
                              : inv.letter === 'X' 
                                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inv.letter}
                        </Badge>
                        <span className="text-xs">{inv.type}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{inv.number}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-900">{inv.customerName}</TableCell>
                      <TableCell className="text-xs text-slate-600">{inv.customerDocumentNumber || 'Consumidor Final'}</TableCell>
                      <TableCell>
                        {isBlanco && inv.cae ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-mono font-bold text-slate-800">{inv.cae}</span>
                            {inv.caeExpiration && (
                              <span className="text-[10px] text-slate-500">
                                Vto: {new Date(inv.caeExpiration).toLocaleDateString('es-AR')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No aplica (Interno)</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-xs text-slate-900">
                        ${Number(inv.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-[10px]">
                          {inv.status || 'AUTORIZADO'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDetail(inv)} 
                            title={isBlanco ? 'Ver Factura Oficial A4 / Imprimir' : 'Ver Comprobante Interno X'}
                            className="h-8 w-8"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Button>
                          {isBlanco && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openCreditNote(inv)} 
                              title="Emitir Nota de Crédito AFIP" 
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                            >
                              <FileX className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {displayInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-slate-500">
                      {isLoading ? 'Cargando comprobantes...' : 'No se encontraron comprobantes con los filtros seleccionados.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InvoiceDetailModal 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        invoice={selectedInvoice}
        onEmitCreditNote={(inv) => openCreditNote(inv)}
      />
      <CreditNoteModal
        isOpen={isCreditNoteOpen}
        onClose={() => setIsCreditNoteOpen(false)}
        invoice={selectedInvoice}
      />
    </div>
  );
}
