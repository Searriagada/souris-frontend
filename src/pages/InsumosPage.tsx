import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, ExternalLink, Power } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaService, insumoService, stockInsumoService } from '../services/entities.service';
import { insumoSchema, InsumoFormData, stockSchema, StockFormData } from '../schemas';
import { Insumo } from '../types';
import {
  DataTable,
  Modal,
  StatusBadge,
  Button,
  Input,
  CustomSelect
} from '../components/ui';

export function InsumosPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const { data: insumos = [], isLoading, error } = useQuery({
    queryKey: ['insumos'],
    queryFn: insumoService.getAll,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriaService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InsumoFormData>({
    resolver: zodResolver(insumoSchema),
  });

  const {
    register: registerStock,
    handleSubmit: handleSubmitStock,
    reset: resetStock,
    formState: { errors: stockErrors, isSubmitting: isStockSubmitting },
  } = useForm<StockFormData>({
    resolver: zodResolver(stockSchema),
  });

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

  const updateStockMutation = useMutation({
    mutationFn: ({ id, cantidad }: { id: number; cantidad: number }) =>
      stockInsumoService.update(id, { cantidad }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insumos'] });
      toast.success('Stock actualizado exitosamente');
      handleCloseStockModal();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenCreate = () => {
    setSelectedInsumo(null);
    reset({
      nombre_insumo: '',
      id_categoria: undefined,
      precio_insumo: undefined,
      link_insumo: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    reset({
      nombre_insumo: insumo.nombre_insumo,
      id_categoria: insumo.id_categoria ?? undefined,
      precio_insumo: insumo.precio_insumo,
      link_insumo: insumo.link_insumo || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInsumo(null);
    reset();
  };

  const handleOpenStockModal = (insumo: Insumo) => {
    setSelectedInsumo(insumo);
    resetStock({ cantidad: insumo.cantidad || 0 });
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setSelectedInsumo(null);
    resetStock();
  };

  const onStockSubmit = (data: StockFormData) => {
    if (selectedInsumo) {
      updateStockMutation.mutate({ id: selectedInsumo.id_insumo, cantidad: data.cantidad });
    }
  };

  const onSubmit = (data: InsumoFormData) => {
    const cleanData = {
      ...data,
      id_categoria: data.id_categoria === null ? undefined : data.id_categoria,
      link_insumo: data.link_insumo === '' ? undefined : data.link_insumo,
    } as InsumoFormData;

    if (selectedInsumo) {
      updateMutation.mutate({ id: selectedInsumo.id_insumo, data: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const columns = [
    {
      key: 'nombre_insumo',
      label: 'Nombre',
      sortable: true,
      render: (item: Insumo) => (
        <div>
          <p className="font-medium text-white">{item.nombre_insumo}</p>
          {item.nombre_categoria && (
            <p className="text-xs text-zinc-500">{item.nombre_categoria}</p>
          )}
        </div>
      ),
    },
    {
      key: 'nombre_categoria',
      label: 'Categoría',
      sortable: true,
      render: (item: Insumo) => (
        <p className="font-medium text-white">{item.nombre_categoria || '—'}</p>
      ),
    },
    {
      key: 'cantidad',
      label: 'Stock',
      sortable: true,
      render: (item: Insumo) => (
        <button
          onClick={() => handleOpenStockModal(item)}
          className="font-medium text-amber-500 hover:text-amber-400 hover:underline transition-colors"
        >
          {item.cantidad || 0}
        </button>
      ),
    },
    {
      key: 'precio_insumo',
      label: 'Precio',
      sortable: false,
      render: (item: Insumo) =>
        item.precio_insumo
          ? `$${Math.round(item.precio_insumo).toLocaleString('es-CL')}`
          : '—',
    },
    {
      key: 'total_value',
      label: 'Total',
      sortable: false,
      render: (item: Insumo) =>
        item.precio_insumo
          ? `$${(item.precio_insumo * (item.cantidad || 0)).toLocaleString('es-CL')}`
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
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Insumos</h1>
          <p className="text-zinc-500">Gestiona los insumos de tu inventario</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nuevo Insumo
        </Button>
      </div>

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

          <Controller
            name="id_categoria"
            control={control}
            render={({ field }) => (
              <CustomSelect
                label="Categoría"
                placeholder="Selecciona una categoría"
                options={categorias.map((cat) => ({
                  value: cat.id_categoria,
                  label: cat.nombre_categoria,
                }))}
                value={field.value}
                onChange={(value) => field.onChange(value ? Number(value) : undefined)}
                error={errors.id_categoria?.message}
              />
            )}
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
            type="text"
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

      <Modal
        isOpen={isStockModalOpen}
        onClose={handleCloseStockModal}
        title={`Actualizar Stock - ${selectedInsumo?.nombre_insumo}`}
      >
        <form onSubmit={handleSubmitStock(onStockSubmit)} className="space-y-4">
          <Input
            label="Cantidad en stock"
            type="number"
            step="1"
            placeholder="0"
            error={stockErrors.cantidad?.message}
            {...registerStock('cantidad', { valueAsNumber: true })}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseStockModal}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isStockSubmitting || updateStockMutation.isPending}
              className="flex-1"
            >
              Actualizar Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InsumosPage;