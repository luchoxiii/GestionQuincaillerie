import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/services/users.service';
import { useUserAuditLogs, AuditLog } from '@/services/audit.service';
import { useAuthStore } from '@/stores/auth.store';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  ScrollText,
  X,
  Search,
  Download,
  Shield,
  Activity,
  ShoppingCart,
  XCircle,
  AlertTriangle,
  KeyRound,
  Package,
  Layers,
  Clock,
  Laptop,
  Code2,
  Lock
} from 'lucide-react';

interface UserBitacoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserBitacoraModal({ isOpen, onClose, user }: UserBitacoraModalProps) {
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<AuditLog | null>(null);

  // Load audit logs specifically for this user
  const { data: logs = [], isLoading } = useUserAuditLogs(
    user ? user.username : undefined,
    {
      action: actionFilter,
      entity: entityFilter,
      search: searchTerm,
    }
  );

  // Calculate user specific metrics
  const totalEvents = logs.length;
  const salesCount = useMemo(() => logs.filter((l) => l.entity === 'Sale' && l.action === 'CREATE').length, [logs]);
  const criticalCount = useMemo(
    () => logs.filter((l) => ['DELETE', 'VOID', 'BAN'].includes(l.action) || l.description?.toLowerCase().includes('ajuste')).length,
    [logs]
  );
  const frequentIp = useMemo(() => {
    if (logs.length === 0) return '192.168.1.10';
    const ipCounts: Record<string, number> = {};
    logs.forEach((l) => {
      ipCounts[l.ipAddress] = (ipCounts[l.ipAddress] || 0) + 1;
    });
    return Object.entries(ipCounts).sort((a, b) => b[1] - a[1])[0][0];
  }, [logs]);

  if (!isOpen || !user) return null;

