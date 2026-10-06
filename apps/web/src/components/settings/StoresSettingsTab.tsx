import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useStores,
  useActiveStore,
  useDeleteStore,
  Store,
} from '@/services/stores.service';
import { NewStoreModal } from '../stores/NewStoreModal';
import {
  Store as StoreIcon,
  Plus,
  MapPin,
  Phone,
  Mail,
  User,
  Hash,
  CheckCircle2,
  Building2,
  Trash2,
  Edit2,
  Radio,
  Star,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function StoresSettingsTab() {
  const { data: stores = [], isLoading } = useStores();
  const { activeStoreId, changeStore } = useActiveStore();
  const deleteStoreMutation = useDeleteStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);

  const handleOpenCreate = () => {
    setStoreToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (store: Store) => {
    setStoreToEdit(store);
    setIsModalOpen(true);
  };

  const handleDelete = async (store: Store) => {
    if (store.isMain) {
      toast.error('No se puede desactivar la Casa Central / Sucursal Principal');
      return;
    }
    const confirmed = window.confirm(`¿Está seguro de que desea desactivar la sucursal "${store.name}"?`);
    if (confirmed) {
      try {
        await deleteStoreMutation.mutateAsync(store.id);
      } catch (err: any) {
        toast.error(err.message || 'Error al desactivar la sucursal');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card with quick actions */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <StoreIcon className="h-5 w-5 text-primary" />
                Red de Tiendas & Sucursales Comerciales
              </CardTitle>
              <CardDescription>
                Administre los locales físicos, depósitos de mostrador y puntos de venta AFIP asociados a su empresa.
              </CardDescription>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Nueva Tienda / Sucursal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Active Store Banner */}
          <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Tienda Activa en esta Terminal</span>
                <h4 className="text-base font-bold text-foreground">
                  {stores.find((s) => s.id === activeStoreId)?.name || 'Casa Central'}
                </h4>
              </div>
            </div>
            <Badge variant="secondary" className="self-start sm:self-auto font-mono text-xs">
              Punto de Venta AFIP: #{stores.find((s) => s.id === activeStoreId)?.posNumber || '0001'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Grid of Stores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map((store) => {
          const isActiveStore = store.id === activeStoreId;

          return (
            <Card
              key={store.id}
              className={`relative transition-all overflow-hidden border-2 ${
                isActiveStore
                  ? 'border-primary shadow-md bg-card'
                  : 'border-border/60 hover:border-primary/40 bg-card'
              }`}
            >
              {store.isMain && (
                <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-xs">
                  <Star className="h-3 w-3 fill-amber-950" />
                  Casa Central
                </div>
              )}

              <CardContent className="p-5 space-y-4">
                {/* Title & Code */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs font-bold">
                      {store.code}
                    </Badge>
                    <Badge
                      className={`text-[10px] font-semibold ${
                        store.isActive
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {store.isActive ? 'Operativa' : 'Inactiva'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{store.name}</h3>
                </div>

                {/* Details List */}
                <div className="space-y-2 text-xs text-muted-foreground border-y py-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Punto de Venta AFIP: <strong className="text-foreground font-mono">#{store.posNumber}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{store.address}{store.city ? `, ${store.city}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                  {store.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{store.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Encargado: <strong className="text-foreground">{store.manager}</strong>
                    </span>
                  </div>
                </div>

                {store.notes && (
                  <p className="text-[11px] text-muted-foreground italic bg-muted/40 p-2 rounded">
                    "{store.notes}"
                  </p>
                )}

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <Button
                    size="sm"
                    variant={isActiveStore ? 'default' : 'outline'}
                    onClick={() => changeStore(store.id)}
                    className="text-xs gap-1.5 flex-1"
                  >
                    <Radio className={`h-3.5 w-3.5 ${isActiveStore ? 'animate-pulse' : ''}`} />
                    {isActiveStore ? 'Tienda Activa' : 'Establecer como Activa'}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(store)}
                      title="Editar Tienda"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!store.isMain && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(store)}
                        title="Desactivar Tienda"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <NewStoreModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        storeToEdit={storeToEdit}
      />
    </div>
  );
}
