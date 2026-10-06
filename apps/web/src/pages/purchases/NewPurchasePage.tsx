import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProducts } from '@/services/products.service';
import { useWarehouses } from '@/services/inventory.service';
import { useSuppliers } from '@/services/suppliers.service';
import { useCreatePurchase } from '@/services/purchases.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function NewPurchasePage() {
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const { data: suppliers } = useSuppliers();
  const { mutate: createPurchase, isPending } = useCreatePurchase();

  const [supplierId, setSupplierId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [updateSellingPrices, setUpdateSellingPrices] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cuenta Corriente');
  const [initialPayment, setInitialPayment] = useState('');
  
  const [items, setItems] = useState<any[]>([]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitCost: 0, taxRate: 21 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = (item: any) => item.quantity * item.unitCost;
  const calculateTotal = () => items.reduce((acc, item) => acc + (calculateSubtotal(item) * (1 + item.taxRate / 100)), 0);

  const handleSubmit = () => {
    if (!supplierId || !warehouseId || !invoiceNumber || items.length === 0) {
      toast.error('Complete los datos principales y agregue al menos un producto');
      return;
    }

    createPurchase({
      supplierId,
      destinationWarehouseId: warehouseId,
      invoiceNumber,
      date,
      status: 'COMPLETED',
      total: calculateTotal(),
      items,
      updateSellingPrices,
      paymentMethod,
      initialPaymentAmount: paymentMethod !== 'Cuenta Corriente' ? parseFloat(initialPayment) || calculateTotal() : 0,
    }, {
      onSuccess: () => {
        toast.success('Compra registrada con éxito');
        navigate('/compras');
      },
      onError: () => toast.error('Error al registrar compra')
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Registrar Compra</h2>
        <p className="text-muted-foreground">Ingresa los datos de la factura de compra y los productos recibidos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Datos de la Factura</h3>
          <div className="grid gap-2">
            <Label>Proveedor</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
              <SelectContent>
                {suppliers?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Depósito de Destino</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar depósito" /></SelectTrigger>
              <SelectContent>
                {warehouses?.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Nro de Factura</Label>
              <Input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="Ej: A-0001-00001234" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Opciones y Pago</h3>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="updatePrices" checked={updateSellingPrices} onChange={e => setUpdateSellingPrices(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="updatePrices">Actualizar precios de venta según margen comercial</Label>
          </div>
          <div className="grid gap-2">
            <Label>Forma de Pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger><SelectValue placeholder="Seleccionar forma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Cuenta Corriente">Cuenta Corriente (A plazo)</SelectItem>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {paymentMethod !== 'Cuenta Corriente' && (
            <div className="grid gap-2">
              <Label>Pago Inicial</Label>
              <Input type="number" value={initialPayment} onChange={e => setInitialPayment(e.target.value)} placeholder={`Total: $${calculateTotal().toLocaleString('es-AR')}`} />
            </div>
          )}
        </Card>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-semibold text-lg">Productos Recibidos</h3>
          <Button variant="outline" size="sm" onClick={addItem}>Agregar Producto</Button>
        </div>
        
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="h-10 px-2 text-left font-medium">Producto</th>
                <th className="h-10 px-2 text-left font-medium">Cantidad</th>
                <th className="h-10 px-2 text-left font-medium">Costo Unit.</th>
                <th className="h-10 px-2 text-left font-medium">IVA %</th>
                <th className="h-10 px-2 text-right font-medium">Subtotal</th>
                <th className="h-10 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">
                    <Select value={item.productId} onValueChange={v => updateItem(idx, 'productId', v)}>
                      <SelectTrigger><SelectValue placeholder="Buscar..." /></SelectTrigger>
                      <SelectContent>
                        {products?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Input type="number" className="w-24" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="p-2">
                    <Input type="number" className="w-24" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="p-2">
                    <Input type="number" className="w-20" value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td className="p-2 text-right font-medium">
                    ${calculateSubtotal(item).toLocaleString('es-AR')}
                  </td>
                  <td className="p-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="text-destructive">X</Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No hay productos. Agregue uno.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end pt-4">
          <div className="text-right">
            <p className="text-lg font-bold">Total con IVA: ${calculateTotal().toLocaleString('es-AR')}</p>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/compras')}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={isPending}>Guardar Compra</Button>
      </div>
    </div>
  );
}
