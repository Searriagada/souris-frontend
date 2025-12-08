import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {Plus,Pencil,Trash2,Power,Box,Link2,Store,Settings,Package,Search} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import {cajaService,cadenaService,plataformaService} from '../services/entities.service';
import {cajaSchema,cadenaSchema,plataformaSchema,CajaFormData,CadenaFormData,PlataformaFormData} from '../schemas';
import { Caja, Cadena, PlataformaVenta, Insumo } from '../types';
import {DataTable,Modal,ConfirmDialog,StatusBadge,Button,Input} from '../components/ui';

type TabType = 'cajas' | 'cadenas' | 'plataformas';

export function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('cajas');

  const tabs = [
    { id: 'cajas' as TabType, label: 'Cajas', icon: Box },
    { id: 'cadenas' as TabType, label: 'Cadenas', icon: Link2 },
    { id: 'plataformas' as TabType, label: 'Plataformas', icon: Store },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-serif text-white">Configuración</h1>
        </div>
        <p className="text-zinc-500">
          Mantenedor de cajas, cadenas y plataforma de venta
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm
                border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-400 hover:text-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'cajas' && <CajasTab />}
      {activeTab === 'cadenas' && <CadenasTab />}
      {activeTab === 'plataformas' && <PlataformasTab />}
    </div>
  );
}

