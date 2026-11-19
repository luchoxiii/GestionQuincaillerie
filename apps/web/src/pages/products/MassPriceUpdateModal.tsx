import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMassPriceUpdate, useBrands } from '@/services/products.service';
import { useCategories } from '@/services/categories.service';
import toast from 'react-hot-toast';

interface MassPriceUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MassPriceUpdateModal({ open, onOpenChange }: MassPriceUpdateModalProps) {
  const [percentage, setPercentage] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [brandId, setBrandId] = useState('all');
  const [round, setRound] = useState(true);

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = useBrands();
  const { mutate: updatePrices, isPending } = useMassPriceUpdate();

  const handleUpdate = () => {
    const parsedPercentage = parseFloat(percentage);
    if (isNaN(parsedPercentage)) {
      toast.error('Ingrese un porcentaje válido');
      return;
    }

    updatePrices(
      { 
        percentage: parsedPercentage, 
        categoryId: categoryId && categoryId !== 'all' ? categoryId : undefined, 
        brandId: brandId && brandId !== 'all' ? brandId : undefined, 
        round 
      },
      {
        onSuccess: () => {
          toast.success('Precios actualizados correctamente');
          setPercentage('');
          setCategoryId('all');
          setBrandId('all');
          onOpenChange(false);
        },
        onError: () => {
          toast.error('Error al actualizar precios');
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuste Masivo de Precios</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Categoría (Opcional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Marca (Opcional)</Label>
            <Select value={brandId} onValueChange={setBrandId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las marcas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las marcas</SelectItem>
                {brands.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Porcentaje de Cambio (%)</Label>
            <Input type="number" value={percentage} onChange={(e) => setPercentage(e.target.value)} placeholder="Ej: 15 o -5" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="round" checked={round} onChange={(e) => setRound(e.target.checked)} className="h-4 w-4" />
            <Label htmlFor="round">Redondear precios</Label>
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            Vista previa: Un producto de $1000 con {percentage || '0'}% pasará a valer ${(1000 * (1 + (parseFloat(percentage) || 0) / 100)).toFixed(round ? 0 : 2)}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleUpdate} disabled={isPending}>
            {isPending ? 'Actualizando...' : 'Actualizar Precios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
