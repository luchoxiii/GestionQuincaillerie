import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useEmailSettings,
  useUpdateEmailSettings,
  EmailSettings,
  DEFAULT_EMAIL_SETTINGS,
} from '@/services/settings.service';
import {
  sendTestEmail,
  getSentEmailsHistory,
  EmailDispatchRecord,
} from '@/services/email-notification.service';
import {
  Mail,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Server,
  Inbox,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function EmailSettingsTab() {
  const { data: emailSettings = DEFAULT_EMAIL_SETTINGS, isLoading } = useEmailSettings();
  const updateMutation = useUpdateEmailSettings();

  const [form, setForm] = useState<EmailSettings>(emailSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailDispatchRecord[]>([]);

  useEffect(() => {
    if (emailSettings) {
      setForm(emailSettings);
      if (!testEmailTarget && emailSettings.fromEmail) {
        setTestEmailTarget(emailSettings.fromEmail);
      }
    }
    setEmailHistory(getSentEmailsHistory());
  }, [emailSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      toast.success('Configuración del correo de la empresa guardada exitosamente');
    } catch (e: any) {
      toast.error('Error al guardar la configuración: ' + e.message);
    }
  };

  const handleSendTest = async () => {
    if (!testEmailTarget || !testEmailTarget.includes('@')) {
      toast.error('Ingrese un email de destino válido');
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await sendTestEmail(testEmailTarget, form);
      setTestResult(res);
      setEmailHistory(getSentEmailsHistory());
      toast.success(res.message);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Error al enviar el correo de prueba',
      });
      toast.error(err.message || 'Error en el envío');
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando configuración de correo...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner Superior Informativo */}
      <Card className="border-blue-200 bg-blue-50/60 dark:bg-blue-950/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-xl">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-blue-950 dark:text-blue-100">
                  Servicio de Notificaciones y Comprobantes por Email
                </h3>
                <Badge className="bg-blue-600 text-white font-semibold">SMTP Corporativo</Badge>
              </div>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                Emita automáticamente por correo los tickets y facturas oficiales a los clientes al momento de cerrar la venta en mostrador o POS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Configuración SMTP */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              Parámetros de Servidor SMTP & Remitente
            </CardTitle>
            <CardDescription>
              Configure el servidor de correo saliente de la ferretería (Gmail, Outlook, Hostinger o servidor privado).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Servidor SMTP */}
              <div className="space-y-2">
                <Label htmlFor="smtp-host">
                  Servidor SMTP (Host) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtp-host"
                  placeholder="Ej: smtp.gmail.com o mail.ferreteria.com"
                  value={form.smtpHost}
                  onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Dirección del host para el despacho de correos.</p>
              </div>

              {/* Puerto SMTP & Seguridad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">
                    Puerto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="smtp-port"
                    type="number"
                    placeholder="587"
                    value={form.smtpPort}
                    onChange={(e) => setForm({ ...form, smtpPort: Number(e.target.value) })}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">587 (TLS) o 465 (SSL).</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp-secure">Seguridad</Label>
                  <Select
                    value={form.secure}
                    onValueChange={(val: any) => setForm({ ...form, secure: val })}
                  >
                    <SelectTrigger id="smtp-secure">
                      <SelectValue placeholder="Seguridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">STARTTLS (587)</SelectItem>
                      <SelectItem value="ssl">SSL / TLS (465)</SelectItem>
                      <SelectItem value="none">Sin cifrado (25)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Protocolo de cifrado.</p>
                </div>
              </div>

              {/* Usuario / Email de Autenticación */}
              <div className="space-y-2">
                <Label htmlFor="smtp-user">
                  Usuario SMTP / Correo de Conexión <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="smtp-user"
                  type="email"
                  placeholder="ventas@ferreteriacentral.com.ar"
                  value={form.smtpUser}
                  onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Cuenta con la que se autentica ante el servidor.</p>
              </div>

              {/* Contraseña o Token de Aplicación */}
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">Contraseña o Clave de Aplicación</Label>
                <div className="relative">
                  <Input
                    id="smtp-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={form.smtpPassword || ''}
                    onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Para Gmail, utilice una <em>Contraseña de Aplicación</em> de 16 caracteres.
                </p>
              </div>

              {/* Nombre de Remitente Visible */}
              <div className="space-y-2">
                <Label htmlFor="from-name">Nombre del Remitente Visible para Clientes</Label>
                <Input
                  id="from-name"
                  placeholder="Ferretería Central - Facturación"
                  value={form.fromName}
                  onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Nombre que verá el cliente en su bandeja de entrada.</p>
              </div>

              {/* Correo Remitente */}
              <div className="space-y-2">
                <Label htmlFor="from-email">Dirección de Envío (From Email)</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="no-reply@ferreteriacentral.com.ar"
                  value={form.fromEmail}
                  onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Dirección que figurará como emisora del mensaje.</p>
              </div>
            </div>

            {/* Opciones Adicionales de Despacho */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="font-medium text-sm">Enviar Comprobante al Cliente Automáticamente</Label>
                  <p className="text-xs text-muted-foreground">
                    Si el cliente posee email cargado, envía el comprobante digital tras confirmar la venta.
                  </p>
                </div>
                <Switch
                  checked={form.sendReceiptOnSale}
                  onCheckedChange={(checked) => setForm({ ...form, sendReceiptOnSale: checked })}
                />
              </div>

              <div className="space-y-2 p-3.5 border rounded-lg bg-card">
                <Label htmlFor="admin-bcc" className="font-medium text-sm">
                  Copia Oculta a Administración (BCC)
                </Label>
                <Input
                  id="admin-bcc"
                  type="email"
                  placeholder="auditoria@ferreteria.com"
                  value={form.adminBccEmail}
                  onChange={(e) => setForm({ ...form, adminBccEmail: e.target.value })}
                  className="h-8 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">Reciba un duplicado silencioso de cada venta emitida.</p>
              </div>
            </div>

            {/* Guardar Configuración */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Configuración de Correo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Tarjeta de Prueba de Envío en Vivo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-5 w-5 text-emerald-600" />
            Comprobación de Envío en Vivo
          </CardTitle>
          <CardDescription>
            Envíe un mensaje de prueba inmediato a cualquier casilla para verificar que las credenciales funcionen correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Ingrese un correo para recibir la prueba..."
              value={testEmailTarget}
              onChange={(e) => setTestEmailTarget(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest || !testEmailTarget}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shrink-0"
            >
              {isSendingTest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>Enviar Correo de Prueba</span>
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{testResult.success ? 'Envío Exitoso' : 'Error en el Envío'}</div>
                <div className="mt-0.5">{testResult.message}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historial Reciente de Correos Despachados */}
      {emailHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Últimos Comprobantes Despachados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y border rounded-lg overflow-hidden bg-card text-xs">
              {emailHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>{item.to}</span>
                      <Badge variant="outline" className={item.status === 'SENT' ? 'text-emerald-700 border-emerald-300 bg-emerald-50' : 'text-blue-700 border-blue-300 bg-blue-50'}>
                        {item.status === 'SENT' ? 'Enviado SMTP' : 'Registrado Digital'}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{item.subject}</div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground shrink-0">
                    {new Date(item.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
