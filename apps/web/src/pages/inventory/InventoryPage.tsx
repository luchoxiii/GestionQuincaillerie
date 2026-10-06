import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStock, useStockMovements } from '@/services/inventory.service';
import { StockAdjustModal } from './StockAdjustModal';
import { StockTransferModal } from './StockTransferModal';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const { data: stockData = [], isLoading: stockLoading } = useStock();
  const { data: movementsData = [], isLoading: movLoading } = useStockMovements();

  const handleExportStockCSV = () => {
    if (!stockData || stockData.length === 0) {
      toast.error('No hay datos de stock para exportar');
      return;
    }
    const headers = ['SKU', 'Producto', 'Depósito', 'Stock Actual', 'Estado'];
    const rows = stockData.map((item: any) => [
      item.sku || '',
      item.product || '',
      item.warehouse || 'Principal',
      item.quantity || 0,
      item.quantity > 10 ? 'Óptimo' : item.quantity > 0 ? 'Bajo' : 'Sin Stock'
    ]);
    exportToCsv(`inventario_stock_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Reporte de stock actual exportado a CSV');
  };

  const handleExportKardexCSV = () => {
    if (!movementsData || movementsData.length === 0) {
      toast.error('No hay movimientos de kardex para exportar');
      return;
    }
    const headers = ['Fecha', 'Tipo Movimiento', 'Producto', 'Cantidad', 'Referencia / Motivo'];
    const rows = movementsData.map((mov: any) => [
      mov.date ? new Date(mov.date).toLocaleDateString('es-AR') : '-',
      mov.type || '',
      mov.product || '',
      mov.quantity || 0,
      mov.reference || ''
    ]);
    exportToCsv(`inventario_kardex_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Reporte de kardex exportado a CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">Control de stock, depósitos y movimientos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportStockCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar Stock CSV
          </Button>
          <Button variant="outline" onClick={handleExportKardexCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar Kardex CSV
          </Button>
          <Button variant="outline" onClick={() => setAdjustOpen(true)}>Ajustar Stock</Button>
          <Button onClick={() => setTransferOpen(true)}>Nueva Transferencia</Button>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock">Stock por Depósito</TabsTrigger>
          <TabsTrigger value="kardex">Kardex / Movimientos</TabsTrigger>
          <TabsTrigger value="transfer">Transferencias</TabsTrigger>
        </TabsList>
        <TabsContent value="stock" className="space-y-4">
          <Card className="p-4">
            {stockLoading ? <div className="p-8 text-center">Cargando...</div> : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">SKU</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Producto</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Depósito</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Stock Actual</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {stockData?.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{item.sku}</td>
                        <td className="p-4 align-middle font-medium">{item.product}</td>
                        <td className="p-4 align-middle">{item.warehouse}</td>
                        <td className="p-4 align-middle">
                          <Badge variant={item.quantity > 10 ? 'success' : item.quantity > 0 ? 'warning' : 'destructive'}>
                            {item.quantity}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          <Button variant="ghost" size="sm" onClick={() => setAdjustOpen(true)}>Ajustar</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="kardex">
          <Card className="p-4">
            {movLoading ? <div className="p-8 text-center">Cargando...</div> : (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Producto</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cantidad</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Referencia</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {movementsData?.map((mov: any) => (
                      <tr key={mov.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle">{mov.date ? new Date(mov.date).toLocaleDateString('es-AR') : '-'}</td>
                        <td className="p-4 align-middle">{mov.type}</td>
                        <td className="p-4 align-middle font-medium">{mov.product}</td>
                        <td className="p-4 align-middle">{mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}</td>
                        <td className="p-4 align-middle">{mov.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="transfer">
          <Card className="p-8 text-center text-muted-foreground">
            El historial de transferencias se mostrará aquí.
          </Card>
        </TabsContent>
      </Tabs>

      <StockAdjustModal open={adjustOpen} onOpenChange={setAdjustOpen} />
      <StockTransferModal open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
  );
}
