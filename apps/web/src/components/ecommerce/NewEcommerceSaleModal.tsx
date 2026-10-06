import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus, Trash2, Globe, Truck, CheckCircle2, DollarSign, Tag, X, Sparkles } from 'lucide-react';
import { useCreateSale, usePaymentMethods } from '@/services/sales.service';
import { useProducts } from '@/services/products.service';
import { validateCoupon, recordCouponRedemption } from '@/services/coupons.service';
import toast from 'react-hot-toast';

interface Props {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  defaultChannel?: 'MERCADO_LIBRE' | 'TIENDA_ONLINE' | 'WHATSAPP' | 'OTRO';
}

export function NewEcommerceSaleModal({ 
  isOpen, 
  open, 
  onClose, 
  onOpenChange, 
  defaultChannel = 'MERCADO_LIBRE' 
}: Props) {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);
  const handleModalClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const [channel, setChannel] = useState<'MERCADO_LIBRE' | 'TIENDA_ONLINE' | 'WHATSAPP' | 'OTRO'>(defaultChannel);
  const [externalOrderId, setExternalOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerBuyerUsername, setCustomerBuyerUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNum, setDocumentNum] = useState('');
  const [fiscalType, setFiscalType] = useState<'BLANCO' | 'NEGRO'>('BLANCO');
  
  const [shippingMethod, setShippingMethod] = useState('Mercado Envíos Flex');
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);

  // Item lines state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [items, setItems] = useState<any[]>([]);

  const { data: products = [] } = useProducts();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const createSale = useCreateSale();

  // Reset or preset defaults when channel changes
  const handleChannelChange = (val: 'MERCADO_LIBRE' | 'TIENDA_ONLINE' | 'WHATSAPP' | 'OTRO') => {
    setChannel(val);
    if (val === 'MERCADO_LIBRE') {
      setExternalOrderId('MELI-200000' + Math.floor(10000 + Math.random() * 90000));
      setShippingMethod('Mercado Envíos Flex');
    } else if (val === 'TIENDA_ONLINE') {
      setExternalOrderId('WEB-TN-' + Math.floor(1000 + Math.random() * 9000));
      setShippingMethod('Envío a Domicilio (Flete Propio)');
    } else if (val === 'WHATSAPP') {
      setExternalOrderId('WAPP-' + Math.floor(1000 + Math.random() * 9000));
      setShippingMethod('Retiro en Mostrador');
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p: any) => p.id === productId);
    if (prod) {
      setItemPrice(Number(prod.salePrice || 0));
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error('Selecciona un producto');
      return;
    }
    const prod = products.find((p: any) => p.id === selectedProductId);
    if (!prod) return;

    const existingIdx = items.findIndex((i) => i.productId === selectedProductId);
    const qty = Number(itemQuantity) || 1;
    const price = Number(itemPrice) || Number(prod.salePrice || 0);
    const taxRate = Number((prod as any).taxRate ?? 21);
    const taxAmount = (price * qty * taxRate) / 100;
    const total = price * qty;

    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].quantity += qty;
      updated[existingIdx].subtotal = updated[existingIdx].quantity * price;
      updated[existingIdx].taxAmount = (updated[existingIdx].subtotal * taxRate) / 100;
      updated[existingIdx].total = updated[existingIdx].subtotal;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice: price,
          discount: 0,
          taxRate,
          taxAmount,
          subtotal: total,
          total,
        },
      ]);
    }

    // Auto-calculate suggested platform fee for Mercado Libre (~13%)
    if (channel === 'MERCADO_LIBRE') {
      const currentSubtotal = items.reduce((acc, i) => acc + i.total, 0) + total;
      setPlatformFee(Math.round(currentSubtotal * 0.13));
    }

    setSelectedProductId('');
    setItemQuantity(1);
    setItemPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
    if (channel === 'MERCADO_LIBRE') {
      const currentSubtotal = updated.reduce((acc, i) => acc + i.total, 0);
      setPlatformFee(Math.round(currentSubtotal * 0.13));
    }
  };

  // Coupon handlers
  const handleApplyCoupon = (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error('Ingrese un código de cupón');
      return;
    }
    const currentSubtotal = items.reduce((acc, i) => acc + i.total, 0);
    if (currentSubtotal <= 0) {
      toast.error('Agregue productos antes de aplicar un cupón');
      return;
    }
    const res = validateCoupon(code, currentSubtotal);
    if (!res.isValid || !res.coupon) {
      toast.error(res.message);
      return;
    }
    setAppliedCoupon({
      code: res.coupon.code,
      discountAmount: res.calculatedDiscount,
      description: res.coupon.description,
    });
    toast.success(res.message);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Cupón removido');
  };

  // Calculations
  const subtotal = useMemo(() => items.reduce((acc, i) => acc + i.total, 0), [items]);
  const taxAmount = useMemo(() => items.reduce((acc, i) => acc + (i.taxAmount || 0), 0), [items]);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Agrega al menos un producto a la venta de e-commerce');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Indica el nombre del comprador o cliente');
      return;
    }

    const defaultPaymentMethod = paymentMethods[0]?.id || 'pm-1';
    const methodId = selectedPaymentMethodId || defaultPaymentMethod;

    try {
      await createSale.mutateAsync({
        channel,
        externalOrderId: externalOrderId.trim() || undefined,
        customerName: customerName.trim(),
        customerBuyerUsername: customerBuyerUsername.trim() || undefined,
        shippingAddress: [shippingAddress, city].filter(Boolean).join(', ') || undefined,
        shippingMethod,
        shippingStatus: 'READY_TO_SHIP',
        shippingCost: Number(shippingCost) || 0,
        platformFee: Number(platformFee) || 0,
        trackingNumber: trackingNumber.trim() || undefined,
        fiscalType,
        couponCode: appliedCoupon?.code,
        subtotal,
        discount,
        taxAmount,
        total,
        items,
        payments: [{ methodId, amount: total }],
      });

      if (appliedCoupon) {
        recordCouponRedemption(appliedCoupon.code, discount, total);
      }

      toast.success(`¡Venta de ${channel === 'MERCADO_LIBRE' ? 'Mercado Libre' : channel === 'TIENDA_ONLINE' ? 'Tienda Online' : channel} ingresada con éxito!`);
      handleModalClose();
      // Reset form
      setItems([]);
      setAppliedCoupon(null);
      setCustomerName('');
      setCustomerBuyerUsername('');
      setShippingAddress('');
      setExternalOrderId('');
      setTrackingNumber('');
    } catch (err: any) {
      toast.error(err?.message || 'Error al registrar la venta e-commerce');
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => { if (!val) handleModalClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Ingresar Venta de E-commerce
          </DialogTitle>
          <DialogDescription>
            Registra una orden proveniente de Mercado Libre, Tienda Online (Tiendanube / Web) u otros canales digitales. Descuenta inventario automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Fila 1: Canal y Nro de Orden Externa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-lg border">
            <div>
              <Label className="text-xs font-semibold">Canal de Venta</Label>
              <Select value={channel} onValueChange={(val: any) => handleChannelChange(val)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MERCADO_LIBRE">🟡 Mercado Libre</SelectItem>
                  <SelectItem value="TIENDA_ONLINE">🌐 Tienda Online (Web)</SelectItem>
                  <SelectItem value="WHATSAPP">💬 WhatsApp / Redes</SelectItem>
                  <SelectItem value="OTRO">📦 Otro Canal Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nro de Orden / Venta Externa</Label>
              <Input
                value={externalOrderId}
                onChange={(e) => setExternalOrderId(e.target.value)}
                placeholder={channel === 'MERCADO_LIBRE' ? '#20000089745' : '#TN-1044'}
                className="mt-1 h-9 font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Régimen Fiscal</Label>
              <Select value={fiscalType} onValueChange={(val: any) => setFiscalType(val)}>
                <SelectTrigger className="mt-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BLANCO">🏛️ Oficial AFIP (Factura A/B con CAE)</SelectItem>
                  <SelectItem value="NEGRO">📋 Comprobante Interno (Ticket X)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Datos del Comprador */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Globe className="w-4 h-4 text-primary" /> Datos del Comprador
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Nombre Completo / Razón Social *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Lucas Ferreyra"
                  required
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Usuario Comprador (Opcional)</Label>
                <Input
                  value={customerBuyerUsername}
                  onChange={(e) => setCustomerBuyerUsername(e.target.value)}
                  placeholder="Ej: LUKAS_MDQ"
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Teléfono / WhatsApp</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 223-5551234"
                  className="mt-1 h-8"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-xs">Dirección de Entrega</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Ej: Av. Colón 3420 2° B"
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Ciudad / Localidad</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Mar del Plata"
                  className="mt-1 h-8"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Selección de Artículos Vendidos */}
          <div className="space-y-3 p-3 bg-muted/20 border rounded-lg">
            <h4 className="text-sm font-semibold flex items-center justify-between">
              <span>Artículos Vendidos (Inventario)</span>
              <Badge variant="outline" className="text-xs font-normal">
                {items.length} ítems en orden
              </Badge>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <Label className="text-xs">Buscar Producto en Catálogo</Label>
                <Select value={selectedProductId} onValueChange={handleProductSelect}>
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue placeholder="Seleccionar producto..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stock ?? p.totalStock ?? 0}) - ${Number(p.salePrice || 0).toLocaleString('es-AR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-1 h-8"
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs">Precio Unit. ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8"
                />
              </div>

              <div className="sm:col-span-2">
                <Button type="button" onClick={handleAddItem} className="w-full h-8" size="sm">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
                </Button>
              </div>
            </div>

            {/* Tabla de ítems agregados */}
            {items.length > 0 ? (
              <div className="border rounded-md overflow-hidden mt-3 bg-background">
                <table className="w-full text-xs">
                  <thead className="bg-muted text-muted-foreground border-b">
                    <tr>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-center w-16">Cant.</th>
                      <th className="p-2 text-right w-24">Precio Unit.</th>
                      <th className="p-2 text-right w-24">Subtotal</th>
                      <th className="p-2 text-center w-12">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{item.productName}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">${Number(item.unitPrice).toLocaleString('es-AR')}</td>
                        <td className="p-2 text-right font-semibold">${Number(item.total).toLocaleString('es-AR')}</td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                No hay productos agregados aún. Selecciona un producto arriba.
              </p>
            )}
          </div>

          {/* Fila 4: Datos de Envío y Despacho */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Truck className="w-4 h-4 text-primary" /> Logística, Envíos y Comisiones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Método de Envío</Label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger className="mt-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mercado Envíos Flex">🚀 Mercado Envíos Flex (Mismo día)</SelectItem>
                    <SelectItem value="Mercado Envíos Colecta">📦 Mercado Envíos Colecta</SelectItem>
                    <SelectItem value="Correo Argentino (Paq.ar)">📫 Correo Argentino</SelectItem>
                    <SelectItem value="Envío a Domicilio (Flete Propio)">🚚 Flete Propio / Domicilio</SelectItem>
                    <SelectItem value="Retiro en Mostrador">🏪 Retiro en Salón / Mostrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Costo de Envío Cobrado ($)</Label>
                <Input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Comisión Plataforma ($)</Label>
                <Input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="mt-1 h-8"
                />
              </div>

              <div>
                <Label className="text-xs">Código Tracking / Guía</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej: MELI-FX-12345"
                  className="mt-1 h-8 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Fila: Cupón de Descuento E-commerce */}
          <div className="p-3 bg-muted/30 rounded-lg border space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Tag className="w-3.5 h-3.5 text-primary" /> Cupón o Promoción Especial
              </Label>
              {appliedCoupon && (
                <span className="text-xs font-bold text-emerald-600">
                  Ahorro aplicado: -${appliedCoupon.discountAmount.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-md p-2 text-xs">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-mono text-xs">
                    {appliedCoupon.code}
                  </Badge>
                  <span className="font-medium text-emerald-800">
                    {appliedCoupon.description}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="h-6 px-2 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 font-medium"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Quitar
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Código de cupón (ej: BIENVENIDO10, FERRETERIA10, etc.)..."
                  className="h-8 text-xs font-mono uppercase bg-white max-w-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyCoupon()}
                  disabled={items.length === 0}
                  className="h-8 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold shrink-0"
                >
                  Aplicar Cupón
                </Button>
              </div>
            )}
          </div>

          {/* Totales y Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm flex-wrap">
              {discount > 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Subtotal:</span>
                  <span className="text-sm line-through text-slate-500">${subtotal.toLocaleString('es-AR')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-emerald-600 font-semibold">Descuento Cupón:</span>
                  <span className="text-sm font-bold text-emerald-600">-${discount.toLocaleString('es-AR')}</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total Venta:</span>
                <span className="text-xl font-bold text-primary">${total.toLocaleString('es-AR')}</span>
              </div>
              {platformFee > 0 && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Neto a Liquidar:</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${Math.max(0, total - platformFee).toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={items.length === 0 || createSale.isPending} className="w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {createSale.isPending ? 'Guardando...' : 'Registrar Venta E-commerce'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}