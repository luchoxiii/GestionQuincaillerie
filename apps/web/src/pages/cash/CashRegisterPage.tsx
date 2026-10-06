import { useState } from 'react';
import { 
  useCurrentCashSession, 
  useCashMovements, 
  useOpenCashSession, 
  useCloseCashSession,
  useCreateCashMovement,
  useCashRegisters 
} from '../../services/cash.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle, Wallet, LogOut, LogIn, DollarSign, PlusCircle, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';

export function CashRegisterPage() {
  const { data: session, isLoading: isSessionLoading } = useCurrentCashSession();
  const { data: movements, isLoading: isMovementsLoading } = useCashMovements(session?.id || null);
  const { data: registers = [] } = useCashRegisters();
  
  const openSessionMutation = useOpenCashSession();
  const closeSessionMutation = useCloseCashSession();
  const createMovementMutation = useCreateCashMovement();

  // Modals state
  const [isOpening, setIsOpening] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isManualMovement, setIsManualMovement] = useState(false);

  // Form states
  const [registerId, setRegisterId] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openNotes, setOpenNotes] = useState('');

  const [closingCount, setClosingCount] = useState('');
  const [closeNotes, setCloseNotes] = useState('');

  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [movementAmount, setMovementAmount] = useState('');
  const [movementDesc, setMovementDesc] = useState('');

  if (isSessionLoading) return <div className="p-6">Cargando datos de caja...</div>;

  const ingresos = movements?.filter(m => m.type === 'IN').reduce((acc, m) => acc + Number(m.amount), 0) || 0;
  const egresos = movements?.filter(m => m.type === 'OUT').reduce((acc, m) => acc + Number(m.amount), 0) || 0;
  const saldoTeorico = (Number(session?.openingBalance) || 0) + ingresos - egresos;

  const handleOpenCash = async () => {
    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      toast.error('Ingrese un fondo inicial válido (mayor o igual a 0)');
      return;
    }
    const reg = registerId || registers[0]?.id || 'reg-1';

    try {
      await openSessionMutation.mutateAsync({
        registerId: reg,
        openingBalance: balance,
        notes: openNotes,
      });
      toast.success('¡Caja abierta exitosamente!');
      setIsOpening(false);
      setOpeningBalance('');
      setOpenNotes('');
    } catch {
      toast.error('Error al abrir la caja');
    }
  };

  const handleCloseCash = async () => {
    if (!session) return;
    const counted = parseFloat(closingCount) || 0;

    try {
      await closeSessionMutation.mutateAsync({
        sessionId: session.id,
        closingBalance: counted,
        notes: closeNotes,
      });
      toast.success('Caja cerrada y arqueo completado');
      setIsClosing(false);
      setClosingCount('');
      setCloseNotes('');
    } catch {
      toast.error('Error al cerrar la caja');
    }
  };

  const handleManualMovement = async () => {
    if (!session) return;
    const amount = parseFloat(movementAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingrese un monto válido');
      return;
    }
    if (!movementDesc.trim()) {
      toast.error('Ingrese una descripción del movimiento');
      return;
    }

    try {
      await createMovementMutation.mutateAsync({
        sessionId: session.id,
        type: movementType,
        amount,
        description: movementDesc.trim(),
      });
      toast.success(movementType === 'IN' ? 'Ingreso registrado' : 'Egreso registrado');
      setIsManualMovement(false);
      setMovementAmount('');
      setMovementDesc('');
    } catch {
      toast.error('Error al registrar movimiento');
    }
  };

  const handleExportCSV = () => {
    if (!movements || movements.length === 0) {
      toast.error('No hay movimientos de caja para exportar');
      return;
    }

    const headers = [
      'ID Movimiento',
      'Fecha',
      'Hora',
      'Tipo (Ingreso/Egreso)',
      'Monto ($)',
      'Descripción / Referencia',
      'Sesión Caja ID'
    ];

    const rows = movements.map((m: any) => {
      const dateObj = m.createdAt ? new Date(m.createdAt) : new Date();
      return [
        m.id,
        format(dateObj, 'dd/MM/yyyy'),
        format(dateObj, 'HH:mm:ss'),
        m.type === 'IN' ? 'Ingreso (+)' : 'Egreso (-)',
        Number(m.amount || 0).toFixed(2),
        m.description || m.concept || '-',
        m.sessionId || session?.id || 'Actual'
      ];
    });

    exportToCsv(`caja_movimientos_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Movimientos de caja exportados a CSV con éxito');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control de Caja</h1>
          <p className="text-muted-foreground">Gestión de turnos, arqueos y movimientos de efectivo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Exportar Movimientos CSV
          </Button>
          {!session ? (
            <Button onClick={() => setIsOpening(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <LogIn className="w-4 h-4" /> Abrir Caja
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsManualMovement(true)} className="gap-2">
                <PlusCircle className="w-4 h-4 text-primary" /> Movimiento Manual
              </Button>
              <Button onClick={() => setIsClosing(true)} variant="destructive" className="gap-2">
                <LogOut className="w-4 h-4" /> Cerrar Caja / Arqueo
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado de Turno</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {session ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600">Abierto</Badge>
              ) : (
                <Badge variant="secondary">Cerrado</Badge>
              )}
            </div>
            {session && (
              <p className="text-xs text-muted-foreground mt-1">
                Desde: {format(new Date(session.openedAt), 'dd/MM/yyyy HH:mm')}
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fondo Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(Number(session?.openingBalance) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monto de apertura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ingresos / Egresos</CardTitle>
            <div className="flex gap-1 text-muted-foreground">
              <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
              <ArrowDownCircle className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm">
              <span className="text-emerald-600 font-bold">+${ingresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              <span className="text-rose-600 font-bold">-${egresos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Movimientos del turno actual</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Saldo Teórico en Caja</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${saldoTeorico.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Efectivo total esperado</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-muted/40">
          <h2 className="font-semibold text-foreground">Movimientos del Turno</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hora</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!session ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  La caja se encuentra cerrada. Abra la caja para comenzar a operar.
                </TableCell>
              </TableRow>
            ) : isMovementsLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : movements?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No hay movimientos registrados en este turno.
                </TableCell>
              </TableRow>
            ) : (
              movements?.map((mov: any) => (
                <TableRow key={mov.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(mov.createdAt || Date.now()), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{mov.description}</TableCell>
                  <TableCell>
                    {mov.type === 'IN' ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-none dark:bg-emerald-950 dark:text-emerald-300">
                        Ingreso
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-800 border-none dark:bg-rose-950 dark:text-rose-300">
                        Egreso
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${mov.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {mov.type === 'IN' ? '+' : '-'}${Number(mov.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Abrir Caja */}
      <Dialog open={isOpening} onOpenChange={setIsOpening}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apertura de Caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Punto de Venta / Terminal</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={registerId}
                onChange={(e) => setRegisterId(e.target.value)}
              >
                {registers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {((r as any).pointOfSale ? `(${(r as any).pointOfSale})` : '')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Fondo Inicial de Caja ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 10000.00"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Efectivo para cambio al iniciar la jornada.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones (Opcional)</Label>
              <Input
                placeholder="Notas de apertura..."
                value={openNotes}
                onChange={(e) => setOpenNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpening(false)}>Cancelar</Button>
            <Button onClick={handleOpenCash} className="bg-emerald-600 hover:bg-emerald-700">
              Confirmar Apertura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Movimiento Manual */}
      <Dialog open={isManualMovement} onOpenChange={setIsManualMovement}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Movimiento Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Tipo de Movimiento</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={movementType === 'IN' ? 'default' : 'outline'}
                  onClick={() => setMovementType('IN')}
                  className="gap-2"
                >
                  <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> Ingreso
                </Button>
                <Button
                  type="button"
                  variant={movementType === 'OUT' ? 'default' : 'outline'}
                  onClick={() => setMovementType('OUT')}
                  className="gap-2"
                >
                  <ArrowDownCircle className="w-4 h-4 text-rose-500" /> Egreso / Retiro
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Monto ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Concepto / Motivo *</Label>
              <Input
                placeholder="Ej. Pago de flete, Retiro de cambio..."
                value={movementDesc}
                onChange={(e) => setMovementDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManualMovement(false)}>Cancelar</Button>
            <Button onClick={handleManualMovement}>Guardar Movimiento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cerrar Caja / Arqueo */}
      <Dialog open={isClosing} onOpenChange={setIsClosing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cierre de Caja y Arqueo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saldo Teórico Esperado:</span>
                <span className="font-bold text-foreground">
                  ${saldoTeorico.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Efectivo Recontado en Caja ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder={saldoTeorico.toString()}
                value={closingCount}
                onChange={(e) => setClosingCount(e.target.value)}
              />
              {closingCount && (
                <div className="text-xs">
                  {parseFloat(closingCount) - saldoTeorico === 0 ? (
                    <span className="text-emerald-600 font-medium">Arqueo exacto. Coincide con el sistema.</span>
                  ) : parseFloat(closingCount) - saldoTeorico > 0 ? (
                    <span className="text-blue-600 font-medium">
                      Sobrante de: ${(parseFloat(closingCount) - saldoTeorico).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium">
                      Faltante de: ${(saldoTeorico - parseFloat(closingCount)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones del Cierre</Label>
              <Input
                placeholder="Observaciones de cierre..."
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClosing(false)}>Cancelar</Button>
            <Button onClick={handleCloseCash} variant="destructive">
              Confirmar Cierre de Turno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
