import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCreditNote, Invoice } from '../../services/invoicing.service';
import toast from 'react-hot-toast';

interface CreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function CreditNoteModal({ isOpen, onClose, invoice }: CreditNoteModalProps) {
  const [reason, setReason] = useState<string>('');
  const createCreditNote = useCreateCreditNote();

  const handleConfirm = async () => {
    if (!invoice) return;
    if (!reason) {
      toast.error('Debe seleccionar un motivo');
      return;
    }

    try {
      await createCreditNote.mutateAsync({ invoiceId: invoice.id, reason });
      toast.success('Nota de Crédito generada y autorizada por AFIP exitosamente');
      onClose();
    } catch (e) {
      toast.error('Error al generar la Nota de Crédito');
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Emitir Nota de Crédito</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            Se generará una Nota de Crédito para el comprobante <strong>{invoice.letter} {invoice.number}</strong> y se solicitará autorización a AFIP (CAE).
          </p>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Motivo</Label>
              <Select onValueChange={setReason} value={reason}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un motivo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Devolución de mercadería">Devolución de mercadería</SelectItem>
                  <SelectItem value="Error de facturación">Error de facturación</SelectItem>
                  <SelectItem value="Descuento aplicado post-venta">Descuento aplicado post-venta</SelectItem>
                  <SelectItem value="Anulación total de la operación">Anulación total de la operación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={createCreditNote.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!reason || createCreditNote.isPending}>
            Confirmar Autorización AFIP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