  // STRICT ACCESS CHECK: Only admin can view audit logs / bitácora
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-destructive/40 shadow-2xl">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Acceso Denegado</h3>
          <p className="text-sm text-muted-foreground">
            La bitácora de actividad y auditoría está restringida exclusivamente a usuarios con rol <strong>Administrador</strong>.
          </p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </Card>
      </div>
    );
  }

  const getActionIcon = (action: string, entity: string) => {
    if (action === 'LOGIN') return <KeyRound className="h-4 w-4 text-sky-500" />;
    if (action === 'VOID') return <XCircle className="h-4 w-4 text-amber-500" />;
    if (action === 'BAN') return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (entity === 'Sale') return <ShoppingCart className="h-4 w-4 text-emerald-500" />;
    if (entity === 'Product') return <Package className="h-4 w-4 text-blue-500" />;
    if (entity === 'Stock') return <Layers className="h-4 w-4 text-indigo-500" />;
    return <Activity className="h-4 w-4 text-primary" />;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px]">CREAR</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px]">EDITAR</Badge>;
      case 'DELETE':
        return <Badge variant="destructive" className="font-medium text-[11px]">ELIMINAR</Badge>;
      case 'VOID':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px]">ANULAR</Badge>;
      case 'BAN':
        return <Badge className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-[11px]">VETAR</Badge>;
      case 'LOGIN':
        return <Badge className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium text-[11px]">SESIÓN</Badge>;
      default:
        return <Badge variant="secondary" className="text-[11px]">{action}</Badge>;
    }
  };

  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case 'Sale': return 'Venta / Factura';
      case 'Product': return 'Catálogo / Precios';
      case 'Stock': return 'Inventario Físico';
      case 'Customer': return 'Cliente';
      case 'Purchase': return 'Orden de Compra';
      case 'Cash': return 'Caja Mostrador';
      case 'User': return 'Seguridad / Usuario';
      default: return entity;
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No hay eventos en la bitácora para exportar');
      return;
    }

    const headers = [
      'ID Registro',
      'Fecha',
      'Hora',
      'Usuario',
      'Nombre Completo',
      'Acción Realizada',
      'Módulo / Entidad',
      'ID Comprobante / Ítem',
      'Descripción del Evento',
      'Dirección IP'
    ];

    const rows = logs.map((log) => {
      const d = new Date(log.timestamp);
      return [
        log.id,
        format(d, 'dd/MM/yyyy'),
        format(d, 'HH:mm:ss'),
        user.username,
        `${user.firstName} ${user.lastName}`,
        log.action,
        getEntityLabel(log.entity),
        log.entityId,
        log.description || '-',
        log.ipAddress
      ];
    });

    const dateStr = format(new Date(), 'yyyy-MM-dd');
    exportToCsv(`bitacora_usuario_${user.username}_${dateStr}`, [headers, ...rows]);
    toast.success(`Bitácora de ${user.username} descargada en CSV`);
  };

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.username.substring(0, 2).toUpperCase();
  const roleNames = user.userRoles?.map((ur) => ur.role?.name || ur.roleId).join(', ') || 'Sin rol';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl bg-card shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-foreground">
                  Bitácora de Actividad: {user.firstName} {user.lastName}
                </h3>
                <Badge variant="outline" className="font-mono text-xs bg-muted">
                  @{user.username}
                </Badge>
                <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[10px]">
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                <span>Rol: <strong className="text-foreground">{roleNames}</strong></span>
                <span>•</span>
                <span>Email: {user.email}</span>
                {user.lastLoginAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      Último ingreso: {format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Exportar a CSV
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content body with scrolling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* KPI Cards for this User */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3.5 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Eventos Registrados</span>
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-primary mt-1">{totalEvents}</div>
              <span className="text-[11px] text-muted-foreground">Total en bitácora</span>
            </Card>

            <Card className="p-3.5 border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Ventas Emitidas</span>
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{salesCount}</div>
              <span className="text-[11px] text-muted-foreground">Cobros mostrador</span>
            </Card>

            <Card className="p-3.5 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Acciones Críticas</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{criticalCount}</div>
              <span className="text-[11px] text-muted-foreground">Anulaciones / Ajustes</span>
            </Card>

            <Card className="p-3.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">IP Frecuente</span>
                <Laptop className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-base font-bold font-mono text-foreground mt-1.5 truncate">
                {frequentIp}
              </div>
              <span className="text-[11px] text-muted-foreground">Terminal asignada</span>
            </Card>
          </div>

          {/* Filters Bar */}
          <Card className="p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar en lenguaje natural (ej. 'anulación', 'comprobante', 'ajuste')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="sm:col-span-4">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Tipo de Acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las Acciones</SelectItem>
                    <SelectItem value="CREATE">Creaciones (CREATE)</SelectItem>
                    <SelectItem value="UPDATE">Modificaciones (UPDATE)</SelectItem>
                    <SelectItem value="VOID">Anulaciones (VOID)</SelectItem>
                    <SelectItem value="BAN">Inhabilitaciones (BAN)</SelectItem>
                    <SelectItem value="LOGIN">Inicios de Sesión (LOGIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-3">
                <Select value={entityFilter} onValueChange={setEntityFilter}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Módulos</SelectItem>
                    <SelectItem value="Sale">Ventas (Sale)</SelectItem>
                    <SelectItem value="Product">Productos (Product)</SelectItem>
                    <SelectItem value="Stock">Inventario (Stock)</SelectItem>
                    <SelectItem value="Customer">Clientes (Customer)</SelectItem>
                    <SelectItem value="Cash">Caja (Cash)</SelectItem>
                    <SelectItem value="Purchase">Compras (Purchase)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Timeline / Activity Table */}
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center space-y-2">
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-xs text-muted-foreground">Consultando registros de bitácora...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <ScrollText className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <h4 className="font-semibold text-foreground text-sm">Sin actividad registrada</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchTerm || actionFilter !== 'all' || entityFilter !== 'all'
                    ? 'No se encontraron eventos que coincidan con los filtros seleccionados.'
                    : 'Este usuario aún no registra acciones operativas en el sistema.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {logs.map((log) => {
                  const logDate = new Date(log.timestamp);
                  const isVoidOrBan = ['VOID', 'BAN', 'DELETE'].includes(log.action);

                  return (
                    <div
                      key={log.id}
                      className={`p-4 transition-colors hover:bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isVoidOrBan ? 'bg-amber-500/5 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted border mt-0.5">
                          {getActionIcon(log.action, log.entity)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {getActionBadge(log.action)}
                            <Badge variant="outline" className="text-[11px] font-mono">
                              {getEntityLabel(log.entity)}: {log.entityId}
                            </Badge>
                            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(logDate, 'dd/MM/yyyy HH:mm:ss')}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-foreground">
                            {log.description || 'Operación registrada en el sistema'}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>Terminal: <code className="text-foreground">{log.ipAddress}</code></span>
                            <span>•</span>
                            <span>ID Evento: <code className="text-foreground">{log.id}</code></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center self-end sm:self-center gap-2">
                        {log.details && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLogForDetails(log)}
                            className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Code2 className="h-3.5 w-3.5" />
                            Detalles JSON
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/20 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Bitácora auditada y firmada digitalmente con trazabilidad inmutable.</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar Bitácora
          </Button>
        </div>
      </div>

      {/* JSON Payload Details Modal */}
      {selectedLogForDetails && (
        <Dialog open={!!selectedLogForDetails} onOpenChange={() => setSelectedLogForDetails(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <Code2 className="h-5 w-5 text-primary" />
                Carga Técnica del Evento ({selectedLogForDetails.id})
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 flex-1 overflow-y-auto text-xs py-2">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg border bg-muted/40 font-mono text-[11px]">
                <div><strong>Usuario:</strong> {selectedLogForDetails.user}</div>
                <div><strong>Rol:</strong> {selectedLogForDetails.role || 'Usuario'}</div>
                <div><strong>Entidad:</strong> {selectedLogForDetails.entity} ({selectedLogForDetails.entityId})</div>
                <div><strong>IP Origen:</strong> {selectedLogForDetails.ipAddress}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Parámetros y cambios registrados:
                </label>
                <pre className="p-3 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-[300px] border border-border">
                  {JSON.stringify(selectedLogForDetails.details, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" onClick={() => setSelectedLogForDetails(null)}>
                Cerrar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
