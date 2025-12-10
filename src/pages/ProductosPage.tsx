import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Power, Package, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { productoService, tipoProductoService } from '../services/entities.service';
import { productoSchema, ProductoFormData } from '../schemas';
import { Producto } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  StatusBadge,
  Button,
  Input,
  CustomSelect,
} from '../components/ui';

export function ProductosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedTipoProducto, setSelectedTipoProducto] = useState<number | undefined>();

  // Fetch productos
  const { data: response = { items: [], total: 0, pages: 0, page: 1 }, isLoading, error } = useQuery({
    queryKey: ['productos', page, search, selectedTipoProducto],
    queryFn: () => productoService.getAll(page, search, selectedTipoProducto),
  });

  const { items: productos = [], pages } = response;

  // Fetch tipos de producto
  const { data: tiposProducto = [] } = useQuery({
    queryKey: ['tipo-producto'],
    queryFn: tipoProductoService.getAll,
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    control,
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
      id_tipo_producto: undefined,
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
      id_tipo_producto: producto.id_tipo_producto ?? undefined,
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
      id_tipo_producto: data.id_tipo_producto || undefined,
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
      key: 'stock_actual',
      label: 'Stock',
      sortable: true,
      render: (item: Producto) => (
        <p className="font-medium text-white">{item.stock_actual || '—'}</p>
      ),
    },
        {
      key: 'nombre_tipo_producto',
      label: 'Tipo',
      sortable: true,
      render: (item: Producto) => (
        <p className="font-medium text-white">{item.nombre_tipo_producto || '—'}</p>
      ),
    },
    {
      key: 'joya',
      label: 'Joya',
      sortable: true,
      render: (item: Producto) => item.joya ? `$${Math.round(Number(item.joya)).toLocaleString('es-CL')}` : '—',
    },
    {
      key: 'costo',
      label: 'Costo total',
      sortable: true,
      render: (item: Producto) => item.costo ? `$${Math.round(Number(item.costo)).toLocaleString('es-CL')}` : '—',
    },
    {
      key: 'precio_venta',
      label: 'Precio venta',
      sortable: true,
      render: (item: Producto) => (
        <span className="font-semibold text-white">
          {item.precio_venta != null
            ? `$${item.precio_venta.toLocaleString('es-CL')}`
            : '—'}
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

      {/* Search and Filters */}
      <div className="flex items-end gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar productos..."
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-5 h-5 text-zinc-500 hover:text-white" />
            </button>
          )}
        </div>

        {/* Filter by Tipo Producto */}
        <div className="w-64">
          <CustomSelect
            label="Filtrar por tipo"
            placeholder="Todos"
            options={[
              { value: 0, label: 'Todos los tipos' },
              ...tiposProducto.map((tipo) => ({
                value: tipo.id_tipo,
                label: tipo.nombre_tipo_producto,
              })),
            ]}
            value={selectedTipoProducto}
            onChange={(value) => {
              setSelectedTipoProducto(value ? Number(value) : undefined);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={productos}
        columns={columns}
        keyField="id_producto"
        isLoading={isLoading}
        error={error?.message}
        emptyMessage="No hay productos registrados"
        actions={tableActions}
      />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">
            Página {page} de {pages}
          </span>
        </div>

        <Button
          variant="secondary"
          onClick={() => setPage(Math.min(pages, page + 1))}
          disabled={page === pages}
        >
          Siguiente
        </Button>
      </div>

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

          <Controller
            name="id_tipo_producto"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="Tipo de producto"
                placeholder="Selecciona un tipo"
                options={tiposProducto.map((tipo) => ({
                  value: tipo.id_tipo,
                  label: tipo.nombre_tipo_producto,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                error={errors.id_tipo_producto?.message}
              />
            )}
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