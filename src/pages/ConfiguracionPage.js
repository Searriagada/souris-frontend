import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Trash2, Power, Box, Link2, Store, Settings } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { cajaService, cadenaService, plataformaService } from '../services/entities.service';
import { cajaSchema, cadenaSchema, plataformaSchema } from '../schemas';
import { DataTable, Modal, ConfirmDialog, StatusBadge, Button, Input } from '../components/ui';
import { InsumoSelector } from '../components/ui/SelectInsumoManufactura';
export function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState('cajas');
    const tabs = [
        { id: 'cajas', label: 'Cajas', icon: Box },
        { id: 'cadenas', label: 'Cadenas', icon: Link2 },
        { id: 'plataformas', label: 'Plataformas', icon: Store },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Settings, { className: "w-6 h-6 text-amber-500" }), _jsx("h1", { className: "text-2xl font-serif text-white", children: "Configuraci\u00F3n" })] }), _jsx("p", { className: "text-zinc-500", children: "Mantenedor de cajas, cadenas y plataforma de venta" })] }), _jsx("div", { className: "flex gap-2 border-b border-zinc-800", children: tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `
                flex items-center gap-2 px-4 py-3 font-medium text-sm
                border-b-2 transition-all
                ${activeTab === tab.id
                            ? 'border-amber-500 text-amber-500'
                            : 'border-transparent text-zinc-400 hover:text-white'}
              `, children: [_jsx(Icon, { className: "w-4 h-4" }), tab.label] }, tab.id));
                }) }), activeTab === 'cajas' && _jsx(CajasTab, {}), activeTab === 'cadenas' && _jsx(CadenasTab, {}), activeTab === 'plataformas' && _jsx(PlataformasTab, {})] }));
}
// ==================== CAJAS TAB ====================
function CajasTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['cajas'],
        queryFn: cajaService.getAll,
    });
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(cajaSchema),
    });
    const createMutation = useMutation({
        mutationFn: cajaService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cajas'] });
            toast.success('Caja creada exitosamente');
            handleCloseModal();
        },
        onError: (error) => toast.error(error.message),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => cajaService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cajas'] });
            toast.success('Caja actualizada exitosamente');
            handleCloseModal();
        },
        onError: (error) => toast.error(error.message),
    });
    const deleteMutation = useMutation({
        mutationFn: cajaService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cajas'] });
            toast.success('Caja eliminada exitosamente');
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        },
        onError: (error) => toast.error(error.message),
    });
    const toggleStatusMutation = useMutation({
        mutationFn: (item) => cajaService.update(item.id_caja, {
            status: item.status === 'activo' ? 'inactivo' : 'activo',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cajas'] });
            toast.success('Estado actualizado');
        },
        onError: (error) => toast.error(error.message),
    });
    const handleOpenCreate = () => {
        setSelectedItem(null);
        reset({ nombre_caja: '', precio: 0 });
        setIsModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        reset({ nombre_caja: item.nombre_caja, precio: item.precio });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        reset();
    };
    const onSubmit = (data) => {
        if (selectedItem) {
            updateMutation.mutate({ id: selectedItem.id_caja, data });
        }
        else {
            createMutation.mutate(data);
        }
    };
    const columns = [
        {
            key: 'nombre_caja',
            label: 'Nombre',
            sortable: true,
            render: (item) => (_jsx("span", { className: "font-medium text-white", children: item.nombre_caja })),
        },
        {
            key: 'precio',
            label: 'Precio',
            sortable: true,
            render: (item) => `$${item.precio.toLocaleString('es-CL')}`,
        },
        {
            key: 'status',
            label: 'Estado',
            render: (item) => _jsx(StatusBadge, { status: item.status }),
        },
    ];
    const tableActions = (item) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => toggleStatusMutation.mutate(item), className: "p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Power, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => {
                    setSelectedItem(item);
                    setIsDeleteDialogOpen(true);
                }, className: "p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nueva Caja" }) }), _jsx(DataTable, { data: items, columns: columns, keyField: "id_caja", isLoading: isLoading, error: error?.message, searchPlaceholder: "Buscar cajas...", emptyMessage: "No hay cajas registradas", actions: tableActions }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedItem ? 'Editar Caja' : 'Nueva Caja', size: "sm", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Nombre", placeholder: "Ej: Caja peque\u00F1a", error: errors.nombre_caja?.message, ...register('nombre_caja') }), _jsx(Input, { label: "Precio", type: "number", step: "0.1", placeholder: "0", error: errors.precio?.message, ...register('precio', { valueAsNumber: true }) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || createMutation.isPending || updateMutation.isPending, className: "flex-1", children: selectedItem ? 'Guardar' : 'Crear' })] })] }) }), _jsx(ConfirmDialog, { isOpen: isDeleteDialogOpen, onClose: () => setIsDeleteDialogOpen(false), onConfirm: () => selectedItem && deleteMutation.mutate(selectedItem.id_caja), title: "Eliminar Caja", message: `¿Eliminar "${selectedItem?.nombre_caja}"?`, confirmText: "Eliminar", isLoading: deleteMutation.isPending })] }));
}
// ==================== CADENAS TAB ====================
function CadenasTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [insumosTemporales, setInsumosTemporales] = useState([]);
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['cadenas'],
        queryFn: cadenaService.getAll,
    });
    const { register, handleSubmit, reset, formState: { errors }, } = useForm({
        resolver: zodResolver(cadenaSchema),
    });
    const handleOpenCreate = () => {
        setSelectedItem(null);
        setInsumosTemporales([]);
        reset({ nombre_cadena: '' });
        setIsModalOpen(true);
    };
    const handleOpenEdit = async (item) => {
        setSelectedItem(item);
        reset({ nombre_cadena: item.nombre_cadena });
        setIsModalOpen(true);
        setIsLoadingInsumos(true);
        try {
            const response = await api.get(`/cadenas/${item.id_cadena}`);
            const cadenaData = response.data?.data || [];
            const insumosCargados = cadenaData
                .filter((row) => row.id_insumo !== null)
                .map((row) => ({
                id_insumo: row.id_insumo,
                nombre_insumo: row.nombre_insumo || `Insumo ${row.id_insumo}`,
                cantidad: row.cantidad || 0,
                precio_unitario: row.precio_insumo,
                subtotal: row.precio_insumo ? row.cantidad * row.precio_insumo : undefined,
            }));
            setInsumosTemporales(insumosCargados);
        }
        catch (error) {
            console.error('Error al cargar insumos de la cadena:', error);
            toast.error('Error al cargar los insumos de la cadena');
            setInsumosTemporales([]);
        }
        finally {
            setIsLoadingInsumos(false);
        }
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        setInsumosTemporales([]);
        reset();
    };
    const onSubmit = async (data) => {
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
            }
            else {
                await api.post('/cadenas', payload);
                toast.success('Cadena creada exitosamente');
            }
            queryClient.invalidateQueries({ queryKey: ['cadenas'] });
            handleCloseModal();
        }
        catch (error) {
            console.error('Error al guardar cadena:', error);
            toast.error(error.response?.data?.error || 'Error al guardar la cadena');
        }
        finally {
            setIsSaving(false);
        }
    };
    const columns = [
        {
            key: 'nombre_cadena',
            label: 'Nombre',
            sortable: true,
            render: (item) => (_jsx("span", { className: "font-medium text-white", children: item.nombre_cadena })),
        },
        {
            key: 'precio',
            label: 'Costo Total',
            sortable: true,
            render: (item) => (_jsxs("span", { className: "text-amber-400 font-medium", children: ["$", (item.precio || 0).toLocaleString('es-CL')] })),
        },
    ];
    const tableActions = (item) => (_jsx("div", { className: "flex items-center justify-end gap-2", children: _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Pencil, { className: "w-4 h-4" }) }) }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nueva Cadena" }) }), _jsx(DataTable, { data: items, columns: columns, keyField: "id_cadena", isLoading: isLoading, error: error?.message, searchPlaceholder: "Buscar cadenas...", emptyMessage: "No hay cadenas registradas", actions: tableActions }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedItem ? 'Editar Cadena' : 'Nueva Cadena', size: "lg", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsx(Input, { label: "Nombre", placeholder: "Ej: Cadena dorada", error: errors.nombre_cadena?.message, ...register('nombre_cadena') }), _jsx("div", { className: "border-t border-zinc-800" }), _jsx(InsumoSelector, { items: insumosTemporales, onChange: setInsumosTemporales, isLoadingItems: isLoadingInsumos, title: "Insumos de la Cadena" }), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-zinc-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", disabled: isSaving, children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSaving, className: "flex-1", children: selectedItem ? 'Guardar' : 'Crear' })] })] }) })] }));
}
// ==================== PLATAFORMAS TAB ====================
function PlataformasTab() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { data: items = [], isLoading, error } = useQuery({
        queryKey: ['plataformas'],
        queryFn: plataformaService.getAll,
    });
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(plataformaSchema),
    });
    const createMutation = useMutation({
        mutationFn: plataformaService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plataformas'] });
            toast.success('Plataforma creada exitosamente');
            handleCloseModal();
        },
        onError: (error) => toast.error(error.message),
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => plataformaService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plataformas'] });
            toast.success('Plataforma actualizada exitosamente');
            handleCloseModal();
        },
        onError: (error) => toast.error(error.message),
    });
    const deleteMutation = useMutation({
        mutationFn: plataformaService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plataformas'] });
            toast.success('Plataforma eliminada exitosamente');
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        },
        onError: (error) => toast.error(error.message),
    });
    const toggleStatusMutation = useMutation({
        mutationFn: (item) => plataformaService.update(item.id_plataforma, {
            status: item.status === 'activo' ? 'inactivo' : 'activo',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['plataformas'] });
            toast.success('Estado actualizado');
        },
        onError: (error) => toast.error(error.message),
    });
    const handleOpenCreate = () => {
        setSelectedItem(null);
        reset({ nombre_plataforma: '', comision: 0 });
        setIsModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setSelectedItem(item);
        reset({ nombre_plataforma: item.nombre_plataforma, comision: item.comision });
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
        reset();
    };
    const onSubmit = (data) => {
        if (selectedItem) {
            updateMutation.mutate({ id: selectedItem.id_plataforma, data });
        }
        else {
            createMutation.mutate(data);
        }
    };
    const columns = [
        {
            key: 'nombre_plataforma',
            label: 'Plataforma',
            sortable: true,
            render: (item) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center", children: _jsx(Store, { className: "w-5 h-5 text-zinc-500" }) }), _jsx("span", { className: "font-medium text-white", children: item.nombre_plataforma })] })),
        },
        {
            key: 'comision',
            label: 'Comisión',
            sortable: true,
            render: (item) => (_jsxs("span", { className: "px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-sm font-medium", children: [item.comision, "%"] })),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (item) => _jsx(StatusBadge, { status: item.status }),
        },
    ];
    const tableActions = (item) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => toggleStatusMutation.mutate(item), className: "p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Power, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Pencil, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => {
                    setSelectedItem(item);
                    setIsDeleteDialogOpen(true);
                }, className: "p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] }));
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "flex justify-end", children: _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nueva Plataforma" }) }), _jsx(DataTable, { data: items, columns: columns, keyField: "id_plataforma", isLoading: isLoading, error: error?.message, searchPlaceholder: "Buscar plataformas...", emptyMessage: "No hay plataformas registradas", actions: tableActions }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedItem ? 'Editar Plataforma' : 'Nueva Plataforma', size: "sm", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Nombre", placeholder: "Ej: MercadoLibre", error: errors.nombre_plataforma?.message, ...register('nombre_plataforma') }), _jsx(Input, { label: "Comisi\u00F3n (%)", type: "number", step: "0.1", placeholder: "0", helperText: "Porcentaje de comisi\u00F3n de la plataforma", error: errors.comision?.message, ...register('comision', { valueAsNumber: true }) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || createMutation.isPending || updateMutation.isPending, className: "flex-1", children: selectedItem ? 'Guardar' : 'Crear' })] })] }) }), _jsx(ConfirmDialog, { isOpen: isDeleteDialogOpen, onClose: () => setIsDeleteDialogOpen(false), onConfirm: () => selectedItem && deleteMutation.mutate(selectedItem.id_plataforma), title: "Eliminar Plataforma", message: `¿Eliminar "${selectedItem?.nombre_plataforma}"?`, confirmText: "Eliminar", isLoading: deleteMutation.isPending })] }));
}
export default ConfiguracionPage;
