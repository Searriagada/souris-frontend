import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Power, Package } from 'lucide-react';
import { toast } from 'sonner';
import { productoService } from '../services/entities.service';
import { productoSchema, ProductoFormData } from '../schemas';
import { Producto } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  StatusBadge,
  Button,
  Input,
} from '../components/ui';

export function ProductosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  // Fetch productos
  const { data: productos = [], isLoading, error } = useQuery({
    queryKey: ['productos'],
    queryFn: productoService.getAll,
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: productoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto creado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductoFormData> }) =>
      productoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedProducto(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (producto: Producto) =>
      productoService.update(producto.id_producto, {
        status: producto.status === 'activo' ? 'inactivo' : 'activo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedProducto(null);
    reset({
      sku: '',
      nombre_producto: '',
      descripcion: '',
      precio_venta: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    reset({
      sku: producto.sku,
      nombre_producto: producto.nombre_producto,
      descripcion: producto.descripcion || '',
      precio_venta: producto.precio_venta,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProducto(null);
    reset();
  };

  const onSubmit = (data: ProductoFormData) => {
    const cleanedData = {
      sku: data.sku,
      nombre_producto: data.nombre_producto,
      descripcion: data.descripcion || undefined,
      precio_venta: data.precio_venta,
    };

    if (selectedProducto) {
      updateMutation.mutate({ id: selectedProducto.id_producto, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (item: Producto) => (
        <span className="font-mono text-amber-500">{item.sku}</span>
      ),
    },
    {
      key: 'nombre_producto',
      label: 'Producto',
      sortable: true,
      render: (item: Producto) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-zinc-500" />
          </div>
          <div>
            <p className="font-medium text-white">{item.nombre_producto}</p>
            {item.descripcion && (
              <p className="text-xs text-zinc-500 truncate max-w-xs">
                {item.descripcion}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'precio_venta',
      label: 'Precio',
      sortable: true,
      render: (item: Producto) => (
        <span className="font-semibold text-white">
          ${item.precio_venta.toLocaleString('es-CL')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: Producto) => <StatusBadge status={item.status} />,
    },
  ];

  const tableActions = (item: Producto) => (
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
          <h1 className="text-2xl font-serif text-white">Productos</h1>
          <p className="text-zinc-500">Gestiona los productos de tu catálogo</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nuevo Producto
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={productos}
        columns={columns}
        keyField="id_producto"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar productos..."
        emptyMessage="No hay productos registrados"
        actions={tableActions}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="SKU"
            placeholder="Ej: PROD-001"
            error={errors.sku?.message}
            {...register('sku')}
          />

          <Input
            label="Nombre del producto"
            placeholder="Ej: Collar de plata"
            error={errors.nombre_producto?.message}
            {...register('nombre_producto')}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">
              Descripción
            </label>
            <textarea
              placeholder="Descripción del producto..."
              className="
                w-full px-4 py-3 
                bg-zinc-900 border border-zinc-800 rounded-lg
                text-white placeholder-zinc-600
                transition-all duration-200 resize-none
                focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                hover:border-zinc-700
              "
              rows={3}
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-400">{errors.descripcion.message}</p>
            )}
          </div>

          <Input
            label="Precio de venta"
            type="number"
            placeholder="0"
            error={errors.precio_venta?.message}
            {...register('precio_venta', { valueAsNumber: true })}
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
              {selectedProducto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedProducto && deleteMutation.mutate(selectedProducto.id_producto)}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${selectedProducto?.nombre_producto}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ProductosPage;
