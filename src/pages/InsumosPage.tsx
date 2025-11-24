import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, ExternalLink, Power } from 'lucide-react';
import { toast } from 'sonner';
import { insumoService } from '../services/entities.service';
import { insumoSchema, InsumoFormData } from '../schemas';
import { Insumo } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  StatusBadge,
  Button,
  Input,
} from '../components/ui';

export function InsumosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);

  // Fetch insumos
  const { data: insumos = [], isLoading, error } = useQuery({
    queryKey: ['insumos'],
    queryFn: insumoService.getAll,
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: insumoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Insumo creado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsumoFormData> }) =>
      insumoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Insumo actualizado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: insumoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Insumo eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedInsumo(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (insumo: Insumo) =>
      insumoService.update(insumo.id_insumo, {
        status: insumo.status === 'activo' ? 'inactivo' : 'activo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedInsumo(null);
    reset({
      nombre_insumo: '',
      categoria_insumo: '',
      precio_insumo: undefined,
      link_insumo: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    reset({
      nombre_insumo: insumo.nombre_insumo,
      categoria_insumo: insumo.categoria_insumo || '',
      precio_insumo: insumo.precio_insumo,
      link_insumo: insumo.link_insumo || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsumo(null);
    reset();
  };

  const onSubmit = (data: InsumoFormData) => {
    // Clean empty strings
    const cleanedData = {
      nombre_insumo: data.nombre_insumo,
      categoria_insumo: data.categoria_insumo || undefined,
      precio_insumo: data.precio_insumo || undefined,
      link_insumo: data.link_insumo || undefined,
    };

    if (selectedInsumo) {
      updateMutation.mutate({ id: selectedInsumo.id_insumo, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'nombre_insumo',
      label: 'Nombre',
      sortable: true,
      render: (item: Insumo) => (
        <div>
          <p className="font-medium text-white">{item.nombre_insumo}</p>
          {item.categoria_insumo && (
            <p className="text-xs text-zinc-500">{item.categoria_insumo}</p>
          )}
        </div>
      ),
    },
    {
      key: 'precio_insumo',
      label: 'Precio',
      sortable: true,
      render: (item: Insumo) =>
        item.precio_insumo
          ? `$${item.precio_insumo.toLocaleString('es-CL')}`
          : '—',
    },
    {
      key: 'link_insumo',
      label: 'Link',
      render: (item: Insumo) =>
        item.link_insumo ? (
          <a
            href={item.link_insumo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-500 hover:text-amber-400"
          >
            Ver <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: Insumo) => <StatusBadge status={item.status} />,
    },
  ];

  const tableActions = (item: Insumo) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => toggleStatusMutation.mutate(item)}
        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors"
        title={item.status === 'activo' ? 'Desactivar' : 'Activar'}
      >
        <Power className="w-4 h-4" />
      </button>
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
          <h1 className="text-2xl font-serif text-white">Insumos</h1>
          <p className="text-zinc-500">Gestiona los insumos de tu inventario</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nuevo Insumo
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={insumos}
        columns={columns}
        keyField="id_insumo"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar insumos..."
        emptyMessage="No hay insumos registrados"
        actions={tableActions}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del insumo"
            placeholder="Ej: Hilo de plata"
            error={errors.nombre_insumo?.message}
            {...register('nombre_insumo')}
          />

          <Input
            label="Categoría"
            placeholder="Ej: Materiales"
            error={errors.categoria_insumo?.message}
            {...register('categoria_insumo')}
          />

          <Input
            label="Precio"
            type="number"
            step="0.1"
            placeholder="0"
            error={errors.precio_insumo?.message}
            {...register('precio_insumo', { valueAsNumber: true })}
          />

          <Input
            label="Link de compra"
            type="url"
            placeholder="https://..."
            error={errors.link_insumo?.message}
            {...register('link_insumo')}
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
              {selectedInsumo ? 'Guardar cambios' : 'Crear insumo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedInsumo && deleteMutation.mutate(selectedInsumo.id_insumo)}
        title="Eliminar Insumo"
        message={`¿Estás seguro de eliminar "${selectedInsumo?.nombre_insumo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default InsumosPage;
