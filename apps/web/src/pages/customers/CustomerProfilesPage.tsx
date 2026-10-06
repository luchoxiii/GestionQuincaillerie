import React, { useState, useMemo } from 'react';
import { 
  useCustomerProfiles, 
  CustomerProfile, 
  exportMLDatasetCsv, 
  exportMarketingAudienceCsv 
} from '@/services/customer-analytics.service';
import { 
  useCoupons, 
  useUpdateCoupon, 
  useDeleteCoupon, 
  exportCouponsCsv, 
  Coupon 
} from '@/services/coupons.service';
import { CustomerProfileModal } from './CustomerProfileModal';
import { NewCouponModal } from '@/components/coupons/NewCouponModal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  Download, 
  Search, 
  Eye, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  ArrowLeft,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Gift,
  Tag,
  Copy,
  Check,
  Power,
  Trash2,
  ShoppingCart,
  PlusCircle,
  Percent
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CustomerProfilesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<CustomerProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Coupons state
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [couponSegmentFilter, setCouponSegmentFilter] = useState<string>('all');
  const [couponStatusFilter, setCouponStatusFilter] = useState<string>('all');
  const [isNewCouponModalOpen, setIsNewCouponModalOpen] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  const { data: coupons = [], isLoading: isLoadingCoupons } = useCoupons();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const { data: profiles = [], isLoading } = useCustomerProfiles({
    search: searchTerm,
    segment: selectedSegment,
    riskLevel: selectedRisk,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === '30d') {
      const past = new Date(today.getTime() - 30 * 86400000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === '90d') {
      const past = new Date(today.getTime() - 90 * 86400000);
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'year') {
      const yearStart = `${today.getFullYear()}-01-01`;
      setStartDate(yearStart);
      setEndDate(todayStr);
    }
  };

  // Calculate executive KPIs
  const totalAnalyzed = profiles.length;
  const highRiskCount = profiles.filter((p) => p.churn.riskLevel === 'HIGH' || p.churn.riskLevel === 'CHURNED').length;
  const totalLTV = profiles.reduce((acc, p) => acc + p.rfm.monetaryLtv, 0);
  const avgLTV = totalAnalyzed > 0 ? totalLTV / totalAnalyzed : 0;
  const avgChurnScore = totalAnalyzed > 0 ? Math.round(profiles.reduce((acc, p) => acc + p.churn.score, 0) / totalAnalyzed) : 0;

  const handleOpenProfile = (profile: CustomerProfile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const handleExportMLDataset = () => {
    if (profiles.length === 0) {
      toast.error('No hay perfiles disponibles para exportar el dataset');
      return;
    }
    const dateRange = (startDate || endDate) ? { startDate, endDate } : undefined;
    exportMLDatasetCsv(profiles, dateRange);
    const rangeMsg = (startDate || endDate)
      ? ` (Período: ${startDate || 'Histórico'} al ${endDate || 'Hoy'})`
      : ' (Histórico completo)';
    toast.success(`Dataset ML exportado (${profiles.length} registros y 22 columnas)${rangeMsg}`);
  };

  const handleExportMarketingAudience = () => {
    if (profiles.length === 0) {
      toast.error('No hay perfiles para exportar');
      return;
    }
    const dateRange = (startDate || endDate) ? { startDate, endDate } : undefined;
    exportMarketingAudienceCsv(profiles, dateRange);
    const rangeMsg = (startDate || endDate)
      ? ` (Período: ${startDate || 'Histórico'} al ${endDate || 'Hoy'})`
      : ' (Histórico completo)';
    toast.success(`Audiencia de marketing exportada (${profiles.length} contactos)${rangeMsg}`);
  };

  // Coupon KPIs & calculations
  const activeCouponsCount = coupons.filter(c => c.isActive).length;
  const totalCouponsDiscount = coupons.reduce((acc, c) => acc + (c.totalDiscountGiven || 0), 0);
  const totalCouponsRevenue = coupons.reduce((acc, c) => acc + (c.totalRevenueGenerated || 0), 0);
  const totalCouponsUses = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesSearch = !couponSearchTerm || 
        c.code.toLowerCase().includes(couponSearchTerm.toLowerCase()) || 
        c.description.toLowerCase().includes(couponSearchTerm.toLowerCase());
      
      const matchesSegment = couponSegmentFilter === 'all' || 
        c.targetSegment === couponSegmentFilter || 
        c.targetSegment === 'ALL';
      
      const matchesStatus = couponStatusFilter === 'all' || 
        (couponStatusFilter === 'active' ? c.isActive : !c.isActive);

      return matchesSearch && matchesSegment && matchesStatus;
    });
  }, [coupons, couponSearchTerm, couponSegmentFilter, couponStatusFilter]);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    toast.success(`Código "${code}" copiado al portapapeles`);
    setTimeout(() => setCopiedCouponCode(null), 2500);
  };

  const handleToggleCouponStatus = async (coupon: Coupon) => {
    try {
      await updateCoupon.mutateAsync({
        id: coupon.id,
        data: { isActive: !coupon.isActive }
      });
      toast.success(`Cupón "${coupon.code}" ${!coupon.isActive ? 'activado' : 'pausado'}`);
    } catch {
      toast.error('Error al cambiar estado del cupón');
    }
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    if (confirm(`¿Está seguro de eliminar el cupón "${coupon.code}"?`)) {
      try {
        await deleteCoupon.mutateAsync(coupon.id);
        toast.success(`Cupón "${coupon.code}" eliminado`);
      } catch {
        toast.error('Error al eliminar cupón');
      }
    }
  };

  const getSegmentBadge = (segment: string, label: string) => {
    switch (segment) {
      case 'VIP':
        return <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold hover:bg-amber-100">🌟 {label}</Badge>;
      case 'BIG_BUILDER':
        return <Badge className="bg-blue-100 text-blue-900 border-blue-300 font-bold hover:bg-blue-100">🏗️ {label}</Badge>;
      case 'LOYAL_POTENTIAL':
        return <Badge className="bg-indigo-100 text-indigo-900 border-indigo-300 font-medium hover:bg-indigo-100">💎 {label}</Badge>;
      case 'AT_RISK':
        return <Badge className="bg-orange-100 text-orange-900 border-orange-300 font-bold hover:bg-orange-100">⚠️ {label}</Badge>;
      case 'HIBERNATING':
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300 font-medium hover:bg-slate-100">💤 {label}</Badge>;
      case 'NEW':
        return <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-medium hover:bg-emerald-100">🌱 {label}</Badge>;
      default:
        return <Badge variant="outline">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')} className="text-xs px-2 text-slate-500">
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver a Clientes
            </Button>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <Brain className="h-7 w-7 text-indigo-600" />
            Marketing, Churn & Cupones
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Segmentación RFM, cálculo predictivo de riesgo de churn (abandono) y gestión de cupones y promociones comerciales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'profiles' ? (
            <>
              {/* Export ML Dataset */}
              <Button 
                onClick={handleExportMLDataset} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Dataset ML (CSV)
              </Button>

              {/* Export Marketing Audience */}
              <Button 
                variant="outline" 
                onClick={handleExportMarketingAudience}
                className="border-indigo-300 text-indigo-900 bg-indigo-50 hover:bg-indigo-100 font-medium"
              >
                <Share2 className="mr-2 h-4 w-4 text-indigo-600" />
                Descargar Audiencia Marketing (CSV)
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setIsNewCouponModalOpen(true)} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Crear Nuevo Cupón
              </Button>

              <Button 
                variant="outline" 
                onClick={() => exportCouponsCsv(coupons)}
                className="border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-medium gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                Exportar Reporte de Cupones (CSV)
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="profiles" className="gap-2">
            <Brain className="h-4 w-4" /> Perfiles & Churn (RFM)
          </TabsTrigger>
          <TabsTrigger value="coupons" className="gap-2">
            <Gift className="h-4 w-4 text-emerald-600" /> Cupones & Promociones
            {coupons.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                {coupons.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Clientes Analizados
            </CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalAnalyzed}</div>
            <p className="text-xs text-slate-500 mt-1">
              Base de clientes con compras cruzadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-900">
              En Riesgo / Churned
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-900">{highRiskCount}</div>
            <p className="text-xs text-rose-700 mt-1">
              {totalAnalyzed > 0 ? Math.round((highRiskCount / totalAnalyzed) * 100) : 0}% de la cartera en alerta
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              LTV Promedio (Valor de Vida)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              {formatCurrency(avgLTV)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gasto total medio por cliente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Score de Riesgo Global
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{avgChurnScore}%</div>
            <p className="text-xs text-slate-500 mt-1">
              Promedio ponderado de inactividad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold">Matriz de Perfiles & Riesgo de Abandono</CardTitle>
            <div className="text-xs text-slate-500 font-medium">
              Mostrando <strong>{profiles.length}</strong> clientes procesados
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div>
              <Label className="text-xs">Buscar Cliente o Documento</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-8 h-9 text-xs"
                  placeholder="Buscar en lenguaje natural (ej. 'con deuda', 'Constructora')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Segmento de Marketing</Label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Todos los segmentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los segmentos</SelectItem>
                  <SelectItem value="VIP">🌟 Clientes VIP / Campeones</SelectItem>
                  <SelectItem value="BIG_BUILDER">🏗️ Grandes Constructores</SelectItem>
                  <SelectItem value="LOYAL_POTENTIAL">💎 Potenciales Leales</SelectItem>
                  <SelectItem value="AT_RISK">⚠️ En Riesgo de Churn</SelectItem>
                  <SelectItem value="HIBERNATING">💤 Inactivos / Hibernando</SelectItem>
                  <SelectItem value="NEW">🌱 Nuevos Clientes</SelectItem>
                  <SelectItem value="OCCASIONAL">Compradores Ocasionales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Nivel de Riesgo de Churn</Label>
              <Select value={selectedRisk} onValueChange={setSelectedRisk}>
                <SelectTrigger className="h-9 text-xs mt-1">
                  <SelectValue placeholder="Todos los niveles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="LOW">Bajo Riesgo (0-35%)</SelectItem>
                  <SelectItem value="MEDIUM">Riesgo Medio (36-70%)</SelectItem>
                  <SelectItem value="HIGH">Alto Riesgo (71-85%)</SelectItem>
                  <SelectItem value="CHURNED">Churn Confirmado (&gt;85%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range for Analysis & Export */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 mb-5 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Período de Análisis y Exportación de Datos:
                </span>
                {(startDate || endDate) ? (
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs font-semibold">
                    📅 Desde {startDate ? new Date(startDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Inicio'} hasta {endDate ? new Date(endDate + 'T00:00:00').toLocaleDateString('es-AR') : 'Hoy'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 text-xs font-medium">
                    Histórico Completo (Todas las transacciones)
                  </Badge>
                )}
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  variant={datePreset === 'all' && !startDate && !endDate ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyDatePreset('all')}
                >
                  Histórico
                </Button>
                <Button
                  type="button"
                  variant={datePreset === '30d' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyDatePreset('30d')}
                >
                  Últimos 30d
                </Button>
                <Button
                  type="button"
                  variant={datePreset === '90d' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyDatePreset('90d')}
                >
                  Últimos 90d
                </Button>
                <Button
                  type="button"
                  variant={datePreset === 'year' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs px-2.5"
                  onClick={() => applyDatePreset('year')}
                >
                  Año Actual
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <Label className="text-xs text-slate-600 font-medium">Fecha Desde (Inicio de Ventas)</Label>
                <Input
                  type="date"
                  className="h-8 text-xs mt-1 bg-white"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 font-medium">Fecha Hasta (Corte de Ventas)</Label>
                <Input
                  type="date"
                  className="h-8 text-xs mt-1 bg-white"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                />
              </div>
              <div className="flex items-end">
                {(startDate || endDate) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-slate-600 hover:text-slate-900"
                    onClick={() => applyDatePreset('all')}
                  >
                    Restablecer Fechas
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Cliente / Razón Social</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead className="text-center">Recencia</TableHead>
                  <TableHead className="text-center">Frecuencia</TableHead>
                  <TableHead className="text-right">LTV Total</TableHead>
                  <TableHead className="text-right">Ticket Prom.</TableHead>
                  <TableHead>Rubro Favorito</TableHead>
                  <TableHead className="w-[180px]">Score de Churn</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => {
                  const churnScore = p.churn.score;
                  const barColor = 
                    churnScore < 35 
                      ? 'bg-emerald-500' 
                      : churnScore < 70 
                        ? 'bg-amber-500' 
                        : churnScore < 85 
                          ? 'bg-orange-500' 
                          : 'bg-rose-600';

                  return (
                    <TableRow key={p.customer.id} className="hover:bg-slate-50/80">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">{p.customer.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {p.customer.documentType || 'DOC'}: {p.customer.documentNumber || p.customer.documentNum || 'S/N'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getSegmentBadge(p.marketing.segment, p.marketing.segmentLabel)}
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        <span className="font-semibold text-slate-900">{p.rfm.recencyDays}</span>
                        <span className="text-[10px] text-slate-500 block">días</span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        <span className="font-semibold text-slate-900">{p.rfm.frequency}</span>
                        <span className="text-[10px] text-slate-500 block">pedidos</span>
                      </TableCell>

                      <TableCell className="text-right font-bold text-xs text-indigo-700 font-mono">
                        {formatCurrency(p.rfm.monetaryLtv)}
                      </TableCell>

                      <TableCell className="text-right font-medium text-xs text-slate-700 font-mono">
                        {formatCurrency(p.rfm.averageOrderValue)}
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border text-[11px]">
                          {p.marketing.preferredCategory}
                        </span>
                      </TableCell>

                      {/* Churn Risk Bar */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={churnScore >= 70 ? 'text-rose-600' : 'text-slate-700'}>
                              {p.churn.label.split(' ')[0]} {p.churn.label.split(' ')[1] || ''}
                            </span>
                            <span className="font-mono">{churnScore}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${churnScore}%` }} />
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenProfile(p)}
                          className="h-8 text-xs text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Perfil 360°
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {profiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-slate-500">
                      {isLoading ? 'Analizando comportamiento y calculando métricas...' : 'No se encontraron clientes con los filtros seleccionados.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Tab 2: Coupons and Promotions */}
    <TabsContent value="coupons" className="space-y-6">
      {/* Coupons KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cupones Activos
            </CardTitle>
            <Tag className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              {activeCouponsCount} <span className="text-sm font-normal text-slate-500">/ {coupons.length}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {coupons.length - activeCouponsCount} cupones pausados o inactivos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Descuento Total Otorgado
            </CardTitle>
            <Percent className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-700">
              {formatCurrency(totalCouponsDiscount)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ahorro comercial directo a clientes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Facturación Generada
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-900">
              {formatCurrency(totalCouponsRevenue)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ventas cerradas aplicando promociones
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Canjes Realizados
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {totalCouponsUses} <span className="text-sm font-normal text-slate-500">canjes</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Redenciones exitosas en POS / Ventas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar for Coupons */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 w-full md:w-auto gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cupón por código (ej: LEALTAD15) o descripción..."
              className="pl-8 text-xs font-medium"
              value={couponSearchTerm}
              onChange={(e) => setCouponSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-[220px]">
            <Select value={couponSegmentFilter} onValueChange={setCouponSegmentFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Filtrar por Segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Segmentos</SelectItem>
                <SelectItem value="ALL">Público General (Todos)</SelectItem>
                <SelectItem value="VIP">🌟 Segmento VIP</SelectItem>
                <SelectItem value="BIG_BUILDER">🏗️ Grandes Constructores</SelectItem>
                <SelectItem value="LOYAL_POTENTIAL">💎 Clientes Leales / Frecuentes</SelectItem>
                <SelectItem value="AT_RISK">⚠️ En Riesgo de Churn</SelectItem>
                <SelectItem value="HIBERNATING">💤 Cuentas Hibernando</SelectItem>
                <SelectItem value="NEW">🌱 Clientes Nuevos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[170px]">
            <Select value={couponStatusFilter} onValueChange={setCouponStatusFilter}>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Estado de Cupón" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="active">Solo Activos</SelectItem>
                <SelectItem value="paused">Solo Pausados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-xs text-muted-foreground whitespace-nowrap">
          Mostrando <strong>{filteredCoupons.length}</strong> de {coupons.length} promociones
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-emerald-600" />
              Catálogo de Cupones & Rendimiento de Campañas
            </CardTitle>
            <div className="text-xs text-slate-500 font-medium">
              Haga clic en <strong>"Aplicar en POS"</strong> para canjear de inmediato en mostrador
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Código</TableHead>
                  <TableHead>Estrategia & Descripción</TableHead>
                  <TableHead>Descuento</TableHead>
                  <TableHead>Segmento Objetivo</TableHead>
                  <TableHead>Condiciones</TableHead>
                  <TableHead className="text-center">Canjes / Límite</TableHead>
                  <TableHead className="text-right">Total Descontado</TableHead>
                  <TableHead className="text-right">Venta Generada</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((c) => {
                  const isPercentage = c.discountType === 'PERCENTAGE';
                  const pctUsed = c.maxUses ? Math.min(100, Math.round((c.usedCount / c.maxUses) * 100)) : null;

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded shadow-2xs">
                            {c.code}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-800"
                            onClick={() => handleCopyCoupon(c.code)}
                            title="Copiar código de cupón"
                          >
                            {copiedCouponCode === c.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[240px]">
                        <p className="text-xs text-slate-700 line-clamp-2" title={c.description}>
                          {c.description}
                        </p>
                        {c.expirationDate && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Vence: {c.expirationDate}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className={isPercentage ? "bg-indigo-100 text-indigo-900 border-indigo-300 font-bold" : "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold"}>
                          {isPercentage ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {getSegmentBadge(c.targetSegment || 'ALL', c.targetSegment === 'ALL' ? 'Todos' : c.targetSegment || 'General')}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600">
                        <div>Mín: {c.minPurchaseAmount ? formatCurrency(c.minPurchaseAmount) : 'Sin mín.'}</div>
                        {c.maxDiscountAmount && (
                          <div className="text-[10px] text-slate-500">Tope: {formatCurrency(c.maxDiscountAmount)}</div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="text-xs font-semibold">
                          {c.usedCount} <span className="text-slate-400 font-normal">/ {c.maxUses || '∞'}</span>
                        </div>
                        {pctUsed !== null && (
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mx-auto mt-1">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pctUsed}%` }} />
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right font-bold text-xs text-rose-700 font-mono">
                        {formatCurrency(c.totalDiscountGiven)}
                      </TableCell>

                      <TableCell className="text-right font-bold text-xs text-emerald-700 font-mono">
                        {formatCurrency(c.totalRevenueGenerated)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant={c.isActive ? 'default' : 'secondary'} className={c.isActive ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}>
                          {c.isActive ? 'Activo' : 'Pausado'}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/pos?coupon=${c.code}`)}
                            className="h-7 text-xs px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 gap-1 font-semibold"
                            title="Abrir POS con este cupón precargado"
                          >
                            <ShoppingCart className="h-3.5 w-3.5 text-emerald-700" />
                            <span className="hidden sm:inline">Aplicar POS</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${c.isActive ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                            onClick={() => handleToggleCouponStatus(c)}
                            title={c.isActive ? 'Pausar cupón' : 'Reactivar cupón'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDeleteCoupon(c)}
                            title="Eliminar cupón"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredCoupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-10 text-slate-500">
                      {isLoadingCoupons ? 'Cargando promociones...' : 'No se encontraron cupones con los filtros seleccionados.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>

  {/* Customer 360 Modal */}
  <CustomerProfileModal
    isOpen={isProfileModalOpen}
    onClose={() => setIsProfileModalOpen(false)}
    profile={selectedProfile}
  />

  {/* New Coupon Modal */}
  <NewCouponModal
    isOpen={isNewCouponModalOpen}
    onClose={() => setIsNewCouponModalOpen(false)}
  />
</div>
  );
}
