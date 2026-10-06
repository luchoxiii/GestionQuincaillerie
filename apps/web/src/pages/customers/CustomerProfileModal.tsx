import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomerProfile } from '@/services/customer-analytics.service';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import { 
  User, 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Tag, 
  Phone, 
  Mail, 
  Layers, 
  ShieldAlert,
  ArrowRight,
  Gift,
  HelpCircle,
  Copy,
  Check,
  FileText
} from 'lucide-react';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile | null;
}

export function CustomerProfileModal({ isOpen, onClose, profile }: CustomerProfileModalProps) {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);
  if (!profile) return null;

  const { customer, rfm, churn, marketing, topCategories, recentPurchases } = profile;

  // Color mapping for churn risk
  const getChurnColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          bar: 'bg-emerald-500',
          text: 'text-emerald-700'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          bar: 'bg-amber-500',
          text: 'text-amber-700'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-300',
          bar: 'bg-orange-500',
          text: 'text-orange-700'
        };
      case 'CHURNED':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          bar: 'bg-rose-600',
          text: 'text-rose-700'
        };
    }
  };

  const churnColors = getChurnColor(churn.riskLevel);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Dark Gradient */}
        <DialogHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-lg">
                {customer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">
                    {customer.name}
                  </DialogTitle>
                  {customer.isBanned && (
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                      Vetado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <span>{customer.documentType || 'DOC'}: {customer.documentNumber || customer.documentNum || 'S/N'}</span>
                  <span>•</span>
                  <span className="bg-indigo-900/60 px-2 py-0.5 rounded text-[11px] text-indigo-200">
                    {customer.taxCondition || 'Consumidor Final'}
                  </span>
                </div>
              </div>
            </div>

            {/* Segment Badge */}
            <div className="sm:text-right">
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-xs px-3 py-1 font-semibold flex items-center gap-1.5 w-fit sm:ml-auto">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {marketing.segmentLabel}
              </Badge>
              <p className="text-[11px] text-slate-400 mt-1">
                {marketing.segmentDescription}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-900">
          {/* Churn Risk Prediction Card */}
          <div className={`p-4 rounded-xl border ${churnColors.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Brain className="h-4 w-4" />
                <span>Índice Predictivo de Riesgo de Churn (Abandono):</span>
                <span className={`text-base font-black ${churnColors.text}`}>
                  {churn.score}%
                </span>
              </div>
              <Badge variant="outline" className={`font-bold text-xs ${churnColors.bg}`}>
                {churn.label}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${churnColors.bar}`}
                style={{ width: `${churn.score}%` }}
              />
            </div>

            <div className="mt-3 text-xs flex flex-col gap-1 text-slate-700">
              <div className="font-semibold text-slate-800">Factores determinantes:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                {churn.churnFactors.map((factor, i) => (
                  <li key={i}>{factor}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* RFM Metrics Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Métricas de Comportamiento RFM (Recencia, Frecuencia, Valor)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Recencia
                </span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {rfm.recencyDays} <span className="text-xs font-medium text-slate-500">días</span>
                </div>
                <span className="text-[11px] text-slate-500">Sin compras</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" /> Frecuencia
                </span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {rfm.frequency} <span className="text-xs font-medium text-slate-500">órdenes</span>
                </div>
                <span className="text-[11px] text-slate-500">~{rfm.monthlyFrequency}/mes</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Valor Total LTV
                </span>
                <div className="text-xl font-black text-indigo-600 mt-1">
                  {formatCurrency(rfm.monetaryLtv)}
                </div>
                <span className="text-[11px] text-slate-500">Gasto acumulado</span>
              </div>

              <div className="p-3 bg-slate-50 border rounded-lg">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Tag className="h-3 w-3" /> Ticket Promedio
                </span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {formatCurrency(rfm.averageOrderValue)}
                </div>
                <span className="text-[11px] text-slate-500">Máx: {formatCurrency(rfm.maxOrderValue)}</span>
              </div>
            </div>
          </div>

          {/* Marketing Campaign & Retention Strategy Card */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Gift className="h-4 w-4 text-indigo-600" />
                Estrategia Recomendada de Marketing & Retención
              </span>
              <div className="flex items-center gap-1.5">
                <Badge className="bg-indigo-600 text-white text-xs font-mono px-2 py-0.5 shadow-2xs">
                  Cupón: {marketing.suggestedCouponCode}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(marketing.suggestedCouponCode);
                    setCopiedCode(true);
                    toast.success(`Cupón "${marketing.suggestedCouponCode}" copiado`);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="h-6 px-1.5 text-[11px] bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  title="Copiar código de cupón"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="text-sm font-semibold text-indigo-950">
              {marketing.recommendedCampaign}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block">Rubro / Categoría Preferida:</span>
                <strong className="text-slate-900 text-sm font-bold">{marketing.preferredCategory}</strong>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                <span className="text-slate-500 block">Medio de Pago Habitual:</span>
                <strong className="text-slate-900 text-sm font-bold">{marketing.preferredPaymentMethod}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-indigo-200/60 mt-1">
              <span className="text-xs text-indigo-900 font-medium">
                ¿Realizar venta con este beneficio ahora?
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate(`/pos?coupon=${encodeURIComponent(marketing.suggestedCouponCode)}&customerId=${encodeURIComponent(customer.id)}`);
                }}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 px-3 shadow-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Aplicar Cupón en POS
              </Button>
            </div>
          </div>

          {/* Top Categories Consumed */}
          {topCategories.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-slate-500" />
                Categorías de Mayor Consumo
              </h4>
              <div className="space-y-2">
                {topCategories.map((cat, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between font-medium mb-1">
                      <span>{cat.category}</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Details & Financial Standing */}
          <div className="p-3.5 bg-slate-50 border rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Datos de Contacto Directo:</span>
              <div className="flex items-center gap-1 text-slate-700">
                <Mail className="h-3 w-3 text-slate-400" />
                <span>{customer.email || 'Sin correo registrado'}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 mt-1">
                <Phone className="h-3 w-3 text-slate-400" />
                <span>{customer.phone || 'Sin teléfono registrado'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Cuenta Corriente & Crédito:</span>
              <div className="flex justify-between">
                <span>Saldo adeudado:</span>
                <strong className="text-slate-900">{formatCurrency(Number(customer.currentBalance || customer.balance || 0))}</strong>
              </div>
              <div className="flex justify-between mt-0.5">
                <span>Límite otorgado:</span>
                <span className="text-slate-600">{formatCurrency(Number(customer.creditLimit || 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex flex-wrap justify-between items-center gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                navigate(`/presupuestos?search=${encodeURIComponent(customer.name)}`);
              }}
              className="border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold gap-1.5"
            >
              <FileText className="h-4 w-4 text-amber-600" /> Ver Cotizaciones
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                navigate(`/pos?coupon=${encodeURIComponent(marketing.suggestedCouponCode)}&customerId=${encodeURIComponent(customer.id)}`);
              }}
              className="border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-semibold gap-1.5"
            >
              <ShoppingCart className="h-4 w-4 text-emerald-600" /> Cobrar en POS con Cupón
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
              onClick={() => {
                const phone = customer.phone?.replace(/\D/g, '');
                if (phone) {
                  window.open(`https://wa.me/549${phone}?text=Hola%20${encodeURIComponent(customer.name)},%20te%20escribimos%20de%20la%20Ferretería.%20Queríamos%20hacerte%20llegar%20un%20beneficio%20exclusivo%20con%20el%20cupón%20${marketing.suggestedCouponCode}.`, '_blank');
                } else {
                  window.location.href = `mailto:${customer.email || ''}?subject=Beneficio%20Especial%20en%20Ferretería&body=Hola%20${encodeURIComponent(customer.name)},%20aprovecha%20tu%20cupón%20${marketing.suggestedCouponCode}`;
                }
              }}
            >
              <Sparkles className="h-4 w-4" /> Activar Campaña con Cliente
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
