import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Search, X, Power, Link } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { productoService, tipoProductoService } from '../services/entities.service';
import { productoSchema, ProductoFormData } from '../schemas';
import { Producto, Cadena } from '../types';
import { DataTable, Modal, ConfirmDialog, StatusBadge, Button, Input, CustomSelect } from '../components/ui';
import { InsumoSelector, InsumoSeleccionado } from '../components/ui/SelectInsumoManufactura';
import { InsumoSelectorEmbalaje, InsumoEmbalajeSeleccionado } from '../components/ui/SelectInsumoEmbalaje';
import { ProductoCostoModal } from '../components/ui/ProductoCostoModal';

export function ProductosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false);
  const [isEmbalajeModalOpen, setIsEmbalajeModalOpen] = useState(false);
  const [isConfirmPublicadoOpen, setIsConfirmPublicadoOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
  const [isLoadingEmbalaje, setIsLoadingEmbalaje] = useState(false);
  const [insumosTemporales, setInsumosTemporales] = useState<InsumoSeleccionado[]>([]);
  const [embalajeTemporales, setEmbalajeTemporales] = useState<InsumoEmbalajeSeleccionado[]>([]);
  const [selectedCadena, setSelectedCadena] = useState<number | null>(null);
  const [isCostoModalOpen, setIsCostoModalOpen] = useState(false);
  const [selectedProductoCosto, setSelectedProductoCosto] = useState<any>(null);

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

  // Fetch cadenas disponibles
  const { data: cadenasResponse } = useQuery({
    queryKey: ['cadenas-selector'],
    queryFn: async () => {
      const response = await api.get('/cadenas');
      return response.data?.data?.items || response.data?.data || [];
    },
  });
  const cadenas: Cadena[] = cadenasResponse || [];

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
    mutationFn: ({ id, insumos, id_cadena }: { id: number; insumos: any[]; id_cadena: number | null }) =>
      api.put(`/productos/${id}/insumos`, { insumos, id_cadena }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Insumos actualizados exitosamente');
      handleCloseInsumosModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateEmbalajesMutation = useMutation({
    mutationFn: ({ id, insumos }: { id: number; insumos: any[] }) =>
      api.put(`/productos/${id}/embalajes`, { insumos }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Insumos actualizados exitosamente');
      handleCloseEmbalajeModal();
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
      //precio_venta: 0,
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
      //precio_venta: producto.precio_venta,
      id_tipo_producto: producto.id_tipo_producto ?? undefined,
      //valor_caja: producto.valor_caja,
      //valor_cadena: producto.valor_cadena,
      //joya: producto.joya,
      //costo: producto.costo_total,
    });
    setIsModalOpen(true);
  };

  const handleOpenInsumosModal = async (producto: Producto) => {
    setSelectedProducto(producto);
    setIsInsumosModalOpen(true);
    setIsLoadingInsumos(true);
    console.log('producto.id_cadena:', producto.id_cadena);

    // Cargar la cadena actual del producto
    setSelectedCadena(producto.id_cadena ?? null);

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

  const handleOpenEmbalajeModal = async (producto: Producto) => {
    setSelectedProducto(producto);
    setIsEmbalajeModalOpen(true);
    setIsLoadingEmbalaje(true);
    setSelectedCadena(producto.id_cadena ?? null);

    try {
      const response = await api.get(`/productos/${producto.id_producto}/embalajes`);
      const productoData = response.data?.data || [];

      const embalajesCargados: InsumoEmbalajeSeleccionado[] = productoData
        .filter((row: any) => row.id_insumo !== null)
        .map((row: any) => ({
          id_insumo: row.id_insumo,
          nombre_insumo: row.nombre_insumo || `Insumo ${row.id_insumo}`,
          cantidad: row.cantidad || 0,
          precio_unitario: row.precio_insumo,
          subtotal: row.precio_insumo ? row.cantidad * row.precio_insumo : undefined,
        }));

      setEmbalajeTemporales(embalajesCargados);
    } catch (error) {
      console.error('Error al cargar insumos del producto:', error);
      toast.error('Error al cargar los insumos del producto');
      setEmbalajeTemporales([]);
    } finally {
      setIsLoadingEmbalaje(false);
    }
  };

  const handleCloseEmbalajeModal = () => {
    setIsEmbalajeModalOpen(false);
    setSelectedProducto(null);
    setEmbalajeTemporales([]);
    setSelectedCadena(null);
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
    setSelectedCadena(null);
  };

  const handleOpenCostoModal = async (producto: Producto) => {
    try {
      const response = await api.get(`/productos/${producto.id_producto}/costo`);
      const productoCostos = response.data?.data?.[0];
      if (!productoCostos) {
        toast.warning('No se pudieron cargar los datos');
        return;
      }
      setSelectedProductoCosto(productoCostos);
      setIsCostoModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar costos');
    }
  };

  const handleCloseCostoModal = () => {
    setIsCostoModalOpen(false);
    setSelectedProductoCosto(null);
  };

  const onSubmit = async (data: ProductoFormData) => {
    const payload = {
      sku: data.sku,
      nombre_producto: data.nombre_producto,
      descripcion: data.descripcion || undefined,
      //precio_venta: data.precio_venta,
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
      await updateInsumosMutation.mutateAsync({
        id: selectedProducto.id_producto,
        insumos: payload,
        id_cadena: selectedCadena
      });
    } catch (error: any) {
      console.error('Error al guardar insumos:', error);
      toast.error(error.response?.data?.error || 'Error al guardar los insumos');
    }
  };
  const onSubmitEmbalaje = async () => {
    if (!selectedProducto) return;

    const payload = embalajeTemporales.map((item) => ({
      id_insumo: item.id_insumo,
      cantidad: item.cantidad,
    }));

    try {
      await updateEmbalajesMutation.mutateAsync({
        id: selectedProducto.id_producto,
        insumos: payload,
      });
    } catch (error: any) {
      console.error('Error al guardar embalajes:', error);
      toast.error(error.response?.data?.error || 'Error al guardar los embalajes');
    }
  };
  // Table columns
  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      sortable: true,
      render: (item: Producto) => (
        <span className="font-mono text-white-500">{item.sku}</span>
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
          className="font-medium text-slate-300 hover:text-amber-400 hover:underline transition-colors"
        >
          {item.joya ? `$${Math.round(Number(item.joya)).toLocaleString('es-CL')}` : '—'}
        </button>
      ),
    },
    {
      key: 'costo_total',
      label: 'Costo total',
      sortable: true,
      render: (row: Producto) => (
        <button
          onClick={() => handleOpenEmbalajeModal(row)}
          className=" font-medium text-slate-300 hover:text-amber-400 hover:underline transition-colors" // px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-colors duration-200 text-sm font-medium cursor-pointer
        >
          ${row.costo_total ? Math.round(Number(row.costo_total)).toLocaleString('es-CL') : '0'}
        </button>
      ),
    },
    {
      key: 'precio_venta',
      label: 'Precio venta',
      sortable: true,
      render: (row: Producto) => (
        <button
          onClick={() => handleOpenCostoModal(row)}
          className="font-medium text-green-500 hover:text-amber-500 hover:underline transition-colors"
        >
          ${row.precio_venta ? Math.round(Number(row.precio_venta)).toLocaleString('es-CL') : '0'}
        </button>
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
            placeholder="Ej: CN001"
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
              Nota
            </label>
            <textarea
              placeholder="Añadir información adicional"
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
        {(() => {
          // Calcular totales en tiempo real
          const totalInsumos = insumosTemporales.reduce((sum, item) => sum + (item.subtotal || 0), 0);
          const cadenaSeleccionada = cadenas.find((c) => c.id_cadena === selectedCadena);
          const precioCadena = parseFloat(cadenaSeleccionada?.precio?.toString() || '0');
          const totalGeneral = totalInsumos + precioCadena;

          return (
            <div className="space-y-6">
              {/* Selector de Cadena */}
              <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="w-5 h-5 text-amber-500" />
                  <h3 className="text-white font-medium">Cadena del producto</h3>
                </div>
                <CustomSelect
                  placeholder="Selecciona una cadena (opcional)"
                  options={[
                    { value: 0, label: 'Sin cadena' },
                    ...cadenas.map((cadena) => ({
                      value: cadena.id_cadena,
                      label: `${cadena.nombre_cadena}${cadena.precio ? ` - $${parseFloat(cadena.precio.toString()).toLocaleString('es-CL')}` : ''}`,
                    })),
                  ]}
                  value={selectedCadena ?? 0}
                  onChange={(value) => setSelectedCadena(value && value !== 0 ? Number(value) : null)}
                />
              </div>

              <InsumoSelector
                items={insumosTemporales}
                onChange={setInsumosTemporales}
                isLoadingItems={isLoadingInsumos}
                title="Costeo de insumos"
              />

              {/* Resumen de costos */}
              <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Insumos:</span>
                    <span>${totalInsumos.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Cadena:</span>
                    <span>${precioCadena.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-zinc-700">
                    <span>Costo total:</span>
                    <span className="text-amber-400">${totalGeneral.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

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
          );
        })()}
      </Modal>

      {/* Modal: Gestionar Embalajes del Producto */}
      <Modal
        isOpen={isEmbalajeModalOpen}
        onClose={handleCloseEmbalajeModal}
        title={`${selectedProducto?.sku} - ${selectedProducto?.nombre_producto}`}
        size="lg"
      >
        {(() => {
          const totalEmbalajes = embalajeTemporales.reduce((sum, item) => sum + (item.subtotal || 0), 0);
          const precioJoya = parseFloat(selectedProducto?.joya?.toString() || '0');
          const totalGeneral = totalEmbalajes + precioJoya;

          return (
            <div className="space-y-6">
              <InsumoSelectorEmbalaje
                items={embalajeTemporales}
                onChange={setEmbalajeTemporales}
                isLoadingItems={isLoadingEmbalaje}
                title="Costo empaque"
              />

              {/* Resumen de costos */}
              <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Precio joya:</span>
                    <span>${precioJoya.toLocaleString('es-CL')}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Embalajes:</span>
                    <span>${totalEmbalajes.toLocaleString('es-CL')}</span>
                  </div>

                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-zinc-700">
                    <span>Costo total:</span>
                    <span className="text-amber-400">${totalGeneral.toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseEmbalajeModal}
                  className="flex-1"
                  disabled={updateEmbalajesMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={onSubmitEmbalaje}
                  isLoading={updateEmbalajesMutation.isPending}
                  className="flex-1"
                >
                  Guardar
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      
      <ProductoCostoModal
        isOpen={isCostoModalOpen}
        onClose={handleCloseCostoModal}
        producto={selectedProductoCosto}
        onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['productos'] });
          setIsCostoModalOpen(false);
          setSelectedProductoCosto(null);
        }}
      />

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