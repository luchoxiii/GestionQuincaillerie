import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateTransfer, useWarehouses } from '@/services/inventory.service';
import { useProducts } from '@/services/products.service';
import toast from 'react-hot-toast';

interface StockTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockTransferModal({ open, onOpenChange }: StockTransferModalProps) {
  const [productId, setProductId] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const { data: warehouses } = useWarehouses();
  const { data: products } = useProducts();
  const { mutate: transferStock, isPending } = useCreateTransfer();

  const handleTransfer = () => {
    const qty = parseInt(quantity, 10);
    if (!productId || !sourceWarehouseId || !destinationWarehouseId || isNaN(qty) || qty <= 0) {
      toast.error('Complete todos los campos correctamente');
      return;
    }
    if (sourceWarehouseId === destinationWarehouseId) {
      toast.error('El depósito de origen y destino no pueden ser iguales');
      return;
    }

    transferStock(
      { productId, sourceWarehouseId, destinationWarehouseId, quantity: qty, notes },
      {
        onSuccess: () => {
          toast.success('Transferencia registrada');
          onOpenChange(false);
          // reset
          setProductId(''); setSourceWarehouseId(''); setDestinationWarehouseId(''); setQuantity(''); setNotes('');
        },
        onError: () => toast.error('Error al transferir stock')
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Transferencia de Stock</DialogTitle>
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
            <Label>Origen</Label>
            <Select value={sourceWarehouseId} onValueChange={setSourceWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Depósito origen" /></SelectTrigger>
              <SelectContent>
                {warehouses?.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Destino</Label>
            <Select value={destinationWarehouseId} onValueChange={setDestinationWarehouseId}>
              <SelectTrigger><SelectValue placeholder="Depósito destino" /></SelectTrigger>
              <SelectContent>
                {warehouses?.map(w => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Cantidad</Label>
            <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="Ej: 5" />
          </div>
          <div className="grid gap-2">
            <Label>Notas</Label>
            <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Referencia u observación" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleTransfer} disabled={isPending}>
            {isPending ? 'Transfiriendo...' : 'Transferir Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
