import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm as useRHForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Save, Building2, Cloud, ShoppingBag, Mail, Coins, DollarSign, Store as StoreIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackupSettingsTab } from '@/components/settings/BackupSettingsTab';
import { MeliSettingsTab } from '@/components/settings/MeliSettingsTab';
import { EmailSettingsTab } from '@/components/settings/EmailSettingsTab';
import { StoresSettingsTab } from '@/components/settings/StoresSettingsTab';
import {
  useSettings,
  useUpdateSettings,
  CompanySettings,
  AVAILABLE_CURRENCIES,
  DEFAULT_CURRENCY,
} from '../../services/settings.service';
import { formatCurrency } from '@/lib/utils';

const settingsSchema = z.object({
  businessName: z.string().min(2, 'Obligatorio'),
  fantasyName: z.string().min(2, 'Obligatorio'),
  cuit: z.string().min(11, 'CUIT inválido'),
  ivaCondition: z.string().min(1, 'Obligatorio'),
  grossIncome: z.string().min(1, 'Obligatorio'),
  activityStartDate: z.string().min(1, 'Obligatorio'),
  address: z.string().min(5, 'Obligatorio'),
  phone: z.string().min(6, 'Obligatorio'),
  email: z.string().email('Email inválido'),
  defaultPos: z.string().min(4, 'Debe ser de 4 dígitos Ej: 0001'),
  currencyCode: z.string().optional(),
  currencyName: z.string().optional(),
  currencySymbol: z.string().optional(),
  currencyLocale: z.string().optional(),
  currencyDecimals: z.coerce.number().min(0).max(4).optional(),
  dollarExchangeRate: z.coerce.number().min(0.01, 'Debe ser mayor a 0').optional(),
});

