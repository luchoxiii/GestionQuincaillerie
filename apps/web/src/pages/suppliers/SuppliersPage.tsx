import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useSupplierAccount, useRecordSupplierPayment } from '@/services/suppliers.service';
import { Edit, Trash2, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<any>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const { data: suppliers = [], isLoading } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  const handleExportCSV = () => {
    if (!suppliers || suppliers.length === 0) {
      toast.error('No hay proveedores para exportar');
      return;
    }

    const headers = [
      'ID',
      'Nombre / Razón Social',
      'CUIT',
      'Condición IVA',
      'Teléfono',
      'Email',
      'Dirección',
      'Saldo Deudor ($)'
    ];

    const rows = suppliers.map((s: any) => [
      s.id,
      s.name,
      s.cuit || s.documentNum || '',
      s.taxCondition || 'Responsable Inscripto',
      s.phone || '-',
      s.email || '-',
      s.address || '-',
      Number(s.debtBalance || s.balance || 0).toFixed(2)
    ]);

    exportToCsv(`proveedores_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Lista de proveedores exportada a CSV con éxito');
  };

  const handleOpenCreate = () => {
    setSupplierToEdit(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (sup: any) => {
    setSupplierToEdit(sup);
    setModalOpen(true);
  };

  const handleDelete = async (sup: any) => {
    if (confirm(`¿Está seguro de que desea eliminar al proveedor "${sup.name}"?`)) {
      try {
        await deleteSupplier.mutateAsync(sup.id);
        toast.success('Proveedor eliminado correctamente');
      } catch {
        toast.error('Error al eliminar proveedor');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proveedores</h2>
          <p className="text-muted-foreground">Gestión de proveedores y cuentas corrientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={handleOpenCreate}>Nuevo Proveedor</Button>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? <div className="p-8 text-center">Cargando...</div> : (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nombre / Razón Social</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">CUIT</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Condición IVA</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Teléfono</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Saldo Deudor</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {suppliers?.map((sup) => (
                  <tr key={sup.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{sup.name}</td>
                    <td className="p-4 align-middle">{sup.cuit}</td>
                    <td className="p-4 align-middle">{sup.taxCondition}</td>
                    <td className="p-4 align-middle">{sup.phone || '-'}</td>
                    <td className="p-4 align-middle font-bold text-destructive">${sup.debtBalance.toLocaleString('es-AR')}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setSelectedSupplier(sup);
                          setAccountOpen(true);
                        }}>Cuenta Corriente</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(sup)} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sup)} className="text-destructive hover:text-destructive" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <SupplierModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        supplier={supplierToEdit} 
      />
      {selectedSupplier && (
        <SupplierAccountModal 
          open={accountOpen} 
          onOpenChange={setAccountOpen} 
          supplier={selectedSupplier} 
        />
      )}
    </div>
  );
}

function SupplierModal({ open, onOpenChange, supplier }: { open: boolean; onOpenChange: (open: boolean) => void; supplier?: any }) {
  const [name, setName] = useState('');
  const [cuit, setCuit] = useState('');
  const [taxCondition, setTaxCondition] = useState('Responsable Inscripto');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const { mutate: createSupplier, isPending: isCreating } = useCreateSupplier();
  const { mutate: updateSupplier, isPending: isUpdating } = useUpdateSupplier();

  useEffect(() => {
    if (open) {
      if (supplier) {
        setName(supplier.name || '');
        setCuit(supplier.cuit || '');
        setTaxCondition(supplier.taxCondition || 'Responsable Inscripto');
        setPhone(supplier.phone || '');
        setEmail(supplier.email || '');
      } else {
        setName('');
        setCuit('');
        setTaxCondition('Responsable Inscripto');
        setPhone('');
        setEmail('');
      }
    }
  }, [open, supplier]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Ingrese el nombre o razón social');
      return;
    }

    if (supplier) {
      updateSupplier({ id: supplier.id, name, cuit, taxCondition, phone, email }, {
        onSuccess: () => {
          toast.success('Proveedor actualizado');
          onOpenChange(false);
        },
        onError: () => toast.error('Error al actualizar proveedor')
      });
    } else {
      createSupplier({ name, cuit, taxCondition, phone, email, debtBalance: 0 }, {
        onSuccess: () => {
          toast.success('Proveedor creado');
          onOpenChange(false);
        },
        onError: () => toast.error('Error al crear proveedor')
      });
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Razón Social / Nombre</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Ferretera Industrial SA" />
          </div>
          <div className="grid gap-2">
            <Label>CUIT</Label>
            <Input value={cuit} onChange={e => setCuit(e.target.value)} placeholder="30-12345678-9" />
          </div>
          <div className="grid gap-2">
            <Label>Condición IVA</Label>
            <Select value={taxCondition} onValueChange={setTaxCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condición IVA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                <SelectItem value="Monotributo">Monotributo</SelectItem>
                <SelectItem value="Exento">Exento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="11-4567-8900" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="ventas@proveedor.com" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Proveedor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupplierAccountModal({ open, onOpenChange, supplier }: { open: boolean, onOpenChange: (open: boolean) => void, supplier: any }) {
  const { data: movements, isLoading } = useSupplierAccount(supplier?.id);
  const { mutate: recordPayment, isPending } = useRecordSupplierPayment();
  const [amount, setAmount] = useState('');

  const handlePayment = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    
    recordPayment({
      supplierId: supplier.id,
      amount: val,
      method: 'Efectivo',
      date: new Date().toISOString()
    }, {
      onSuccess: () => {
        toast.success('Pago registrado');
        setAmount('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Cuenta Corriente: {supplier?.name}</DialogTitle></DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center bg-muted p-4 rounded-md">
            <div>
              <span className="text-sm text-muted-foreground">Saldo Deudor Actual</span>
              <p className="text-2xl font-bold text-destructive">${supplier?.debtBalance.toLocaleString('es-AR')}</p>
            </div>
            <div className="flex gap-2 items-end">
              <div className="grid gap-1">
                <Label>Monto a Pagar</Label>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
              </div>
              <Button onClick={handlePayment} disabled={isPending}>Registrar Pago</Button>
            </div>
          </div>

          <div className="relative w-full overflow-auto max-h-60">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b">
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fecha</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="h-10 px-4 text-left font-medium text-muted-foreground">Descripción</th>
                  <th className="h-10 px-4 text-right font-medium text-muted-foreground">Monto</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan={4} className="p-4 text-center">Cargando...</td></tr> : 
                  movements?.map((m: any) => (
                    <tr key={m.id} className="border-b">
                      <td className="p-2">{new Date(m.date).toLocaleDateString('es-AR')}</td>
                      <td className="p-2">{m.type}</td>
                      <td className="p-2">{m.description}</td>
                      <td className={`p-2 text-right ${m.amount < 0 ? 'text-success' : 'text-destructive'}`}>
                        ${Math.abs(m.amount).toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
