import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, ExternalLink, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { categoriaService, insumoService, stockInsumoService } from '../services/entities.service';
import { insumoSchema, stockSchema } from '../schemas';
import { DataTable, Modal, Button, Input, CustomSelect } from '../components/ui';
export function InsumosPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInsumo, setSelectedInsumo] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState();
    const { data: response = { items: [], total: 0, pages: 0, page: 1 }, isLoading, error } = useQuery({
        queryKey: ['insumos', page, search, selectedCategory],
        queryFn: () => insumoService.getAll(page, search, selectedCategory),
    });
    const { items: insumos = [], pages } = response;
    const { data: categorias = [] } = useQuery({
        queryKey: ['categorias'],
        queryFn: categoriaService.getAll,
    });
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(insumoSchema),
    });
    const { register: registerStock, handleSubmit: handleSubmitStock, reset: resetStock, formState: { errors: stockErrors, isSubmitting: isStockSubmitting }, } = useForm({
        resolver: zodResolver(stockSchema),
    });
    const createMutation = useMutation({
        mutationFn: insumoService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            toast.success('Insumo creado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => insumoService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            toast.success('Insumo actualizado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateStockMutation = useMutation({
        mutationFn: ({ id, cantidad }) => stockInsumoService.update(id, { cantidad }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['insumos'] });
            toast.success('Stock actualizado exitosamente');
            handleCloseStockModal();
        },
        onError: (error) => {
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
    const handleOpenEdit = (insumo) => {
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
    const handleOpenStockModal = (insumo) => {
        setSelectedInsumo(insumo);
        resetStock({ cantidad: insumo.cantidad || 0 });
        setIsStockModalOpen(true);
    };
    const handleCloseStockModal = () => {
        setIsStockModalOpen(false);
        setSelectedInsumo(null);
        resetStock();
    };
    const onStockSubmit = (data) => {
        if (selectedInsumo) {
            updateStockMutation.mutate({ id: selectedInsumo.id_insumo, cantidad: data.cantidad });
        }
    };
    const onSubmit = (data) => {
        const cleanData = {
            ...data,
            id_categoria: data.id_categoria === null ? undefined : data.id_categoria,
            link_insumo: data.link_insumo === '' ? undefined : data.link_insumo,
        };
        if (selectedInsumo) {
            updateMutation.mutate({ id: selectedInsumo.id_insumo, data: cleanData });
        }
        else {
            createMutation.mutate(cleanData);
        }
    };
    const columns = [
        {
            key: 'nombre_insumo',
            label: 'Nombre',
            sortable: true,
            render: (item) => (_jsx("div", { children: _jsx("p", { className: "font-medium text-white", children: item.nombre_insumo }) })),
        },
        {
            key: 'nombre_categoria',
            label: 'Categoría',
            sortable: true,
            render: (item) => (_jsx("p", { className: "font-medium text-white", children: item.nombre_categoria || '—' })),
        },
        {
            key: 'cantidad',
            label: 'Stock',
            sortable: true,
            render: (item) => (_jsx("button", { onClick: () => handleOpenStockModal(item), className: "font-medium text-pink-400 hover:text-pink-700 hover:underline transition-colors", children: item.cantidad || 0 })),
        },
        {
            key: 'precio_insumo',
            label: 'Precio',
            sortable: false,
            render: (item) => item.precio_insumo
                ? `$${Math.round(item.precio_insumo).toLocaleString('es-CL')}`
                : '—',
        },
        {
            key: 'total_value',
            label: 'Total',
            sortable: false,
            render: (item) => item.precio_insumo
                ? `$${(item.precio_insumo * (item.cantidad || 0)).toLocaleString('es-CL')}`
                : '—',
        },
        {
            key: 'link_insumo',
            label: 'Link',
            render: (item) => item.link_insumo ? (_jsxs("a", { href: item.link_insumo, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-amber-500 hover:text-amber-400", children: ["Ver ", _jsx(ExternalLink, { className: "w-3 h-3" })] })) : ('—'),
        },
    ];
    const tableActions = (item) => (_jsx("div", { className: "flex items-center justify-end gap-2", children: _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", title: "Editar", children: _jsx(Pencil, { className: "w-4 h-4" }) }) }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-serif text-white", children: "Insumos" }) }), _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nuevo Insumo" })] }), _jsxs("div", { className: "flex items-end gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }, placeholder: "Buscar insumos...", className: "w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500" }), search && (_jsx("button", { onClick: () => {
                                    setSearch('');
                                    setPage(1);
                                }, className: "absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded transition-colors", title: "Limpiar b\u00FAsqueda", children: _jsx(X, { className: "w-5 h-5 text-zinc-500 hover:text-white" }) }))] }), _jsx("div", { className: "w-64", children: _jsx(CustomSelect, { label: "Filtrar por categor\u00EDa", placeholder: "Todas", options: [
                                { value: 0, label: 'Todas las categorías' },
                                ...categorias.map((cat) => ({
                                    value: cat.id_categoria,
                                    label: cat.nombre_categoria,
                                })),
                            ], value: selectedCategory, onChange: (value) => {
                                setSelectedCategory(value ? Number(value) : undefined);
                                setPage(1);
                            } }) })] }), _jsx(DataTable, { data: insumos, columns: columns, keyField: "id_insumo", isLoading: isLoading, error: error?.message, emptyMessage: "No hay insumos registrados", actions: tableActions }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "Anterior" }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-sm text-zinc-400", children: ["P\u00E1gina ", page, " de ", pages] }) }), _jsx(Button, { variant: "secondary", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Siguiente" })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedInsumo ? 'Editar Insumo' : 'Nuevo Insumo', children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Nombre del insumo", placeholder: "Ej: Hilo de plata", error: errors.nombre_insumo?.message, ...register('nombre_insumo') }), _jsx(Controller, { name: "id_categoria", control: control, render: ({ field }) => (_jsx(CustomSelect, { label: "Categor\u00EDa", placeholder: "Selecciona una categor\u00EDa", options: categorias.map((cat) => ({
                                    value: cat.id_categoria,
                                    label: cat.nombre_categoria,
                                })), value: field.value, onChange: (value) => field.onChange(value ? Number(value) : undefined), error: errors.id_categoria?.message })) }), _jsx(Input, { label: "Precio", type: "number", step: "0.1", placeholder: "0", error: errors.precio_insumo?.message, ...register('precio_insumo', { valueAsNumber: true }) }), _jsx(Input, { label: "Link de compra", type: "text", placeholder: "https://...", error: errors.link_insumo?.message, ...register('link_insumo') }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || createMutation.isPending || updateMutation.isPending, className: "flex-1", children: selectedInsumo ? 'Guardar cambios' : 'Crear insumo' })] })] }) }), _jsx(Modal, { isOpen: isStockModalOpen, onClose: handleCloseStockModal, title: `Actualizar Stock - ${selectedInsumo?.nombre_insumo}`, children: _jsxs("form", { onSubmit: handleSubmitStock(onStockSubmit), className: "space-y-4", children: [_jsx(Input, { label: "Cantidad en stock", type: "number", step: "1", placeholder: "0", error: stockErrors.cantidad?.message, ...registerStock('cantidad', { valueAsNumber: true }) }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseStockModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isStockSubmitting || updateStockMutation.isPending, className: "flex-1", children: "Actualizar Stock" })] })] }) })] }));
}
export default InsumosPage;
