import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, ShoppingCart, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { ventaService, clienteService, plataformaService } from '../services/entities.service';
import { ventaSchema, VentaFormData } from '../schemas';
import { Venta } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  Button,
  Input,
  Select,
} from '../components/ui';

export function VentasPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

  // Fetch data
  const { data: ventas = [], isLoading, error } = useQuery({
    queryKey: ['ventas'],
    queryFn: ventaService.getAll,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  const { data: plataformas = [] } = useQuery({
    queryKey: ['plataformas'],
    queryFn: plataformaService.getAll,
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VentaFormData>({
    resolver: zodResolver(ventaSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: ventaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta registrada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: VentaFormData }) =>
      ventaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ventaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      toast.success('Venta eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedVenta(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedVenta(null);
    reset({
      id_plataforma: 0,
      id_cliente: 0,
      costo_despacho: 0,
      fecha_venta: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (venta: Venta) => {
    setSelectedVenta(venta);
    reset({
      id_plataforma: venta.id_plataforma,
      id_cliente: venta.id_cliente,
      costo_despacho: venta.costo_despacho,
      fecha_venta: venta.fecha_venta.split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (venta: Venta) => {
    setSelectedVenta(venta);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVenta(null);
    reset();
  };

  const onSubmit = (data: VentaFormData) => {
    if (selectedVenta) {
      updateMutation.mutate({ id: selectedVenta.id_venta, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Helper functions
  const getClienteName = (id: number) => {
    const cliente = clientes.find((c) => c.id_cliente === id);
    return cliente?.nombre_cliente || '—';
  };

  const getPlataformaName = (id: number) => {
    const plataforma = plataformas.find((p) => p.id_plataforma === id);
    return plataforma?.nombre_plataforma || '—';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Table columns
  const columns = [
    {
      key: 'id_venta',
      label: 'ID',
      sortable: true,
      render: (item: Venta) => (
        <span className="font-mono text-amber-500">#{item.id_venta}</span>
      ),
    },
    {
      key: 'fecha_venta',
      label: 'Fecha',
      sortable: true,
      render: (item: Venta) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500" />
          <span>{formatDate(item.fecha_venta)}</span>
        </div>
      ),
    },
    {
      key: 'id_cliente',
      label: 'Cliente',
      render: (item: Venta) => (
        <span className="font-medium text-white">
          {item.cliente?.nombre_cliente || getClienteName(item.id_cliente)}
        </span>
      ),
    },
    {
      key: 'id_plataforma',
      label: 'Plataforma',
      render: (item: Venta) => (
        <span className="px-2 py-1 bg-zinc-800 rounded text-sm">
          {item.plataforma?.nombre_plataforma || getPlataformaName(item.id_plataforma)}
        </span>
      ),
    },
    {
      key: 'costo_despacho',
      label: 'Despacho',
      sortable: true,
      render: (item: Venta) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-zinc-500" />
          <span>{item.costo_despacho.toLocaleString('es-CL')}</span>
        </div>
      ),
    },
  ];

  const tableActions = (item: Venta) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenEdit(item)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleOpenDelete(item)}
        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Ventas</h1>
          <p className="text-zinc-500">Registro de ventas realizadas</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nueva Venta
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Total Ventas</p>
              <p className="text-xl font-semibold text-white">{ventas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Total Despachos</p>
              <p className="text-xl font-semibold text-white">
                ${ventas.reduce((sum, v) => sum + v.costo_despacho, 0).toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-zinc-500 text-sm">Última Venta</p>
              <p className="text-xl font-semibold text-white">
                {ventas.length > 0 ? formatDate(ventas[0].fecha_venta) : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={ventas}
        columns={columns}
        keyField="id_venta"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar ventas..."
        emptyMessage="No hay ventas registradas"
        actions={tableActions}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedVenta ? 'Editar Venta' : 'Nueva Venta'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Fecha de venta"
            type="date"
            error={errors.fecha_venta?.message}
            {...register('fecha_venta')}
          />

          <Controller
            name="id_cliente"
            control={control}
            render={({ field }) => (
              <Select
                label="Cliente"
                placeholder="Selecciona un cliente"
                options={clientes.map((c) => ({
                  value: c.id_cliente,
                  label: c.nombre_cliente,
                }))}
                error={errors.id_cliente?.message}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                value={field.value || ''}
              />
            )}
          />

          <Controller
            name="id_plataforma"
            control={control}
            render={({ field }) => (
              <Select
                label="Plataforma"
                placeholder="Selecciona una plataforma"
                options={plataformas
                  .filter((p) => p.status === 'activo')
                  .map((p) => ({
                    value: p.id_plataforma,
                    label: `${p.nombre_plataforma} (${p.comision}%)`,
                  }))}
                error={errors.id_plataforma?.message}
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                value={field.value || ''}
              />
            )}
          />

          <Input
            label="Costo de despacho"
            type="number"
            placeholder="0"
            error={errors.costo_despacho?.message}
            {...register('costo_despacho', { valueAsNumber: true })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {selectedVenta ? 'Guardar cambios' : 'Registrar venta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedVenta && deleteMutation.mutate(selectedVenta.id_venta)}
        title="Eliminar Venta"
        message={`¿Estás seguro de eliminar la venta #${selectedVenta?.id_venta}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default VentasPage;
