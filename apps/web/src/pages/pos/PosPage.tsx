import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePosStore } from '../../stores/pos.store';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { useProducts } from '../../services/products.service';
import { useCustomers } from '../../services/customers.service';
import { useCategories } from '../../services/categories.service';
import { validateCoupon } from '../../services/coupons.service';
import { CheckoutModal } from './CheckoutModal';
import { TicketReceiptModal } from './TicketReceiptModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Trash2, Plus, Minus, ShoppingCart, Ban, Tag, Gift, Sparkles, X, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Sale } from '@ferreteria/shared';
import { PriceCheckModal } from '../../components/common/PriceCheckModal';
import { useAccessibilityStore } from '../../stores/accessibility.store';
import { a11yAudio } from '../../services/a11y-audio.service';


export function PosPage() {
  const [searchParams] = useSearchParams();
  const couponQuery = searchParams.get('coupon');
  const customerIdQuery = searchParams.get('customerId');

  const { 
    cart, 
    addItem, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getSubtotal, 
    getTotalTax, 
    getTotal, 
    getTotalDiscount,
    selectedCustomer, 
    setCustomer,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    activeQuoteNumber
  } = usePosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  
  const { data: categories = [] } = useCategories();
  const { data: productsData } = useProducts({ 
    search: searchTerm, 
    categoryId: categoryFilter || undefined,
    limit: 50
  });

  const { data: customersData } = useCustomers({ limit: 50 });
  const customers = customersData?.data || [];
  
  const products: any[] = (Array.isArray(productsData) ? productsData : (productsData as any)?.data) || [];
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  useBarcodeScanner((barcode) => {
    // Intentar encontrar producto por código de barras o SKU
    const product = products.find((p: any) => (p.code || p.sku) === barcode);
    if (product) {
      const { soundFeedback, textToSpeech } = useAccessibilityStore.getState();
      if (soundFeedback) a11yAudio.playScan();
      if (textToSpeech) a11yAudio.speak(`${product.name}, agregado al carrito`);

      addItem({ 
        id: product.id, 
        name: product.name, 
        sku: product.sku || product.code || '', 
        price: Number(product.price ?? product.salePrice ?? 0), 
        taxRate: Number(product.taxRate ?? 21) 
      });
    } else {
      if (useAccessibilityStore.getState().soundFeedback) {
        a11yAudio.playAlert();
      }
    }
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('quick-search')?.focus();
      } else if (e.key === 'F3') {
        e.preventDefault();
        setIsPriceCheckOpen(prev => !prev);
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) setIsCheckoutOpen(true);
      } else if (e.key === 'Escape') {
        if (cart.length > 0) {
          const { soundFeedback, textToSpeech } = useAccessibilityStore.getState();
          if (soundFeedback) a11yAudio.playClick();
          if (textToSpeech) a11yAudio.speak('Carrito vaciado');
        }
        clearCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, clearCart]);


  // Auto-select customer from URL query
  useEffect(() => {
    if (customerIdQuery && customers.length > 0) {
      const found = customers.find((c: any) => c.id === customerIdQuery);
      if (found) setCustomer(found);
    }
  }, [customerIdQuery, customers, setCustomer]);

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      toast.error('Ingrese un código de cupón');
      return;
    }
    const subtotal = getSubtotal();
    if (subtotal <= 0) {
      toast.error('Agregue artículos al carrito antes de aplicar el cupón');
      return;
    }
    const res = validateCoupon(code, subtotal);
    if (!res.isValid || !res.coupon) {
      toast.error(res.message);
      return;
    }
    applyCoupon({
      code: res.coupon.code,
      discountType: res.coupon.discountType,
      discountValue: res.coupon.discountValue,
      discountAmount: res.calculatedDiscount,
      description: res.coupon.description,
    });
    toast.success(res.message);
    setCouponInput('');
  };

  // Auto-apply coupon from URL once cart has items
  useEffect(() => {
    if (couponQuery && cart.length > 0 && !appliedCoupon) {
      handleApplyCoupon(couponQuery);
    }
  }, [couponQuery, cart.length, appliedCoupon]);

  const suggestedCoupon = useMemo(() => {
    if (!selectedCustomer) return null;
    if (selectedCustomer.isBanned) return null;
    if (selectedCustomer.creditLimit >= 300000 || selectedCustomer.taxCondition === 'RESPONSABLE_INSCRIPTO') return 'CORRALON_VIP';
    return 'LEALTAD15';
  }, [selectedCustomer]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100 overflow-hidden">
      {/* Left Area: Catalog */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              id="quick-search"
              placeholder="Buscar producto en lenguaje natural (F2)..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPriceCheckOpen(true)}
            className="bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 font-semibold gap-1.5 shrink-0 shadow-xs"
          >
            <Tag className="h-4 w-4 text-amber-700" />
            <span className="hidden sm:inline">Consultar Precio</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-amber-200 text-amber-900 rounded border border-amber-400">
              F3
            </kbd>
          </Button>
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-md">
            <Button size="sm" variant={categoryFilter === null ? 'default' : 'outline'} onClick={() => setCategoryFilter(null)}>
              Todo
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                size="sm"
                variant={categoryFilter === cat.id ? 'default' : 'outline'}
                onClick={() => setCategoryFilter(categoryFilter === cat.id ? null : cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {products.map((product: any) => {
            const productPrice = Number(product.price ?? product.salePrice ?? 0);
            const productCode = product.sku || product.code || '';
            return (
              <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => addItem({
                id: product.id,
                name: product.name,
                sku: productCode,
                price: productPrice,
                taxRate: Number(product.taxRate ?? 21)
              })}>
                <CardContent className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <h3 className="font-semibold line-clamp-2" title={product.name}>{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">SKU: {productCode}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-lg">${productPrice.toFixed(2)}</span>
                    <Badge variant="secondary">Stock: {product.stock || 10}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {products.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No hay productos para mostrar.
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Ticket */}
      <div className="w-[400px] bg-white border-l shadow-lg flex flex-col z-10">
        <div className="p-4 border-b bg-gray-50 flex flex-col gap-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Ticket de Venta
          </h2>

          {activeQuoteNumber && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
              <div className="flex items-center gap-1.5">
                <FileSpreadsheet className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span>Presupuesto: <strong>{activeQuoteNumber}</strong></span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.5 rounded">1-Clic POS</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Select 
              value={selectedCustomer?.id || "consumidor_final"} 
              onValueChange={(val) => {
                if (val === "consumidor_final") {
                  setCustomer(null);
                } else {
                  const cust = customers.find(c => c.id === val);
                  setCustomer(cust || null);
                }
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Seleccionar Cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consumidor_final">Consumidor Final</SelectItem>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id} className={c.isBanned ? "text-destructive font-medium" : ""}>
                    {c.name} {c.isBanned ? '🚫 [VETADO]' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCustomer?.isBanned && (
              <div className="flex flex-col bg-red-50 text-red-800 p-2.5 rounded-md border border-red-300 gap-1 animate-pulse">
                <div className="flex items-center gap-1.5 font-bold text-xs text-red-700">
                  <Ban className="h-3.5 w-3.5 text-red-600 shrink-0" />
                  <span>CLIENTE VETADO / INHABILITADO</span>
                </div>
                <p className="text-[11px] text-red-600 font-medium">
                  Motivo: {selectedCustomer.banReason || 'Inhabilitado por administración central. Ventas bloqueadas.'}
                </p>
              </div>
            )}

            {selectedCustomer && (((selectedCustomer.balance ?? (selectedCustomer as any).currentBalance) || 0) > 0 || (selectedCustomer.creditLimit || 0) > 0) && (
              <div className="flex justify-between items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-md text-sm border border-blue-100">
                <div className="flex flex-col">
                  <span className="font-semibold text-xs text-blue-600 uppercase">Saldo Actual</span>
                  <span className={`font-bold ${((selectedCustomer.balance ?? (selectedCustomer as any).currentBalance) || 0) > 0 ? 'text-red-600' : 'text-blue-900'}`}>
                    ${((selectedCustomer.balance ?? (selectedCustomer as any).currentBalance) || 0).toFixed(2)}
                  </span>
                </div>
                {(selectedCustomer.creditLimit || 0) > 0 && (
                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-xs text-blue-600 uppercase">Límite</span>
                    <span className="font-medium text-blue-900">
                      ${(selectedCustomer.creditLimit || 0).toFixed(2)}
                    </span>
                    {((selectedCustomer.balance ?? (selectedCustomer as any).currentBalance) || 0) > (selectedCustomer.creditLimit || 0) && (
                      <Badge variant="destructive" className="mt-1 text-[10px] h-4 py-0">Excedido</Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              El carrito está vacío
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.product.id} className="flex flex-col border-b pb-2">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium truncate pr-2">{item.product.name}</span>
                    <span className="font-bold">${item.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-6 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                      <span className="ml-2">x ${item.unitPrice.toFixed(2)}</span>
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => removeItem(item.product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          {/* Coupon / Promotion Section */}
          <div className="bg-white p-2.5 rounded-lg border border-dashed border-gray-300">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-900 border border-emerald-200 rounded p-2 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                      <span className="text-emerald-700 font-semibold">
                        (-${appliedCoupon.discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-600 truncate max-w-[210px]">
                      {appliedCoupon.description}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-600 shrink-0"
                  onClick={() => {
                    removeCoupon();
                    toast.success('Cupón quitado de la venta');
                  }}
                  title="Quitar cupón"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Código de cupón..."
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    className="h-8 text-xs font-mono uppercase bg-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shrink-0 font-medium"
                    onClick={() => handleApplyCoupon()}
                    disabled={cart.length === 0}
                  >
                    Aplicar
                  </Button>
                </div>
                {suggestedCoupon && (
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(suggestedCoupon)}
                    disabled={cart.length === 0}
                    className="w-full flex items-center justify-between text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded px-2 py-1 transition-colors text-left disabled:opacity-50"
                  >
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Sugerido: <strong>{suggestedCoupon}</strong></span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold underline">Usar</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${getSubtotal().toFixed(2)}</span>
            </div>
            {getTotalDiscount() > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Descuento Cupón:
                </span>
                <span>-${getTotalDiscount().toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">IVA:</span>
              <span>${getTotalTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-2xl mt-2 border-t pt-2">
              <span>Total:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={clearCart}>
              Cancelar (Esc)
            </Button>
            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || Boolean(selectedCustomer?.isBanned)}
              onClick={() => {
                if (selectedCustomer?.isBanned) {
                  toast.error(`No se puede cobrar: El cliente "${selectedCustomer.name}" está VETADO.`);
                  return;
                }
                setIsCheckoutOpen(true);
              }}
            >
              {selectedCustomer?.isBanned ? 'Cliente Vetado' : 'Cobrar (F4)'}
            </Button>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        onSuccess={(sale) => {
          setIsCheckoutOpen(false);
          setCompletedSale(sale);
          setIsTicketOpen(true);
        }} 
      />

      <TicketReceiptModal 
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        sale={completedSale}
      />

      <PriceCheckModal 
        isOpen={isPriceCheckOpen}
        onClose={() => setIsPriceCheckOpen(false)}
      />
    </div>
  );
}
