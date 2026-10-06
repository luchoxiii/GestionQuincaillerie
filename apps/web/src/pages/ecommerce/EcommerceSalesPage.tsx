import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSales, useSyncEcommerceOrders, useUpdateShippingStatus } from '@/services/sales.service';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingBag, 
  Globe, 
  Truck, 
  Plus, 
  RefreshCw, 
  Download, 
  Search, 
  Printer, 
  Copy, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { NewEcommerceSaleModal } from '@/components/ecommerce/NewEcommerceSaleModal';
import { ShippingLabelModal } from '@/components/ecommerce/ShippingLabelModal';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EcommerceSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [shippingFilter, setShippingFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedLabelSale, setSelectedLabelSale] = useState<any>(null);

  const { data: sales = [], isLoading } = useSales();
  const syncEcommerce = useSyncEcommerceOrders();
  const updateShipping = useUpdateShippingStatus();

  // Filter only ecommerce sales (or sales with non-POS channel or externalOrderId)
  const ecommerceSales = useMemo(() => {
    return sales.filter((s: any) => {
      const isEcom = s.channel && s.channel !== 'POS';
      const hasExternal = Boolean(s.externalOrderId);
      return isEcom || hasExternal;
    });
  }, [sales]);

  // Tab and filter calculations
  const filteredSales = useMemo(() => {
    return ecommerceSales.filter((s: any) => {
      // Tab filter
      if (activeTab === 'meli' && s.channel !== 'MERCADO_LIBRE') return false;
      if (activeTab === 'web' && s.channel !== 'TIENDA_ONLINE') return false;
      if (activeTab === 'shipping' && (s.shippingStatus === 'DELIVERED' || s.shippingStatus === 'CANCELLED')) return false;

      // Shipping status filter
      if (shippingFilter !== 'all' && s.shippingStatus !== shippingFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const num = (s.saleNumber || s.number || '').toString().toLowerCase();
        const ext = (s.externalOrderId || '').toLowerCase();
        const client = (s.customerName || s.customer?.name || '').toLowerCase();
        const user = (s.customerBuyerUsername || '').toLowerCase();
        const track = (s.trackingNumber || '').toLowerCase();
        return num.includes(q) || ext.includes(q) || client.includes(q) || user.includes(q) || track.includes(q);
      }
      return true;
    });
  }, [ecommerceSales, activeTab, shippingFilter, searchTerm]);

  // Executive KPIs
  const totalEcommerceRevenue = useMemo(() => {
    return ecommerceSales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0);
  }, [ecommerceSales]);

  const meliSales = useMemo(() => ecommerceSales.filter((s: any) => s.channel === 'MERCADO_LIBRE'), [ecommerceSales]);
  const meliRevenue = useMemo(() => meliSales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0), [meliSales]);

  const webSales = useMemo(() => ecommerceSales.filter((s: any) => s.channel === 'TIENDA_ONLINE'), [ecommerceSales]);
  const webRevenue = useMemo(() => webSales.reduce((acc: number, s: any) => acc + (Number(s.total) || 0), 0), [webSales]);

  const pendingDispatchCount = useMemo(() => {
    return ecommerceSales.filter((s: any) => s.shippingStatus === 'READY_TO_SHIP' || s.shippingStatus === 'PREPARING' || s.shippingStatus === 'PENDING').length;
  }, [ecommerceSales]);

  const handleSyncOrders = async () => {
    try {
      const res = await syncEcommerce.mutateAsync();
      toast.success(`¡Sincronización completada! Se importaron ${res.importedCount} pedidos nuevos de Mercado Libre y Tienda Online.`);
    } catch {
      toast.error('Error al sincronizar con las plataformas de e-commerce');
    }
  };

  const handleStatusChange = async (saleId: string, newStatus: string) => {
    try {
      await updateShipping.mutateAsync({ saleId, shippingStatus: newStatus });
      toast.success('Estado logístico actualizado');
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleExportCSV = () => {
    const rows: (string | number)[][] = [
      ['=== REPORTE DE VENTAS Y OPERACIONES E-COMMERCE ===', ''],
      ['Fecha de Emisión', new Date().toLocaleDateString('es-AR')],
      ['Total Pedidos E-commerce', filteredSales.length],
      ['Total Facturado ($)', totalEcommerceRevenue.toFixed(2)],
      [''],
      [
        'ID Venta',
        'Fecha',
        'Canal',
        'Nro Orden Externa',
        'Comprador',
        'Usuario Plataforma',
        'Dirección Entrega',
        'Método Envío',
        'Código Tracking',
        'Estado Despacho',
        'Régimen Fiscal',
        'Total ($)',
        'Costo Envío ($)',
        'Comisión Plataforma ($)'
      ]
    ];

    filteredSales.forEach((s: any) => {
      rows.push([
        s.saleNumber || s.id,
        s.createdAt ? new Date(s.createdAt).toLocaleDateString('es-AR') : '-',
        s.channel || 'E-COMMERCE',
        s.externalOrderId || '-',
        s.customerName || s.customer?.name || 'Consumidor Final',
        s.customerBuyerUsername || '-',
        s.shippingAddress || '-',
        s.shippingMethod || '-',
        s.trackingNumber || '-',
        s.shippingStatus || 'COMPLETED',
        s.fiscalType || 'BLANCO',
        Number(s.total || 0).toFixed(2),
        Number(s.shippingCost || 0).toFixed(2),
        Number(s.platformFee || 0).toFixed(2)
      ]);
    });

    exportToCsv(`ventas_ecommerce_${new Date().toISOString().split('T')[0]}`, rows);
    toast.success('Listado de ventas e-commerce exportado a CSV');
  };

  const renderChannelBadge = (channel: string, externalId?: string) => {
    if (channel === 'MERCADO_LIBRE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
          <span>🟡 Mercado Libre</span>
          {externalId && <span className="font-mono text-[10px] opacity-75">{externalId}</span>}
        </span>
      );
    }
    if (channel === 'TIENDA_ONLINE') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
          <span>🌐 Tienda Online</span>
          {externalId && <span className="font-mono text-[10px] opacity-75">{externalId}</span>}
        </span>
      );
    }
    if (channel === 'WHATSAPP') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-900 border border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800">
          <span>💬 WhatsApp</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border dark:bg-neutral-800 dark:text-neutral-300">
        <span>📦 {channel || 'Digital'}</span>
      </span>
    );
  };

  const renderShippingBadge = (status: string) => {
    switch (status) {
      case 'READY_TO_SHIP':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            ⏳ Listo para Despachar
          </span>
        );
      case 'PREPARING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            📦 En Preparación
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            🚚 En Camino / Despachado
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
            ✅ Entregado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
            {status || 'Procesado'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" /> Centro de Operaciones E-commerce
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Recepción, facturación y despacho de ventas online (Mercado Libre, Tienda Web y canales digitales).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSyncOrders}
            disabled={syncEcommerce.isPending}
            className="shadow-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 text-primary ${syncEcommerce.isPending ? 'animate-spin' : ''}`} />
            Sincronizar Pedidos
          </Button>

          <Button variant="outline" onClick={handleExportCSV} className="shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>

          <Link to="/configuracion">
            <Button variant="outline" className="shadow-sm border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 gap-1.5 font-semibold">
              <ShoppingBag className="h-4 w-4 text-amber-700" />
              <span>Configurar MELI</span>
            </Button>
          </Link>

          <Button onClick={() => setIsNewModalOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Ingresar Venta E-commerce
          </Button>
        </div>

      </div>

      {/* KPI Cards de E-commerce */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado Online</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              ${totalEcommerceRevenue.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {ecommerceSales.length} ventas digitales registradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mercado Libre</CardTitle>
            <span className="text-lg">🟡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              ${meliRevenue.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {meliSales.length} órdenes recibidas de Meli
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tienda Online (Web)</CardTitle>
            <span className="text-lg">🌐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              ${webRevenue.toLocaleString('es-AR')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {webSales.length} compras en tienda directa
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Despacho</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <Truck className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              {pendingDispatchCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              paquetes por empaquetar o despachar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Pestañas */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="all">
                Todos ({ecommerceSales.length})
              </TabsTrigger>
              <TabsTrigger value="meli">
                🟡 Mercado Libre ({meliSales.length})
              </TabsTrigger>
              <TabsTrigger value="web">
                🌐 Tienda Online ({webSales.length})
              </TabsTrigger>
              <TabsTrigger value="shipping">
                🚚 Por Despachar ({pendingDispatchCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por orden, comprador, tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Estado Logístico:</span>
              <Select value={shippingFilter} onValueChange={setShippingFilter}>
                <SelectTrigger className="w-48 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="READY_TO_SHIP">Listo para Despachar</SelectItem>
                  <SelectItem value="PREPARING">En Preparación</SelectItem>
                  <SelectItem value="SHIPPED">En Camino / Despachado</SelectItem>
                  <SelectItem value="DELIVERED">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla Principal de Pedidos E-commerce */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-24">Venta</TableHead>
                  <TableHead className="w-44">Canal / Orden</TableHead>
                  <TableHead>Comprador / Destino</TableHead>
                  <TableHead className="w-48">Método / Tracking</TableHead>
                  <TableHead className="w-44">Estado Logístico</TableHead>
                  <TableHead className="text-right w-28">Total</TableHead>
                  <TableHead className="text-center w-28">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No se encontraron ventas de e-commerce en este filtro. Presiona <strong>"Ingresar Venta E-commerce"</strong> o <strong>"Sincronizar Pedidos"</strong>.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale: any) => (
                    <TableRow key={sale.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="font-mono text-xs font-semibold">{sale.saleNumber || sale.id}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('es-AR') : '-'}
                        </div>
                      </TableCell>

                      <TableCell>
                        {renderChannelBadge(sale.channel, sale.externalOrderId)}
                        <div className="mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {sale.fiscalType === 'BLANCO' ? 'Factura Oficial' : 'Ticket X'}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-xs">
                          {sale.customerName || sale.customer?.name || 'Consumidor Final'}
                        </div>
                        {sale.customerBuyerUsername && (
                          <div className="text-[11px] text-primary font-mono">
                            @{sale.customerBuyerUsername}
                          </div>
                        )}
                        <div className="text-[11px] text-muted-foreground truncate max-w-[240px]" title={sale.shippingAddress}>
                          {sale.shippingAddress || 'Retiro en Sucursal'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-medium flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>{sale.shippingMethod || 'Mercado Envíos'}</span>
                        </div>
                        {sale.trackingNumber && (
                          <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Guía: {sale.trackingNumber}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Select 
                          value={sale.shippingStatus || 'READY_TO_SHIP'} 
                          onValueChange={(val) => handleStatusChange(sale.id, val)}
                        >
                          <SelectTrigger className="h-7 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="READY_TO_SHIP">⏳ Listo para Despachar</SelectItem>
                            <SelectItem value="PREPARING">📦 En Preparación</SelectItem>
                            <SelectItem value="SHIPPED">🚚 Despachado / En Camino</SelectItem>
                            <SelectItem value="DELIVERED">✅ Entregado</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="font-bold text-sm">
                          ${Number(sale.total || 0).toLocaleString('es-AR')}
                        </div>
                        {sale.platformFee > 0 && (
                          <div className="text-[10px] text-muted-foreground">
                            Comisión: -${Number(sale.platformFee).toLocaleString('es-AR')}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => setSelectedLabelSale(sale)}
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Rótulo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <NewEcommerceSaleModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      <ShippingLabelModal
        isOpen={Boolean(selectedLabelSale)}
        onClose={() => setSelectedLabelSale(null)}
        sale={selectedLabelSale}
      />
    </div>
  );
}