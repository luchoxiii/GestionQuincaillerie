import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Copy, Package, Truck, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen?: boolean;
  open?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  sale: any;
}

export function ShippingLabelModal({ isOpen, open, onClose, onOpenChange, sale }: Props) {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);
  const handleModalClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  if (!sale) return null;

  const tracking = sale.trackingNumber || sale.externalOrderId || 'TRK-' + sale.number;
  const channelLabel = sale.channel === 'MERCADO_LIBRE' ? 'MERCADO LIBRE' : sale.channel === 'TIENDA_ONLINE' ? 'TIENDA ONLINE' : 'VENTA DIGITAL';
  const shippingMethod = sale.shippingMethod || 'Mercado Envíos Flex';

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(tracking);
    toast.success('Código de seguimiento copiado al portapapeles');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(val) => { if (!val) handleModalClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Rótulo y Etiqueta de Despacho E-commerce
          </DialogTitle>
          <DialogDescription>
            Etiqueta térmica estandarizada de 10x15 cm para adherir al paquete.
          </DialogDescription>
        </DialogHeader>

        {/* ETIQUETA IMPRIMIBLE (Formato Estándar de Despacho) */}
        <div className="border-2 border-dashed border-foreground/40 p-4 rounded-lg bg-white text-black space-y-3 font-sans shadow-sm my-2 select-all print:border-solid print:m-0">
          {/* Header Etiqueta */}
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">CANAL LOGÍSTICO</span>
              <h3 className="text-base font-black text-black">{channelLabel}</h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-500">MÉTODO</span>
              <div className="font-extrabold text-xs uppercase bg-black text-white px-2 py-0.5 rounded">
                {shippingMethod}
              </div>
            </div>
          </div>

          {/* Código de Barras Simulado de Alta Resolución */}
          <div className="py-2 text-center border-b">
            <div className="inline-flex items-center justify-center gap-0.5 h-12 w-full max-w-[260px] bg-neutral-100 p-1.5 rounded">
              {[3,1,2,4,1,3,2,1,4,2,3,1,2,3,1,4,2,1,3,2,4,1,2,3,1,2,4,1,3,2].map((w, i) => (
                <div key={i} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
              ))}
            </div>
            <p className="font-mono text-xs font-bold mt-1 tracking-widest text-black">
              {tracking}
            </p>
          </div>

          {/* Datos del Destinatario */}
          <div className="space-y-1 text-xs border-b pb-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[10px] text-neutral-500">DESTINATARIO</span>
              <span className="font-mono text-[10px] text-neutral-600">ORDEN: {sale.externalOrderId || sale.saleNumber}</span>
            </div>
            <p className="font-bold text-sm text-black">{sale.customerName || sale.customer?.name || 'Cliente E-commerce'}</p>
            {sale.customerBuyerUsername && (
              <p className="text-[11px] text-neutral-600">Usuario: <strong>@{sale.customerBuyerUsername}</strong></p>
            )}
            <p className="text-neutral-800">{sale.shippingAddress || 'Domicilio no especificado'}</p>
          </div>

          {/* Detalle de Bultos y Contenido */}
          <div className="text-[11px] space-y-1">
            <span className="font-bold uppercase text-[10px] text-neutral-500">CONTENIDO DEL PAQUETE</span>
            <div className="bg-neutral-50 p-2 rounded border border-neutral-200">
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-neutral-800">
                    <span className="truncate max-w-[220px]">• {it.product?.name || it.productName || 'Artículo'}</span>
                    <span className="font-bold font-mono">x{it.quantity}</span>
                  </div>
                ))
              ) : (
                <span className="text-neutral-500 italic">Materiales de ferretería / bulto cerrado</span>
              )}
            </div>
          </div>

          {/* Remitente */}
          <div className="border-t pt-2 flex items-center justify-between text-[10px] text-neutral-500">
            <span>REMITENTE: Ferretería & Corralón Central</span>
            <span>BULTOS: 1/1</span>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyTracking} className="text-xs">
            <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Tracking
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cerrar
            </Button>
            <Button size="sm" onClick={handlePrint} className="text-xs">
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimir Etiqueta
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}