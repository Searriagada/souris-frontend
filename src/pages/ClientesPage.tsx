import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { clienteService } from '../services/entities.service';
import { clienteSchema, ClienteFormData } from '../schemas';
import { Cliente } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  Button,
  Input,
} from '../components/ui';

export function ClientesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  // Fetch clientes
  const { data: clientes = [], isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: clienteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteFormData }) =>
      clienteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: clienteService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedCliente(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedCliente(null);
    reset({ nombre_cliente: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    reset({ nombre_cliente: cliente.nombre_cliente });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCliente(null);
    reset();
  };

  const onSubmit = (data: ClienteFormData) => {
    if (selectedCliente) {
      updateMutation.mutate({ id: selectedCliente.id_cliente, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Format date
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
      key: 'nombre_cliente',
      label: 'Cliente',
      sortable: true,
      render: (item: Cliente) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-pink-500" />
          </div>
          <span className="font-medium text-white">{item.nombre_cliente}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Registrado',
      sortable: true,
      render: (item: Cliente) => (
        <span className="text-zinc-400">{formatDate(item.created_at)}</span>
      ),
    },
  ];

  const tableActions = (item: Cliente) => (
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
          <h1 className="text-2xl font-serif text-white">Clientes</h1>
          <p className="text-zinc-500">Gestiona tu base de clientes</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={clientes}
        columns={columns}
        keyField="id_cliente"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar clientes..."
        emptyMessage="No hay clientes registrados"
        actions={tableActions}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre del cliente"
            placeholder="Ej: Juan Pérez"
            error={errors.nombre_cliente?.message}
            {...register('nombre_cliente')}
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
              {selectedCliente ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedCliente && deleteMutation.mutate(selectedCliente.id_cliente)}
        title="Eliminar Cliente"
        message={`¿Estás seguro de eliminar a "${selectedCliente?.nombre_cliente}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ClientesPage;
