import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Quote } from '../../services/quotes.service';
import { getStoredDollarExchangeRate } from '../../services/settings.service';
import { DollarSign, TrendingUp, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface UpdateExchangeRateModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (quoteId: string, newRate: number) => void;
  isPending?: boolean;
}

export function UpdateExchangeRateModal({
  quote,
  isOpen,
  onClose,
  onSave,
  isPending = false,
}: UpdateExchangeRateModalProps) {
  const [exchangeRate, setExchangeRate] = useState<number>(1350);
  const companyDefaultRate = getStoredDollarExchangeRate();

  useEffect(() => {
    if (quote) {
      setExchangeRate(quote.exchangeRate || companyDefaultRate || 1350);
    }
  }, [quote, companyDefaultRate]);

  if (!quote) return null;

  const currentRate = quote.exchangeRate || companyDefaultRate || 1350;
  const isUSD = quote.currency === 'USD';

  // Calculations
  const currentSecondary =
    quote.totalSecondary ||
    (isUSD ? Math.round(quote.total * currentRate) : Math.round(quote.total / currentRate));

  const newSecondary = isUSD
    ? Math.round(quote.total * exchangeRate)
    : Math.round((quote.total / (exchangeRate || 1)) * 100) / 100;

  const diffAmount = newSecondary - currentSecondary;
  const diffPct = currentSecondary > 0 ? ((newSecondary - currentSecondary) / currentSecondary) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exchangeRate <= 0) return;
    onSave(quote.id, exchangeRate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Ajustar Tipo de Cambio
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Presupuesto <span className="font-mono font-bold text-slate-700">{quote.number}</span> • {quote.customerName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Info Box */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-600">
              <span>Moneda Principal:</span>
              <span className="font-bold text-slate-800">
                {isUSD ? 'Dólares Estadounidenses (USD)' : 'Pesos Argentinos (ARS)'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Total Cotizado:</span>
              <span className="font-extrabold font-mono text-slate-900 text-sm">
                {isUSD ? 'US$ ' : '$'}
                {quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>TC Actual Pactado:</span>
              <span className="font-mono font-bold text-slate-700">
                ${currentRate.toLocaleString('es-AR')} / USD
              </span>
            </div>
          </div>

          {/* New Exchange Rate Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nuevo Tipo de Cambio ($/USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                $
              </div>
              <Input
                type="number"
                step="any"
                min="1"
                value={exchangeRate || ''}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                className="pl-8 font-mono font-bold text-base text-slate-900 focus-visible:ring-emerald-500"
                placeholder="1350"
                required
                autoFocus
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Atajos:</span>
              <button
                type="button"
                onClick={() => setExchangeRate(companyDefaultRate)}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                TC Empresa (${companyDefaultRate})
              </button>
              <button
                type="button"
                onClick={() => setExchangeRate((prev) => Math.round(prev + 10))}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                +10
              </button>
              <button
                type="button"
                onClick={() => setExchangeRate((prev) => Math.round(prev + 50))}
                className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              >
                +50
              </button>
            </div>
          </div>

          {/* Live Impact Preview */}
          <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
              Impacto del Nuevo Tipo de Cambio
            </span>
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Equivalente Anterior</span>
                <span className="font-mono font-medium text-slate-700">
                  {isUSD ? `$${currentSecondary.toLocaleString('es-AR')}` : `US$ ${currentSecondary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-600" />
              <div className="text-right">
                <span className="text-emerald-700 font-bold block text-[10px]">Nuevo Equivalente</span>
                <span className="font-mono font-extrabold text-emerald-900 text-sm">
                  {isUSD ? `$${newSecondary.toLocaleString('es-AR')}` : `US$ ${newSecondary.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {diffAmount !== 0 && (
              <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600">Variación:</span>
                <span className={`font-mono font-bold ${diffAmount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {diffAmount > 0 ? '+' : ''}{isUSD ? `$${diffAmount.toLocaleString('es-AR')}` : `US$ ${diffAmount.toFixed(2)}`} ({diffPct > 0 ? '+' : ''}{diffPct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || exchangeRate <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Check className="h-4 w-4 mr-1.5" />
              {isPending ? 'Guardando...' : 'Actualizar Tipo de Cambio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
