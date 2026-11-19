import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import type { Sale } from '@ferreteria/shared';
import { useSettings } from '../../services/settings.service';

interface TicketReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export function TicketReceiptModal({ isOpen, onClose, sale }: TicketReceiptModalProps) {
  const { data: companySettings } = useSettings();

  const handlePrint = () => {
    window.print();
  };

  if (!sale) return null;

  const businessName =
    companySettings?.fantasyName || companySettings?.businessName || 'FERRETERÍA CENTRAL';
  const address = companySettings?.address || 'Av. Corrientes 1234, CABA';
  const cuit = companySettings?.cuit || '30-12345678-9';
  const ivaCondition = companySettings?.ivaCondition || 'IVA Responsable Inscripto';
  const customerName =
    (sale as any).customerName || (sale as any).customer?.name || 'Consumidor Final';
  const items: any[] = Array.isArray((sale as any).items) ? (sale as any).items : [];
  const ticketNumber =
    (sale as any).invoiceNumber ||
    (sale as any).saleNumber ||
    sale.number?.toString().padStart(8, '0') ||
    'S/N';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] print:shadow-none print:border-none">
        <DialogHeader className="print:hidden">
          <DialogTitle>Ticket Emitido</DialogTitle>
        </DialogHeader>
        <div
          id="print-area"
          className="p-4 bg-white text-black font-mono text-sm max-w-[80mm] mx-auto border print:border-none print:max-w-full print:p-0"
        >
          <div className="text-center mb-4">
            <h2 className="font-bold text-lg uppercase">{businessName}</h2>
            <p className="text-xs">{address}</p>
            <p className="text-xs">CUIT: {cuit}</p>
            <p className="text-xs">{ivaCondition}</p>
          </div>
          
          <div className="mb-4 border-b border-dashed border-gray-400 pb-2 text-xs space-y-0.5">
            <p>Ticket Nro: {ticketNumber}</p>
            <p>
              Fecha:{' '}
              {sale.createdAt
                ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')
                : format(new Date(), 'dd/MM/yyyy HH:mm')}
            </p>
            <p>Cliente: {customerName}</p>
          </div>
          
          <div className="mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dashed border-gray-400">
                  <th className="text-left font-bold pb-1">Cant x Artículo</th>
                  <th className="text-right font-bold pb-1">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-gray-200">
                {items.length > 0 ? (
                  items.map((item: any, idx: number) => {
                    const itemName =
                      item.productName ||
                      item.product?.name ||
                      item.description ||
                      item.name ||
                      `Artículo #${idx + 1}`;
                    const qty = Number(item.quantity || 1);
                    const unitPrice = Number(item.unitPrice || 0);
                    const lineTotal = Number(
                      item.total ?? item.subtotal ?? qty * unitPrice
                    );
                    return (
                      <tr key={item.id || item.productId || idx}>
                        <td className="py-1.5 pr-2">
                          <div className="font-semibold text-black">{itemName}</div>
                          <div className="text-[11px] text-gray-600">
                            {qty} x ${unitPrice.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-1.5 text-right font-semibold align-top">
                          ${lineTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={2} className="text-left py-2 text-gray-500 italic">
                      Sin desglose de artículos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-dashed border-gray-400 pt-2 text-right space-y-0.5 text-xs">
            <p>Subtotal: ${Number(sale.subtotal || 0).toFixed(2)}</p>
            {(sale as any).couponCode && Number(sale.discount || 0) > 0 ? (
              <p className="font-bold">
                Cupón ({(sale as any).couponCode}): -${Number(sale.discount || 0).toFixed(2)}
              </p>
            ) : Number(sale.discount || 0) > 0 ? (
              <p>Descuento: -${Number(sale.discount || 0).toFixed(2)}</p>
            ) : null}
            <p>IVA: ${Number(sale.taxAmount || 0).toFixed(2)}</p>
            <h3 className="font-bold text-lg mt-2 pt-1 border-t border-dashed border-gray-400">
              TOTAL: ${Number(sale.total || 0).toFixed(2)}
            </h3>
          </div>
          
          <div className="text-center mt-6 text-xs">
            <p>¡Gracias por su compra!</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-4 print:hidden">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> Imprimir (Ctrl+P)</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
