import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Pencil,
  Trash2,
  Power,
  Box,
  Link2,
  Store,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  cajaService,
  cadenaService,
  plataformaService,
} from '../services/entities.service';
import {
  cajaSchema,
  cadenaSchema,
  plataformaSchema,
  CajaFormData,
  CadenaFormData,
  PlataformaFormData,
} from '../schemas';
import { Caja, Cadena, PlataformaVenta } from '../types';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  StatusBadge,
  Button,
  Input,
} from '../components/ui';

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
          Gestiona las configuraciones base del sistema
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

// ==================== CADENAS TAB ====================
function CadenasTab() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Cadena | null>(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['cadenas'],
    queryFn: cadenaService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CadenaFormData>({
    resolver: zodResolver(cadenaSchema),
  });

  const createMutation = useMutation({
    mutationFn: cadenaService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadenas'] });
      toast.success('Cadena creada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CadenaFormData }) =>
      cadenaService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadenas'] });
      toast.success('Cadena actualizada exitosamente');
      handleCloseModal();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: cadenaService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadenas'] });
      toast.success('Cadena eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (item: Cadena) =>
      cadenaService.update(item.id_cadena, {
        status: item.status === 'activo' ? 'inactivo' : 'activo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cadenas'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    reset({ nombre_cadena: '', precio: 0 });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Cadena) => {
    setSelectedItem(item);
    reset({ nombre_cadena: item.nombre_cadena, precio: item.precio });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    reset();
  };

  const onSubmit = (data: CadenaFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id_cadena, data });
    } else {
      createMutation.mutate(data);
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
      label: 'Precio',
      sortable: true,
      render: (item: Cadena) => `$${item.precio.toLocaleString('es-CL')}`,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item: Cadena) => <StatusBadge status={item.status} />,
    },
  ];

  const tableActions = (item: Cadena) => (
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedItem ? 'Editar Cadena' : 'Nueva Cadena'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre"
            placeholder="Ej: Cadena dorada"
            error={errors.nombre_cadena?.message}
            {...register('nombre_cadena')}
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
        onConfirm={() => selectedItem && deleteMutation.mutate(selectedItem.id_cadena)}
        title="Eliminar Cadena"
        message={`¿Eliminar "${selectedItem?.nombre_cadena}"?`}
        confirmText="Eliminar"
        isLoading={deleteMutation.isPending}
      />
    </>
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
