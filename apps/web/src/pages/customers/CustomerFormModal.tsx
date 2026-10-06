import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCustomerInput, CreateCustomerInputSchema, DocumentType, TaxCondition, Customer } from '@ferreteria/shared';
import { useCreateCustomer, useUpdateCustomer } from '@/services/customers.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
}

export function CustomerFormModal({ open, onOpenChange, customer }: CustomerFormModalProps) {
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  
  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(CreateCustomerInputSchema),
    defaultValues: {
      name: customer?.name || '',
      documentType: (customer?.documentType as DocumentType) || DocumentType.DNI,
      documentNum: customer?.documentNum || '',
      taxCondition: (customer?.taxCondition as TaxCondition) || TaxCondition.CONSUMIDOR_FINAL,
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      city: customer?.city || '',
      creditLimit: customer?.creditLimit || 0,
      isActive: customer ? customer.isActive : true,
      isBanned: customer?.isBanned || false,
      banReason: customer?.banReason || '',
    },
  });

  // Reset form when modal opens with new customer data
  React.useEffect(() => {
    if (open) {
      if (customer) {
        form.reset({
          name: customer.name,
          documentType: customer.documentType as DocumentType,
          documentNum: customer.documentNum,
          taxCondition: customer.taxCondition as TaxCondition,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          city: customer.city || '',
          creditLimit: customer.creditLimit || 0,
          isActive: customer.isActive,
          isBanned: customer.isBanned || false,
          banReason: customer.banReason || '',
        });
      } else {
        form.reset({
          name: '',
          documentType: DocumentType.DNI,
          documentNum: '',
          taxCondition: TaxCondition.CONSUMIDOR_FINAL,
          email: '',
          phone: '',
          address: '',
          city: '',
          creditLimit: 0,
          isActive: true,
          isBanned: false,
          banReason: '',
        });
      }
    }
  }, [open, customer, form]);

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, ...data });
      } else {
        await createCustomer.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Datos Generales</TabsTrigger>
                <TabsTrigger value="contact">Contacto</TabsTrigger>
                <TabsTrigger value="commercial">Comercial</TabsTrigger>
                <TabsTrigger value="restrictions">Veto / Estado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre o Razón Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="documentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Doc</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={DocumentType.DNI}>DNI</SelectItem>
                            <SelectItem value={DocumentType.CUIT}>CUIT</SelectItem>
                            <SelectItem value={DocumentType.CUIL}>CUIL</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="documentNum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 20123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="taxCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condición IVA</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={TaxCondition.CONSUMIDOR_FINAL}>Consumidor Final</SelectItem>
                          <SelectItem value={TaxCondition.RESPONSABLE_INSCRIPTO}>Resp. Inscripto</SelectItem>
                          <SelectItem value={TaxCondition.MONOTRIBUTISTA}>Monotributista</SelectItem>
                          <SelectItem value={TaxCondition.EXENTO}>Exento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 11 1234 5678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Av. San Martín 123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Buenos Aires" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="commercial" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Límite de Crédito ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="restrictions" className="space-y-4 pt-4">
                <div className="rounded-lg border p-4 bg-muted/20 space-y-4">
                  <FormField
                    control={form.control}
                    name="isBanned"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold text-destructive">
                            Inhabilitar / Vetar Cliente
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Al vetar a este cliente, el sistema bloqueará ventas o emitirá alertas críticas en el Punto de Venta.
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="banReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo de Veto o Inhabilitación</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej: Cheques rechazados, mora recurrente, conducta fraudulenta..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
