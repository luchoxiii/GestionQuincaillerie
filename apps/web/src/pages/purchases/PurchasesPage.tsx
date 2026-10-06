import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePurchases } from '@/services/purchases.service';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PurchasesPage() {
  const { data: purchases = [], isLoading } = usePurchases();
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  const handleExportCSV = () => {
    if (!purchases || purchases.length === 0) {
      toast.error('No hay compras para exportar');
      return;
    }

    const headers = ['Nro Compra', 'Factura / Remito', 'Proveedor', 'Fecha', 'Total ($)', 'Estado'];
    const rows = purchases.map((p: any) => [
      p.purchaseNumber || '',
      p.invoiceNumber || '-',
      p.supplier || '',
      p.date ? new Date(p.date).toLocaleDateString('es-AR') : '-',
      Number(p.total || 0).toFixed(2),
      p.status === 'COMPLETED' ? 'Completado' : 'Pendiente'
    ]);

    exportToCsv(`compras_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Reporte de compras exportado a CSV');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compras</h2>
          <p className="text-muted-foreground">Historial de compras y recepción de mercadería.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar Compras CSV
          </Button>
          <Button asChild>
            <Link to="/compras/nueva">Registrar Compra</Link>
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? <div className="p-8 text-center">Cargando...</div> : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nro Compra</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Factura/Remito</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Proveedor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fecha</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Estado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {purchases?.map((p: any) => (
                  <tr key={p.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{p.purchaseNumber}</td>
                    <td className="p-4 align-middle">{p.invoiceNumber}</td>
                    <td className="p-4 align-middle">{p.supplier}</td>
                    <td className="p-4 align-middle">{new Date(p.date).toLocaleDateString('es-AR')}</td>
                    <td className="p-4 align-middle font-bold">${Number(p.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-4 align-middle">
                      <Badge variant={p.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {p.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPurchase(p)}>Ver Detalle</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle de Compra: {selectedPurchase?.purchaseNumber}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-2">
            <p><strong>Proveedor:</strong> {selectedPurchase?.supplier}</p>
            <p><strong>Factura:</strong> {selectedPurchase?.invoiceNumber}</p>
            <p><strong>Total:</strong> ${Number(selectedPurchase?.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
            <div className="mt-4 p-4 bg-muted rounded-md text-sm">
              <p>Los ítems de la compra aparecerían aquí.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
