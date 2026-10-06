import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Upload,
  Cloud,
  CloudUpload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  ExternalLink,
  Info,
  Database,
  Lock,
} from 'lucide-react';
import {
  createBackupSnapshot,
  downloadBackupFile,
  validateBackupFile,
  restoreBackupSnapshot,
  ErpBackupSnapshot,
} from '@/services/backup.service';
import {
  getGoogleDriveConfig,
  saveGoogleDriveConfig,
  getSavedGoogleToken,
  saveGoogleToken,
  clearGoogleToken,
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  downloadBackupFromGoogleDrive,
  GoogleDriveBackupFile,
} from '@/services/google-drive.service';
import toast from 'react-hot-toast';

export function BackupSettingsTab() {
  const [snapshot, setSnapshot] = useState<ErpBackupSnapshot | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [pendingRestore, setPendingRestore] = useState<ErpBackupSnapshot | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // Google Drive state
  const [gdriveConfig, setGdriveConfig] = useState(getGoogleDriveConfig());
  const [tokenInput, setTokenInput] = useState(getSavedGoogleToken() || '');
  const [isConnected, setIsConnected] = useState(!!getSavedGoogleToken());
  const [isUploadingGDrive, setIsUploadingGDrive] = useState(false);
  const [isLoadingGDriveFiles, setIsLoadingGDriveFiles] = useState(false);
  const [gdriveFiles, setGdriveFiles] = useState<GoogleDriveBackupFile[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Generar resumen inicial del sistema
    const current = createBackupSnapshot();
    setSnapshot(current);

    if (isConnected && tokenInput) {
      loadGoogleDriveFiles(tokenInput);
    }
  }, []);

  const handleDownloadLocalBackup = () => {
    try {
      const filename = downloadBackupFile();
      toast.success(`Copia de seguridad descargada: ${filename}`);
      setSnapshot(createBackupSnapshot());
    } catch (e: any) {
      toast.error('Error al generar la copia: ' + e.message);
    }
  };

  const handleSelectRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupFile(content);
      if (!validation.isValid || !validation.snapshot) {
        toast.error(validation.error || 'Archivo de copia no válido');
        setPendingRestore(null);
        setRestoreFile(null);
        return;
      }
      setRestoreFile(file);
      setPendingRestore(validation.snapshot);
      toast.success('Archivo de respaldo verificado correctamente');
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!pendingRestore) return;

    if (!window.confirm('⚠️ ATENCIÓN: Esta acción reemplazará los datos actuales por los del archivo de respaldo. ¿Desea continuar?')) {
      return;
    }

    try {
      const res = restoreBackupSnapshot(pendingRestore);
      toast.success(
        `Restauración completada: ${res.stats.products} productos, ${res.stats.customers} clientes, ${res.stats.sales} ventas recuperadas.`
      );
      setPendingRestore(null);
      setRestoreFile(null);
      setSnapshot(createBackupSnapshot());
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e: any) {
      toast.error('Error al restaurar copia: ' + e.message);
    }
  };

  const handleSaveGDriveConfig = () => {
    saveGoogleDriveConfig(gdriveConfig);
    if (tokenInput.trim()) {
      saveGoogleToken(tokenInput.trim(), true);
      setIsConnected(true);
      loadGoogleDriveFiles(tokenInput.trim());
      toast.success('Credenciales de Google Drive guardadas');
    } else {
      clearGoogleToken();
      setIsConnected(false);
      setGdriveFiles([]);
      toast.success('Configuración guardada (modo sin token)');
    }
  };

  const loadGoogleDriveFiles = async (token: string) => {
    setIsLoadingGDriveFiles(true);
    try {
      const files = await listGoogleDriveBackups(token);
      setGdriveFiles(files);
    } catch (err: any) {
      console.warn('Error al listar archivos de Google Drive:', err);
      // Si el token expiró, sugerir renovar
      if (err.message?.includes('401') || err.message?.includes('Invalid Credentials')) {
        toast.error('El token de Google Drive ha expirado. Ingrese un token vigente.');
        setIsConnected(false);
      }
    } finally {
      setIsLoadingGDriveFiles(false);
    }
  };

  const handleUploadToGoogleDrive = async () => {
    const token = getSavedGoogleToken() || tokenInput;
    if (!token) {
      toast.error('Debe conectar o ingresar un Access Token de Google Drive primero');
      return;
    }

    setIsUploadingGDrive(true);
    try {
      const uploaded = await uploadBackupToGoogleDrive(token);
      toast.success(`¡Copia subida con éxito a Google Drive en la carpeta "Ferreteria_ERP_Backups"!`);
      loadGoogleDriveFiles(token);
    } catch (err: any) {
      toast.error('Error al subir a Google Drive: ' + (err.message || 'Error de autenticación'));
    } finally {
      setIsUploadingGDrive(false);
    }
  };

  const handleRestoreFromGoogleDrive = async (file: GoogleDriveBackupFile) => {
    const token = getSavedGoogleToken() || tokenInput;
    if (!token) return;

    if (!window.confirm(`¿Desea restaurar el sistema con la copia "${file.name}" guardada en Google Drive?`)) {
      return;
    }

    try {
      toast.loading('Descargando copia desde Google Drive...', { id: 'gdrive-restore' });
      const snap = await downloadBackupFromGoogleDrive(file.id, token);
      const res = restoreBackupSnapshot(snap);
      toast.success(
        `Restauración desde Google Drive exitosa: ${res.stats.products} productos, ${res.stats.customers} clientes recuperados.`,
        { id: 'gdrive-restore' }
      );
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e: any) {
      toast.error('Error al restaurar desde Google Drive: ' + e.message, { id: 'gdrive-restore' });
    }
  };

  const handleConnectWithGoogleOAuth = () => {
    const clientId = gdriveConfig.clientId.trim();
    if (!clientId) {
      toast.error('Por favor ingrese su Google Client ID en el campo de configuración');
      return;
    }

    // Flujo OAuth2 Popup / Redirect estándar para Google Drive
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${scope}&include_granted_scopes=true`;

    const popup = window.open(authUrl, 'google_oauth_popup', 'width=600,height=700');
    if (!popup) {
      window.location.href = authUrl;
    } else {
      const checkTimer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(checkTimer);
            return;
          }
          const hash = popup.location.hash;
          if (hash && hash.includes('access_token=')) {
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get('access_token');
            if (token) {
              popup.close();
              clearInterval(checkTimer);
              setTokenInput(token);
              saveGoogleToken(token, true);
              setIsConnected(true);
              toast.success('¡Conectado exitosamente con Google Drive!');
              loadGoogleDriveFiles(token);
            }
          }
        } catch {}
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Resumen de datos respaldables */}
      {snapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 bg-muted/30">
            <div className="text-xs text-muted-foreground">Productos en Catálogo</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {snapshot.metadata.totals.products}
            </div>
          </Card>
          <Card className="p-4 bg-muted/30">
            <div className="text-xs text-muted-foreground">Clientes Registrados</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {snapshot.metadata.totals.customers}
            </div>
          </Card>
          <Card className="p-4 bg-muted/30">
            <div className="text-xs text-muted-foreground">Ventas Realizadas</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {snapshot.metadata.totals.sales}
            </div>
          </Card>
          <Card className="p-4 bg-muted/30">
            <div className="text-xs text-muted-foreground">Cotizaciones / Presupuestos</div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {snapshot.metadata.totals.quotes}
            </div>
          </Card>
        </div>
      )}

      {/* 2. Tarjeta de Backup Local */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Copia de Seguridad Local (Descarga y Restauración)
          </CardTitle>
          <CardDescription>
            Exporte o restaure un archivo snapshot completo (.JSON) con todos los datos de su ferretería.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-foreground">Generar y Descargar Respaldo</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crea un archivo inmutable con productos, existencias, clientes, ventas, compras, caja y configuración.
              </p>
            </div>
            <Button
              onClick={handleDownloadLocalBackup}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shrink-0"
            >
              <Download className="h-4 w-4" /> Descargar Backup (.JSON)
            </Button>
          </div>

          {/* Restauración desde archivo local */}
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" /> Restaurar Copia desde Archivo
            </h4>
            <p className="text-xs text-muted-foreground">
              Seleccione un archivo de respaldo generado previamente para recuperar el sistema.
            </p>

            <div className="flex flex-wrap gap-2 items-center pt-1">
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleSelectRestoreFile}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => restoreInputRef.current?.click()}
                className="gap-2"
              >
                <FileJson className="h-4 w-4 text-primary" />
                {restoreFile ? restoreFile.name : 'Seleccionar archivo .JSON'}
              </Button>

              {pendingRestore && (
                <Button
                  onClick={handleConfirmRestore}
                  size="sm"
                  className="bg-destructive hover:bg-destructive/90 text-white gap-1.5"
                >
                  <AlertTriangle className="h-4 w-4" /> Confirmar y Restaurar Datos
                </Button>
              )}
            </div>

            {pendingRestore && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs space-y-1">
                <div className="font-semibold text-destructive">Datos detectados en el archivo:</div>
                <div className="text-muted-foreground">
                  • Fecha de creación: {new Date(pendingRestore.metadata.createdAt).toLocaleString('es-AR')}
                  <br />
                  • {pendingRestore.metadata.totals.products} productos, {pendingRestore.metadata.totals.customers} clientes, {pendingRestore.metadata.totals.sales} ventas.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Tarjeta de Google Drive Cloud Backup */}
      <Card className="border-indigo-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cloud className="h-5 w-5 text-indigo-600" />
              Copia de Seguridad en Google Drive (Nube)
            </CardTitle>
            {isConnected ? (
              <Badge className="bg-emerald-600 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" /> Conectado a Google Drive
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground gap-1">
                <Lock className="h-3 w-3" /> No conectado
              </Badge>
            )}
          </div>
          <CardDescription>
            Respalde automáticamente sus datos en su cuenta personal o corporativa de Google Drive dentro de la carpeta segura <code>Ferreteria_ERP_Backups</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario de conexión */}
          <div className="p-4 bg-muted/40 border rounded-lg space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gdriveClientId">Google Client ID (OAuth 2.0)</Label>
                <Input
                  id="gdriveClientId"
                  placeholder="ej: 123456789-xxxxxx.apps.googleusercontent.com"
                  value={gdriveConfig.clientId}
                  onChange={(e) => setGdriveConfig({ ...gdriveConfig, clientId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gdriveToken">Access Token de Google Drive (o iniciar sesión)</Label>
                <Input
                  id="gdriveToken"
                  type="password"
                  placeholder="Token de acceso (o haga clic en Vincular)"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center pt-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleConnectWithGoogleOAuth}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium"
                >
                  <Cloud className="h-4 w-4" /> Vincular con Google Drive
                </Button>
                <Button variant="outline" onClick={handleSaveGDriveConfig}>
                  Guardar Configuración
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(!showGuide)}
                className="text-xs text-indigo-600 dark:text-indigo-400 gap-1"
              >
                <Info className="h-3.5 w-3.5" />
                {showGuide ? 'Ocultar guía de configuración' : '¿Cómo obtener tu Google Client ID?'}
              </Button>
            </div>

            {/* Guía desplegable */}
            {showGuide && (
              <div className="p-4 bg-background border rounded-md text-xs space-y-2 text-muted-foreground">
                <div className="font-semibold text-foreground text-sm">
                  Pasos para habilitar Google Drive API en Google Cloud Console (2 minutos):
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>
                    Ingresa a{' '}
                    <a
                      href="https://console.cloud.google.com/apis/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline font-medium"
                    >
                      Google Cloud Console
                    </a>{' '}
                    y crea un proyecto (ej: <code>Ferreteria ERP</code>).
                  </li>
                  <li>Dirígete a <strong>"Biblioteca de APIs"</strong> y busca y habilita <strong>"Google Drive API"</strong>.</li>
                  <li>
                    En <strong>"Pantalla de consentimiento de OAuth"</strong>, selecciona tipo <em>Externo</em> y añade tu email.
                  </li>
                  <li>
                    En <strong>"Credenciales"</strong>, haz clic en <strong>"+ Crear credenciales"</strong> $\rightarrow$ <strong>"ID de cliente de OAuth"</strong>.
                  </li>
                  <li>
                    Tipo de aplicación: <strong>"Aplicación web"</strong>. En <em>Orígenes autorizados de JavaScript</em> ingresa:{' '}
                    <code className="bg-muted px-1 py-0.5 rounded text-foreground">{window.location.origin}</code>
                  </li>
                  <li>Copia el <strong>Client ID</strong> generado y pégalo arriba. ¡Listo!</li>
                </ol>
              </div>
            )}
          </div>

          {/* Acciones de Google Drive */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <div>
              <h4 className="font-semibold text-sm text-foreground">Subir Copia a la Nube Ahora</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Almacena una copia snapshot en la carpeta <code>Ferreteria_ERP_Backups</code> de tu Google Drive.
              </p>
              {gdriveConfig.lastBackupDate && (
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                  Último respaldo en la nube:{' '}
                  {new Date(gdriveConfig.lastBackupDate).toLocaleString('es-AR')}
                </div>
              )}
            </div>

            <Button
              onClick={handleUploadToGoogleDrive}
              disabled={isUploadingGDrive || !isConnected}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shrink-0"
            >
              {isUploadingGDrive ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Subiendo a Drive...
                </>
              ) : (
                <>
                  <CloudUpload className="h-4 w-4" /> Subir a Google Drive
                </>
              )}
            </Button>
          </div>

          {/* Lista de copias en Google Drive */}
          {isConnected && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Cloud className="h-4 w-4 text-indigo-600" /> Copias disponibles en tu Google Drive
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadGoogleDriveFiles(tokenInput)}
                  disabled={isLoadingGDriveFiles}
                  className="text-xs gap-1 text-muted-foreground"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingGDriveFiles ? 'animate-spin' : ''}`} />
                  Refrescar lista
                </Button>
              </div>

              {gdriveFiles.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground border rounded-lg bg-muted/20">
                  {isLoadingGDriveFiles
                    ? 'Consultando Google Drive...'
                    : 'Aún no hay copias subidas en la carpeta Ferreteria_ERP_Backups.'}
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden divide-y text-xs">
                  {gdriveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-muted/30"
                    >
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <FileJson className="h-4 w-4 text-indigo-600 shrink-0" />
                          {file.name}
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          Subido: {new Date(file.createdTime).toLocaleString('es-AR')} •{' '}
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-7 text-xs text-muted-foreground gap-1"
                          >
                            <a href={file.webViewLink} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3" /> Ver en Drive
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestoreFromGoogleDrive(file)}
                          className="h-7 text-xs text-indigo-600 hover:text-indigo-700 border-indigo-200"
                        >
                          Restaurar Sistema
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
