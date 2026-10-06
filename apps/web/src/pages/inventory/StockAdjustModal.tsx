import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdjustStock, useWarehouses } from '@/services/inventory.service';
import { useProducts } from '@/services/products.service';
import toast from 'react-hot-toast';

interface StockAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockAdjustModal({ open, onOpenChange }: StockAdjustModalProps) {
  const [productId, setProductId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('ADJUST');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  const { mutate: adjustStock, isPending } = useAdjustStock();

  const handleAdjust = () => {
    const qty = parseInt(quantity, 10);
    if (!productId || !warehouseId || isNaN(qty) || qty <= 0) {
      toast.error('Complete todos los campos correctamente');
      return;
    }

    adjustStock(
      { productId, warehouseId, type, quantity: qty, notes },
      {
        onSuccess: () => {
          toast.success('Stock ajustado correctamente');
          onOpenChange(false);
          // reset form
          setProductId(''); setWarehouseId(''); setType('ADJUST'); setQuantity(''); setNotes('');
        },
        onError: () => toast.error('Error al ajustar el stock')
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Producto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Seleccione un producto" /></SelectTrigger>
              <SelectContent>
                {products?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.sku} - {p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Depósito</Label>
            <Select value={warehouseId} onValueChange={setWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Seleccione un depósito" /></SelectTrigger>
              <SelectContent>
                {warehouses?.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Tipo de Ajuste</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="IN">Entrada (+)</SelectItem>
                <SelectItem value="OUT">Salida (-)</SelectItem>
                <SelectItem value="ADJUST">Reemplazo / Ajuste Exacto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Cantidad</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ej: 10" />
          </div>
          <div className="grid gap-2">
            <Label>Notas</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Motivo del ajuste" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleAdjust} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Ajuste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
