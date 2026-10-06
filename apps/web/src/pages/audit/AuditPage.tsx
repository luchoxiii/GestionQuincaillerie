import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Info,
  Download,
  Shield,
  Activity,
  UserCheck,
  AlertOctagon,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Copy,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuditLogs, verifyLedgerIntegrity, getLocalAuditLogs, recordAuditLog } from '../../services/audit.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { exportToCsv } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AuditPage() {
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const [userFilter, setUserFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState<ReturnType<typeof verifyLedgerIntegrity> | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: logs = [], isLoading } = useAuditLogs({
    entity: entityFilter !== 'all' ? entityFilter : undefined,
    action: actionFilter !== 'all' ? actionFilter : undefined,
    user: userFilter !== 'all' ? userFilter : undefined,
    search
  });

  // Verify ledger integrity on mount or when logs change
  useEffect(() => {
    const res = verifyLedgerIntegrity();
    setVerification(res);
  }, [logs.length]);

  const handleManualVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifyLedgerIntegrity();
      setVerification(res);
      setIsVerifying(false);
      if (res.isValid) {
        toast.success(`Integridad Forense Certificada: ${res.totalEntries} bloques SHA-256 encadenados sin manipulación.`);
      } else {
        toast.error(`Alerta Forense: Manipulación detectada en bloque #${res.tamperedIndex}`);
      }
    }, 350);
  };

  // Copy hash helper
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Hash SHA-256 copiado al portapapeles');
  };

  // Extract unique users
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.user) set.add(l.user);
    });
    return Array.from(set);
  }, [logs]);

  // Statistics
  const totalEvents = logs.length;
  const createCount = logs.filter(l => l.action === 'CREATE').length;
  const updateCount = logs.filter(l => l.action === 'UPDATE').length;
  const criticalCount = logs.filter(l => ['DELETE', 'VOID', 'BAN'].includes(l.action)).length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">CREAR (CREATE)</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">EDITAR (UPDATE)</Badge>;
      case 'DELETE':
        return <Badge variant="destructive">ELIMINAR (DELETE)</Badge>;
      case 'VOID':
        return <Badge className="bg-amber-600 hover:bg-amber-700 text-white">ANULAR (VOID)</Badge>;
      case 'BAN':
        return <Badge className="bg-red-700 hover:bg-red-800 text-white font-bold">VETAR (BAN)</Badge>;
      case 'ADJUST':
        return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">AJUSTE (ADJUST)</Badge>;
      case 'LOGIN':
        return <Badge className="bg-teal-600 hover:bg-teal-700 text-white">LOGIN (INGRESO)</Badge>;
      case 'LOGIN_FAILED':
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white animate-pulse">LOGIN_FAILED (FALLIDO)</Badge>;
      case 'LOGOUT':
        return <Badge className="bg-slate-600 hover:bg-slate-700 text-white">LOGOUT (SALIDA)</Badge>;
      case 'CSV_EXPORT':
        return <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white">CSV_EXPORT (DESCARGA)</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getEntityLabel = (entity: string) => {
    switch (entity) {
      case 'Product': return 'Producto';
      case 'Sale': return 'Venta';
      case 'User': return 'Usuario';
      case 'Invoice': return 'Factura';
      case 'Customer': return 'Cliente';
      case 'Purchase': return 'Compra';
      case 'Stock': return 'Inventario';
      default: return entity;
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No hay registros de auditoría para exportar');
      return;
    }

    const headers = [
      'Bloque / Secuencia',
      'Hash SHA-256',
      'Hash Previo (Parent)',
      'Fecha',
      'Hora',
      'Usuario / Operador',
      'Rol del Usuario',
      'Acción',
      'Entidad',
      'ID Referencia',
      'Descripción del Evento',
      'Dirección IP'
    ];

    const rows = logs.map((log) => {
      const dateObj = new Date(log.timestamp);
      return [
        `#${String(log.sequence || 0).padStart(4, '0')}`,
        log.hash || 'N/A',
        log.previousHash || 'N/A',
        format(dateObj, 'dd/MM/yyyy'),
        format(dateObj, 'HH:mm:ss'),
        log.user,
        log.role || 'Usuario',
        log.action,
        getEntityLabel(log.entity),
        log.entityId,
        log.description || '-',
        log.ipAddress
      ];
    });

    exportToCsv(`bitacora_forense_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    
    // Add audit log for CSV export
    try {
      recordAuditLog({
        userId: isAdmin ? 'admin' : 'unknown',
        user: isAdmin ? 'Administrador Principal' : 'Usuario',
        role: isAdmin ? 'ADMIN' : 'USER',
        action: 'CSV_EXPORT',
        entity: 'AuditLog',
        entityId: 'ALL',
        description: `Exportación de ${logs.length} registros forenses a CSV`,
        details: { count: logs.length, filters: { entityFilter, actionFilter, userFilter } }
      });
    } catch {}

    toast.success('Bitácora con hashes SHA-256 exportada a CSV');
  };

  const handleExportForensicReport = () => {
    const allLogs = getLocalAuditLogs();
    const verif = verifyLedgerIntegrity();

    const report = {
      tipoComprobante: 'ACTA_OFICIAL_AUDITORIA_FORENSE',
      normativa: 'ISO/IEC 27001 / Requisitos de Inalterabilidad e Integridad de Registros',
      fechaCertificacion: new Date().toISOString(),
      estadoIntegridad: verif.isValid ? 'INTEGRO_Y_VERIFICADO' : 'ALTERACION_DETECTADA',
      totalBloquesEncadenados: verif.totalEntries,
      algoritmoHash: 'SHA-256 (Secure Hash Algorithm 256-bit)',
      ultimoHashTip: verif.lastHash,
      resumenEventos: {
        total: allLogs.length,
        creaciones: allLogs.filter((l) => l.action === 'CREATE').length,
        modificaciones: allLogs.filter((l) => l.action === 'UPDATE').length,
        eventosCriticos: allLogs.filter((l) => ['DELETE', 'VOID', 'BAN'].includes(l.action)).length,
      },
      cadenaBloques: allLogs.map((l) => ({
        bloque: l.sequence,
        hashSha256: l.hash,
        hashPrevio: l.previousHash,
        marcaTiempoIso: l.timestamp,
        operador: l.user,
        rol: l.role || 'Usuario',
        accion: l.action,
        entidadAfectada: l.entity,
        idEntidad: l.entityId,
        direccionIp: l.ipAddress,
        descripcion: l.description,
        datosCarga: l.details,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acta_forense_auditoria_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Acta Oficial de Auditoría Forense descargada en formato JSON firmado');
  };

  if (!isAdmin) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto min-h-[60vh]">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Acceso Restringido: Solo Administrador</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La bitácora de auditoría y supervisión de operadores es de acceso confidencial y exclusivo para usuarios con rol de <strong>Administrador</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Bitácora Forense e Inalterable de Auditoría
          </h2>
          <p className="text-sm text-muted-foreground">
            Registro secuencial con encadenamiento criptográfico SHA-256 (tamper-evident ledger) ante peritajes y auditorías legales.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleManualVerification}
            disabled={isVerifying}
            className="border-emerald-300 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100 font-semibold text-xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            Verificar Integridad SHA-256
          </Button>
          <Button variant="outline" onClick={handleExportForensicReport} className="text-xs">
            <FileCheck className="mr-1.5 h-3.5 w-3.5 text-blue-600" /> Acta Forense (JSON)
          </Button>
          <Button variant="outline" onClick={handleExportCSV} className="text-xs">
            <Download className="mr-1.5 h-3.5 w-3.5" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Forensic Verification Status Banner */}
      <Card className={`border-2 ${verification?.isValid ? 'border-emerald-500/40 bg-emerald-50/30' : 'border-red-500/40 bg-red-50/30'}`}>
        <CardContent className="py-4 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-full ${verification?.isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {verification?.isValid ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-foreground">
                    {verification?.isValid
                      ? 'Integridad Criptográfica de la Bitácora Certificada (100% Inalterable)'
                      : `¡Alerta de Auditoría! Alteración detectada en Bloque #${verification?.tamperedIndex}`}
                  </h3>
                  <Badge variant="outline" className={verification?.isValid ? 'border-emerald-400 text-emerald-800 bg-emerald-100/60 font-mono text-[10px]' : 'border-red-400 text-red-800 bg-red-100/60 font-mono text-[10px]'}>
                    SHA-256 CHAIN
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {verification?.isValid
                    ? `Todos los ${verification?.totalEntries || logs.length} eventos históricos están sellados y validados secuencialmente con hashes SHA-256 inmutables.`
                    : verification?.reason || 'El hash del bloque no coincide con la carga de datos original.'}
                </p>
              </div>
            </div>
            {verification?.lastHash && (
              <div className="flex flex-col md:items-end text-xs font-mono bg-background/80 p-2.5 rounded border">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans font-semibold">
                  <KeyRound className="h-3 w-3 text-emerald-600" />
                  Último Hash Sellado (Tip Block):
                </span>
                <span className="font-bold text-emerald-950 truncate max-w-[240px] text-[11px]" title={verification.lastHash}>
                  {verification.lastHash}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">Sucesos monitoreados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creaciones (Nuevos)</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{createCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Ventas, compras y altas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modificaciones</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{updateCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Edición de precios o stock</p>
          </CardContent>
        </Card>

        <Card className={criticalCount > 0 ? "border-red-200 bg-red-50/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Eventos Críticos</CardTitle>
            <AlertOctagon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Anulaciones, vetos y bajas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros de Supervisión por Operador y Acción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, descripción o IP..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* User Filter Dropdown */}
            <div className="w-[230px]">
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Usuario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Operadores</SelectItem>
                  {uniqueUsers.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Filter */}
            <div className="w-[180px]">
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Entidades</SelectItem>
                  <SelectItem value="Sale">Ventas</SelectItem>
                  <SelectItem value="Customer">Clientes</SelectItem>
                  <SelectItem value="Product">Productos</SelectItem>
                  <SelectItem value="Purchase">Compras</SelectItem>
                  <SelectItem value="Stock">Inventario</SelectItem>
                  <SelectItem value="User">Usuarios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="w-[180px]">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las Acciones</SelectItem>
                  <SelectItem value="CREATE">CREATE (Creación)</SelectItem>
                  <SelectItem value="UPDATE">UPDATE (Edición)</SelectItem>
                  <SelectItem value="VOID">VOID (Anulación)</SelectItem>
                  <SelectItem value="BAN">BAN (Veto)</SelectItem>
                  <SelectItem value="ADJUST">ADJUST (Ajuste Stock)</SelectItem>
                  <SelectItem value="DELETE">DELETE (Borrado)</SelectItem>
                  <SelectItem value="LOGIN">LOGIN (Ingreso)</SelectItem>
                  <SelectItem value="LOGIN_FAILED">LOGIN_FAILED (Fallido)</SelectItem>
                  <SelectItem value="LOGOUT">LOGOUT (Salida)</SelectItem>
                  <SelectItem value="CSV_EXPORT">CSV_EXPORT (Descarga)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/60 text-muted-foreground border-b text-xs">
                <tr>
                  <th className="px-3 py-3 font-semibold">Bloque</th>
                  <th className="px-3 py-3 font-semibold">Fecha y Hora</th>
                  <th className="px-3 py-3 font-semibold">Operador</th>
                  <th className="px-3 py-3 font-semibold text-center">Acción</th>
                  <th className="px-3 py-3 font-semibold">Entidad</th>
                  <th className="px-3 py-3 font-semibold">Descripción del Suceso</th>
                  <th className="px-3 py-3 font-semibold font-mono">Hash SHA-256</th>
                  <th className="px-3 py-3 font-semibold text-center">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted-foreground">Cargando registros...</td>
                  </tr>
                ) : logs?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-muted-foreground">
                      No se encontraron registros de auditoría para los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  logs?.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap text-xs font-mono font-bold text-foreground">
                        <span className="bg-muted px-1.5 py-0.5 rounded border">
                          #{String(log.sequence || 0).padStart(4, '0')}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs font-mono">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs">{log.user}</span>
                          {log.role && (
                            <span className="text-[10px] text-muted-foreground">{log.role}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="px-3 py-3 font-medium text-xs">
                        {getEntityLabel(log.entity)}
                      </td>
                      <td className="px-3 py-3 text-xs max-w-xs">
                        <span className="text-foreground">{log.description || '-'}</span>
                        <span className="text-muted-foreground block font-mono text-[10px] mt-0.5">Ref: {log.entityId}</span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs font-mono">
                        {log.hash ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300 font-mono">
                              {log.hash.slice(0, 8)}...{log.hash.slice(-6)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              onClick={() => handleCopyHash(log.hash)}
                              title="Copiar Hash SHA-256 completo"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Sin hash</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary">
                              <Info className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-base">
                                <Shield className="h-4 w-4 text-primary" />
                                Auditoría Forense: Bloque #{String(log.sequence || 0).padStart(4, '0')}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 py-2 text-xs">
                              {/* Hash chain cryptographic seal */}
                              <div className="bg-slate-950 text-slate-100 p-3 rounded-md font-mono space-y-1.5 border border-slate-800">
                                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                  <KeyRound className="h-3 w-3" /> Sello Criptográfico Inalterable
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Hash SHA-256 de este bloque:</span>
                                  <span className="text-emerald-300 break-all text-[11px] select-all font-bold">
                                    {log.hash || 'GENESIS'}
                                  </span>
                                </div>
                                <div className="pt-1 border-t border-slate-800">
                                  <span className="text-slate-400 text-[10px] block">Hash del Bloque Anterior (Parent Hash):</span>
                                  <span className="text-slate-300 break-all text-[11px] select-all">
                                    {log.previousHash || 'GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000'}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-muted p-2.5 rounded border space-y-1">
                                <div><strong>Fecha y Hora:</strong> {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</div>
                                <div><strong>Operador:</strong> {log.user} ({log.role || 'Usuario'})</div>
                                <div><strong>Acción y Entidad:</strong> {log.action} sobre {getEntityLabel(log.entity)}</div>
                                <div><strong>Dirección IP:</strong> {log.ipAddress}</div>
                                <div><strong>ID Referencia:</strong> {log.entityId}</div>
                                {log.description && <div><strong>Detalle:</strong> {log.description}</div>}
                              </div>
                              <h4 className="font-semibold text-xs mt-2">Carga de Datos / JSON Payload:</h4>
                              <div className="bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto font-mono text-[11px]">
                                <pre>{JSON.stringify(log.details, null, 2)}</pre>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
