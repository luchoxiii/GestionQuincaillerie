import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers, useDebtors, useDeleteCustomer, useToggleBanCustomer } from '@/services/customers.service';
import { Customer, matchCustomerNatural } from '@ferreteria/shared';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CustomerFormModal } from './CustomerFormModal';
import { CustomerAccountModal } from './CustomerAccountModal';
import { CustomerProfileModal } from './CustomerProfileModal';
import { CustomerExcelImportModal } from '@/components/customers/CustomerExcelImportModal';
import { useCustomerProfile } from '@/services/customer-analytics.service';
import { Plus, Eye, Edit, Trash2, AlertCircle, DollarSign, Users, Download, Ban, ShieldCheck, ShieldAlert, Brain, Sparkles, FileSpreadsheet } from 'lucide-react';
import { formatCurrency, exportToCsv } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ColumnDef } from '@tanstack/react-table';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [banFilter, setBanFilter] = useState<'all' | 'banned' | 'unbanned'>('all');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [accountCustomerId, setAccountCustomerId] = useState<string | null>(null);

  const [profileCustomerId, setProfileCustomerId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: customerAnalyticsProfile } = useCustomerProfile(profileCustomerId);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const { data: customersData, isLoading } = useCustomers({ page, limit, search });
  const { data: debtorsData = [] } = useDebtors();
  const deleteCustomer = useDeleteCustomer();
  const toggleBan = useToggleBanCustomer();

  const totalDeuda = debtorsData.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const clientesConDeuda = debtorsData.filter(c => (c.balance || 0) > 0).length;
  const clientesExcedidos = debtorsData.filter(c => (c.balance || 0) > (c.creditLimit || 0)).length;
  const totalClientes = customersData?.meta.total || 0;
  const clientesVetados = (customersData?.data || []).filter(c => c.isBanned).length;

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  const handleViewProfile = (customer: Customer) => {
    setProfileCustomerId(customer.id);
    setIsProfileOpen(true);
  };

  const handleViewAccount = (customer: Customer) => {
    setAccountCustomerId(customer.id);
    setIsAccountOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer.mutateAsync(customerToDelete.id);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleToggleBan = async (customer: Customer) => {
    if (customer.isBanned) {
      await toggleBan.mutateAsync({ id: customer.id, isBanned: false });
      toast.success(`Se ha levantado el veto a ${customer.name}`);
    } else {
      const reason = window.prompt(`Ingrese el motivo del veto para "${customer.name}":`, 'Mora recurrente o cheques rechazados');
      if (reason !== null) {
        await toggleBan.mutateAsync({
          id: customer.id,
          isBanned: true,
          banReason: reason.trim() || 'Inhabilitado por administración'
        });
        toast.error(`Cliente ${customer.name} marcado como VETADO.`);
      }
    }
  };

  const rawList = customersData?.data || [];
  const displayedCustomers = React.useMemo(() => {
    let list = rawList;
    if (banFilter === 'banned') list = list.filter(c => c.isBanned);
    if (banFilter === 'unbanned') list = list.filter(c => !c.isBanned);
    if (search.trim()) {
      list = list.filter(c => matchCustomerNatural(c, search));
    }
    return list;
  }, [rawList, banFilter, search]);

  const handleExportCSV = () => {
    const list = displayedCustomers || [];
    if (list.length === 0) {
      toast.error('No hay clientes para exportar');
      return;
    }

    const headers = [
      'ID',
      'Nombre o Razón Social',
      'Tipo Doc',
      'Número Doc',
      'Condición IVA',
      'Teléfono',
      'Email',
      'Dirección',
      'Ciudad',
      'Límite de Crédito ($)',
      'Saldo Actual ($)',
      'Estado General',
      'Vetado / Inhabilitado',
      'Motivo de Veto'
    ];

    const rows = list.map((c: any) => [
      c.id || '',
      c.name || '',
      c.documentType || 'DNI',
      c.documentNum || c.documentNumber || '',
      c.taxCondition ? c.taxCondition.replace(/_/g, ' ') : 'Consumidor Final',
      c.phone || '',
      c.email || '',
      c.address || '',
      c.city || '',
      Number(c.creditLimit || 0).toFixed(2),
      Number(c.balance ?? c.currentBalance ?? 0).toFixed(2),
      c.isActive !== false ? 'Activo' : 'Inactivo',
      c.isBanned ? 'SÍ (VETADO)' : 'NO',
      c.isBanned ? (c.banReason || 'Inhabilitado') : '-'
    ]);

    exportToCsv(`clientes_${new Date().toISOString().split('T')[0]}`, [headers, ...rows]);
    toast.success('Archivo CSV de clientes generado con éxito');
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre / Razón Social',
      cell: ({ row }) => {
        const isBanned = row.original.isBanned;
        const banReason = row.original.banReason;
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{row.original.name}</span>
              {isBanned && (
                <Badge variant="destructive" className="flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.5">
                  <Ban className="h-3 w-3" /> VETADO
                </Badge>
              )}
            </div>
            {isBanned && banReason && (
              <span className="text-xs text-destructive/90 font-medium italic mt-0.5">
                Motivo: {banReason}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'documentNum',
      header: 'Documento',
      cell: ({ row }) => {
        const type = row.original.documentType;
        const num = row.original.documentNum;
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{type}</Badge>
            <span>{num}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'taxCondition',
      header: 'Condición IVA',
      cell: ({ row }) => {
        const text = row.original.taxCondition.replace(/_/g, ' ');
        return <span className="capitalize text-sm">{text.toLowerCase()}</span>;
      }
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono / Contacto',
      cell: ({ row }) => (
        <div className="flex flex-col text-sm">
          {row.original.phone && <span>{row.original.phone}</span>}
          {row.original.email && <span className="text-muted-foreground">{row.original.email}</span>}
        </div>
      )
    },
    {
      accessorKey: 'balance',
      header: 'Saldo Actual',
      cell: ({ row }) => {
        const balance = row.original.balance || 0;
        const limit = row.original.creditLimit || 0;
        const isDebt = balance > 0;
        const isExceeded = isDebt && balance > limit;

        return (
          <div className="flex flex-col space-y-1">
            <span className={isDebt ? 'text-red-600 font-medium' : 'text-green-600'}>
              {formatCurrency(balance)}
            </span>
            {isExceeded && (
              <Badge variant="destructive" className="w-fit text-[10px] px-1 py-0 h-4">
                Excedido
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: 'creditLimit',
      header: 'Límite',
      cell: ({ row }) => formatCurrency(row.original.creditLimit || 0),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewProfile(row.original)}
            title="Ver Perfil 360°, RFM y Scoring Churn"
            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleBan(row.original)}
            title={row.original.isBanned ? "Levantar veto al cliente" : "Vetar / Inhabilitar cliente"}
            className={row.original.isBanned ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"}
          >
            {row.original.isBanned ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleViewAccount(row.original)} title="Ver Cuenta Corriente / Cobrar">
            <DollarSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)} title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)} title="Eliminar" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestione la base de clientes y cuentas corrientes."
      >
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => navigate('/clientes/perfiles')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
          >
            <Brain className="mr-2 h-4 w-4" /> Perfiles & Churn Scoring
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsExcelImportOpen(true)}
            className="border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-medium"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-indigo-600" />
            Importar Excel
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => { setSelectedCustomer(undefined); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda en la Calle</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDeuda)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Saldo Deudor</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesConDeuda}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excedidos de Límite</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{clientesExcedidos}</div>
          </CardContent>
        </Card>
        <Card className={clientesVetados > 0 ? "border-red-200 bg-red-50/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Inhabilitados / Vetados</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{clientesVetados}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={banFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBanFilter('all')}
          >
            Todos ({totalClientes})
          </Button>
          <Button
            variant={banFilter === 'banned' ? 'destructive' : 'outline'}
            size="sm"
            onClick={() => setBanFilter('banned')}
          >
            <Ban className="mr-1.5 h-3.5 w-3.5" />
            Vetados ({clientesVetados})
          </Button>
          <Button
            variant={banFilter === 'unbanned' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setBanFilter('unbanned')}
          >
            Habilitados ({totalClientes - clientesVetados})
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={displayedCustomers}
            pageCount={customersData?.meta.totalPages || -1}
            pageIndex={page - 1}
            pageSize={limit}
            onPaginationChange={({ pageIndex, pageSize }) => {
              setPage(pageIndex + 1);
              setLimit(pageSize);
            }}
            isLoading={isLoading}
            searchPlaceholder="Buscar en lenguaje natural (ej. 'con deuda', 'Juan Perez', 'vetado')..."
            searchValue={search}
            onSearchChange={setSearch}
            emptyMessage={banFilter === 'banned' ? "No hay clientes vetados." : "No se encontraron clientes."}
          />
        </CardContent>
      </Card>

      <CustomerFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        customer={selectedCustomer}
      />

      <CustomerAccountModal
        open={isAccountOpen}
        onOpenChange={setIsAccountOpen}
        customerId={accountCustomerId}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Eliminar Cliente"
        description={`¿Está seguro que desea eliminar a ${customerToDelete?.name}? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <CustomerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={customerAnalyticsProfile || null}
      />

      <CustomerExcelImportModal
        open={isExcelImportOpen}
        onOpenChange={setIsExcelImportOpen}
      />
    </div>
  );
}
