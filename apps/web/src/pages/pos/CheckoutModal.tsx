import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { useCreateSale, usePaymentMethods } from '../../services/sales.service';
import { useCreateInvoiceFromSale } from '../../services/invoicing.service';
import { usePosStore } from '../../stores/pos.store';
import { useCurrentCashSession } from '../../services/cash.service';
import { recordCouponRedemption } from '../../services/coupons.service';
import { convertQuoteToSaleDirect } from '../../services/quotes.service';
import { telemetry } from '../../services/telemetry.service';
import { Ban, Gift, Tag, FileSpreadsheet, Mail, DollarSign, Percent } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccessibilityStore } from '../../stores/accessibility.store';
import { a11yAudio } from '../../services/a11y-audio.service';
import { useCommercialPolicies } from '../../services/settings.service';
import { sendSaleReceiptEmail } from '../../services/email-notification.service';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (sale: any) => void;
}

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const {
    getSubtotal,
    getTotalDiscount,
    getTotalTax,
    cart,
    selectedCustomer,
    clearCart,
    appliedCoupon,
    activeQuoteId,
    activeQuoteNumber,
  } = usePosStore();

  const { data: paymentMethods } = usePaymentMethods();
  const { data: session } = useCurrentCashSession();
  const { data: commercialPolicies } = useCommercialPolicies();
  const createSale = useCreateSale();
  const createInvoice = useCreateInvoiceFromSale();

  const [payments, setPayments] = useState<{ methodId: string; amount: number }[]>([]);
  const [tendered, setTendered] = useState<string>('');
  const [fiscalType, setFiscalType] = useState<'BLANCO' | 'NEGRO'>('BLANCO');

  // Descuento en efectivo para facturación en negro
  const [applyBlackCashDiscount, setApplyBlackCashDiscount] = useState<boolean>(true);
  const [blackCashDiscountPct, setBlackCashDiscountPct] = useState<number>(10);

  // Envío de comprobante por correo electrónico
  const [sendCustomerEmail, setSendCustomerEmail] = useState<boolean>(false);
  const [customerEmailInput, setCustomerEmailInput] = useState<string>('');

  useEffect(() => {
    if (commercialPolicies?.blackCashDiscountPercent) {
      setBlackCashDiscountPct(commercialPolicies.blackCashDiscountPercent);
    }
  }, [commercialPolicies]);

  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setTendered('');
      setFiscalType('BLANCO');
      setApplyBlackCashDiscount(true);

      const clientEmail = selectedCustomer?.email || '';
      setCustomerEmailInput(clientEmail);
      setSendCustomerEmail(Boolean(clientEmail && clientEmail.includes('@')));
    }
  }, [isOpen, selectedCustomer]);

  // Cálculos de subtotales, impuestos y descuentos
  const rawSubtotal = getSubtotal();
  const couponDiscount = getTotalDiscount();
  const tax = fiscalType === 'BLANCO' ? getTotalTax() : 0;

  // Si es en negro y está activo el descuento por efectivo
  const blackCashDiscountAmount =
    fiscalType === 'NEGRO' && applyBlackCashDiscount
      ? Math.round((rawSubtotal - couponDiscount) * (blackCashDiscountPct / 100))
      : 0;

  const totalDiscount = couponDiscount + blackCashDiscountAmount;
  const total = Math.max(0, rawSubtotal - totalDiscount + tax);

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const change = Number(tendered) - remaining > 0 ? Number(tendered) - remaining : 0;

  // Determine suggested invoice letter based on customer CUIT vs DNI
  const cleanDoc =
    ((selectedCustomer?.documentNumber || (selectedCustomer as any)?.documentNum || '') as string).replace(
      /\D/g,
      ''
    ) || '';
  const isCuit = selectedCustomer?.documentType === 'CUIT' || cleanDoc.length === 11;
  const suggestedLetter: 'A' | 'B' | 'X' = fiscalType === 'NEGRO' ? 'X' : isCuit ? 'A' : 'B';

  const handleAddPayment = (methodId: string, amountStr: string) => {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return;

    const actualAmount = amount > remaining ? remaining : amount;

    setPayments([...payments, { methodId, amount: actualAmount }]);
    setTendered('');
  };

  const handleConfirm = async () => {
    if (selectedCustomer?.isBanned) {
      if (useAccessibilityStore.getState().soundFeedback) a11yAudio.playAlert();
      toast.error(`Operación bloqueada: El cliente "${selectedCustomer.name}" está VETADO.`);
      return;
    }

    if (totalPaid < total - 0.01) {
      if (useAccessibilityStore.getState().soundFeedback) a11yAudio.playAlert();
      toast.error('El monto pagado no cubre el total.');
      return;
    }
    const sessionId = session?.id || 'sess-mostrador';

    try {
      const sale = await createSale.mutateAsync({
        customerId: selectedCustomer?.id || null,
        cashSessionId: sessionId,
        fiscalType,
        couponCode: appliedCoupon?.code || undefined,
        subtotal: rawSubtotal,
        discount: totalDiscount,
        taxAmount: tax,
        total,
        items: cart.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
          taxRate: i.taxRate,
          taxAmount: i.taxAmount,
          subtotal: i.subtotal,
          total: i.total,
        })),
        payments,
      });

      if (appliedCoupon?.code) {
        recordCouponRedemption(appliedCoupon.code, couponDiscount, total);
      }

      if (sale?.id) {
        try {
          await createInvoice.mutateAsync({
            saleId: sale.id,
            fiscalType,
            letter: suggestedLetter,
            customerName: selectedCustomer?.name,
            customerDocumentType: selectedCustomer?.documentType,
            customerDocumentNumber:
              selectedCustomer?.documentNumber || (selectedCustomer as any)?.documentNum || '',
            total,
          });

          if (fiscalType === 'BLANCO') {
            toast.success(`Venta registrada y Factura Oficial ${suggestedLetter} (AFIP) emitida`);
          } else {
            toast.success('Venta registrada y Ticket X / Remito interno emitido (En Negro)');
          }
        } catch (e) {
          toast.error('Venta registrada, pero falló la emisión del comprobante');
        }
      } else {
        toast.success('Venta registrada con éxito');
      }

      // Envío de correo electrónico al cliente con el comprobante digital
      if (sendCustomerEmail && customerEmailInput && customerEmailInput.includes('@')) {
        try {
          const selectedMethod = paymentMethods?.find((m) => payments.some((p) => p.methodId === m.id));
          await sendSaleReceiptEmail({
            toEmail: customerEmailInput,
            customerName: selectedCustomer?.name || 'Cliente de Mostrador',
            saleNumber: sale?.saleNumber || `V-${Date.now()}`,
            fiscalType,
            invoiceLetter: suggestedLetter,
            items: cart.map((i) => ({
              name: i.product.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
            subtotal: rawSubtotal,
            discount: totalDiscount,
            taxAmount: tax,
            total,
            paymentMethodName: selectedMethod?.name || (payments.length > 0 ? 'Pago Registrado' : 'Efectivo'),
            cashDiscountApplied: blackCashDiscountAmount,
          });
          toast.success(`Comprobante enviado por email a ${customerEmailInput}`);
        } catch (emailErr: any) {
          console.error('Error enviando comprobante por email:', emailErr);
          toast.error('No se pudo enviar el correo al cliente: ' + (emailErr.message || 'Error'));
        }
      }

      if (activeQuoteId) {
        convertQuoteToSaleDirect(activeQuoteId, sale?.id || `sale-${Date.now()}`);
        toast.success(`Presupuesto ${activeQuoteNumber || ''} convertido a Venta POS exitosamente`);
      }

      telemetry.trackSale({
        saleId: sale?.id || 'sale-pos',
        total,
        fiscalType,
        itemCount: cart.length,
      });

      const { soundFeedback, textToSpeech } = useAccessibilityStore.getState();
      if (soundFeedback) {
        a11yAudio.playSuccess();
      }
      if (textToSpeech) {
        a11yAudio.speakSaleComplete(total, change);
      }

      clearCart();
      onSuccess(sale);
    } catch (e) {
      if (useAccessibilityStore.getState().soundFeedback) {
        a11yAudio.playAlert();
      }
      toast.error('Error al registrar la venta');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Cobrar Venta</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          {activeQuoteId && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Presupuesto en Conversión: {activeQuoteNumber || activeQuoteId}</span>
                  <p className="text-[11px] text-blue-700">
                    Los renglones y precios acordados se vincularán automáticamente al comprobante.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedCustomer?.isBanned && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm">
              <div className="font-bold flex items-center gap-1.5 text-red-700">
                <Ban className="h-4 w-4" /> VENTA BLOQUEADA: CLIENTE VETADO
              </div>
              <p className="mt-1 text-xs text-red-600">
                El cliente <strong>{selectedCustomer.name}</strong> está inhabilitado por la administración central.
                {selectedCustomer.banReason ? ` Motivo: ${selectedCustomer.banReason}` : ''}
              </p>
            </div>
          )}

          {/* Tarjeta de Total a Cobrar con Desglose */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Subtotal artículos:</span>
              <strong className="text-foreground">${rawSubtotal.toFixed(2)}</strong>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-700 font-medium">
                <span>Descuento de Cupón ({appliedCoupon?.code}):</span>
                <strong>-${couponDiscount.toFixed(2)}</strong>
              </div>
            )}

            {blackCashDiscountAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-amber-800 font-bold bg-amber-100/60 dark:bg-amber-950/40 px-2 py-1 rounded">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-amber-700" /> Descuento Efectivo (Negro {blackCashDiscountPct}%):
                </span>
                <span>-${blackCashDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {fiscalType === 'BLANCO' && (
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>IVA (21% AFIP):</span>
                <strong className="text-foreground">${tax.toFixed(2)}</strong>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Total a Cobrar</span>
                <div className="text-3xl font-extrabold text-foreground tracking-tight">${total.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Restante:</span>
                <strong className={`text-base font-bold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  ${remaining.toFixed(2)}
                </strong>
              </div>
            </div>
          </div>

          {/* Selector de Régimen Fiscal (Blanco vs Negro) */}
          <div className="space-y-2 p-3 border rounded-lg bg-card">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Modalidad de Facturación / Impuestos
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setFiscalType('BLANCO');
                  setPayments([]);
                }}
                className={`p-3 text-left rounded-lg border text-sm transition-all flex flex-col ${
                  fiscalType === 'BLANCO'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold ring-2 ring-blue-500/20 shadow-sm'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5 font-bold text-blue-800 dark:text-blue-400">
                  🏛️ Factura Oficial AFIP (Blanco)
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  Factura {isCuit ? 'A' : 'B'} con CAE oficial. Se declara al contador en Libro IVA.
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFiscalType('NEGRO');
                  setPayments([]);
                }}
                className={`p-3 text-left rounded-lg border text-sm transition-all flex flex-col ${
                  fiscalType === 'NEGRO'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-900 font-semibold ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-border bg-card hover:bg-muted text-muted-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                  📋 Ticket X / Remito (Negro)
                </span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  Comprobante interno sin CAE. Suma a caja física, NO se envía al contador.
                </span>
              </button>
            </div>
          </div>

          {/* Facturación en Negro: Descuento en Efectivo */}
          {fiscalType === 'NEGRO' && (
            <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-amber-200 text-amber-900 rounded">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <Label htmlFor="black-cash-discount-toggle" className="text-xs font-bold text-amber-950 block">
                      Descuento por Pago en Efectivo (Facturación en Negro)
                    </Label>
                    <span className="text-[11px] text-amber-800">
                      Beneficio especial de mostrador al cobrar sin costo impositivo ni comisiones.
                    </span>
                  </div>
                </div>
                <Switch
                  id="black-cash-discount-toggle"
                  checked={applyBlackCashDiscount}
                  onCheckedChange={(checked) => {
                    setApplyBlackCashDiscount(checked);
                    setPayments([]);
                  }}
                />
              </div>

              {applyBlackCashDiscount && (
                <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-amber-900 font-semibold flex items-center gap-1">
                    <Percent className="h-3.5 w-3.5" /> Porcentaje de Descuento:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setBlackCashDiscountPct(pct);
                          setPayments([]);
                        }}
                        className={`px-2.5 py-1 text-xs font-bold rounded border transition-colors ${
                          blackCashDiscountPct === pct
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {pct}% OFF
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Envío de Comprobante por Correo Electrónico al Cliente */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-200 text-blue-900 rounded">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <Label htmlFor="send-email-toggle" className="text-xs font-bold text-blue-950 block">
                    Enviar comprobante por email al cliente
                  </Label>
                  <span className="text-[11px] text-blue-800">
                    Despacha el detalle de compra y ticket digital a la casilla del comprador.
                  </span>
                </div>
              </div>
              <Switch
                id="send-email-toggle"
                checked={sendCustomerEmail}
                onCheckedChange={setSendCustomerEmail}
              />
            </div>

            {sendCustomerEmail && (
              <div className="pt-1.5 space-y-1">
                <Input
                  type="email"
                  placeholder="Ingrese el email del cliente (ej: cliente@correo.com)"
                  value={customerEmailInput}
                  onChange={(e) => setCustomerEmailInput(e.target.value)}
                  className="h-8 text-xs bg-white border-blue-300 focus-visible:border-blue-500"
                />
                <p className="text-[10px] text-blue-900/80">
                  {selectedCustomer
                    ? `Cliente asociado: ${selectedCustomer.name} (${selectedCustomer.documentNumber || 'S/D'})`
                    : 'Cliente ocasional de mostrador.'}
                </p>
              </div>
            )}
          </div>

          {/* Registro de Pagos */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Medio de Pago</Label>
              <Select
                onValueChange={(val) => {
                  if (val) handleAddPayment(val, tendered || remaining.toString());
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Monto (Paga con)</Label>
              <Input
                type="number"
                value={tendered}
                onChange={(e) => setTendered(e.target.value)}
                placeholder={remaining.toFixed(2)}
              />
            </div>
          </div>

          {payments.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground font-semibold">Pagos registrados:</Label>
              <ul className="mt-1.5 text-sm border rounded-lg divide-y bg-card">
                {payments.map((p, idx) => {
                  const m = paymentMethods?.find((x) => x.id === p.methodId);
                  return (
                    <li key={idx} className="flex justify-between px-3 py-2 text-xs">
                      <span className="font-medium text-foreground">{m?.name || 'Pago'}</span>
                      <span className="font-bold text-foreground">${p.amount.toFixed(2)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {change > 0 && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-sm flex justify-between">
              <span>Vuelto a entregar:</span>
              <span className="text-base">${change.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              Boolean(selectedCustomer?.isBanned) ||
              totalPaid < total - 0.01 ||
              createSale.isPending ||
              createInvoice.isPending
            }
            className={fiscalType === 'BLANCO' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}
          >
            {selectedCustomer?.isBanned
              ? 'Cliente Vetado (Bloqueado)'
              : fiscalType === 'BLANCO'
              ? `Confirmar (Factura ${suggestedLetter} AFIP)`
              : 'Confirmar (Ticket X Interno)'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
