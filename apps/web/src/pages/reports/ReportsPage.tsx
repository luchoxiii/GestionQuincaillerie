import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, PieChart, Percent, Calculator } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useSalesReport, useProfitabilityReport, useIvaVentas, useIvaCompras, useInventoryValuation } from '../../services/reports.service';

export default function ReportsPage() {
  const [salesPeriod, setSalesPeriod] = useState('30-days');
  const [ivaMonth, setIvaMonth] = useState('10');
  const [ivaYear, setIvaYear] = useState('2023');

  const { data: salesData, isLoading: salesLoading } = useSalesReport(salesPeriod);
  const { data: profitabilityData, isLoading: profitabilityLoading } = useProfitabilityReport();
  const { data: ivaVentasData, isLoading: ivaVentasLoading } = useIvaVentas({ month: Number(ivaMonth), year: Number(ivaYear) });
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryValuation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reportes y Estadísticas</h2>
        <p className="text-muted-foreground">Métricas, rentabilidad e informes contables.</p>
      </div>

      <Tabs defaultValue="ventas" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="ventas">Ventas & Rentabilidad</TabsTrigger>
          <TabsTrigger value="iva">Libro IVA Digital</TabsTrigger>
          <TabsTrigger value="inventario">Valorización de Inventario</TabsTrigger>
        </TabsList>

        <TabsContent value="ventas" className="space-y-6">
          <div className="flex justify-between items-center">
            <Select value={salesPeriod} onValueChange={setSalesPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7-days">Últimos 7 días</SelectItem>
                <SelectItem value="30-days">Últimos 30 días</SelectItem>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="this-year">Este año</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar PDF</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${salesData?.summary.totalRevenue.toLocaleString('es-AR') ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo de Mercadería</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${salesData?.summary.totalCost.toLocaleString('es-AR') ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ganancia Bruta</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${salesData?.summary.grossProfit.toLocaleString('es-AR') ?? 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{salesData?.summary.averageMargin ?? 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${salesData?.summary.averageTicket.toLocaleString('es-AR') ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ventas vs Costos</CardTitle>
              <CardDescription>Evolución de ingresos y costos de mercadería vendida</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {salesLoading ? (
                <div className="h-full flex items-center justify-center">Cargando...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData?.chartData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} />
                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} labelFormatter={(label) => new Date(label).toLocaleDateString('es-AR')} />
                    <Legend />
                    <Bar dataKey="sales" name="Ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="cost" name="Costo" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Márgenes de Rentabilidad por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Categoría</th>
                      <th className="px-4 py-3 font-medium text-right">Facturación</th>
                      <th className="px-4 py-3 font-medium text-right">Ganancia Bruta</th>
                      <th className="px-4 py-3 font-medium text-center">Margen (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityData?.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3 font-medium">{row.category}</td>
                        <td className="px-4 py-3 text-right">${row.revenue.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-3 text-right">${row.profit.toLocaleString('es-AR')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.margin >= 40 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {row.margin}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iva" className="space-y-6">
          <div className="flex gap-4 items-center">
            <Select value={ivaMonth} onValueChange={setIvaMonth}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Mes" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Enero</SelectItem>
                <SelectItem value="9">Septiembre</SelectItem>
                <SelectItem value="10">Octubre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ivaYear} onValueChange={setIvaYear}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Año" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="ml-auto"><Download className="mr-2 h-4 w-4" /> Exportar a CSV / Excel</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Libro IVA Ventas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[800px]">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">Fecha</th>
                      <th className="px-3 py-2 font-medium">Tipo</th>
                      <th className="px-3 py-2 font-medium">Punto Venta</th>
                      <th className="px-3 py-2 font-medium">Número</th>
                      <th className="px-3 py-2 font-medium">CUIT/DNI</th>
                      <th className="px-3 py-2 font-medium">Razón Social</th>
                      <th className="px-3 py-2 font-medium text-right">Neto Gravado</th>
                      <th className="px-3 py-2 font-medium text-right">IVA 21%</th>
                      <th className="px-3 py-2 font-medium text-right">IVA 10.5%</th>
                      <th className="px-3 py-2 font-medium text-right">Total</th>
                      <th className="px-3 py-2 font-medium">CAE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ivaVentasData?.records.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{new Date(r.date).toLocaleDateString('es-AR')}</td>
                        <td className="px-3 py-2">{r.type}</td>
                        <td className="px-3 py-2">{r.pos}</td>
                        <td className="px-3 py-2">{r.number}</td>
                        <td className="px-3 py-2">{r.cuit}</td>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2 text-right">${r.net.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2 text-right">${r.iva21.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2 text-right">${r.iva105.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2 text-right font-medium">${r.total.toLocaleString('es-AR')}</td>
                        <td className="px-3 py-2 text-[10px] text-muted-foreground">{r.cae}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 font-medium">
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-right">Totales:</td>
                      <td className="px-3 py-2 text-right">${ivaVentasData?.totals.net.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2 text-right">${ivaVentasData?.totals.iva21.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2 text-right">${ivaVentasData?.totals.iva105.toLocaleString('es-AR')}</td>
                      <td className="px-3 py-2 text-right">${ivaVentasData?.totals.total.toLocaleString('es-AR')}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventario" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Stock Valorizado al Costo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${inventoryData?.totalCost.toLocaleString('es-AR') ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Capital inmovilizado actual</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Valorizado a Precio de Venta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${inventoryData?.totalSalesValue.toLocaleString('es-AR') ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Proyección de ingresos brutos</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-primary">Margen Potencial Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{inventoryData?.margin ?? 0}%</div>
                <p className="text-xs text-primary/80 mt-1">Ganancia proyectada: ${inventoryData?.potentialProfit.toLocaleString('es-AR') ?? 0}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
