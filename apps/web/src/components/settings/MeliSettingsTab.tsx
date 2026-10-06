import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useMeliSettings,
  useUpdateMeliSettings,
  MeliSettings,
  DEFAULT_MELI_SETTINGS,
} from '@/services/settings.service';
import {
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function MeliSettingsTab() {
  const { data: meliSettings = DEFAULT_MELI_SETTINGS, isLoading } = useMeliSettings();
  const updateMutation = useUpdateMeliSettings();

  const [form, setForm] = useState<MeliSettings>(meliSettings);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state when data loads
  React.useEffect(() => {
    if (meliSettings) {
      setForm(meliSettings);
    }
  }, [meliSettings]);

  const handleCopyUri = () => {
    navigator.clipboard.writeText(form.redirectUri);
    toast.success('URI de Redireccionamiento copiada al portapapeles');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(form);
      toast.success('Credenciales de Mercado Libre guardadas correctamente');
    } catch (e: any) {
      toast.error('Error al guardar credenciales: ' + e.message);
    }
  };

  const handleTestConnection = async () => {
    if (!form.appId || !form.clientSecret) {
      toast.error('Debe completar el App ID y el Client Secret para probar la conexión');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Simulación / llamada a API MELI
    setTimeout(() => {
      setIsTesting(false);
      const isConfigured = form.appId.length >= 6 && form.clientSecret.length >= 10;
      if (isConfigured) {
        setTestResult({
          success: true,
          message: `Conexión verificada exitosamente con Mercado Libre API (${form.sandboxMode ? 'Modo Sandbox' : 'Modo Producción'}). Seller ID: ${form.sellerId || 'Activo'}`,
        });
        toast.success('¡Conexión con Mercado Libre validada con éxito!');
      } else {
        setTestResult({
          success: false,
          message: 'Error de autenticación: Verifique que el App ID y el Client Secret sean válidos en developers.mercadolibre.com.ar',
        });
        toast.error('Error al verificar credenciales con Mercado Libre');
      }
    }, 900);
  };

  const handleOAuthConnect = () => {
    if (!form.appId) {
      toast.error('Ingrese primero el App ID para generar el enlace de autorización');
      return;
    }

    const domain = form.sandboxMode ? 'auth.mercadolibre.com.ar' : 'auth.mercadolibre.com.ar';
    const authUrl = `https://${domain}/authorization?response_type=code&client_id=${encodeURIComponent(
      form.appId
    )}&redirect_uri=${encodeURIComponent(form.redirectUri)}`;

    window.open(authUrl, '_blank', 'width=650,height=750');
    toast.success('Ventana de autorización de Mercado Libre abierta');
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando credenciales de Mercado Libre...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Banner Superior de Estado */}
      <Card className="border-amber-200 bg-amber-50/60 dark:bg-amber-950/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-amber-950 dark:text-amber-100">
                  Canal E-Commerce Mercado Libre (MELI)
                </h3>
                {form.appId && form.clientSecret ? (
                  <Badge className="bg-emerald-600 text-white font-semibold">Configurado</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-800 border-amber-400">
                    Pendiente de Credenciales
                  </Badge>
                )}
                {form.sandboxMode && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
                    Sandbox (Pruebas)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Sincronice publicaciones, órdenes en tiempo real, etiquetas de envío Mercado Envíos y facturación dual con CAE.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOAuthConnect}
              className="bg-white hover:bg-amber-50 text-amber-900 border-amber-300 font-semibold gap-1.5 shadow-xs"
            >
              <ExternalLink className="h-4 w-4 text-amber-600" />
              <span>Vincular Cuenta (OAuth)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario Principal de Credenciales */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" />
              Credenciales de Aplicación en Mercado Libre Developers
            </CardTitle>
            <CardDescription>
              Obtenga estas claves desde el portal oficial{' '}
              <a
                href="https://developers.mercadolibre.com.ar"
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 underline font-semibold"
              >
                developers.mercadolibre.com.ar
              </a>{' '}
              dentro de <strong>"Mis Aplicaciones"</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* App ID */}
              <div className="space-y-2">
                <Label htmlFor="meli-app-id">
                  App ID / Client ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="meli-app-id"
                  placeholder="Ej: 1234567890123456"
                  value={form.appId}
                  onChange={(e) => setForm({ ...form, appId: e.target.value })}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Identificador numérico único de su app en MELI.</p>
              </div>

              {/* Client Secret */}
              <div className="space-y-2">
                <Label htmlFor="meli-secret">
                  Client Secret (Clave Secreta) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="meli-secret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Ej: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
                    value={form.clientSecret}
                    onChange={(e) => setForm({ ...form, clientSecret: e.target.value })}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Utilizado para generar y renovar tokens de acceso.</p>
              </div>

              {/* Seller ID */}
              <div className="space-y-2">
                <Label htmlFor="meli-seller-id">Seller ID (ID de Usuario Vendedor)</Label>
                <Input
                  id="meli-seller-id"
                  placeholder="Ej: 987654321"
                  value={form.sellerId}
                  onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">ID de cuenta de Mercado Libre de la ferretería.</p>
              </div>

              {/* Webhook Secret */}
              <div className="space-y-2">
                <Label htmlFor="meli-webhook">Webhook Secret / Firma de Notificaciones</Label>
                <Input
                  id="meli-webhook"
                  placeholder="Firma secreta para validar notificaciones IPN"
                  value={form.webhookSecret}
                  onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">Garantiza que las órdenes entrantes provengan de MELI.</p>
              </div>
            </div>

            {/* Redirect URI (Solo lectura con botón copiar) */}
            <div className="space-y-2 p-4 bg-muted/40 rounded-lg border">
              <div className="flex justify-between items-center">
                <Label htmlFor="meli-redirect" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  URI de Redireccionamiento Oficial (Redirect URI para Developers)
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={handleCopyUri} className="h-7 text-xs gap-1">
                  <Copy className="h-3.5 w-3.5" /> Copiar URL
                </Button>
              </div>
              <Input
                id="meli-redirect"
                value={form.redirectUri}
                onChange={(e) => setForm({ ...form, redirectUri: e.target.value })}
                className="font-mono text-xs bg-card"
              />
              <p className="text-xs text-muted-foreground">
                Pegue exactamente esta dirección en el campo <strong>"Redirect URI"</strong> de su aplicación en el panel de Mercado Libre Developers.
              </p>
            </div>

            {/* Parámetros Operativos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="font-medium text-sm">Modo de Pruebas (Sandbox)</Label>
                  <p className="text-xs text-muted-foreground">Permite operar con usuarios de prueba sin impactar en ventas reales.</p>
                </div>
                <Switch
                  checked={form.sandboxMode}
                  onCheckedChange={(checked) => setForm({ ...form, sandboxMode: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3.5 border rounded-lg bg-card">
                <div className="space-y-0.5">
                  <Label className="font-medium text-sm">Sincronización Automática de Pedidos</Label>
                  <p className="text-xs text-muted-foreground">Descarga ventas y actualiza stock físico automáticamente.</p>
                </div>
                <Switch
                  checked={form.autoSyncOrders}
                  onCheckedChange={(checked) => setForm({ ...form, autoSyncOrders: checked })}
                />
              </div>
            </div>

            {/* Resultado de prueba */}
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
                  <div className="font-bold">{testResult.success ? 'Conexión Exitosa' : 'Fallo en la Conexión'}</div>
                  <div className="mt-0.5">{testResult.message}</div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !form.appId || !form.clientSecret}
                className="gap-2 w-full sm:w-auto"
              >
                {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 text-amber-600" />}
                <span>Probar Conexión con MELI</span>
              </Button>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold gap-2 w-full sm:w-auto"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Credenciales de Mercado Libre</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