export default function SettingsPage() {
  const { data: currentSettings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useRHForm<CompanySettings>({
    resolver: zodResolver(settingsSchema),
  });

  const selectedCurrencyCode = watch('currencyCode') || DEFAULT_CURRENCY.code;
  const watchedSymbol = watch('currencySymbol') || DEFAULT_CURRENCY.symbol;
  const watchedLocale = watch('currencyLocale') || DEFAULT_CURRENCY.locale;
  const watchedDecimals = watch('currencyDecimals') !== undefined ? Number(watch('currencyDecimals')) : DEFAULT_CURRENCY.decimals;

  const handleCurrencySelect = (code: string) => {
    const preset = AVAILABLE_CURRENCIES.find((c) => c.code === code);
    if (preset) {
      setValue('currencyCode', preset.code, { shouldDirty: true });
      setValue('currencyName', preset.name, { shouldDirty: true });
      setValue('currencySymbol', preset.symbol, { shouldDirty: true });
      setValue('currencyLocale', preset.locale, { shouldDirty: true });
      setValue('currencyDecimals', preset.decimals, { shouldDirty: true });
    }
  };

  useEffect(() => {
    if (currentSettings) {
      reset(currentSettings);
    }
  }, [currentSettings, reset]);

  const onSubmit = async (data: CompanySettings) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success('Configuración guardada correctamente');
    } catch (error) {
      toast.error('Error al guardar la configuración');
    }
  };

  if (isLoading) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h2>
        <p className="text-muted-foreground">Administre los datos fiscales, parámetros comerciales y copias de seguridad de la ferretería.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="stores" className="gap-2">
            <StoreIcon className="h-4 w-4 text-emerald-600" /> Tiendas
          </TabsTrigger>
          <TabsTrigger value="meli" className="gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-600" /> Mercado Libre
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4 text-blue-600" /> Correo
          </TabsTrigger>
          <TabsTrigger value="backups" className="gap-2">
            <Cloud className="h-4 w-4 text-indigo-600" /> Backups
          </TabsTrigger>
        </TabsList>


        <TabsContent value="company">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Datos Fiscales y Comerciales</CardTitle>
                <CardDescription>Esta información será utilizada en la facturación y reportes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Razón Social</Label>
                    <Input id="businessName" {...register('businessName')} />
                    {errors.businessName && <span className="text-xs text-red-500">{errors.businessName.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fantasyName">Nombre de Fantasía</Label>
                    <Input id="fantasyName" {...register('fantasyName')} />
                    {errors.fantasyName && <span className="text-xs text-red-500">{errors.fantasyName.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cuit">CUIT (con guiones)</Label>
                    <Input id="cuit" placeholder="30-12345678-9" {...register('cuit')} />
                    {errors.cuit && <span className="text-xs text-red-500">{errors.cuit.message}</span>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ivaCondition">Condición frente al IVA</Label>
                    <Select defaultValue={currentSettings?.ivaCondition} onValueChange={(val) => setValue('ivaCondition', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                        <SelectItem value="Monotributo">Monotributo</SelectItem>
                        <SelectItem value="Exento">Exento</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.ivaCondition && <span className="text-xs text-red-500">{errors.ivaCondition.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grossIncome">Ingresos Brutos (Nro. Inscripción)</Label>
                    <Input id="grossIncome" {...register('grossIncome')} />
                    {errors.grossIncome && <span className="text-xs text-red-500">{errors.grossIncome.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activityStartDate">Inicio de Actividades</Label>
                    <Input id="activityStartDate" type="date" {...register('activityStartDate')} />
                    {errors.activityStartDate && <span className="text-xs text-red-500">{errors.activityStartDate.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Domicilio Comercial</Label>
                    <Input id="address" {...register('address')} />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono de Contacto</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultPos">Punto de Venta Predeterminado</Label>
                    <Input id="defaultPos" placeholder="0001" {...register('defaultPos')} />
                    {errors.defaultPos && <span className="text-xs text-red-500">{errors.defaultPos.message}</span>}
                  </div>
                </div>

                {/* CONFIGURACIÓN DE MONEDA Y FORMATO REGIONAL */}
                <div className="pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Coins className="h-5 w-5 text-emerald-600" />
                        Moneda Comercial & Formato Regional
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Configure la moneda principal que se utilizará en el punto de venta (POS), catálogo de artículos, comprobantes térmicos e informes.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-4 rounded-lg border">
                    <div className="space-y-2">
                      <Label htmlFor="currencyPreset">Moneda Predefinida</Label>
                      <Select
                        value={selectedCurrencyCode}
                        onValueChange={(val) => handleCurrencySelect(val)}
                      >
                        <SelectTrigger id="currencyPreset">
                          <SelectValue placeholder="Seleccionar moneda..." />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-xs text-muted-foreground">
                        Auto-completa el símbolo, formato regional y decimales estándar.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currencySymbol">Símbolo Visible</Label>
                      <Input
                        id="currencySymbol"
                        placeholder="$"
                        {...register('currencySymbol')}
                      />
                      <span className="text-xs text-muted-foreground">
                        Ej: $, US$, €, R$, Gs.
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currencyCode">Código ISO 4217</Label>
                      <Input
                        id="currencyCode"
                        placeholder="ARS"
                        {...register('currencyCode')}
                      />
                      <span className="text-xs text-muted-foreground">
                        Ej: ARS, USD, EUR, CLP, BRL
                      </span>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currencyDecimals">Cantidad de Decimales</Label>
                      <Input
                        id="currencyDecimals"
                        type="number"
                        min="0"
                        max="4"
                        placeholder="2"
                        {...register('currencyDecimals')}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2 bg-background/80 p-3.5 rounded-md border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="dollarExchangeRate" className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                          Cotización Dólar Referencia / Tipo de Cambio ($/USD)
                        </Label>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                          Presupuestos & Cotizaciones
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">$</span>
                          <Input
                            id="dollarExchangeRate"
                            type="number"
                            step="any"
                            min="0.01"
                            className="pl-7 font-mono font-bold text-slate-900 dark:text-slate-100"
                            placeholder="1350.00"
                            {...register('dollarExchangeRate')}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          pesos por cada 1.00 USD
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cotización sugerida por defecto al confeccionar cotizaciones en dólares para clientes y calcular equivalencias comerciales en presupuestos y mostrador.
                      </p>
                    </div>
                  </div>

                  {/* VISTA PREVIA EN VIVO */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                        Vista Previa en Vivo:
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Así se verán los precios en el mostrador del POS, tickets y reportes.
                      </p>
                    </div>
                    <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(12450.5, {
                        code: selectedCurrencyCode,
                        symbol: watchedSymbol,
                        locale: watchedLocale,
                        decimals: watchedDecimals,
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="stores">
          <StoresSettingsTab />
        </TabsContent>

        <TabsContent value="meli">
          <MeliSettingsTab />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettingsTab />
        </TabsContent>

        <TabsContent value="backups">
          <BackupSettingsTab />
        </TabsContent>
      </Tabs>

    </div>
  );
}
