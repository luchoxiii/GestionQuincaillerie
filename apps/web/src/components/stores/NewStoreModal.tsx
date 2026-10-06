import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Store, useCreateStore, useUpdateStore } from '@/services/stores.service';
import { Store as StoreIcon, Building2, MapPin, Phone, Mail, User, Hash, CheckCircle2 } from 'lucide-react';

const storeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  code: z.string().min(2, 'El código es obligatorio (ej. SUC-02)'),
  posNumber: z.string().min(4, 'Debe ser de 4 dígitos (ej. 0002)').max(4, 'Máximo 4 dígitos'),
  address: z.string().min(5, 'La dirección es obligatoria'),
  city: z.string().optional(),
  phone: z.string().min(6, 'Teléfono de contacto obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  manager: z.string().min(3, 'Nombre del encargado obligatorio'),
  isMain: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

interface NewStoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeToEdit?: Store | null;
}

export function NewStoreModal({ open, onOpenChange, storeToEdit }: NewStoreModalProps) {
  const createMutation = useCreateStore();
  const updateMutation = useUpdateStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      code: '',
      posNumber: '0002',
      address: '',
      city: 'Buenos Aires',
      phone: '',
      email: '',
      manager: '',
      isMain: false,
      isActive: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (storeToEdit) {
      reset({
        name: storeToEdit.name,
        code: storeToEdit.code,
        posNumber: storeToEdit.posNumber,
        address: storeToEdit.address,
        city: storeToEdit.city || 'Buenos Aires',
        phone: storeToEdit.phone,
        email: storeToEdit.email || '',
        manager: storeToEdit.manager,
        isMain: storeToEdit.isMain,
        isActive: storeToEdit.isActive,
        notes: storeToEdit.notes || '',
      });
    } else {
      reset({
        name: '',
        code: `SUC-0${Math.floor(Math.random() * 80 + 3)}`,
        posNumber: '0002',
        address: '',
        city: 'Buenos Aires',
        phone: '',
        email: '',
        manager: '',
        isMain: false,
        isActive: true,
        notes: '',
      });
    }
  }, [storeToEdit, reset, open]);

  const onSubmit = async (data: StoreFormData) => {
    try {
      if (storeToEdit) {
        await updateMutation.mutateAsync({
          id: storeToEdit.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {storeToEdit ? 'Editar Sucursal / Tienda' : 'Dar de Alta Nueva Tienda / Sucursal'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure los datos comerciales, punto de venta AFIP y responsable del nuevo local.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre y Código */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Nombre de la Sucursal *</Label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('name')}
                  placeholder="Ej: Sucursal Norte (Tigre)"
                  className="pl-8 text-sm"
                />
              </div>
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Código *</Label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('code')}
                  placeholder="SUC-02"
                  className="pl-8 text-sm uppercase"
                />
              </div>
              {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
            </div>
          </div>

          {/* Punto de Venta AFIP & Encargado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Punto de Venta AFIP (4 dígitos) *</Label>
              <Input
                {...register('posNumber')}
                placeholder="0002"
                maxLength={4}
                className="font-mono text-sm"
              />
              <span className="text-[10px] text-muted-foreground">
                Número de terminal asignada para facturación fiscal.
              </span>
              {errors.posNumber && <p className="text-destructive text-xs">{errors.posNumber.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Encargado / Responsable *</Label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('manager')}
                  placeholder="Ej: Marcelo Torres"
                  className="pl-8 text-sm"
                />
              </div>
              {errors.manager && <p className="text-destructive text-xs">{errors.manager.message}</p>}
            </div>
          </div>

          {/* Dirección y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Dirección Comercial *</Label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('address')}
                  placeholder="Av. Cazón 1234"
                  className="pl-8 text-sm"
                />
              </div>
              {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Ciudad / Localidad</Label>
              <Input
                {...register('city')}
                placeholder="Tigre"
                className="text-sm"
              />
            </div>
          </div>

          {/* Teléfono & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Teléfono de Contacto *</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('phone')}
                  placeholder="011-4567-8901"
                  className="pl-8 text-sm"
                />
              </div>
              {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email de la Tienda</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register('email')}
                  placeholder="sucursal2@ferreteria.com"
                  className="pl-8 text-sm"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
          </div>

          {/* Opciones Especiales */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                {...register('isMain')}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Establecer como Sucursal Principal / Casa Central</span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span>Tienda activa y habilitada para operar</span>
            </label>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Observaciones / Notas de la Sucursal</Label>
            <Textarea
              {...register('notes')}
              placeholder="Detalles sobre horarios, capacidad de almacenamiento, etc."
              rows={2}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : storeToEdit
                ? 'Actualizar Sucursal'
                : 'Guardar y Habilitar Sucursal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
