import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Invoice } from '../../services/invoicing.service';
import { Printer } from 'lucide-react';

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onEmitCreditNote?: (invoice: Invoice) => void;
}

export function InvoiceDetailModal({ isOpen, onClose, invoice, onEmitCreditNote }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const netGravado21 = invoice.items.filter(i => i.taxRate === 21).reduce((acc, i) => acc + i.subtotal, 0);
  const netGravado105 = invoice.items.filter(i => i.taxRate === 10.5).reduce((acc, i) => acc + i.subtotal, 0);
  const iva21 = netGravado21 * 0.21;
  const iva105 = netGravado105 * 0.105;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] h-[90vh] overflow-y-auto print:max-w-none print:h-auto print:p-0 print:border-none print:shadow-none print:block">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <DialogTitle>Detalle del Comprobante</DialogTitle>
          <div className="flex gap-2">
            {onEmitCreditNote && invoice.status !== 'ANULADO' && (
              <Button variant="destructive" onClick={() => { onClose(); onEmitCreditNote(invoice); }}>
                Emitir Nota de Crédito
              </Button>
            )}
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Factura A4 (Ctrl+P)
            </Button>
          </div>
        </div>
        
        {/* Printable Area - Formal Argentine Electronic Invoice layout */}
        <div className="bg-white text-black p-8 border border-gray-300 w-full font-sans print:border-none print:m-0 print:p-0">
          {/* Header Box */}
          <div className="flex justify-between border-b-2 border-black pb-4 relative">
            <div className="w-[45%]">
              <h2 className="text-2xl font-bold uppercase mb-2">Ferretería El Martillo</h2>
              <p className="text-sm">Razón Social: Ferretería El Martillo S.A.</p>
              <p className="text-sm">Domicilio Comercial: Av. Siempre Viva 123, CABA</p>
              <p className="text-sm">Condición frente al IVA: Responsable Inscripto</p>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 top-0 border-2 border-black p-2 flex flex-col items-center bg-white">
              <span className="text-4xl font-bold">{invoice.letter}</span>
              <span className="text-xs font-bold mt-1">COD. {invoice.afipCode || (invoice.letter === 'A' ? '001' : '006')}</span>
            </div>
            
            <div className="w-[45%] text-right">
              <h2 className="text-2xl font-bold uppercase mb-2">FACTURA</h2>
              <div className="flex justify-end gap-4 text-sm font-bold mb-1">
                <span>Punto de Venta: {invoice.salePoint}</span>
                <span>Comp. Nro: {invoice.number}</span>
              </div>
              <p className="text-sm">Fecha de Emisión: {new Date(invoice.date).toLocaleDateString('es-AR')}</p>
              <p className="text-sm mt-2">CUIT: 30-71234567-8</p>
              <p className="text-sm">Ingresos Brutos: 901-234567-8</p>
              <p className="text-sm">Inicio de Actividades: 01/01/2010</p>
            </div>
          </div>

          {/* Section Receptor */}
          <div className="border-b-2 border-black py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><span className="font-bold">CUIT / DNI:</span> {invoice.customerDocumentNumber || 'Consumidor Final'}</p>
                <p className="text-sm"><span className="font-bold">Condición frente al IVA:</span> {invoice.customerDocumentType === 'CUIT' ? 'Responsable Inscripto' : 'Consumidor Final'}</p>
              </div>
              <div>
                <p className="text-sm"><span className="font-bold">Cliente / Razón Social:</span> {invoice.customerName || 'Consumidor Final'}</p>
                <p className="text-sm"><span className="font-bold">Condición de Venta:</span> Contado</p>
              </div>
            </div>
          </div>

          {/* Table of Items */}
          <div className="min-h-[300px]">
            <table className="w-full text-sm border-collapse mt-4">
              <thead className="bg-gray-100 border-y-2 border-black">
                <tr>
                  <th className="py-2 px-1 text-left">Código</th>
                  <th className="py-2 px-1 text-left">Descripción del producto</th>
                  <th className="py-2 px-1 text-right">Cantidad</th>
                  <th className="py-2 px-1 text-left">Unidad</th>
                  <th className="py-2 px-1 text-right">Precio Unitario</th>
                  <th className="py-2 px-1 text-right">% IVA</th>
                  <th className="py-2 px-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-1">{item.code}</td>
                    <td className="py-2 px-1">{item.description}</td>
                    <td className="py-2 px-1 text-right">{item.quantity}</td>
                    <td className="py-2 px-1">{item.unit}</td>
                    <td className="py-2 px-1 text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 px-1 text-right">{item.taxRate}%</td>
                    <td className="py-2 px-1 text-right">${(item.subtotal * (1 + item.taxRate / 100)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotales & Bases Imponibles */}
          <div className="border-t-2 border-black pt-4 grid grid-cols-2 gap-4">
            <div className="border border-gray-300 p-2 text-sm">
              <div className="flex justify-between">
                <span>Importe Neto Gravado (21%):</span>
                <span>${netGravado21.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA 21%:</span>
                <span>${iva21.toFixed(2)}</span>
              </div>
              {netGravado105 > 0 && (
                <>
                  <div className="flex justify-between mt-1">
                    <span>Importe Neto Gravado (10.5%):</span>
                    <span>${netGravado105.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA 10.5%:</span>
                    <span>${iva105.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-end justify-end">
              <div className="text-right">
                <span className="text-lg font-bold mr-4">Importe Total:</span>
                <span className="text-2xl font-bold">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Official Footer AFIP */}
          <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Fake QR code for representation */}
              <div className="w-24 h-24 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs text-center p-2">
                Código QR oficial de AFIP (RG 4892)
              </div>
              <div className="text-sm font-bold italic">
                Comprobante Autorizado
              </div>
            </div>
            <div className="text-right font-bold">
              <p>CAE N°: {invoice.cae || '74321987654321'}</p>
              <p>Fecha de Vto. de CAE: {invoice.caeExpiration ? new Date(invoice.caeExpiration).toLocaleDateString('es-AR') : '31/12/2026'}</p>
            </div>
          </div>
        </div>
        
        {/* Style for print mode injected globally via className utilities above */}
      </DialogContent>
    </Dialog>
  );
}
