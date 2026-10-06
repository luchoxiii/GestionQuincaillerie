import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSales, useVoidSale, useSyncEcommerceOrders } from '../../services/sales.service';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { 
  Search, 
  Eye, 
  Ban, 
  Download, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  UserCheck, 
  Shield, 
  Calendar,
  Globe,
  Truck,
  RefreshCw,
  Plus,
  Tag
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportToCsv, formatCurrency } from '@/lib/utils';
import { NewEcommerceSaleModal } from '../../components/ecommerce/NewEcommerceSaleModal';
import { ShippingLabelModal } from '../../components/ecommerce/ShippingLabelModal';
import toast from 'react-hot-toast';

export function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFiscal, setSelectedFiscal] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isEcommerceModalOpen, setIsEcommerceModalOpen] = useState(false);
  const [selectedLabelSale, setSelectedLabelSale] = useState<any>(null);

  const { data: sales = [], isLoading } = useSales();
  const voidSale = useVoidSale();
  const syncEcommerce = useSyncEcommerceOrders();

  // Extract unique sellers
  const uniqueSellers = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s: any) => {
      const seller = s.sellerName || s.user?.name || s.userName;
      if (seller) set.add(seller);
    });
    return Array.from(set);
  }, [sales]);

  const applySalesDatePreset = (preset: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '30d') {
      const past = new Date(today.getTime() - 30 * 86400000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      setEndDate(todayStr);
    }
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s: any) => {
      const sNumber = (s.number?.toString() || s.saleNumber || '').toLowerCase();
      const sClient = (s.customerName || s.customer?.name || 'Consumidor Final').toLowerCase();
      const sSeller = (s.sellerName || s.user?.name || 'Administrador Principal').toLowerCase();
      const sExt = (s.externalOrderId || '').toLowerCase();
      const sTrack = (s.trackingNumber || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || 
        sNumber.includes(search) || 
        sClient.includes(search) || 
        sSeller.includes(search) ||
        sExt.includes(search) ||
        sTrack.includes(search);
      
      const currentSeller = s.sellerName || s.user?.name || 'Administrador Principal';
      const matchesSeller = selectedSeller === 'all' || currentSeller === selectedSeller;

      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      
      const matchesFiscal = selectedFiscal === 'all' || (s.fiscalType || 'BLANCO') === selectedFiscal;

      const matchesChannel = selectedChannel === 'all' || (s.channel || 'POS') === selectedChannel;

      let matchesDate = true;
      const saleDateStr = s.createdAt || s.date;
      if (saleDateStr) {
        const saleTime = new Date(saleDateStr).getTime();
        if (startDate) {
          const startMs = new Date(startDate + 'T00:00:00').getTime();
          if (!isNaN(startMs) && saleTime < startMs) matchesDate = false;
        }
        if (endDate) {
          const endMs = new Date(endDate + 'T23:59:59.999').getTime();
          if (!isNaN(endMs) && saleTime > endMs) matchesDate = false;
        }
      }

      return matchesSearch && matchesSeller && matchesStatus && matchesFiscal && matchesChannel && matchesDate;
    });
  }, [sales, searchTerm, selectedSeller, selectedStatus, selectedFiscal, selectedChannel, startDate, endDate]);

  // Executive KPIs
  const completedSales = filteredSales.filter((s: any) => s.status === 'COMPLETED');
  const totalRevenue = completedSales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0);
  const totalCompletedCount = completedSales.length;
  const averageTicket = totalCompletedCount > 0 ? totalRevenue / totalCompletedCount : 0;
  const voidedSalesCount = filteredSales.filter((s: any) => s.status === 'VOIDED').length;

  const handleVoidSale = async (id: string) => {
    if (confirm('¿Está seguro de que desea anular esta venta? Esta acción no se puede deshacer.')) {
      try {
        await voidSale.mutateAsync(id);
        toast.success('Venta anulada con éxito');
      } catch (e) {
        toast.error('Error al anular la venta');
      }
    }
  };

  const handleSyncEcommerce = async () => {
    try {
      const res = await syncEcommerce.mutateAsync();
      toast.success(res.importedCount > 0 
        ? `Se sincronizaron ${res.importedCount} órdenes de e-commerce con éxito`
        : 'Sincronización finalizada: no se detectaron nuevas órdenes pendientes');
    } catch (e) {
      toast.error('Error al sincronizar órdenes e-commerce');
    }
  };

  const renderChannelBadge = (channel?: string, externalOrderId?: string) => {
    switch (channel) {
      case 'MERCADO_LIBRE':
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] hover:bg-amber-100 font-semibold flex items-center gap-1 w-fit">
            <span>🟡 Mercado Libre</span>
            {externalOrderId && <span className="font-mono text-[9px] opacity-80">({externalOrderId})</span>}
          </Badge>
        );
      case 'TIENDA_ONLINE':
        return (
          <Badge className="bg-sky-100 text-sky-900 border-sky-300 text-[10px] hover:bg-sky-100 font-semibold flex items-center gap-1 w-fit">
            <span>🌐 Tienda Web</span>
            {externalOrderId && <span className="font-mono text-[9px] opacity-80">({externalOrderId})</span>}
          </Badge>
        );
      case 'WHATSAPP':
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-[10px] hover:bg-emerald-100 font-semibold flex items-center gap-1 w-fit">
            <span>💬 WhatsApp</span>
          </Badge>
        );
      case 'OTRO':
        return (
          <Badge className="bg-purple-100 text-purple-900 border-purple-300 text-[10px] hover:bg-purple-100 font-semibold">
            📦 E-commerce
          </Badge>
        );
      case 'POS':
      default:
        return (
          <Badge variant="outline" className="text-slate-600 bg-slate-50 text-[10px] w-fit">
            🏪 Mostrador (POS)
          </Badge>
        );
    }
  };

  const handleExportCSV = () => {
    if (filteredSales.length === 0) {
      toast.error('No hay ventas para exportar');
      return;
    }

    const headers = [
      'Nro Venta',
      'Canal',
      'ID Orden Externa',
      'Cupón Aplicado',
      'Fecha',
      'Hora',
      'Modalidad Fiscal',
      'Vendedor / Operador',
      'Cliente',
      'Subtotal ($)',
      'Descuento ($)',
      'IVA ($)',
      'Total ($)',
      'Estado',
      'Método de Envío',
      'Estado Despacho',
      'Nro Seguimiento',
      'Medios de Pago'
    ];

    const rows = filteredSales.map((s: any) => {
      const dateObj = s.createdAt ? new Date(s.createdAt) : new Date();
      const dateStr = format(dateObj, 'dd/MM/yyyy');
      const timeStr = format(dateObj, 'HH:mm');
      const paymentsSummary = Array.isArray(s.payments) 
        ? s.payments.map((p: any) => `${p.method || p.methodId || 'Pago'}: $${Number(p.amount || 0).toFixed(2)}`).join(' | ')
        : 'Efectivo';
      const fiscalLabel = (s.fiscalType || 'BLANCO') === 'BLANCO' ? 'En Blanco (AFIP)' : 'En Negro (Ticket X)';
      const channelLabel = s.channel === 'MERCADO_LIBRE' ? 'Mercado Libre'
        : s.channel === 'TIENDA_ONLINE' ? 'Tienda Online'
        : s.channel === 'WHATSAPP' ? 'WhatsApp'
        : s.channel === 'OTRO' ? 'E-commerce'
        : 'Mostrador (POS)';

      return [
        s.number?.toString().padStart(8, '0') || s.saleNumber || 'S/N',
        channelLabel,
        s.externalOrderId || '-',
        s.couponCode || '-',
        dateStr,
        timeStr,
        fiscalLabel,
        s.sellerName || 'Administrador Principal',
        s.customerName || s.customer?.name || 'Consumidor Final',
        Number(s.subtotal || 0).toFixed(2),
        Number(s.discount || 0).toFixed(2),
        Number(s.taxAmount || 0).toFixed(2),
        Number(s.total || 0).toFixed(2),
        s.status === 'COMPLETED' ? 'Completada' : s.status === 'VOIDED' ? 'Anulada' : s.status,
        s.shippingMethod || '-',
        s.shippingStatus || '-',
        s.trackingNumber || '-',
        paymentsSummary
      ];
    });

    const dateSlug = new Date().toISOString().split('T')[0];
    const fileSlug = (startDate || endDate)
      ? `ventas_supervision_${startDate || 'inicio'}_a_${endDate || 'hoy'}`
      : `ventas_supervision_${dateSlug}`;
    exportToCsv(fileSlug, [headers, ...rows]);
    const periodMsg = (startDate || endDate)
      ? ` (Período: ${startDate || 'Inicio'} al ${endDate || 'Hoy'})`
      : '';
    toast.success(`Reporte de ventas exportado con éxito (${filteredSales.length} registros)${periodMsg}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Supervisión General de Ventas
          </h1>
          <p className="text-sm text-muted-foreground">
            Panel de control para Administrador: visualice ventas globales, rendimiento de vendedores y auditoría de ingresos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            onClick={() => setIsEcommerceModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Ingresar Venta E-commerce
          </Button>

          <Button 
            variant="outline"
            onClick={handleSyncEcommerce}
            disabled={syncEcommerce.isPending}
            title="Simular sincronización de Mercado Libre y Tienda Online"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${syncEcommerce.isPending ? 'animate-spin text-primary' : ''}`} />
            Sincronizar E-com
          </Button>

          <Button variant="outline" asChild>
            <Link to="/ecommerce">
              <Globe className="mr-2 h-4 w-4 text-sky-600" /> Centro E-commerce
            </Link>
          </Button>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturación Total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ventas activas completadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompletedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Operaciones cobradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageTicket)}</div>
            <p className="text-xs text-muted-foreground mt-1">Ingreso por comprobante</p>
          </CardContent>
        </Card>

        <Card className={voidedSalesCount > 0 ? "border-red-200 bg-red-50/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Ventas Anuladas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{voidedSalesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Comprobantes cancelados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 w-full md:w-auto gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar por Nro, Cliente o Vendedor..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-[220px]">
            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por Vendedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Vendedores</SelectItem>
                {uniqueSellers.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[180px]">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado de Venta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="COMPLETED">Solo Completadas</SelectItem>
                <SelectItem value="VOIDED">Solo Anuladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[200px]">
            <Select value={selectedFiscal} onValueChange={setSelectedFiscal}>
              <SelectTrigger>
                <SelectValue placeholder="Condición Fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Modalidades</SelectItem>
                <SelectItem value="BLANCO">🏛️ Oficial AFIP (En Blanco)</SelectItem>
                <SelectItem value="NEGRO">📋 Ticket X (En Negro)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[190px]">
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Canal de Venta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Canales</SelectItem>
                <SelectItem value="POS">🏪 Mostrador (POS)</SelectItem>
                <SelectItem value="MERCADO_LIBRE">🟡 Mercado Libre</SelectItem>
                <SelectItem value="TIENDA_ONLINE">🌐 Tienda Web</SelectItem>
                <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                <SelectItem value="OTRO">📦 Otros Canales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Mostrando <strong>{filteredSales.length}</strong> ventas
        </div>
      </div>

      {/* Date Range for Sales & Export */}
      <div className="bg-white p-3.5 rounded-lg shadow-sm border space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold text-slate-800">
              Período de Ventas para Análisis & Exportación CSV:
            </span>
            {(startDate || endDate) ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300 text-xs font-semibold">
                📅 Desde {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Inicio'} hasta {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Hoy'}
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
              variant={!startDate && !endDate ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => applySalesDatePreset('all')}
            >
              Histórico
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => applySalesDatePreset('today')}
            >
              Hoy
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => applySalesDatePreset('month')}
            >
              Este Mes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => applySalesDatePreset('30d')}
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
              className="h-8 text-xs mt-1"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-600 font-medium">Fecha Hasta</Label>
            <Input
              type="date"
              className="h-8 text-xs mt-1"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            {(startDate || endDate) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-600 hover:text-slate-900"
                onClick={() => applySalesDatePreset('all')}
              >
                Restablecer Fechas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nro Venta</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Modalidad</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Vendedor / Operador</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-500">Cargando ventas...</TableCell>
              </TableRow>
            ) : filteredSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                  No se encontraron ventas para los filtros seleccionados
                </TableCell>
              </TableRow>
            ) : (
              filteredSales.map((sale: any) => {
                const sellerName = sale.sellerName || sale.user?.name || 'Administrador Principal';
                const clientName = sale.customerName || sale.customer?.name || (sale.customerId ? 'Cliente Registrado' : 'Consumidor Final');
                const isBlanco = (sale.fiscalType || 'BLANCO') === 'BLANCO';
                const isEcommerce = sale.channel && sale.channel !== 'POS';

                return (
                  <TableRow key={sale.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-semibold text-primary">
                      {sale.number?.toString().padStart(8, '0') || sale.saleNumber || 'S/N'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      {isBlanco ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] hover:bg-blue-100">
                          🏛️ AFIP (Blanco)
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] hover:bg-amber-100">
                          📋 Ticket X (Negro)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {renderChannelBadge(sale.channel, sale.externalOrderId)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                        <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                        <span>{sellerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {clientName}
                    </TableCell>
                    <TableCell className="text-right font-bold text-base">
                      <div>{formatCurrency(sale.total || 0)}</div>
                      {sale.couponCode && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] px-1.5 py-0 gap-1 font-mono font-bold mt-0.5 inline-flex items-center">
                          <Tag className="h-2.5 w-2.5 text-emerald-600" />
                          {sale.couponCode}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={sale.status === 'COMPLETED' ? 'default' : sale.status === 'VOIDED' ? 'destructive' : 'secondary'}>
                        {sale.status === 'COMPLETED' ? 'Completada' : sale.status === 'VOIDED' ? 'Anulada' : sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {isEcommerce && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="Ver / Imprimir Etiqueta de Despacho"
                            onClick={() => setSelectedLabelSale(sale)}
                          >
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" title="Ver detalle completo" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {sale.status !== 'VOIDED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Anular venta"
                            onClick={() => handleVoidSale(sale.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sale Detail Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Detalle de Venta #{selectedSale?.number?.toString().padStart(8, '0') || selectedSale?.saleNumber || 'S/N'}
            </DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/60 p-3 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block text-xs">Fecha y Hora</span>
                  <span className="font-medium">{selectedSale.createdAt ? format(new Date(selectedSale.createdAt), 'dd/MM/yyyy HH:mm') : '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Estado y Modalidad Fiscal</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={selectedSale.status === 'COMPLETED' ? 'default' : 'destructive'}>
                      {selectedSale.status === 'COMPLETED' ? 'Completada' : 'Anulada'}
                    </Badge>
                    {(selectedSale.fiscalType || 'BLANCO') === 'BLANCO' ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                        🏛️ AFIP (Blanco)
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                        📋 Ticket X (Negro)
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Vendedor / Operador</span>
                  <span className="font-semibold text-primary">{selectedSale.sellerName || 'Administrador Principal'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Cliente</span>
                  <span className="font-medium">{selectedSale.customerName || selectedSale.customer?.name || (selectedSale.customerId ? 'Cliente Registrado' : 'Consumidor Final')}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Subtotal / Descuento / IVA</span>
                  <span className="font-medium text-xs">
                    Sub: ${Number(selectedSale.subtotal || 0).toFixed(2)}
                    {Number(selectedSale.discount || 0) > 0 && (
                      <span className="text-emerald-600 font-semibold ml-1">
                        | Desc: -${Number(selectedSale.discount || 0).toFixed(2)}
                      </span>
                    )}
                    {" "}| IVA: ${Number(selectedSale.taxAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Monto Total Cobrado</span>
                  <span className="font-bold text-lg text-primary">{formatCurrency(selectedSale.total || 0)}</span>
                  {selectedSale.couponCode && (
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-900 border-emerald-300 text-[11px] gap-1 font-mono">
                        <Tag className="h-3 w-3 text-emerald-600" />
                        Cupón: {selectedSale.couponCode}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* E-commerce & Dispatch Details */}
              {(Boolean(selectedSale.channel && selectedSale.channel !== 'POS') || Boolean(selectedSale.externalOrderId)) && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-amber-700" />
                      Información de Despacho & E-commerce
                    </span>
                    {renderChannelBadge(selectedSale.channel, selectedSale.externalOrderId)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Método de Envío:</span>
                      <span className="font-semibold">{selectedSale.shippingMethod || 'Mercado Envíos Flex'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Estado Logístico:</span>
                      <Badge variant="outline" className="bg-white text-[10px]">
                        {selectedSale.shippingStatus || 'PENDING'}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Número de Guía / Tracking:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedSale.trackingNumber || 'Sin guía asignada'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Comisión de Plataforma:</span>
                      <span className="font-medium text-red-600">
                        {selectedSale.platformFee ? `-$${Number(selectedSale.platformFee).toFixed(2)}` : '$0.00'}
                      </span>
                    </div>
                    {selectedSale.shippingAddress && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-[11px]">Dirección de Destino:</span>
                        <span className="font-medium">{selectedSale.shippingAddress}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs bg-white hover:bg-amber-100 border-amber-300 text-amber-900"
                      onClick={() => setSelectedLabelSale(selectedSale)}
                    >
                      <Truck className="h-3.5 w-3.5 mr-1 text-amber-600" /> Imprimir Rótulo de Envío (10x15)
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-sm mb-2">Artículos Vendidos</h4>
                <div className="border rounded-md overflow-hidden text-sm">
                  <table className="w-full">
                    <thead className="bg-muted text-xs">
                      <tr>
                        <th className="p-2 text-left">Ítem</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">P. Unit</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items && selectedSale.items.length > 0 ? (
                        selectedSale.items.map((it: any, idx: number) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2 font-medium">{it.productName || it.name || it.product?.name || 'Artículo de mostrador'}</td>
                            <td className="p-2 text-center">{it.quantity}</td>
                            <td className="p-2 text-right">${Number(it.unitPrice || 0).toFixed(2)}</td>
                            <td className="p-2 text-right font-semibold">${Number(it.subtotal || it.total || (it.quantity * it.unitPrice) || 0).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-muted-foreground text-xs">
                            Total general de artículos: ${Number(selectedSale.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedSale.payments && selectedSale.payments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">Medios de Pago Aplicados</h4>
                  <div className="space-y-1.5 text-xs">
                    {selectedSale.payments.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between bg-muted/40 p-2 rounded border">
                        <span className="capitalize font-medium">{p.method || p.methodId || 'Efectivo'}</span>
                        <span className="font-bold">{formatCurrency(p.amount || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* E-commerce Modal */}
      <NewEcommerceSaleModal
        isOpen={isEcommerceModalOpen}
        onClose={() => setIsEcommerceModalOpen(false)}
      />

      {/* Shipping Label Modal */}
      <ShippingLabelModal
        sale={selectedLabelSale}
        isOpen={Boolean(selectedLabelSale)}
        onClose={() => setSelectedLabelSale(null)}
      />
    </div>
  );
}