// ==================== CAJAS TAB ====================
function CajasTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Caja | null>(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['cajas'],
    queryFn: cajaService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CajaFormData>({
    resolver: zodResolver(cajaSchema),
  });

  const createMutation = useMutation({
    mutationFn: cajaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja creada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CajaFormData }) =>
      cajaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: cajaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Caja eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (item: Caja) =>
      cajaService.update(item.id_caja, {
        status: item.status === 'activo' ? 'inactivo' : 'activo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cajas'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    reset({ nombre_caja: '', precio: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Caja) => {
    setSelectedItem(item);
    reset({ nombre_caja: item.nombre_caja, precio: item.precio });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    reset();
  };

  const onSubmit = (data: CajaFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id_caja, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'nombre_caja',
      label: 'Nombre',
      sortable: true,
      render: (item: Caja) => (
        <span className="font-medium text-white">{item.nombre_caja}</span>
      ),
    },
    {
      key: 'precio',
      label: 'Precio',
      sortable: true,
      render: (item: Caja) => `$${item.precio.toLocaleString('es-CL')}`,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: Caja) => <StatusBadge status={item.status} />,
    },
  ];

  const tableActions = (item: Caja) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => toggleStatusMutation.mutate(item)}
        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Power className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleOpenEdit(item)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setSelectedItem(item);
          setIsDeleteDialogOpen(true);
        }}
        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nueva Caja
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        keyField="id_caja"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar cajas..."
        emptyMessage="No hay cajas registradas"
        actions={tableActions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Editar Caja' : 'Nueva Caja'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Caja pequeña"
            error={errors.nombre_caja?.message}
            {...register('nombre_caja')}
          />
          <Input
            label="Precio"
            type="number"
            step="0.1"
            placeholder="0"
            error={errors.precio?.message}
            {...register('precio', { valueAsNumber: true })}
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending} className="flex-1">
              {selectedItem ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedItem && deleteMutation.mutate(selectedItem.id_caja)}
        title="Eliminar Caja"
        message={`¿Eliminar "${selectedItem?.nombre_caja}"?`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

// ==================== TYPES PARA INSUMOS SELECTOR ====================
interface InsumoSeleccionado {
  id_insumo: number;
  nombre_insumo: string;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
}

// ==================== CADENAS TAB (CON INSUMO SELECTOR) ====================
function CadenasTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Cadena | null>(null);
  const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [insumosTemporales, setInsumosTemporales] = useState<InsumoSeleccionado[]>([]);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['cadenas'],
    queryFn: cadenaService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CadenaFormData>({
    resolver: zodResolver(cadenaSchema),
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setInsumosTemporales([]);
    reset({ nombre_cadena: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (item: Cadena) => {
    setSelectedItem(item);
    reset({ nombre_cadena: item.nombre_cadena });
    setIsModalOpen(true);
    setIsLoadingInsumos(true);
    
    try {
      const response = await api.get(`/cadenas/${item.id_cadena}`);
      const cadenaData = response.data?.data || [];
      
      const insumosCargados: InsumoSeleccionado[] = cadenaData
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
      console.error('Error al cargar insumos de la cadena:', error);
      toast.error('Error al cargar los insumos de la cadena');
      setInsumosTemporales([]);
    } finally {
      setIsLoadingInsumos(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setInsumosTemporales([]);
    reset();
  };

  const onSubmit = async (data: CadenaFormData) => {
    const payload = {
      ...data,
      insumos: insumosTemporales.map((item) => ({
        id_insumo: item.id_insumo,
        cantidad: item.cantidad,
      })),
    };

    setIsSaving(true);

    try {
      if (selectedItem) {
        await api.put(`/cadenas/${selectedItem.id_cadena}`, payload);
        toast.success('Cadena actualizada exitosamente');
      } else {
        await api.post('/cadenas', payload);
        toast.success('Cadena creada exitosamente');
      }
      queryClient.invalidateQueries({ queryKey: ['cadenas'] });
      handleCloseModal();
    } catch (error: any) {
      console.error('Error al guardar cadena:', error);
      toast.error(error.response?.data?.error || 'Error al guardar la cadena');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      key: 'nombre_cadena',
      label: 'Nombre',
      sortable: true,
      render: (item: Cadena) => (
        <span className="font-medium text-white">{item.nombre_cadena}</span>
      ),
    },
    {
      key: 'precio',
      label: 'Costo Total',
      sortable: true,
      render: (item: Cadena) => (
        <span className="text-amber-400 font-medium">
          ${(item.precio || 0).toLocaleString('es-CL')}
        </span>
      ),
    },
  ];

  const tableActions = (item: Cadena) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => handleOpenEdit(item)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nueva Cadena
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        keyField="id_cadena"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar cadenas..."
        emptyMessage="No hay cadenas registradas"
        actions={tableActions}
      />

      {/* Modal con Insumo Selector */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Editar Cadena' : 'Nueva Cadena'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campos básicos de la cadena */}
          <Input
            label="Nombre"
            placeholder="Ej: Cadena dorada"
            error={errors.nombre_cadena?.message}
            {...register('nombre_cadena')}
          />

          {/* Separador */}
          <div className="border-t border-zinc-800" />

          {/* Selector de Insumos */}
          <InsumoSelector
            items={insumosTemporales}
            onChange={setInsumosTemporales}
            isLoadingItems={isLoadingInsumos}
          />

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1" disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              isLoading={isSaving} 
              className="flex-1"
            >
              {selectedItem ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ==================== INSUMO SELECTOR COMPONENT ====================
interface InsumoSelectorProps {
  items: InsumoSeleccionado[];
  onChange: (items: InsumoSeleccionado[]) => void;
  isLoadingItems?: boolean;
}

function InsumoSelector({ items, onChange, isLoadingItems = false }: InsumoSelectorProps) {
  const [selectedInsumoId, setSelectedInsumoId] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const { data: insumosDisponibles = [], isLoading } = useQuery({
    queryKey: ['insumos-selector'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '500');
      const response = await api.get(`/insumos?${params}`);
      return response.data?.data?.items || [];
    },
  });

  const insumosArray = Array.isArray(insumosDisponibles) ? insumosDisponibles : [];

  const insumosFiltrados = insumosArray.filter((insumo: Insumo) =>
    insumo.nombre_insumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setSelectedInsumoId('');
    setCantidad(1);
    setSearchTerm('');
    setEditingIndex(null);
    setIsDropdownOpen(false);
  };

  const handleAgregar = () => {
    if (!selectedInsumoId || cantidad <= 0) return;

    const insumo = insumosArray.find((i: Insumo) => i.id_insumo === selectedInsumoId);
    if (!insumo) return;

    const existingIndex = items.findIndex((item) => item.id_insumo === selectedInsumoId);

    if (existingIndex !== -1 && editingIndex === null) {
      const updated = [...items];
      updated[existingIndex].cantidad += cantidad;
      if (insumo.precio_insumo) {
        updated[existingIndex].subtotal = updated[existingIndex].cantidad * insumo.precio_insumo;
      }
      onChange(updated);
    } else if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = {
        id_insumo: insumo.id_insumo,
        nombre_insumo: insumo.nombre_insumo,
        cantidad,
        precio_unitario: insumo.precio_insumo,
        subtotal: insumo.precio_insumo ? cantidad * insumo.precio_insumo : undefined,
      };
      onChange(updated);
    } else {
      const nuevoItem: InsumoSeleccionado = {
        id_insumo: insumo.id_insumo,
        nombre_insumo: insumo.nombre_insumo,
        cantidad,
        precio_unitario: insumo.precio_insumo,
        subtotal: insumo.precio_insumo ? cantidad * insumo.precio_insumo : undefined,
      };
      onChange([...items, nuevoItem]);
    }

    resetForm();
  };

  const handleEditar = (index: number) => {
    const item = items[index];
    setSelectedInsumoId(item.id_insumo);
    setCantidad(item.cantidad);
    setSearchTerm(item.nombre_insumo);
    setEditingIndex(index);
  };

  const handleEliminar = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleSelectInsumo = (insumo: Insumo) => {
    setSelectedInsumoId(insumo.id_insumo);
    setSearchTerm(insumo.nombre_insumo);
    setIsDropdownOpen(false);
  };

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-amber-500" />
        <h3 className="text-white font-medium">Insumos de la Cadena</h3>
      </div>

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p className="text-sm text-zinc-400 mb-4">
          {editingIndex !== null ? 'Editando insumo' : 'Agregar insumo'}
        </p>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 relative" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (!e.target.value) setSelectedInsumoId('');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Buscar insumo..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      Cargando...
                    </div>
                  ) : insumosFiltrados.length > 0 ? (
                    insumosFiltrados.map((insumo: Insumo) => (
                      <button
                        key={insumo.id_insumo}
                        type="button"
                        onClick={() => handleSelectInsumo(insumo)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors ${
                          selectedInsumoId === insumo.id_insumo
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block">{insumo.nombre_insumo}</span>
                            {insumo.nombre_categoria && (
                              <span className="text-xs text-zinc-500">{insumo.nombre_categoria}</span>
                            )}
                          </div>
                          {insumo.precio_insumo && (
                            <span className="text-xs text-zinc-500">
                              ${insumo.precio_insumo.toLocaleString('es-CL')}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      Sin resultados
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3">
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              placeholder="Cant."
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div className="col-span-2">
            <Button
              type="button"
              onClick={handleAgregar}
              disabled={!selectedInsumoId || cantidad <= 0}
              className="w-full h-full"
            >
              {editingIndex !== null ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetForm}
            className="mt-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar edición
          </button>
        )}
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {isLoadingItems ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Cargando insumos...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-800/20 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="col-span-5">Insumo</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">P. Unit.</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div
                key={`${item.id_insumo}-${index}`}
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                  editingIndex === index
                    ? 'bg-amber-500/5 border-l-2 border-amber-500'
                    : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="col-span-5">
                  <span className="text-white font-medium text-sm">{item.nombre_insumo}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 text-sm">{item.cantidad}</span>
                </div>
                <div className="col-span-2 text-right text-zinc-400 text-sm">
                  {item.precio_unitario ? `$${item.precio_unitario.toLocaleString('es-CL')}` : '-'}
                </div>
                <div className="col-span-2 text-right text-amber-400 font-medium text-sm">
                  {item.subtotal ? `$${item.subtotal.toLocaleString('es-CL')}` : '-'}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {total > 0 && (
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/30">
                <div className="col-span-9 text-right text-zinc-400 font-medium text-sm">
                  Total:
                </div>
                <div className="col-span-2 text-right text-amber-400 font-semibold">
                  ${total.toLocaleString('es-CL')}
                </div>
                <div className="col-span-1"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Package className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No hay insumos agregados</p>
            <p className="text-zinc-600 text-xs mt-1">
              Usa el buscador para agregar insumos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PLATAFORMAS TAB ====================
function PlataformasTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PlataformaVenta | null>(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['plataformas'],
    queryFn: plataformaService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlataformaFormData>({
    resolver: zodResolver(plataformaSchema),
  });

  const createMutation = useMutation({
    mutationFn: plataformaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plataformas'] });
      toast.success('Plataforma creada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlataformaFormData }) =>
      plataformaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plataformas'] });
      toast.success('Plataforma actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: plataformaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plataformas'] });
      toast.success('Plataforma eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (item: PlataformaVenta) =>
      plataformaService.update(item.id_plataforma, {
        status: item.status === 'activo' ? 'inactivo' : 'activo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plataformas'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    reset({ nombre_plataforma: '', comision: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PlataformaVenta) => {
    setSelectedItem(item);
    reset({ nombre_plataforma: item.nombre_plataforma, comision: item.comision });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    reset();
  };

  const onSubmit = (data: PlataformaFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id_plataforma, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'nombre_plataforma',
      label: 'Plataforma',
      sortable: true,
      render: (item: PlataformaVenta) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-zinc-500" />
          </div>
          <span className="font-medium text-white">{item.nombre_plataforma}</span>
        </div>
      ),
    },
    {
      key: 'comision',
      label: 'Comisión',
      sortable: true,
      render: (item: PlataformaVenta) => (
        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-sm font-medium">
          {item.comision}%
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: PlataformaVenta) => <StatusBadge status={item.status} />,
    },
  ];

  const tableActions = (item: PlataformaVenta) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => toggleStatusMutation.mutate(item)}
        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Power className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleOpenEdit(item)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        onClick={() => {
          setSelectedItem(item);
          setIsDeleteDialogOpen(true);
        }}
        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-5 h-5" />}>
          Nueva Plataforma
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        keyField="id_plataforma"
        isLoading={isLoading}
        error={error?.message}
        searchPlaceholder="Buscar plataformas..."
        emptyMessage="No hay plataformas registradas"
        actions={tableActions}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Editar Plataforma' : 'Nueva Plataforma'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: MercadoLibre"
            error={errors.nombre_plataforma?.message}
            {...register('nombre_plataforma')}
          />
          <Input
            label="Comisión (%)"
            type="number"
            step="0.1"
            placeholder="0"
            helperText="Porcentaje de comisión de la plataforma"
            error={errors.comision?.message}
            {...register('comision', { valueAsNumber: true })}
          />
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending} className="flex-1">
              {selectedItem ? 'Guardar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => selectedItem && deleteMutation.mutate(selectedItem.id_plataforma)}
        title="Eliminar Plataforma"
        message={`¿Eliminar "${selectedItem?.nombre_plataforma}"?`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}

export default ConfiguracionPage;
