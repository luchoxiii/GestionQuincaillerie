import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Quote } from '../../services/quotes.service';
import { Printer, X, Building2, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface QuotePrintModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuotePrintModal({ quote, isOpen, onClose }: QuotePrintModalProps) {
  if (!quote) return null;

  const handlePrint = () => {
    window.print();
  };

  const isExpired = new Date() > new Date(quote.validUntil);
  const isUSD = quote.currency === 'USD';
  const sym = isUSD ? 'US$ ' : '$';
  const rate = quote.exchangeRate || 1350;
  const formattedCreated = new Date(quote.createdAt).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedValid = new Date(quote.validUntil).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 print:p-0 print:max-w-none print:max-h-none print:shadow-none print:border-none">
        {/* Print controls bar - hidden in print */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between sticky top-0 z-20 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-amber-400" />
            <span className="font-semibold text-sm">Vista Previa Formal A4 - {quote.number}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs h-8 px-4"
            >
              <Printer className="h-4 w-4 mr-1.5" /> Imprimir / Guardar PDF
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs h-8 px-3"
            >
              <X className="h-4 w-4 mr-1" /> Cerrar
            </Button>
          </div>
        </div>

        {/* A4 Sheet container */}
        <div className="p-8 sm:p-12 bg-white text-slate-800 printable-quote font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-2xl shadow-sm">
                FE
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">FERRETERÍA & CORRALÓN</h1>
                <p className="text-xs text-slate-500 font-medium">Materiales para la Construcción, Herramientas e Instalaciones</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  CUIT: 30-71982345-9 • IVA Responsable Inscripto<br />
                  Av. Libertador 4580, Tigre, Prov. Buenos Aires • Tel: (011) 4749-0000 / WhatsApp: +54 9 11 9876-5432
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">Documento Comercial</span>
                <span className="text-lg font-black text-slate-900">{quote.number}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p><span className="font-semibold">Emisión:</span> {formattedCreated}</p>
                <p className={isExpired ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  <span>Vigencia:</span> {formattedValid} ({quote.validityHours} hs)
                </p>
                {isUSD ? (
                  <p className="text-emerald-700 font-bold">
                    <span>Moneda:</span> Dólares (USD) • TC: ${rate.toLocaleString('es-AR')}
                  </p>
                ) : (
                  <p className="text-slate-600">
                    <span>Moneda:</span> Pesos (ARS) {quote.exchangeRate ? `• TC Ref: $${rate.toLocaleString('es-AR')}` : ''}
                  </p>
                )}
                <p><span className="font-semibold">Emitido por:</span> {quote.createdBy || 'Oficina Técnica'}</p>
              </div>
            </div>
          </div>

          {/* Customer box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Datos del Cliente</p>
                <p className="text-sm font-bold text-slate-900">{quote.customerName}</p>
                {quote.customerDocument && (
                  <p className="text-slate-600 mt-0.5">CUIT/DNI: <span className="font-medium text-slate-800">{quote.customerDocument}</span></p>
                )}
                {quote.customerEmail && (
                  <p className="text-slate-600 mt-0.5">Email: <span className="font-medium text-slate-800">{quote.customerEmail}</span></p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Contacto y Entrega</p>
                {quote.customerPhone && (
                  <p className="text-slate-600">Tel / Celular: <span className="font-medium text-slate-800">{quote.customerPhone}</span></p>
                )}
                <p className="text-slate-600 mt-0.5">Condición de Venta: <span className="font-medium text-slate-800">Contado / Transferencia / Tarjeta</span></p>
                {quote.notes && (
                  <p className="text-slate-600 mt-0.5 italic">Nota: {quote.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alert if expired */}
          {isExpired && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>Aviso de Vigencia:</strong> Este presupuesto superó las {quote.validityHours} horas de validez comercial. Los precios cotizados deben ser revalidados con la lista de precios vigente al momento de emitir la orden.
              </span>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-6 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-28">Código</th>
                  <th className="py-2.5 px-3">Descripción del Material</th>
                  <th className="py-2.5 px-3 w-20 text-center">Unidad</th>
                  <th className="py-2.5 px-3 w-16 text-right">Cant.</th>
                  <th className="py-2.5 px-3 w-28 text-right">P. Unitario ({isUSD ? 'US$' : '$'})</th>
                  <th className="py-2.5 px-3 w-16 text-right">Desc %</th>
                  <th className="py-2.5 px-3 w-28 text-right">Subtotal ({isUSD ? 'US$' : '$'})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-600 font-semibold">{item.code}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                    <td className="py-2 px-3 text-center text-slate-600 uppercase font-semibold text-[10px]">{item.unit || 'UNID'}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-2 px-3 text-right text-slate-700">{sym}{item.unitPrice.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{item.discountPct > 0 ? `${item.discountPct}%` : '-'}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{sym}{item.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals and Terms */}
          <div className="grid grid-cols-12 gap-6 mb-8">
            {/* Terms and conditions */}
            <div className="col-span-7 bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Términos y Condiciones Comerciales</p>
              <p>• {quote.termsAndConditions || `Precios congelados por ${quote.validityHours} horas hábiles. Transcurrido dicho plazo, la cotización quedará sujeta a variación sin previo aviso.`}</p>
              <p>• La entrega de materiales pesados (arena, piedra, cemento, ladrillos) se realiza sobre vereda o a pie de camión.</p>
              <p>• Para hacer efectiva esta cotización directamente en mostrador, presente este comprobante o mencione el código <strong className="text-slate-900">{quote.number}</strong>.</p>
            </div>

            {/* Financial summary */}
            <div className="col-span-5 bg-slate-100/80 border border-slate-300 rounded-lg p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Bruto:</span>
                <span className="font-semibold">{sym}{quote.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              {quote.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Bonificación Especial:</span>
                  <span className="font-semibold">-{sym}{quote.discountTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>IVA Discriminado:</span>
                <span className="font-semibold">{sym}{quote.taxTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900 uppercase">Total {isUSD ? 'USD' : 'Final'}:</span>
                <span className="text-xl font-black text-slate-950">{sym}{quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Equivalence Box */}
              <div className="pt-2 mt-1 border-t border-dashed border-slate-300 space-y-0.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span className="font-medium">{isUSD ? 'Equivalente en Pesos:' : 'Equivalente en Dólares:'}</span>
                  <strong className="text-slate-900 font-mono">
                    {isUSD
                      ? `$${(quote.totalSecondary || (quote.total * rate)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `US$ ${(quote.totalSecondary || (quote.total / rate)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </strong>
                </div>
                <div className="flex justify-between text-slate-500 text-[10px]">
                  <span>Cotización Dólar congelada:</span>
                  <span>1 USD = ${rate.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="border-t border-dashed border-slate-300 pt-8 mt-12 grid grid-cols-2 gap-12 text-center text-xs text-slate-500">
            <div>
              <div className="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Firma y Sello Vendedor</p>
              <p className="text-[10px]">Ferretería & Corralón Central</p>
            </div>
            <div>
              <div className="w-48 border-b border-slate-400 mx-auto mb-1"></div>
              <p className="font-semibold text-slate-700">Conformidad del Cliente</p>
              <p className="text-[10px]">Aclaración y DNI</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
