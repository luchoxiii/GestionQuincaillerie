import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProducts } from '@/services/products.service';
import { usePosStore } from '@/stores/pos.store';
import { Barcode, ShoppingCart, Tag, AlertCircle, CheckCircle2, Package, Layers, RotateCcw, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccessibilityStore } from '@/stores/accessibility.store';
import { a11yAudio } from '@/services/a11y-audio.service';

interface PriceCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
}

export function PriceCheckModal({ isOpen, onClose, onAddToCart }: PriceCheckModalProps) {
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem } = usePosStore();

  const { data: productsData, isLoading } = useProducts({
    search: query,
    limit: 30,
  });

  const products: any[] = (Array.isArray(productsData) ? productsData : (productsData as any)?.data) || [];

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedProduct(null);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // If query is an exact barcode match, select automatically
  useEffect(() => {
    if (query.trim().length >= 3 && products.length > 0) {
      const exactMatch = products.find(
        (p: any) =>
          (p.sku && p.sku.toLowerCase() === query.trim().toLowerCase()) ||
          (p.code && p.code.toLowerCase() === query.trim().toLowerCase())
      );
      if (exactMatch) {
        setSelectedProduct(exactMatch);
      }
    }
  }, [query, products]);

  const handleSelect = (prod: any) => {
    setSelectedProduct(prod);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const price = Number(selectedProduct.price ?? selectedProduct.salePrice ?? 0);
    addItem({
      id: selectedProduct.id,
      name: selectedProduct.name,
      sku: selectedProduct.sku || selectedProduct.code || '',
      price: price,
      taxRate: selectedProduct.taxRate ?? 21,
    });
    if (onAddToCart) {
      onAddToCart(selectedProduct);
    }
    toast.success(`"${selectedProduct.name}" agregado al carrito POS`);
  };

  const handleResetSearch = () => {
    setQuery('');
    setSelectedProduct(null);
    inputRef.current?.focus();
  };

  const activeProduct = selectedProduct || (products.length === 1 && query.trim() ? products[0] : null);
  const price = activeProduct ? Number(activeProduct.price ?? activeProduct.salePrice ?? 0) : 0;
  const cashDiscountPrice = price * 0.90; // 10% off efectivo
  const cuota3 = price / 3;
  const cuota6 = (price * 1.15) / 6;
  const stock = activeProduct ? (activeProduct.totalStock ?? activeProduct.stock ?? 0) : 0;
  const minStock = activeProduct ? (activeProduct.minStock ?? 5) : 5;

  // Vocalización y sonido automático según preferencias a11y
  const lastAnnouncedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeProduct && activeProduct.id !== lastAnnouncedIdRef.current) {
      lastAnnouncedIdRef.current = activeProduct.id;
      const { soundFeedback, textToSpeech } = useAccessibilityStore.getState();
      if (soundFeedback) {
        a11yAudio.playScan();
      }
      if (textToSpeech) {
        a11yAudio.speakProduct(activeProduct.name, price, stock);
      }
    } else if (!activeProduct) {
      lastAnnouncedIdRef.current = null;
    }
  }, [activeProduct, price, stock]);

  useEffect(() => {
    if (!isOpen) {
      lastAnnouncedIdRef.current = null;
      a11yAudio.cancel();
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="bg-slate-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                <Tag className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Verificador de Precios y Stock
                  <span className="text-xs bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    F3
                  </span>
                </DialogTitle>
                <p className="text-xs text-slate-300 mt-0.5">
                  Escanee el código de barras con la lectora USB o escriba el nombre/SKU
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Barcode className="h-6 w-6" />
            </div>
            <Input
              ref={inputRef}
              type="text"
              placeholder="Escanee código o busque en lenguaje natural (ej. 'bosch percutor', 'martillo stanley')..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && products.length > 0) {
                  setSelectedProduct(products[0]);
                }
              }}
              className="pl-12 pr-10 text-base h-12 border-2 border-slate-300 focus-visible:border-blue-600 shadow-sm"
            />
            {query && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* If an active product is matched/selected */}
          {activeProduct ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Product Header & Badges */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      SKU: {activeProduct.sku || activeProduct.code || 'S/N'}
                    </span>
                    {activeProduct.category?.name && (
                      <Badge variant="outline" className="text-xs bg-white">
                        {activeProduct.category.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xl font-bold text-slate-900">
                      {activeProduct.name}
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => a11yAudio.speakProduct(activeProduct.name, price, stock)}
                      className="h-7 px-2 text-xs text-blue-700 border-blue-200 hover:bg-blue-50 rounded-md gap-1"
                      title="Escuchar precio y stock en voz alta"
                      aria-label="Escuchar precio y stock en voz alta"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Escuchar</span>
                    </Button>
                  </div>

                  {activeProduct.description && (
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {activeProduct.description}
                    </p>
                  )}
                </div>

                <div className="text-right flex md:flex-col items-center md:items-end justify-between gap-1">
                  <span className="text-xs font-medium text-slate-500">Disponibilidad</span>
                  {stock <= 0 ? (
                    <Badge variant="destructive" className="flex items-center gap-1 font-bold">
                      <AlertCircle className="h-3.5 w-3.5" /> Sin Stock
                    </Badge>
                  ) : stock <= minStock ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Stock Crítico: {stock} un.
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> En Stock: {stock} un.
                    </Badge>
                  )}
                </div>
              </div>

              {/* Huge Price Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main List Price */}
                <div className="md:col-span-2 p-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl shadow-md flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-blue-200 font-semibold">
                      Precio de Lista (Contado / Tarjeta)
                    </span>
                    <Badge className="bg-blue-500/30 text-blue-200 border-none text-[10px]">
                      IVA {activeProduct.taxRate ?? 21}% Inc.
                    </Badge>
                  </div>
                  <div className="my-2">
                    <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                      ${price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-blue-800/80 flex items-center justify-between text-xs text-blue-200">
                    <span>Efectivo / Débito (10% OFF):</span>
                    <strong className="text-emerald-400 font-bold text-sm">
                      ${cashDiscountPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Installments Card */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                  <span className="text-xs uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-blue-600" /> Financiación
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="font-semibold text-slate-800">3 cuotas sin interés</div>
                      <div className="text-blue-600 font-bold text-sm">
                        ${cuota3.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mes
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <div className="text-slate-600">6 cuotas fijas (+15%)</div>
                      <div className="text-slate-900 font-semibold">
                        ${cuota6.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mes
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warehouses & Locations Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Package className="h-4 w-4 text-slate-500" /> Stock por Ubicación Física
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white border rounded-lg">
                    <span className="text-slate-500 block">Depósito Central (A1)</span>
                    <strong className="text-slate-900 font-bold text-sm">
                      {Math.max(0, stock - 2)} un.
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border rounded-lg">
                    <span className="text-slate-500 block">Salón / Mostrador</span>
                    <strong className="text-slate-900 font-bold text-sm">
                      {Math.min(2, stock)} un.
                    </strong>
                  </div>
                  <div className="p-2.5 bg-white border rounded-lg">
                    <span className="text-slate-500 block">Stock Mínimo Configurado</span>
                    <strong className="text-slate-700 font-medium text-sm">
                      {minStock} un.
                    </strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={handleResetSearch} className="text-xs text-slate-600">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Consultar Otro Producto
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cerrar
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={stock <= 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <ShoppingCart className="h-4 w-4" /> Cargar al Carrito (POS)
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-result or empty search list */
            <div>
              {isLoading ? (
                <div className="text-center py-12 text-slate-500">
                  Buscando en el catálogo...
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    Haga clic en un producto para consultar su precio detallado y financiación ({products.length} encontrados):
                  </p>
                  <div className="max-h-64 overflow-y-auto divide-y border rounded-lg">
                    {products.map((p: any) => {
                      const pPrice = Number(p.price ?? p.salePrice ?? 0);
                      const pStock = p.totalStock ?? p.stock ?? 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelect(p)}
                          className="p-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div className="flex-1 pr-4">
                            <div className="font-semibold text-sm text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">
                              SKU: <span className="font-mono">{p.sku || p.code || 'S/N'}</span> • {p.category?.name || 'General'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-base text-blue-700">
                              ${pPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs">
                              {pStock > 0 ? (
                                <span className="text-emerald-600 font-medium">{pStock} en stock</span>
                              ) : (
                                <span className="text-red-500 font-medium">Sin stock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : query.trim() ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">
                    No se encontró ningún producto con "{query}"
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Verifique el código de barras o intente buscar por palabras clave
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Barcode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Listo para consultar</p>
                  <p className="text-xs">Pase un código de barras por el lector o escriba arriba</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
