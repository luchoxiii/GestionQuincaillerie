import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import type { Sale } from '@ferreteria/shared';

interface TicketReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function TicketReceiptModal({ isOpen, onClose, sale }: TicketReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ticket Emitido</DialogTitle>
        </DialogHeader>
        <div id="print-area" className="p-4 bg-white text-black font-mono text-sm max-w-[80mm] mx-auto border">
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg">FERRETERÍA EL CLAVO</h2>
            <p>Av. Siempre Viva 123, CABA</p>
            <p>CUIT: 30-12345678-9</p>
            <p>IVA Responsable Inscripto</p>
          </div>
          
          <div className="mb-4 border-b border-dashed border-gray-400 pb-2">
            <p>Ticket Nro: {sale.number?.toString().padStart(8, '0') || 'S/N'}</p>
            <p>Fecha: {sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            <p>Cliente: Consumidor Final</p>
          </div>
          
          <div className="mb-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dashed border-gray-400">
                  <th className="text-left font-bold">Artículos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left py-2 text-gray-500 italic">Ver detalle en sistema...</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-dashed border-gray-400 pt-2 text-right">
            <p>Subtotal: ${sale.subtotal?.toFixed(2) || '0.00'}</p>
            {(sale as any).couponCode && (sale.discount || 0) > 0 ? (
              <p className="font-bold text-xs">Cupón ({(sale as any).couponCode}): -${(sale.discount || 0).toFixed(2)}</p>
            ) : (sale.discount || 0) > 0 ? (
              <p>Descuento: -${sale.discount.toFixed(2)}</p>
            ) : null}
            <p>IVA: ${sale.taxAmount?.toFixed(2) || '0.00'}</p>
            <h3 className="font-bold text-xl mt-2">TOTAL: ${sale.total?.toFixed(2) || '0.00'}</h3>
          </div>
          
          <div className="text-center mt-6 text-xs">
            <p>¡Gracias por su compra!</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Imprimir (Ctrl+P)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
