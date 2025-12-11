import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Search, X, Power } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { productoService, tipoProductoService } from '../services/entities.service';
import { productoSchema, ProductoFormData } from '../schemas';
import { Producto } from '../types';
import { DataTable, Modal, ConfirmDialog, StatusBadge, Button, Input, CustomSelect } from '../components/ui';
import { InsumoSelector, InsumoSeleccionado } from '../components/ui/InsumoSelectorModal';

export function ProductosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false);
  const [isConfirmPublicadoOpen, setIsConfirmPublicadoOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
  const [insumosTemporales, setInsumosTemporales] = useState<InsumoSeleccionado[]>([]);

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

  // Form principal
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
    mutationFn: (data: any) => api.post('/productos', data),
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
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/productos/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateInsumosMutation = useMutation({
    mutationFn: ({ id, insumos }: { id: number; insumos: any[] }) =>
      api.put(`/productos/${id}/insumos`, { insumos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Insumos actualizados exitosamente');
      handleCloseInsumosModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const togglePublicadoMLMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/productos/${id}/toggle-publicado-ml`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Estado de publicación actualizado');
      setIsConfirmPublicadoOpen(false);
      setSelectedProducto(null);
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
      valor_caja: producto.valor_caja,
      valor_cadena: producto.valor_cadena,
      joya: producto.joya,
      costo: producto.costo,
    });
    setIsModalOpen(true);
  };

  const handleOpenInsumosModal = async (producto: Producto) => {
    setSelectedProducto(producto);
    setIsInsumosModalOpen(true);
    setIsLoadingInsumos(true);
    
    try {
      const response = await api.get(`/productos/${producto.id_producto}/insumos`);
      const productoData = response.data?.data || [];
      
      const insumosCargados: InsumoSeleccionado[] = productoData
        .filter((row: any) => row.id_insumo !== null)
        .map((row: any) => ({
          id_insumo: row.id_insumo,
          nombre_insumo: row.nombre_insumo || `Insumo ${row.id_insumo}`,
          cantidad: row.cantidad || 0,
          precio_unitario: row.precio_insumo,
          subtotal: row.precio_insumo ? row.cantidad * row.precio_insumo : undefined,
        }));
      
      setInsumosTemporales(insumosCargados);
    } catch (error) {
      console.error('Error al cargar insumos del producto:', error);
      toast.error('Error al cargar los insumos del producto');
      setInsumosTemporales([]);
    } finally {
      setIsLoadingInsumos(false);
    }
  };

  const handleOpenPublicadoConfirm = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsConfirmPublicadoOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProducto(null);
    reset();
  };

  const handleCloseInsumosModal = () => {
    setIsInsumosModalOpen(false);
    setSelectedProducto(null);
    setInsumosTemporales([]);
  };

  const onSubmit = async (data: ProductoFormData) => {
    const payload = {
      sku: data.sku,
      nombre_producto: data.nombre_producto,
      descripcion: data.descripcion || undefined,
      precio_venta: data.precio_venta,
      id_tipo_producto: data.id_tipo_producto || undefined,
    };

    try {
      if (selectedProducto) {
        await updateMutation.mutateAsync({ id: selectedProducto.id_producto, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      toast.error(error.response?.data?.error || 'Error al guardar el producto');
    }
  };

  const onSubmitInsumos = async () => {
    if (!selectedProducto) return;

    const payload = insumosTemporales.map((item) => ({
      id_insumo: item.id_insumo,
      cantidad: item.cantidad,
    }));

    try {
      await updateInsumosMutation.mutateAsync({ id: selectedProducto.id_producto, insumos: payload });
    } catch (error: any) {
      console.error('Error al guardar insumos:', error);
      toast.error(error.response?.data?.error || 'Error al guardar los insumos');
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
      label: 'Joyas',
      sortable: false,
      render: (item: Producto) => (
        <button
          onClick={() => handleOpenInsumosModal(item)}
          className="font-medium text-amber-500 hover:text-amber-400 hover:underline transition-colors"
        >
          {item.joya ? `$${Math.round(Number(item.joya)).toLocaleString('es-CL')}` : '—'}
        </button>
      ),
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
      key: 'publicado_ml',
      label: 'Publicado ML',
      render: (item: Producto) => (
        <StatusBadge status={item.publicado_ml && item.publicado_ml !== '' && item.publicado_ml === 'si' ? 'activo' : 'inactivo'} />
      ),
    },
  ];

  const tableActions = (item: Producto) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenPublicadoConfirm(item)}
        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors"
        title={item.publicado_ml && item.publicado_ml !== '' && item.publicado_ml === 'si' ? 'Pausar publicación' : 'Publicar'}
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

      {/* Modal: Crear/Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProducto ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="SKU"
            placeholder="Ej: PROD-001"
            error={errors.sku?.message}
            {...register('sku')}
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
          <div className="flex gap-3">
            <Input
            label="Precio de joya"
            type="number"
            placeholder="0"
            error={errors.joya?.message}
            {...register('joya', { valueAsNumber: true })}
          />
           <Input
            label="Precio de cadena"
            type="number"
            placeholder="0"
            error={errors.valor_cadena?.message}
            {...register('valor_cadena', { valueAsNumber: true })}
          />
          </div>
          <div className='flex gap-3 readonly:bg-zinc-800'> 
            <Input
            label="Precio de caja"
            type="number"
            placeholder="0"
            error={errors.valor_caja?.message}
            {...register('valor_caja', { valueAsNumber: true })}
          /> 

          <Input
            label="Precio de venta"
            type="number"
            placeholder="0"
            error={errors.precio_venta?.message}
            {...register('precio_venta', { valueAsNumber: true })}
          />
          </div>
           

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

      {/* Modal: Gestionar Insumos del Producto */}
      <Modal
        isOpen={isInsumosModalOpen}
        onClose={handleCloseInsumosModal}
        title={` ${selectedProducto?.sku}- ${selectedProducto?.nombre_producto}`}
        size="lg"
      >
        <div className="space-y-6">
          <InsumoSelector
            items={insumosTemporales}
            onChange={setInsumosTemporales}
            isLoadingItems={isLoadingInsumos}
            title="Costo del producto"
          />

          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseInsumosModal}
              className="flex-1"
              disabled={updateInsumosMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onSubmitInsumos}
              isLoading={updateInsumosMutation.isPending}
              className="flex-1"
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog: Cambiar estado publicado_ml */}
      <ConfirmDialog
        isOpen={isConfirmPublicadoOpen}
        onClose={() => {
          setIsConfirmPublicadoOpen(false);
          setSelectedProducto(null);
        }}
        onConfirm={() => selectedProducto && togglePublicadoMLMutation.mutate(selectedProducto.id_producto)}
        title="Cambiar estado de publicación"
        message={`¿${selectedProducto?.publicado_ml && selectedProducto?.publicado_ml !== '' && selectedProducto?.publicado_ml === 'si' ? 'Pausar' : 'Publicar'} "${selectedProducto?.nombre_producto}" en MercadoLibre?`}
        confirmText={selectedProducto?.publicado_ml && selectedProducto?.publicado_ml !== '' && selectedProducto?.publicado_ml === 'si' ? 'Pausar' : 'Publicar'}
        isLoading={togglePublicadoMLMutation.isPending}
      />
    </div>
  );
}

export default ProductosPage;