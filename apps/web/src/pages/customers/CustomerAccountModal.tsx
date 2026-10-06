import React, { useState } from 'react';
import { Customer, PaymentMethod } from '@ferreteria/shared';
import { useCustomerAccount, useRecordCustomerPayment } from '@/services/customers.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CustomerAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export function CustomerAccountModal({ open, onOpenChange, customerId }: CustomerAccountModalProps) {
  const { data, isLoading } = useCustomerAccount(customerId);
  const recordPayment = useRecordCustomerPayment();
  
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('cash');
  const [reference, setReference] = useState<string>('');
  
  // Set default amount when data loads
  React.useEffect(() => {
    if (data?.totalBalance && data.totalBalance > 0) {
      setAmount(data.totalBalance.toString());
    } else {
      setAmount('');
    }
  }, [data]);

  const handleCobrarTotal = () => {
    if (data?.totalBalance) {
      setAmount(data.totalBalance.toString());
    }
  };

  const handleRegistrarCobro = async () => {
    if (!customerId || !amount || parseFloat(amount) <= 0) return;
    
    try {
      await recordPayment.mutateAsync({
        id: customerId,
        payment: {
          amount: parseFloat(amount),
          paymentMethod: method,
          reference,
        }
      });
      // Optionally reset form
      setReference('');
      if (data?.totalBalance) {
        setAmount((data.totalBalance - parseFloat(amount)).toString());
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  if (!open) return null;

  const customer = data?.customer;
  const transactions = data?.transactions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Cuenta Corriente</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !customer ? (
          <div className="p-4 text-center text-muted-foreground">No se encontró la cuenta.</div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header info */}
            <div className="grid grid-cols-4 gap-4 bg-muted p-4 rounded-lg mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                <p className="font-semibold">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{customer.documentType}</p>
                <p className="font-semibold">{customer.documentNum}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Actual</p>
                <p className={`font-bold ${data.totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(data.totalBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Límite Disponible</p>
                <p className="font-semibold">
                  {formatCurrency(data.availableCredit)}
                </p>
              </div>
            </div>

            <Tabs defaultValue="history" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">Historial de Movimientos</TabsTrigger>
                <TabsTrigger value="payment">Registrar Cobranza</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="flex-1 overflow-auto mt-4">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Comprobante</TableHead>
                        <TableHead className="text-right">Débito</TableHead>
                        <TableHead className="text-right">Crédito</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No hay movimientos registrados.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {tx.type === 'SALE' && 'Venta'}
                              {tx.type === 'PAYMENT' && 'Pago'}
                              {tx.type === 'CREDIT_NOTE' && 'Nota de Crédito'}
                            </TableCell>
                            <TableCell>{tx.reference}</TableCell>
                            <TableCell className="text-right">{tx.debit > 0 ? formatCurrency(tx.debit) : '-'}</TableCell>
                            <TableCell className="text-right">{tx.credit > 0 ? formatCurrency(tx.credit) : '-'}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(tx.balance)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="mt-4">
                <div className="space-y-6 max-w-md mx-auto p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-medium border-b pb-2">Nuevo Cobro</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Monto a Cobrar</Label>
                      <div className="flex space-x-2">
                        <Input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          placeholder="0.00"
                        />
                        <Button variant="outline" onClick={handleCobrarTotal}>
                          Cobrar Total
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Efectivo</SelectItem>
                          <SelectItem value="debit">Tarjeta de Débito</SelectItem>
                          <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="transfer">Transferencia</SelectItem>
                          <SelectItem value="check">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Número de Comprobante / Referencia (Opcional)</Label>
                      <Input 
                        value={reference} 
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Ej. TR-123456" 
                      />
                    </div>

                    <Button 
                      className="w-full mt-4" 
                      onClick={handleRegistrarCobro}
                      disabled={!amount || parseFloat(amount) <= 0 || recordPayment.isPending}
                    >
                      {recordPayment.isPending ? 'Procesando...' : 'Registrar Cobro y Emitir Recibo'}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
