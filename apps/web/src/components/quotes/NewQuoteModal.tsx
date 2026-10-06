import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCustomers } from '../../services/customers.service';
import { useProducts, Product } from '../../services/products.service';
import { useCreateQuote, Quote } from '../../services/quotes.service';
import { useSettings, getStoredDollarExchangeRate } from '../../services/settings.service';
import { matchProductNatural } from '@ferreteria/shared';
import { telemetry } from '../../services/telemetry.service';
import {
  FilePlus,
  Search,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Package,
  DollarSign,
  Coins,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (quote: Quote) => void;
}

interface QuoteFormItem {
  productId: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
}

export function NewQuoteModal({ isOpen, onClose, onCreated }: NewQuoteModalProps) {
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: products = [] } = useProducts();
  const createQuote = useCreateQuote();
  const { data: companySettings } = useSettings();

  // Currency & Exchange Rate State
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS');
  const [exchangeRate, setExchangeRate] = useState<number>(() => companySettings?.dollarExchangeRate || getStoredDollarExchangeRate());

  // Customer Mode: 'REGISTERED' | 'WALK_IN'
  const [customerMode, setCustomerMode] = useState<'REGISTERED' | 'WALK_IN'>('REGISTERED');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerDocument, setCustomerDocument] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');

  // Validity: hours
  const [validityHours, setValidityHours] = useState<number>(48);

  // Items
  const [items, setItems] = useState<QuoteFormItem[]>([]);
  const [productSearch, setProductSearch] = useState<string>('');

  // Notes & terms
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('Precios congelados por 48 hs hábiles sujeto a stock. Flete a convenir.');

  const handleCurrencyChange = (newCurrency: 'ARS' | 'USD') => {
    if (newCurrency === currency) return;
    const rate = exchangeRate > 0 ? exchangeRate : 1350;
    if (items.length > 0) {
      if (newCurrency === 'USD') {
        const updated = items.map((it) => ({
          ...it,
          unitPrice: Number((it.unitPrice / rate).toFixed(2)),
        }));
        setItems(updated);
        toast.success(`Renglones convertidos a Dólares (TC: $${rate})`);
      } else {
        const updated = items.map((it) => ({
          ...it,
          unitPrice: Number((it.unitPrice * rate).toFixed(2)),
        }));
        setItems(updated);
        toast.success(`Renglones convertidos a Pesos (TC: $${rate})`);
      }
    }
    setCurrency(newCurrency);
  };

  // Filtered products for search dropdown using Natural Language Engine
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    return products
      .filter((p) => matchProductNatural(p, productSearch))
      .slice(0, 8);
  }, [products, productSearch]);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const cust = customersData?.data.find((c) => c.id === customerId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerDocument(cust.documentNumber || '');
      setCustomerPhone(cust.phone || '');
      setCustomerEmail(cust.email || '');
    }
  };

  const handleSetValidity = (hours: number) => {
    setValidityHours(hours);
    setTerms(`Precios congelados por ${hours} hs hábiles sujeto a stock. Flete a convenir.`);
  };

  const handleAddProduct = (product: Product) => {
    // Check if already in items
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex !== -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      setItems(updated);
      toast.success(`Incrementada cantidad de "${product.name}"`);
    } else {
      const defaultTax = product.taxes?.[0]?.tax?.rate ?? 21;
      const basePrice = product.salePrice || product.price || 0;
      const rate = exchangeRate > 0 ? exchangeRate : 1350;
      const initialUnitPrice = currency === 'USD'
        ? Number((basePrice / rate).toFixed(2))
        : basePrice;

      setItems([
        ...items,
        {
          productId: product.id,
          code: product.code,
          name: product.name,
          unit: product.unit?.abbreviation || 'UNID',
          quantity: 1,
          unitPrice: initialUnitPrice,
          discountPct: 0,
          taxRate: defaultTax,
        },
      ]);
      toast.success(`Agregado "${product.name}"`);
    }
    setProductSearch('');
  };

  const handleUpdateItem = (index: number, field: keyof QuoteFormItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Financial calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    items.forEach((item) => {
      const lineSubtotal = item.quantity * item.unitPrice;
      const disc = lineSubtotal * (item.discountPct / 100);
      const afterDisc = lineSubtotal - disc;
      const tax = afterDisc * (item.taxRate / 100);

      subtotal += lineSubtotal;
      discountTotal += disc;
      taxTotal += tax;
    });

    const total = subtotal - discountTotal + taxTotal;
    return { subtotal, discountTotal, taxTotal, total };
  }, [items]);

  // Expiration preview date
  const expirationDatePreview = useMemo(() => {
    const d = new Date(Date.now() + validityHours * 3600 * 1000);
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [validityHours]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Por favor indique el nombre del cliente o empresa');
      return;
    }

    if (items.length === 0) {
      toast.error('Debe agregar al menos 1 artículo al presupuesto');
      return;
    }

    try {
      const created = await createQuote.mutateAsync({
        customerId: customerMode === 'REGISTERED' ? selectedCustomerId : null,
        customerName: customerName.trim(),
        customerDocument: customerDocument.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        validityHours,
        currency,
        currencySymbol: currency === 'USD' ? 'US$' : '$',
        exchangeRate: exchangeRate > 0 ? exchangeRate : 1350,
        items,
        notes: notes.trim() || undefined,
        termsAndConditions: terms.trim() || undefined,
      });

      toast.success(`Presupuesto ${created.number} creado exitosamente`);
      telemetry.trackQuote({
        quoteNumber: created.number,
        total: created.total,
        validityHours,
      });
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error('Error al crear el presupuesto');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <FilePlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Nuevo Presupuesto / Cotización</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Cotice materiales con congelamiento de precios por tiempo limitado y conversión directa a venta POS.
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Customer & Validity row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-slate-50 border rounded-xl">
            {/* Customer Box */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Cliente Destinatario</Label>
                <div className="flex rounded-md border bg-white p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('REGISTERED')}
                    className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                      customerMode === 'REGISTERED' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Registrado
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('WALK_IN');
                      setSelectedCustomerId('');
                      setCustomerName('');
                      setCustomerDocument('');
                      setCustomerPhone('');
                      setCustomerEmail('');
                    }}
                    className={`px-2.5 py-0.5 rounded font-medium transition-colors ${
                      customerMode === 'WALK_IN' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Ocasional / Mostrador
                  </button>
                </div>
              </div>

              {customerMode === 'REGISTERED' ? (
                <div className="space-y-2">
                  <Select value={selectedCustomerId} onValueChange={handleSelectCustomer}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Seleccione un cliente registrado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {customersData?.data.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.documentNumber || 'Sin doc'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {customerName && (
                    <div className="p-2.5 bg-white border rounded text-xs space-y-1">
                      <p className="font-bold text-slate-900">{customerName}</p>
                      <div className="flex flex-wrap gap-x-3 text-slate-600 text-[11px]">
                        {customerDocument && <span>Doc: {customerDocument}</span>}
                        {customerPhone && <span>Tel: {customerPhone}</span>}
                        {customerEmail && <span>Email: {customerEmail}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div>
                    <Input
                      placeholder="Nombre del Cliente o Empresa *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="bg-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="CUIT o DNI"
                      value={customerDocument}
                      onChange={(e) => setCustomerDocument(e.target.value)}
                      className="bg-white text-xs"
                    />
                    <Input
                      placeholder="Teléfono / WhatsApp"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="bg-white text-xs"
                    />
                  </div>
                  <Input
                    placeholder="Email de contacto"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="bg-white text-xs"
                  />
                </div>
              )}
            </div>

            {/* Validity Box */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Plazo de Validez y Congelamiento</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '24 Horas', hours: 24 },
                  { label: '48 Horas', hours: 48 },
                  { label: '7 Días', hours: 168 },
                  { label: '15 Días', hours: 360 },
                  { label: '30 Días', hours: 720 },
                ].map((item) => (
                  <Button
                    key={item.hours}
                    type="button"
                    variant={validityHours === item.hours ? 'default' : 'outline'}
                    onClick={() => handleSetValidity(item.hours)}
                    className={`text-xs h-9 ${
                      validityHours === item.hours
                        ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Calendar className="h-4 w-4 text-amber-700" />
                  <span>Vigencia hasta: {expirationDatePreview}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Durante este período de {validityHours} horas, los precios acordados se mantendrán fijos al convertirlos directamente en venta POS.
                </p>
              </div>
            </div>
          </div>

          {/* Moneda y Tipo de Cambio Row */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/50 border border-emerald-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Moneda de la Cotización
                </Label>
                <p className="text-xs text-muted-foreground">
                  Elija si cotiza al cliente en moneda local o fija el presupuesto en dólares estadounidenses.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-md border bg-white p-0.5 text-xs shadow-xs">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('ARS')}
                  className={`px-3 py-1 rounded font-bold transition-colors ${
                    currency === 'ARS' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pesos ($)
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USD')}
                  className={`px-3 py-1 rounded font-bold transition-colors flex items-center gap-1 ${
                    currency === 'USD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5" /> Dólares (US$)
                </button>
              </div>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs shadow-xs">
                <span className="font-semibold text-slate-700 whitespace-nowrap">TC Dólar:</span>
                <span className="text-slate-400 font-bold">$</span>
                <Input
                  type="number"
                  step="any"
                  min="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Math.max(0.01, Number(e.target.value) || 1350))}
                  className="h-6 w-20 px-1 py-0 font-mono font-bold text-emerald-700 text-xs border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {/* Product search and addition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Artículos y Materiales</Label>
              <span className="text-xs text-muted-foreground">{items.length} ítem(s) agregado(s)</span>
            </div>

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar material por nombre o código (ej: Cemento, Varilla, Amoladora)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>

              {filteredProducts.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl divide-y max-h-60 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProduct(p)}
                      className="p-3 hover:bg-amber-50/60 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Package className="h-4 w-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Código: {p.code} • Stock actual: {p.totalStock ?? p.stock ?? 0} {p.unit?.abbreviation || 'UN'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700">
                          ${(p.salePrice || p.price || 0).toLocaleString('es-AR')}
                        </span>
                        <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2 text-amber-700 ml-2">
                          <Plus className="h-3 w-3 mr-1" /> Agregar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Table of added items */}
            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Package className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Aún no has agregado artículos a esta cotización.</p>
                <p className="text-[11px] text-slate-400">Utilice el buscador superior para agregar materiales del catálogo.</p>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Material</th>
                      <th className="py-2.5 px-3 w-24 text-center">Cant.</th>
                      <th className="py-2.5 px-3 w-32 text-right">P. Unitario ({currency === 'USD' ? 'US$' : '$'})</th>
                      <th className="py-2.5 px-3 w-24 text-right">Desc %</th>
                      <th className="py-2.5 px-3 w-32 text-right">Total ({currency === 'USD' ? 'US$' : '$'})</th>
                      <th className="py-2.5 px-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, idx) => {
                      const lineSubtotal = item.quantity * item.unitPrice;
                      const disc = lineSubtotal * (item.discountPct / 100);
                      const lineTotal = (lineSubtotal - disc) * (1 + item.taxRate / 100);

                      return (
                        <tr key={item.productId + idx} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className="text-[10px] text-slate-500 font-mono">{item.code} • {item.unit}</span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                              className="h-7 w-20 mx-auto text-center text-xs font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(idx, 'unitPrice', Math.max(0, Number(e.target.value)))}
                              className="h-7 w-28 ml-auto text-right text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPct}
                              onChange={(e) => handleUpdateItem(idx, 'discountPct', Math.min(100, Math.max(0, Number(e.target.value))))}
                              className="h-7 w-20 ml-auto text-right text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {currency === 'USD' ? 'US$ ' : '$ '}{lineTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(idx)}
                              className="h-7 w-7 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes, Terms & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
            <div className="md:col-span-7 space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Observaciones / Logística de Entrega</Label>
                <Input
                  placeholder="Ej: Retira cliente / Envío en camión grúa a obra en Av. Libertador..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-white text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Condiciones Comerciales y Validez</Label>
                <Input
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="bg-white text-xs mt-1 text-slate-600"
                />
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Renglones:</span>
                <span className="font-semibold">{currency === 'USD' ? 'US$ ' : '$'}{totals.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descuento Bonificado:</span>
                  <span className="font-semibold">-{currency === 'USD' ? 'US$ ' : '$'}{totals.discountTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>IVA Estimado:</span>
                <span className="font-semibold">{currency === 'USD' ? 'US$ ' : '$'}{totals.taxTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900 uppercase">Total {currency === 'USD' ? 'USD' : 'Final'}:</span>
                <span className="text-2xl font-black text-amber-700">{currency === 'USD' ? 'US$ ' : '$'}{totals.total.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Dual currency conversion badge */}
              <div className="pt-2 mt-1 border-t border-dashed border-slate-300 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">
                  {currency === 'USD' ? 'Equivalente en Pesos:' : 'Equivalente en Dólares:'}
                </span>
                <span className="font-bold font-mono text-slate-800">
                  {currency === 'USD'
                    ? `$ ${(totals.total * (exchangeRate || 1350)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `US$ ${(totals.total / (exchangeRate || 1350)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  <span className="text-[10px] text-slate-500 font-normal ml-1.5">
                    (TC: ${exchangeRate || 1350})
                  </span>
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createQuote.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6"
            >
              {createQuote.isPending ? 'Generando...' : 'Crear Presupuesto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
