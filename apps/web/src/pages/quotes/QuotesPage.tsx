import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useQuotes,
  useUpdateQuoteStatus,
  useUpdateQuoteExchangeRate,
  Quote,
  QuoteStatus,
  computeQuoteValidityStatus,
  generateWhatsAppMessage,
  exportQuotesCsv,
} from '../../services/quotes.service';
import { useCustomers } from '../../services/customers.service';
import { extractSearchTokens, fieldMatchesToken } from '@ferreteria/shared';
import { usePosStore, PosItem } from '../../stores/pos.store';
import { NewQuoteModal } from '../../components/quotes/NewQuoteModal';
import { QuotePrintModal } from '../../components/quotes/QuotePrintModal';
import { UpdateExchangeRateModal } from '../../components/quotes/UpdateExchangeRateModal';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ShoppingCart,
  Printer,
  Share2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  UserCheck,
  Check,
  Ban,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function QuotesPage() {
  const navigate = useNavigate();
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: customersData } = useCustomers({ limit: 100 });
  const updateStatus = useUpdateQuoteStatus();
  const updateExchangeRate = useUpdateQuoteExchangeRate();
  const { loadQuoteToCart } = usePosStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'ACCEPTED' | 'CONVERTED' | 'EXPIRED'>('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);
  const [selectedQuoteForRateEdit, setSelectedQuoteForRateEdit] = useState<Quote | null>(null);

  const handleSaveExchangeRate = async (quoteId: string, newRate: number) => {
    try {
      await updateExchangeRate.mutateAsync({ id: quoteId, newExchangeRate: newRate });
      toast.success(`Tipo de cambio actualizado a $${newRate.toLocaleString('es-AR')} con éxito`);
      setSelectedQuoteForRateEdit(null);
    } catch (err) {
      toast.error('Error al actualizar el tipo de cambio');
    }
  };


  // Filtered quotes based on tab and search
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const validity = computeQuoteValidityStatus(q);

      // Status tab filter
      if (activeTab === 'ACTIVE') {
        if (q.status === 'CONVERTED' || q.status === 'CANCELLED' || validity.isExpired) return false;
      } else if (activeTab === 'ACCEPTED') {
        if (q.status !== 'ACCEPTED') return false;
      } else if (activeTab === 'CONVERTED') {
        if (q.status !== 'CONVERTED') return false;
      } else if (activeTab === 'EXPIRED') {
        if (!validity.isExpired && q.status !== 'EXPIRED') return false;
      }

      // Natural Language Search filter
      if (searchTerm.trim()) {
        const tokens = extractSearchTokens(searchTerm);
        if (tokens.length > 0) {
          const itemsText = q.items.map((i) => `${i.name} ${i.code}`).join(' ');
          const matchAllTokens = tokens.every((tok) => {
            return (
              fieldMatchesToken(q.number, tok) ||
              fieldMatchesToken(q.customerName, tok) ||
              fieldMatchesToken(q.customerDocument, tok) ||
              fieldMatchesToken(q.customerPhone, tok) ||
              fieldMatchesToken(itemsText, tok)
            );
          });
          if (!matchAllTokens) return false;
        }
      }

      return true;
    });
  }, [quotes, activeTab, searchTerm]);

  // Executive KPI metrics
  const kpis = useMemo(() => {
    const totalQuotesCount = quotes.length;
    let activeCount = 0;
    let activeTotalMoney = 0;
    let convertedCount = 0;
    let convertedTotalMoney = 0;
    let expiringOrExpiredCount = 0;

    quotes.forEach((q) => {
      const validity = computeQuoteValidityStatus(q);

      if (q.status === 'CONVERTED') {
        convertedCount++;
        convertedTotalMoney += q.total;
      } else if (q.status !== 'CANCELLED' && !validity.isExpired) {
        activeCount++;
        activeTotalMoney += q.total;
      }

      if (validity.isExpired || validity.isExpiringSoon) {
        expiringOrExpiredCount++;
      }
    });

    const conversionRate =
      totalQuotesCount > 0 ? Math.round((convertedCount / totalQuotesCount) * 100) : 0;

    return {
      activeCount,
      activeTotalMoney,
      conversionRate,
      convertedCount,
      convertedTotalMoney,
      expiringOrExpiredCount,
    };
  }, [quotes]);

  // 1-Click POS Conversion
  const handleConvertToPos = (quote: Quote) => {
    const validity = computeQuoteValidityStatus(quote);

    if (validity.isExpired) {
      const confirmProceed = window.confirm(
        `⚠️ AVISO DE VIGENCIA: El presupuesto ${quote.number} superó las ${quote.validityHours} hs de validez comercial.\n\n¿Desea cargarlo de todas formas en el Punto de Venta (POS) congelando los precios acordados?`
      );
      if (!confirmProceed) return;
    }

    // Convert items into POS store cart format (converts to base currency if quote was in USD)
    const isUSD = quote.currency === 'USD';
    const rate = quote.exchangeRate || 1350;

    const posItems: PosItem[] = quote.items.map((item) => {
      const convertedPrice = isUSD ? Number((item.unitPrice * rate).toFixed(2)) : item.unitPrice;
      const subtotal = item.quantity * convertedPrice;
      const discount = subtotal * (item.discountPct / 100);
      const afterDisc = subtotal - discount;
      const taxAmount = afterDisc * (item.taxRate / 100);
      const total = afterDisc + taxAmount;

      return {
        product: {
          id: item.productId,
          name: isUSD ? `${item.name} (Cotizado US$ ${item.unitPrice.toFixed(2)})` : item.name,
          sku: item.code,
          price: convertedPrice,
          taxRate: item.taxRate,
        },
        quantity: item.quantity,
        unitPrice: convertedPrice,
        discount,
        subtotal,
        taxRate: item.taxRate,
        taxAmount,
        total,
      };
    });

    // Customer resolution
    const customer = quote.customerId
      ? customersData?.data.find((c) => c.id === quote.customerId) || {
          id: quote.customerId,
          name: quote.customerName,
          documentNumber: quote.customerDocument,
          phone: quote.customerPhone,
        }
      : {
          id: null,
          name: quote.customerName,
          documentNumber: quote.customerDocument,
          phone: quote.customerPhone,
        };

    loadQuoteToCart(posItems, customer, quote.id, quote.number);
    toast.success(`Presupuesto ${quote.number} cargado en el POS listo para cobrar`);
    navigate('/pos');
  };

  // WhatsApp Share
  const handleShareWhatsApp = (quote: Quote) => {
    const message = generateWhatsAppMessage(quote);
    const rawPhone = (quote.customerPhone || '').replace(/\D/g, '');
    const phone = rawPhone.length >= 10 ? rawPhone : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`Estado del presupuesto actualizado a ${status}`);
    } catch (e) {
      toast.error('Error al actualizar el estado');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Presupuestos y Cotizaciones
              </h1>
              <p className="text-xs text-muted-foreground">
                Gestión de cotizaciones con validez temporal, congelamiento de precios y conversión directa a venta en 1 clic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => exportQuotesCsv(quotes)}
            className="text-xs h-9 border-slate-300 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-500" /> Exportar CSV
          </Button>

          <Button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo Presupuesto
          </Button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Presupuestos Vigentes
            </CardTitle>
            <Clock className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{kpis.activeCount}</div>
            <p className="text-xs text-emerald-700 font-semibold mt-1">
              ${kpis.activeTotalMoney.toLocaleString('es-AR', { minimumFractionDigits: 2 })}{' '}
              <span className="text-slate-500 font-normal">en cotizaciones abiertas</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Tasa de Conversión POS
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-700">{kpis.conversionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-900 font-bold">{kpis.convertedCount}</strong> cotizaciones cobradas en mostrador
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Ventas desde Cotización
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              ${kpis.convertedTotalMoney.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">Ingresos efectivos liquidados en POS</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Alertas de Vencimiento
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-600">{kpis.expiringOrExpiredCount}</div>
            <p className="text-xs text-slate-500 mt-1">Vencidos o por expirar en &lt; 12 hs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-3.5 border rounded-xl shadow-xs">
        {/* Tabs */}
        <div className="flex rounded-lg border bg-slate-50 p-1 text-xs font-medium w-full md:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'ACTIVE', label: 'Vigentes' },
            { id: 'ACCEPTED', label: 'Aceptados' },
            { id: 'CONVERTED', label: 'Convertidos en POS' },
            { id: 'EXPIRED', label: 'Vencidos' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por N°, cliente, CUIT o material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-xs h-9"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">N° Cotización</th>
                <th className="py-3 px-4">Cliente / Contacto</th>
                <th className="py-3 px-4">Emisión</th>
                <th className="py-3 px-4">Validez & Congelamiento</th>
                <th className="py-3 px-4 text-center">Renglones</th>
                <th className="py-3 px-4 text-right">Total Final</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center">Acciones Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Cargando cotizaciones...
                  </td>
                </tr>
              ) : filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No se encontraron presupuestos</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cree una nueva cotización con el botón superior.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => {
                  const validity = computeQuoteValidityStatus(quote);
                  const isConverted = quote.status === 'CONVERTED';

                  return (
                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{quote.number}</span>
                          {quote.convertedSaleId && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono px-1.5 py-0.5 rounded border border-indigo-200">
                              Venta #{quote.convertedSaleId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{quote.customerName}</p>
                        <div className="flex flex-wrap gap-x-2 text-[11px] text-slate-500">
                          {quote.customerDocument && <span>{quote.customerDocument}</span>}
                          {quote.customerPhone && (
                            <span className="text-emerald-700 font-medium">{quote.customerPhone}</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(quote.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(quote.createdAt).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Validity Traffic Light */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isConverted ? (
                          <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            <span>Convertido en Venta</span>
                          </div>
                        ) : validity.isExpired ? (
                          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                            <AlertTriangle className="h-4 w-4 text-rose-600" />
                            <span>Vencido ({quote.validityHours}h)</span>
                          </div>
                        ) : validity.isExpiringSoon ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                            <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                            <span>Vence hoy ({validity.formattedRemaining})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span>{validity.formattedRemaining}</span>
                          </div>
                        )}
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Hasta {new Date(quote.validUntil).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Items count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 font-bold rounded text-slate-700 text-[11px]">
                          {quote.items.length} {quote.items.length === 1 ? 'artículo' : 'artículos'}
                        </span>
                      </td>

                      {/* Total & Currency */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-0.5">
                          {quote.currency === 'USD' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                              <DollarSign className="h-3 w-3" /> USD
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 font-mono text-[10px] px-1.5 py-0">
                              ARS
                            </Badge>
                          )}
                          <span className="font-extrabold text-sm text-slate-900 font-mono">
                            {quote.currency === 'USD' ? 'US$ ' : '$'}
                            {quote.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Dual Currency & Exchange Rate Info */}
                        <div className="text-[11px] text-slate-500 font-medium">
                          {quote.currency === 'USD' ? (
                            <span>
                              Equiv. <strong className="text-slate-700">${(quote.totalSecondary || (quote.total * (quote.exchangeRate || 1350))).toLocaleString('es-AR', { maximumFractionDigits: 0 })}</strong>
                              <button
                                type="button"
                                onClick={() => setSelectedQuoteForRateEdit(quote)}
                                className="text-[10px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/70 font-semibold px-1 py-0.5 rounded border border-emerald-200/80 transition-colors inline-flex items-center gap-0.5 ml-1"
                                title="Haga clic para cambiar o actualizar el tipo de cambio pactado"
                              >
                                TC: ${quote.exchangeRate || 1350}
                                <TrendingUp className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          ) : (
                            <span>
                              Equiv. <strong className="text-slate-700">US$ {(quote.totalSecondary || (quote.total / (quote.exchangeRate || 1350))).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                              <button
                                type="button"
                                onClick={() => setSelectedQuoteForRateEdit(quote)}
                                className="text-[10px] text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 px-1 py-0.5 rounded border border-slate-200 hover:border-emerald-200 transition-colors inline-flex items-center gap-0.5 ml-1"
                                title="Haga clic para cambiar o actualizar el tipo de cambio de referencia"
                              >
                                TC: ${quote.exchangeRate || 1350}
                                <TrendingUp className="h-2.5 w-2.5" />
                              </button>
                            </span>
                          )}
                        </div>

                        {quote.discountTotal > 0 && (
                          <span className="block text-[10px] text-emerald-600 font-medium">
                            -{quote.currency === 'USD' ? 'US$ ' : '$'}{quote.discountTotal.toLocaleString('es-AR')} bonificado
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {quote.status === 'CONVERTED' ? (
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                            Convertido POS
                          </Badge>
                        ) : quote.status === 'ACCEPTED' ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            Aceptado
                          </Badge>
                        ) : validity.isExpired || quote.status === 'EXPIRED' ? (
                          <Badge className="bg-rose-100 text-rose-800 border-rose-200">
                            Vencido
                          </Badge>
                        ) : quote.status === 'SENT' ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Enviado
                          </Badge>
                        ) : quote.status === 'CANCELLED' ? (
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200">
                            Anulado
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                            Borrador
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1-Click POS Conversion Button */}
                          <Button
                            size="sm"
                            disabled={isConverted || quote.status === 'CANCELLED'}
                            onClick={() => handleConvertToPos(quote)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-2.5 shadow-xs"
                            title="Cargar renglones y precios acordados en el carrito del Punto de Venta"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                            Cobrar POS
                          </Button>

                          {/* Print Formal A4 */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedQuoteForPrint(quote)}
                            className="h-8 px-2 text-slate-700 hover:text-slate-900 border-slate-300"
                            title="Ver e Imprimir Formato Formal A4"
                          >
                            <Printer className="h-3.5 w-3.5 text-slate-600" />
                          </Button>

                          {/* WhatsApp Share */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShareWhatsApp(quote)}
                            className="h-8 px-2 text-emerald-700 hover:text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                            title="Compartir detalle por WhatsApp"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </Button>

                          {/* Quick Adjust Exchange Rate Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedQuoteForRateEdit(quote)}
                            className="h-8 px-2 text-slate-700 hover:text-emerald-700 border-slate-300 hover:border-emerald-300 hover:bg-emerald-50"
                            title="Modificar o actualizar Tipo de Cambio ($/USD)"
                          >
                            <TrendingUp className="h-3.5 w-3.5" />
                          </Button>

                          {/* Quick Accept / Cancel status toggles */}
                          {quote.status !== 'CONVERTED' && quote.status !== 'CANCELLED' && (
                            <>
                              {quote.status !== 'ACCEPTED' && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleStatusChange(quote.id, 'ACCEPTED')}
                                  className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                                  title="Marcar como Aceptado por el cliente"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(quote.id, 'CANCELLED')}
                                className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                title="Anular presupuesto"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Quote Modal */}
      <NewQuoteModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />

      {/* Quote Print Modal */}
      <QuotePrintModal
        quote={selectedQuoteForPrint}
        isOpen={!!selectedQuoteForPrint}
        onClose={() => setSelectedQuoteForPrint(null)}
      />

      {/* Update Exchange Rate Modal */}
      <UpdateExchangeRateModal
        quote={selectedQuoteForRateEdit}
        isOpen={!!selectedQuoteForRateEdit}
        onClose={() => setSelectedQuoteForRateEdit(null)}
        onSave={handleSaveExchangeRate}
        isPending={updateExchangeRate.isPending}
      />
    </div>
  );
}
export default QuotesPage;
