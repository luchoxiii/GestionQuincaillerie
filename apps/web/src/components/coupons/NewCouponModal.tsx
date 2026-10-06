import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gift, Percent, DollarSign, Sparkles } from 'lucide-react';
import { useCreateCoupon } from '@/services/coupons.service';
import toast from 'react-hot-toast';

interface Props {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  initialSegment?: string;
}

export function NewCouponModal({ isOpen, open, onClose, onOpenChange, initialSegment = 'ALL' }: Props) {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);
  const handleModalClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const createCoupon = useCreateCoupon();

  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [targetSegment, setTargetSegment] = useState<string>(initialSegment);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>('');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('');
  const [expirationDate, setExpirationDate] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Ingrese un código para el cupón');
      return;
    }

    const val = Number(discountValue);
    if (!val || val <= 0) {
      toast.error('El valor del descuento debe ser mayor a 0');
      return;
    }

    if (discountType === 'PERCENTAGE' && val > 100) {
      toast.error('El porcentaje de descuento no puede ser superior al 100%');
      return;
    }

    try {
      await createCoupon.mutateAsync({
        code: cleanCode,
        description: description.trim() || `Descuento del ${discountType === 'PERCENTAGE' ? `${val}%` : `$${val}`}`,
        discountType,
        discountValue: val,
        targetSegment,
        minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        expirationDate: expirationDate || undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        isActive: true,
      });

      // Reset
      setCode('');
      setDescription('');
      setDiscountValue('10');
      setMinPurchaseAmount('');
      setMaxDiscountAmount('');
      setExpirationDate('');
      setMaxUses('');
      handleModalClose();
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear el cupón');
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => { if (!val) handleModalClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gift className="w-5 h-5 text-indigo-600" />
            Crear Nuevo Cupón de Descuento
          </DialogTitle>
          <DialogDescription>
            Configure promociones para retener clientes, reactivar cuentas o bonificar a clientes frecuentes en el POS y tienda online.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Código del Cupón *</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="EJ: PRIMAVERA15"
                className="mt-1 font-mono font-bold tracking-wider uppercase h-9"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Segmento Objetivo</Label>
              <Select value={targetSegment} onValueChange={setTargetSegment}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">🌐 Todos los Clientes (General)</SelectItem>
                  <SelectItem value="VIP">🌟 Clientes VIP / Campeones</SelectItem>
                  <SelectItem value="LOYAL_POTENTIAL">💎 Clientes Potenciales Leales</SelectItem>
                  <SelectItem value="AT_RISK">⚠️ Clientes en Riesgo</SelectItem>
                  <SelectItem value="HIBERNATING">💤 Clientes Hibernando / Inactivos</SelectItem>
                  <SelectItem value="NEW">🌱 Nuevos Clientes</SelectItem>
                  <SelectItem value="BIG_BUILDER">🏗️ Grandes Obras y Empresas</SelectItem>
                  <SelectItem value="OCCASIONAL">🛒 Compradores Ocasionales</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Descripción Comercial o Motivo</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Bonificación del 15% para clientes con obras activas"
              className="mt-1 h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border rounded-lg">
            <div>
              <Label className="text-xs font-semibold">Tipo de Descuento</Label>
              <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                <SelectTrigger className="mt-1 h-9 text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentual (% OFF)</SelectItem>
                  <SelectItem value="FIXED">Monto Fijo ($ Pesos)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">
                {discountType === 'PERCENTAGE' ? 'Porcentaje (%):' : 'Monto Fijo ($):'}
              </Label>
              <div className="relative mt-1">
                {discountType === 'PERCENTAGE' ? (
                  <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                ) : (
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                )}
                <Input
                  type="number"
                  step="any"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className={`h-9 font-bold ${discountType === 'FIXED' ? 'pl-8' : 'pr-8'}`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Compra Mínima Requerida ($)</Label>
              <Input
                type="number"
                value={minPurchaseAmount}
                onChange={(e) => setMinPurchaseAmount(e.target.value)}
                placeholder="Opcional (Ej: 10000)"
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Tope Máximo Descuento ($)</Label>
              <Input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder="Opcional (Ej: 25000)"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Fecha de Expiración</Label>
              <Input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Límite Total de Canjes</Label>
              <Input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Ilimitado"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t">
            <Button type="button" variant="outline" onClick={handleModalClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              disabled={createCoupon.isPending}
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Guardar y Activar Cupón
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
