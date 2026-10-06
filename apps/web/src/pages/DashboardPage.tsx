import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Download, 
  Calendar, 
  CalendarRange, 
  TrendingUp, 
  ShoppingBag,
  Layers,
  Sparkles,
  Globe,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { useSalesReport, useTopProducts } from '../services/reports.service';
import { useSales } from '../services/sales.service';
import { useProducts } from '../services/products.service';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PeriodPreset {
  id: string;
  label: string;
  shortLabel: string;
}

const PERIOD_PRESETS: PeriodPreset[] = [
  { id: 'today', label: 'Hoy', shortLabel: 'Hoy' },
  { id: 'yesterday', label: 'Ayer', shortLabel: 'Ayer' },
  { id: '7d', label: 'Últimos 7 días', shortLabel: '7 días' },
  { id: 'month', label: 'Este Mes', shortLabel: 'Este mes' },
  { id: '30d', label: 'Últimos 30 días', shortLabel: '30 días' },
  { id: 'year', label: 'Este Año', shortLabel: 'Año' },
  { id: 'custom', label: 'Personalizado', shortLabel: 'Rango' },
];

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  
  // Custom date range state (defaults: 30 days ago to today)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [customStartDate, setCustomStartDate] = useState<string>(thirtyDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  const filterParams = useMemo(() => {
    if (selectedPeriod === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    return undefined;
  }, [selectedPeriod, customStartDate, customEndDate]);

  const { data: salesData, isLoading: salesLoading } = useSalesReport(selectedPeriod, filterParams);
  const { data: topProducts, isLoading: topProductsLoading } = useTopProducts(selectedPeriod, filterParams);
  const { data: allSales } = useSales();
  const { data: allProducts } = useProducts();

  // Active period human readable label
  const activePeriodPreset = PERIOD_PRESETS.find(p => p.id === selectedPeriod) || PERIOD_PRESETS[4];
  const shortPeriodLabel = activePeriodPreset.shortLabel;

  const activeRangeDescription = useMemo(() => {
    const now = new Date();
    const formatD = (d: Date) => d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    if (selectedPeriod === 'today') {
      return `Hoy (${formatD(now)})`;
    }
    if (selectedPeriod === 'yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return `Ayer (${formatD(y)})`;
    }
    if (selectedPeriod === '7d') {
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      return `Del ${formatD(past)} al ${formatD(now)}`;
    }
    if (selectedPeriod === 'month') {
      const past = new Date(now.getFullYear(), now.getMonth(), 1);
      return `Del ${formatD(past)} al ${formatD(now)}`;
    }
    if (selectedPeriod === 'year') {
      const past = new Date(now.getFullYear(), 0, 1);
      return `Del ${formatD(past)} al ${formatD(now)}`;
    }
    if (selectedPeriod === 'custom') {
      const s = customStartDate ? new Date(customStartDate + 'T00:00:00') : now;
      const e = customEndDate ? new Date(customEndDate + 'T00:00:00') : now;
      return `Del ${formatD(s)} al ${formatD(e)}`;
    }
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    return `Del ${formatD(past)} al ${formatD(now)}`;
  }, [selectedPeriod, customStartDate, customEndDate]);

  // Stock alerts dynamic calculation
  const stockAlerts = useMemo(() => {
    if (allProducts && allProducts.length > 0) {
      const critical = allProducts.filter((p: any) => (p.stock ?? 0) <= (p.minStock ?? 5));
      if (critical.length > 0) {
        return critical.slice(0, 4).map((p: any) => ({
          id: p.id,
          name: p.name,
          stock: p.stock ?? 0,
          min: p.minStock ?? 5,
          status: (p.stock ?? 0) <= 0 ? 'out' : 'low'
        }));
      }
    }
    return [
      { id: '1', name: 'Martillo Galponero 500g', stock: 2, min: 5, status: 'low' },
      { id: '2', name: 'Clavos Punta París 2.5"', stock: 0, min: 50, status: 'out' },
      { id: '3', name: 'Taladro Percutor 700W', stock: 1, min: 3, status: 'low' },
      { id: '4', name: 'Disco de Corte 115mm', stock: 4, min: 10, status: 'low' },
    ];
  }, [allProducts]);

  // E-commerce summary metrics
  const ecommerceStats = useMemo(() => {
    if (!allSales || allSales.length === 0) return { count: 0, total: 0, pendingDispatch: 0 };
    const ecom = allSales.filter((s: any) => (s.channel && s.channel !== 'POS') || Boolean(s.externalOrderId));
    const pending = ecom.filter((s: any) => s.shippingStatus === 'PENDING' || s.shippingStatus === 'PREPARING' || s.shippingStatus === 'READY_TO_SHIP');
    const total = ecom.reduce((acc: number, s: any) => acc + (s.status === 'COMPLETED' ? Number(s.total || 0) : 0), 0);
    return { count: ecom.length, total, pendingDispatch: pending.length };
  }, [allSales]);

  // Recent transactions dynamic list
  const recentTransactions = useMemo(() => {
    if (allSales && allSales.length > 0) {
      return allSales.slice(0, 5).map((s: any) => {
        const d = s.createdAt ? new Date(s.createdAt) : new Date();
        const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        const typeStr = s.fiscalType === 'BLANCO' 
          ? (s.invoiceNumber?.startsWith('A') ? 'Factura A' : 'Factura B') 
          : 'Ticket X (Interno)';
        return {
          id: s.saleNumber || s.invoiceNumber || s.id,
          date: `${dateStr} ${timeStr}`,
          type: typeStr,
          customer: s.customerName || s.customer?.name || 'Consumidor Final',
          amount: s.status === 'VOIDED' ? -Number(s.total || 0) : Number(s.total || 0),
          status: s.status === 'VOIDED' ? 'Anulado' : 'Completado',
          fiscalType: s.fiscalType || 'BLANCO',
          channel: s.channel || 'POS',
          externalOrderId: s.externalOrderId,
        };
      });
    }
    return [
      { id: 'V-0001-00000101', date: 'Hoy 10:30', type: 'Factura A', customer: 'Constructora del Plata SA', amount: 54450, status: 'Completado', fiscalType: 'BLANCO', channel: 'POS' },
      { id: 'V-0001-00000102', date: 'Hoy 11:15', type: 'Factura B', customer: 'Roberto Gómez (Instalaciones)', amount: 21780, status: 'Completado', fiscalType: 'BLANCO', channel: 'POS' },
      { id: 'V-0001-00000103', date: 'Hoy 12:00', type: 'Ticket X (Interno)', customer: 'Consumidor Final', amount: 5808, status: 'Completado', fiscalType: 'NEGRO', channel: 'POS' },
      { id: 'V-0001-00000104', date: 'Ayer 16:45', type: 'Factura B', customer: 'Consumidor Final', amount: -38720, status: 'Anulado', fiscalType: 'BLANCO', channel: 'POS' },
    ];
  }, [allSales]);

  // Export comprehensive Dashboard CSV with selected period
  const handleExportDashboardCSV = () => {
    const today = new Date().toLocaleDateString('es-AR');
    const rows: (string | number)[][] = [
      ['=== RESUMEN EJECUTIVO DEL DASHBOARD ===', ''],
      ['Fecha de Emisión del Reporte', today],
      ['Período Temporal Seleccionado', activePeriodPreset.label],
      ['Rango de Fechas', activeRangeDescription],
      [''],
      ['=== MÉTRICAS DE VENTAS Y RENTABILIDAD DEL PERÍODO ===', ''],
      ['Total Facturado ($)', Number(salesData?.summary?.totalRevenue || 0).toFixed(2)],
      ['Costo Total de Mercadería ($)', Number(salesData?.summary?.totalCost || 0).toFixed(2)],
      ['Ganancia Bruta Estimada ($)', Number(salesData?.summary?.grossProfit || 0).toFixed(2)],
      ['Margen Promedio (%)', `${Number(salesData?.summary?.averageMargin || 0).toFixed(1)}%`],
      ['Ticket Promedio ($)', Number(salesData?.summary?.averageTicket || 0).toFixed(2)],
      ['Cantidad de Operaciones', Number(salesData?.summary?.count || 0)],
      ['Artículos en Stock Crítico', stockAlerts.length],
      [''],
      ['=== EVOLUCIÓN TEMPORAL DE VENTAS ===', '', ''],
      ['Punto Temporal / Fecha', 'Ventas ($)', 'Costo ($)'],
    ];

    if (salesData?.chartData && salesData.chartData.length > 0) {
      salesData.chartData.forEach((pt: any) => {
        rows.push([
          pt.date,
          Number(pt.sales || 0).toFixed(2),
          Number(pt.cost || 0).toFixed(2),
        ]);
      });
    }

    rows.push(['']);
    rows.push(['=== TOP PRODUCTOS DEL PERÍODO ===', '', '', '']);
    rows.push(['Posición', 'Producto', 'Unidades Vendidas', 'Ingresos Generados ($)']);

    if (topProducts && topProducts.length > 0) {
      topProducts.forEach((p: any, idx: number) => {
        rows.push([
          idx + 1,
          p.name || 'Artículo',
          p.quantity || 0,
          Number(p.revenue || 0).toFixed(2)
        ]);
      });
    }

    rows.push(['']);
    rows.push(['=== TRANSACCIONES RECIENTES ===', '', '', '', '', '']);
    rows.push(['ID Transacción', 'Fecha / Hora', 'Tipo Comprobante', 'Cliente', 'Monto ($)', 'Estado']);

    recentTransactions.forEach((t) => {
      rows.push([
        t.id,
        t.date,
        t.type,
        t.customer,
        Number(t.amount).toFixed(2),
        t.status
      ]);
    });

    rows.push(['']);
    rows.push(['=== ALERTAS DE STOCK CRÍTICO ===', '', '', '']);
    rows.push(['ID', 'Producto', 'Stock Actual', 'Stock Mínimo', 'Estado']);

    stockAlerts.forEach((a) => {
      rows.push([
        a.id,
        a.name,
        a.stock,
        a.min,
        a.status === 'out' ? 'Sin Stock (Agotado)' : 'Stock Bajo'
      ]);
    });

    const filePeriod = selectedPeriod === 'custom' ? `${customStartDate}_a_${customEndDate}` : selectedPeriod;
    exportToCsv(`dashboard_resumen_${filePeriod}_${new Date().toISOString().split('T')[0]}`, rows);
    toast.success(`Resumen del Dashboard (${activePeriodPreset.label}) exportado a CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Ejecutivo</h2>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
            <span>Visión general del negocio y rendimiento de ventas</span>
            <span>•</span>
            <span className="font-medium text-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {activeRangeDescription}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportDashboardCSV} className="shadow-sm">
            <Download className="mr-2 h-4 w-4 text-primary" /> Exportar Resumen a CSV
          </Button>
        </div>
      </div>

      {/* BARRA DE SELECCIÓN DE TIEMPO DE LAS VENTAS */}
      <Card className="border-primary/20 bg-card/60 backdrop-blur shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Presets de Tiempo */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center mr-1">
                <Calendar className="w-3.5 h-3.5 mr-1 text-primary" /> Período de Ventas:
              </span>
              {PERIOD_PRESETS.map((preset) => {
                const isActive = selectedPeriod === preset.id;
                return (
                  <Button
                    key={preset.id}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 text-xs font-medium px-3 rounded-md transition-all ${
                      isActive ? 'shadow-sm font-semibold' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setSelectedPeriod(preset.id)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            {/* Selector de Rango Personalizado o Rango Activo */}
            <div className="flex items-center gap-2 flex-wrap text-xs w-full lg:w-auto">
              {selectedPeriod === 'custom' ? (
                <div className="flex items-center gap-2 bg-muted/60 border p-1.5 rounded-lg w-full lg:w-auto">
                  <CalendarRange className="w-4 h-4 text-primary ml-1" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Desde:</span>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="h-7 text-xs w-32 px-2 bg-background"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Hasta:</span>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="h-7 text-xs w-32 px-2 bg-background"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-muted/40 border px-3 py-1.5 rounded-lg text-muted-foreground font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>{activeRangeDescription}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner de Monitoreo E-commerce */}
      {ecommerceStats.count > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-transparent border border-amber-200/80 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-700">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">Canales E-commerce Activos</span>
                {ecommerceStats.pendingDispatch > 0 && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-[10px]">
                    🚚 {ecommerceStats.pendingDispatch} por despachar
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ecommerceStats.count} ventas registradas online (Mercado Libre, Tienda Web) • Facturación canal: ${ecommerceStats.total.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild className="h-8 text-xs bg-white border-amber-300 hover:bg-amber-50 text-amber-900">
              <Link to="/ecommerce">
                Centro E-commerce <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Dinámicas según Período */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Facturado */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas ({shortPeriodLabel})
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {salesLoading ? 'Cargando...' : `$${(salesData?.summary?.totalRevenue || 0).toLocaleString('es-AR')}`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ShoppingBag className="h-3 w-3 mr-1 text-primary" />
              <span className="font-semibold text-foreground mr-1">
                {salesData?.summary?.count || 0}
              </span> 
              operaciones registradas
            </p>
          </CardContent>
        </Card>
        
        {/* Ganancia Estimada */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Estimada</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
              {salesLoading ? 'Cargando...' : `$${(salesData?.summary?.grossProfit || 0).toLocaleString('es-AR')}`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
              Margen promedio:{' '}
              <span className="font-semibold text-foreground ml-1">
                {(salesData?.summary?.averageMargin || 0).toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {salesLoading ? 'Cargando...' : `$${(salesData?.summary?.averageTicket || 0).toLocaleString('es-AR')}`}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              Costo mercadería:{' '}
              <span className="font-semibold text-foreground ml-1">
                ${(salesData?.summary?.totalCost || 0).toLocaleString('es-AR')}
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Alertas de Stock */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Crítico</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {stockAlerts.length}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              {stockAlerts.filter(a => a.status === 'out').length} artículos agotados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico y Alertas Rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico Adaptativo de Ventas */}
        <Card className="col-span-4 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Tendencia de Ventas ({activePeriodPreset.label})
              </CardTitle>
              <CardDescription className="text-xs">
                Evolución de ingresos y costos en {activeRangeDescription}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px] font-normal">
              {salesData?.chartData?.length || 0} puntos temporales
            </Badge>
          </CardHeader>
          <CardContent className="h-[350px]">
            {salesLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Cargando métricas del período...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData?.chartData || []} margin={{ top: 15, right: 15, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(val) => {
                      if (typeof val === 'string' && val.includes(':')) return val; // Hourly
                      if (['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].includes(val)) return val;
                      try {
                        const d = new Date(val + 'T00:00:00');
                        return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
                      } catch {
                        return val;
                      }
                    }} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#888' }}
                    dy={8}
                  />
                  <YAxis 
                    tickFormatter={(val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}k`} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#888' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `$${Number(value).toLocaleString('es-AR')}`,
                      name === 'sales' ? 'Ventas' : 'Costo Estimado'
                    ]}
                    labelFormatter={(label) => {
                      if (typeof label === 'string' && label.includes(':')) return `Hora: ${label}`;
                      return `Fecha: ${label}`;
                    }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    formatter={(value) => (value === 'sales' ? 'Ventas Facturadas' : 'Costo Mercadería')}
                  />
                  <Line 
                    type="monotone" 
                    name="sales"
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    name="cost"
                    dataKey="cost" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Alertas Rápidas de Stock */}
        <Card className="col-span-3 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Alertas de Stock</CardTitle>
              <CardDescription className="text-xs">Artículos con reposición prioritaria</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/inventario" className="text-xs text-primary flex items-center">
                Ver Todo <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              {stockAlerts.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b last:border-0 pb-2.5 last:pb-0">
                  <div className="space-y-0.5 max-w-[200px]">
                    <p className="text-sm font-medium leading-none truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Existencia: <span className="font-semibold text-foreground">{item.stock}</span> / Mín: {item.min}
                    </p>
                  </div>
                  {item.status === 'out' ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950/50 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:text-red-300">
                      Sin Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                      Stock Bajo
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button className="w-full mt-5" variant="outline" asChild>
              <Link to="/compras/nueva">
                Crear Orden de Compra
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Productos y Transacciones Recientes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Top 5 Productos del Período */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">
                Top 5 Productos ({shortPeriodLabel})
              </CardTitle>
              <CardDescription className="text-xs">Artículos con mayor recaudación</CardDescription>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent className="h-[300px]">
             {topProductsLoading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Calculando productos líderes...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts || []} layout="vertical" margin={{ top: 5, right: 30, left: 15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                  <XAxis 
                    type="number" 
                    tickFormatter={(val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${val / 1000}k`} 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={140} 
                    tick={{ fontSize: 11 }} 
                    tickFormatter={(val) => val.length > 18 ? `${val.substring(0, 18)}...` : val}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${Number(value).toLocaleString('es-AR')}`, 'Recaudación']} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Últimas Transacciones Registradas */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Últimas Transacciones</CardTitle>
              <CardDescription className="text-xs">Movimientos recientes de facturación</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/ventas" className="text-xs text-primary flex items-center">
                Ver Todas <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b pb-2.5 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{tx.customer}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="font-mono">{tx.id}</span>
                      <span>•</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] py-0 px-1.5 ${
                          tx.fiscalType === 'BLANCO' 
                            ? 'text-blue-600 border-blue-200 bg-blue-50/50 dark:bg-blue-950/30' 
                            : 'text-neutral-600 border-neutral-200 bg-neutral-50 dark:bg-neutral-900'
                        }`}
                      >
                        {tx.type}
                      </Badge>
                      {tx.channel && tx.channel !== 'POS' && (
                        <>
                          <span>•</span>
                          <Badge 
                            variant="outline" 
                            className={`text-[9px] py-0 px-1.5 font-semibold ${
                              tx.channel === 'MERCADO_LIBRE' 
                                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                : 'bg-sky-100 text-sky-900 border-sky-300'
                            }`}
                          >
                            {tx.channel === 'MERCADO_LIBRE' ? '🟡 MeLi' : '🌐 Web'}
                          </Badge>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                      {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toLocaleString('es-AR')}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
