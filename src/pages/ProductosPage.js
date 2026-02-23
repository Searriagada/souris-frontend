import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Pencil, Search, X, Power, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { productoService, tipoProductoService } from '../services/entities.service';
import { productoSchema } from '../schemas';
import { DataTable, Modal, ConfirmDialog, StatusBadge, Button, Input, CustomSelect } from '../components/ui';
import { InsumoSelector } from '../components/ui/SelectInsumoManufactura';
import { InsumoSelectorEmbalaje } from '../components/ui/SelectInsumoEmbalaje';
import { ProductoCostoModal } from '../components/ui/ProductoCostoModal';
import { ProductoInsumoSelector } from '../components/ui/SelectProductoAsInsumo';
export function ProductosPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isInsumosModalOpen, setIsInsumosModalOpen] = useState(false);
    const [isEmbalajeModalOpen, setIsEmbalajeModalOpen] = useState(false);
    const [isConfirmPublicadoOpen, setIsConfirmPublicadoOpen] = useState(false);
    const [selectedProducto, setSelectedProducto] = useState(null);
    const [isLoadingInsumos, setIsLoadingInsumos] = useState(false);
    const [isLoadingEmbalaje, setIsLoadingEmbalaje] = useState(false);
    const [insumosTemporales, setInsumosTemporales] = useState([]);
    const [embalajeTemporales, setEmbalajeTemporales] = useState([]);
    const [selectedCadena, setSelectedCadena] = useState(null);
    const [isCostoModalOpen, setIsCostoModalOpen] = useState(false);
    const [selectedProductoCosto, setSelectedProductoCosto] = useState(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockForm, setStockForm] = useState({ cantidad: 0, nota: '' });
    const [stockFormError, setStockFormError] = useState('');
    const [productoInsumoTemporales, setProductoInsumoTemporales] = useState([]);
    const [openProductoInsumo, setOpenProductoInsumo] = useState(false); // para el acordeón
    // Accordion states for Insumos modal
    const [openCadena, setOpenCadena] = useState(false);
    const [openCosteo, setOpenCosteo] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedTipoProducto, setSelectedTipoProducto] = useState();
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
    const cadenas = cadenasResponse || [];
    // Form principal
    const { register, handleSubmit, reset, control, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(productoSchema),
    });
    // Mutations
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/productos', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Producto creado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/productos/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Producto actualizado exitosamente');
            handleCloseModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateInsumosMutation = useMutation({
        mutationFn: ({ id, insumos, id_cadena, productos_insumo }) => api.put(`/productos/${id}/insumos`, { insumos, id_cadena, productos_insumo }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Insumos actualizados exitosamente');
            handleCloseInsumosModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateEmbalajesMutation = useMutation({
        mutationFn: ({ id, insumos }) => api.put(`/productos/${id}/embalajes`, { insumos }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Insumos actualizados exitosamente');
            handleCloseEmbalajeModal();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const togglePublicadoMLMutation = useMutation({
        mutationFn: (id) => api.patch(`/productos/${id}/toggle-publicado-ml`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Estado de publicación actualizado');
            setIsConfirmPublicadoOpen(false);
            setSelectedProducto(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
    const updateStockMutation = useMutation({
        mutationFn: ({ id, cantidad, nota }) => api.put(`/productos/${id}/stock`, { cantidad, nota }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['productos'] });
            toast.success('Stock actualizado exitosamente');
            handleCloseStockModal();
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.error || error.message || 'Error al actualizar stock';
            toast.error(errorMsg);
        },
    });
    // Handlers
    const handleOpenCreate = () => {
        setSelectedProducto(null);
        reset({
            sku: '',
            nombre_producto: '',
            descripcion: '',
            cantidad: 0,
            id_tipo_producto: undefined,
            utilidad: 1,
            costo_fijo: 0,
        });
        setIsModalOpen(true);
    };
    const handleOpenEdit = (producto) => {
        setSelectedProducto(producto);
        reset({
            sku: producto.sku,
            nombre_producto: producto.nombre_producto,
            descripcion: producto.descripcion || '',
            id_tipo_producto: producto.id_tipo ?? undefined,
            cantidad: producto.stock_actual || 0,
            utilidad: producto.utilidad || 1,
            costo_fijo: producto.costo_fijo || 0,
        });
        setIsModalOpen(true);
    };
    const handleOpenInsumosModal = async (producto) => {
        setSelectedProducto(producto);
        setIsInsumosModalOpen(true);
        setIsLoadingInsumos(true);
        setSelectedCadena(producto.id_cadena ?? null);
        try {
            // Cargar insumos normales
            const response = await api.get(`/productos/${producto.id_producto}/insumos`);
            const productoData = response.data?.data || [];
            const insumosCargados = productoData
                .filter((row) => row.id_insumo !== null)
                .map((row) => ({
                id_insumo: row.id_insumo,
                nombre_insumo: row.nombre_insumo || `Insumo ${row.id_insumo}`,
                cantidad: row.cantidad || 0,
                precio_unitario: row.precio_insumo,
                subtotal: row.precio_insumo ? row.cantidad * row.precio_insumo : undefined,
            }));
            setInsumosTemporales(insumosCargados);
            // Cargar productos como insumo
            const responseProductoInsumo = await api.get(`/productos/as-insumos/${producto.id_producto}`);
            const productoInsumoData = responseProductoInsumo.data?.data || [];
            const productoInsumoCargados = productoInsumoData.map((row) => ({
                id_producto_as_insumo: row.id_producto_as_insumo,
                nombre_producto: row.nombre_producto,
                sku: row.nombre_producto,
                cantidad: row.cantidad || 0,
                costo_fijo: row.costo_fijo,
                subtotal: row.costo_fijo ? row.cantidad * row.costo_fijo : undefined,
            }));
            setProductoInsumoTemporales(productoInsumoCargados);
        }
        catch (error) {
            console.error('Error al cargar insumos del producto:', error);
            toast.error('Error al cargar los insumos del producto');
            setInsumosTemporales([]);
            setProductoInsumoTemporales([]);
        }
        finally {
            setIsLoadingInsumos(false);
        }
    };
    const handleOpenEmbalajeModal = async (producto) => {
        setSelectedProducto(producto);
        setIsEmbalajeModalOpen(true);
        setIsLoadingEmbalaje(true);
        setSelectedCadena(producto.id_cadena ?? null);
        try {
            const response = await api.get(`/productos/${producto.id_producto}/embalajes`);
            const productoData = response.data?.data || [];
            const embalajesCargados = productoData
                .filter((row) => row.id_insumo !== null)
                .map((row) => ({
                id_insumo: row.id_insumo,
                nombre_insumo: row.nombre_insumo || `Insumo ${row.id_insumo}`,
                cantidad: row.cantidad || 0,
                precio_unitario: row.precio_insumo,
                subtotal: row.precio_insumo ? row.cantidad * row.precio_insumo : undefined,
            }));
            setEmbalajeTemporales(embalajesCargados);
        }
        catch (error) {
            console.error('Error al cargar insumos del producto:', error);
            toast.error('Error al cargar los insumos del producto');
            setEmbalajeTemporales([]);
        }
        finally {
            setIsLoadingEmbalaje(false);
        }
    };
    const handleCloseEmbalajeModal = () => {
        setIsEmbalajeModalOpen(false);
        setSelectedProducto(null);
        setEmbalajeTemporales([]);
        setSelectedCadena(null);
    };
    const handleOpenPublicadoConfirm = (producto) => {
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
        setProductoInsumoTemporales([]);
        setSelectedCadena(null);
    };
    const handleOpenCostoModal = async (producto) => {
        try {
            const response = await api.get(`/productos/${producto.id_producto}/costo`);
            const productoCostos = response.data?.data?.[0];
            if (!productoCostos) {
                toast.warning('No se pudieron cargar los datos');
                return;
            }
            setSelectedProductoCosto(productoCostos);
            setIsCostoModalOpen(true);
        }
        catch (error) {
            console.error(error);
            toast.error('Error al cargar costos');
        }
    };
    const handleCloseCostoModal = () => {
        setIsCostoModalOpen(false);
        setSelectedProductoCosto(null);
    };
    const handleOpenStockModal = (producto) => {
        setSelectedProducto(producto);
        setStockForm({ cantidad: 0, nota: '' });
        setStockFormError('');
        setIsStockModalOpen(true);
    };
    const handleCloseStockModal = () => {
        setIsStockModalOpen(false);
        setSelectedProducto(null);
        setStockForm({ cantidad: 0, nota: '' });
        setStockFormError('');
    };
    const handleStockSubmit = async () => {
        if (!selectedProducto)
            return;
        setStockFormError('');
        // Validar que la cantidad sea un número
        if (typeof stockForm.cantidad !== 'number') {
            setStockFormError('Cantidad debe ser un número');
            return;
        }
        const nuevoStock = (selectedProducto?.stock_actual ?? 0) + stockForm.cantidad;
        // Validar que no quede en negativo
        if (nuevoStock < 0) {
            setStockFormError(`No puedes retirar ${Math.abs(stockForm.cantidad)}. Stock disponible: ${selectedProducto.stock_actual}`);
            return;
        }
        try {
            await updateStockMutation.mutateAsync({
                id: selectedProducto.id_producto,
                cantidad: stockForm.cantidad,
                nota: stockForm.nota
            });
        }
        catch (error) {
            console.error('Error al actualizar stock:', error);
        }
    };
    const onSubmit = async (data) => {
        const payload = {
            sku: data.sku,
            nombre_producto: data.nombre_producto,
            descripcion: data.descripcion || undefined,
            id_tipo_producto: data.id_tipo_producto || undefined,
            utilidad: data.utilidad,
            cantidad: data.cantidad,
            costo_fijo: data.costo_fijo,
        };
        try {
            if (selectedProducto) {
                await updateMutation.mutateAsync({ id: selectedProducto.id_producto, data: payload });
            }
            else {
                await createMutation.mutateAsync(payload);
            }
        }
        catch (error) {
            console.error('Error al guardar producto:', error);
            toast.error(error.response?.data?.error || 'Error al guardar el producto');
        }
    };
    const onSubmitInsumos = async () => {
        if (!selectedProducto)
            return;
        const insumosPayload = insumosTemporales.map((item) => ({
            id_insumo: item.id_insumo,
            cantidad: item.cantidad,
        }));
        const productosInsumoPayload = productoInsumoTemporales.map((item) => ({
            id_producto_as_insumo: item.id_producto_as_insumo,
            cantidad: item.cantidad,
        }));
        try {
            await updateInsumosMutation.mutateAsync({
                id: selectedProducto.id_producto,
                insumos: insumosPayload,
                productos_insumo: productosInsumoPayload, // agregar esto
                id_cadena: selectedCadena
            });
        }
        catch (error) {
            console.error('Error al guardar insumos:', error);
            toast.error(error.response?.data?.error || 'Error al guardar los insumos');
        }
    };
    const onSubmitEmbalaje = async () => {
        if (!selectedProducto)
            return;
        const payload = embalajeTemporales.map((item) => ({
            id_insumo: item.id_insumo,
            cantidad: item.cantidad,
        }));
        try {
            await updateEmbalajesMutation.mutateAsync({
                id: selectedProducto.id_producto,
                insumos: payload,
            });
        }
        catch (error) {
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
            render: (item) => (_jsx("span", { className: "font-mono text-white-500", children: item.sku })),
        },
        {
            key: 'nombre_producto',
            label: 'Producto',
            sortable: true,
            render: (item) => (_jsx("div", { className: "flex items-center gap-3", children: _jsx("div", { children: _jsx("p", { className: "font-medium text-white", children: item.nombre_producto }) }) })),
        },
        {
            key: 'stock_actual',
            label: 'Stock',
            sortable: true,
            render: (item) => (_jsx("button", { onClick: () => handleOpenStockModal(item), className: "font-medium text-amber-200 hover:text-amber-400 hover:underline transition-colors", children: item.stock_actual || '—' })),
        },
        {
            key: 'nombre_tipo_producto',
            label: 'Tipo',
            sortable: true,
            render: (item) => (_jsx("p", { className: "font-medium text-white", children: item.nombre_tipo_producto || '—' })),
        },
        {
            key: 'joya',
            label: 'Joya',
            sortable: false,
            render: (item) => (_jsx("button", { onClick: () => handleOpenInsumosModal(item), className: "font-medium text-amber-200 hover:text-amber-400 hover:underline transition-colors", children: item.joya ? `$${Math.round(Number(item.joya)).toLocaleString('es-CL')}` : '—' })),
        },
        {
            key: 'costo_embalaje',
            label: 'Embalaje',
            sortable: true,
            render: (row) => (_jsxs("button", { onClick: () => handleOpenEmbalajeModal(row), className: " font-medium text-amber-200 hover:text-amber-400 hover:underline transition-colors" // px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 transition-colors duration-200 text-sm font-medium cursor-pointer
                , children: ["$", row.costo_embalaje ? Math.round(Number(row.costo_embalaje)).toLocaleString('es-CL') : '0'] })),
        },
        {
            key: 'costo_total',
            label: 'Costo total',
            sortable: true,
            render: (row) => (_jsxs("p", { className: "font-medium text-white", children: ["$", row.costo_total ? Math.round(Number(row.costo_total)).toLocaleString('es-CL') : '0'] })),
        },
        {
            key: 'precio_venta',
            label: 'Precio venta',
            sortable: true,
            render: (row) => (_jsxs("button", { onClick: () => handleOpenCostoModal(row), className: "font-medium text-green-500 hover:text-amber-500 hover:underline transition-colors", children: ["$", row.precio_venta ? Math.round(Number(row.precio_venta)).toLocaleString('es-CL') : '0'] })),
        },
        {
            key: 'publicado_ml',
            label: 'Publicado ML',
            render: (item) => (_jsx(StatusBadge, { status: item.publicado_ml && item.publicado_ml !== '' && item.publicado_ml === 'si' ? 'activo' : 'inactivo' })),
        },
    ];
    const tableActions = (item) => (_jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => handleOpenPublicadoConfirm(item), className: "p-2 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 rounded-lg transition-colors", title: item.publicado_ml && item.publicado_ml !== '' && item.publicado_ml === 'si' ? 'Pausar publicación' : 'Publicar', children: _jsx(Power, { className: "w-4 h-4" }) }), _jsx("button", { onClick: () => handleOpenEdit(item), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors", title: "Editar", children: _jsx(Pencil, { className: "w-4 h-4" }) })] }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { children: _jsx("h1", { className: "text-2xl font-serif text-white", children: "Productos" }) }), _jsx(Button, { onClick: handleOpenCreate, leftIcon: _jsx(Plus, { className: "w-5 h-5" }), children: "Nuevo Producto" })] }), _jsxs("div", { className: "flex items-end gap-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" }), _jsx("input", { type: "text", value: search, onChange: (e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }, placeholder: "Buscar productos...", className: "w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500" }), search && (_jsx("button", { onClick: () => {
                                    setSearch('');
                                    setPage(1);
                                }, className: "absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded transition-colors", title: "Limpiar b\u00FAsqueda", children: _jsx(X, { className: "w-5 h-5 text-zinc-500 hover:text-white" }) }))] }), _jsx("div", { className: "w-64", children: _jsx(CustomSelect, { label: "Filtrar por tipo", placeholder: "Todos", options: [
                                { value: 0, label: 'Todos los tipos' },
                                ...tiposProducto.map((tipo) => ({
                                    value: tipo.id_tipo,
                                    label: tipo.nombre_tipo_producto,
                                })),
                            ], value: selectedTipoProducto, onChange: (value) => {
                                setSelectedTipoProducto(value ? Number(value) : undefined);
                                setPage(1);
                            } }) })] }), _jsx(DataTable, { data: productos, columns: columns, keyField: "id_producto", isLoading: isLoading, error: error?.message, emptyMessage: "No hay productos registrados", actions: tableActions }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Button, { variant: "secondary", onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, children: "Anterior" }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs("span", { className: "text-sm text-zinc-400", children: ["P\u00E1gina ", page, " de ", pages] }) }), _jsx(Button, { variant: "secondary", onClick: () => setPage(Math.min(pages, page + 1)), disabled: page === pages, children: "Siguiente" })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: handleCloseModal, title: selectedProducto ? 'Editar Producto' : 'Nuevo Producto', size: "md", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(Input, { label: "SKU", placeholder: "Ej: CN001", error: errors.sku?.message, ...register('sku') }), _jsx(Controller, { name: "id_tipo_producto", control: control, render: ({ field }) => (_jsx(CustomSelect, { label: "Tipo de producto", placeholder: "Selecciona un tipo", options: tiposProducto.map((tipo) => ({
                                    value: tipo.id_tipo,
                                    label: tipo.nombre_tipo_producto,
                                })), value: field.value, onChange: (value) => field.onChange(value ? Number(value) : undefined), error: errors.id_tipo_producto?.message })) }), _jsx(Input, { label: "Nombre del producto", placeholder: "Ej: Collar de plata", error: errors.nombre_producto?.message, ...register('nombre_producto') }), _jsx(Input, { label: "Porcentaje de utilidad", placeholder: "1 = 100%", error: errors.utilidad?.message, ...register('utilidad', { valueAsNumber: true }) }), !selectedProducto && (_jsx(Input, { label: "Stock inicial", placeholder: "Ej: 10", error: errors.cantidad?.message, ...register('cantidad', { valueAsNumber: true }) })), _jsx(Input, { label: "Costo fijo (Productos de reventa)", placeholder: "S\u00F3lo para productos de reventa", error: errors.costo_fijo?.message, ...register('costo_fijo', { valueAsNumber: true }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-zinc-300", children: "Nota" }), _jsx("textarea", { placeholder: "A\u00F1adir informaci\u00F3n adicional", className: "\r\n                w-full px-4 py-3 \r\n                bg-zinc-900 border border-zinc-800 rounded-lg\r\n                text-white placeholder-zinc-600\r\n                transition-all duration-200 resize-none\r\n                focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500\r\n                hover:border-zinc-700\r\n              ", rows: 3, ...register('descripcion') }), errors.descripcion && (_jsx("p", { className: "text-sm text-red-400", children: errors.descripcion.message }))] }), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseModal, className: "flex-1", children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || createMutation.isPending || updateMutation.isPending, className: "flex-1", children: selectedProducto ? 'Guardar cambios' : 'Crear producto' })] })] }) }), _jsx(Modal, { isOpen: isInsumosModalOpen, onClose: handleCloseInsumosModal, title: ` ${selectedProducto?.sku}- ${selectedProducto?.nombre_producto}`, size: "lg", children: (() => {
                    // Calcular totales en tiempo real
                    const totalInsumos = insumosTemporales.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                    const cadenaSeleccionada = cadenas.find((c) => c.id_cadena === selectedCadena);
                    const precioCadena = parseFloat(cadenaSeleccionada?.precio?.toString() || '0');
                    const costoFijo = productoInsumoTemporales.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                    const totalGeneral = totalInsumos + precioCadena + costoFijo;
                    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "border border-zinc-700 rounded-lg overflow-visible", children: [_jsxs("button", { type: "button", onClick: () => setOpenProductoInsumo(!openProductoInsumo), className: "w-full flex items-center justify-between gap-3 px-4 py-3 bg-amber-900 hover:bg-amber-800 transition-colors", children: [_jsx("span", { className: "text-white font-medium", children: "Productos como Insumo" }), _jsx(ChevronDown, { className: `w-5 h-5 text-zinc-400 transition-transform ${openProductoInsumo ? 'rotate-180' : ''}` })] }), openProductoInsumo && (_jsx("div", { className: "p-4 border-t border-zinc-800", children: _jsx(ProductoInsumoSelector, { items: productoInsumoTemporales, onChange: setProductoInsumoTemporales, isLoadingItems: isLoadingInsumos, title: "" }) }))] }), _jsxs("div", { className: "border border-zinc-700 rounded-lg overflow-visible", children: [_jsxs("button", { type: "button", onClick: () => setOpenCadena((s) => !s), className: "w-full flex items-center justify-between gap-3 px-4 py-3 bg-amber-900 hover:bg-amber-800 transition-colors", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-white font-medium", children: "Cadena" }) }), _jsx(ChevronDown, { className: `w-5 h-5 text-zinc-400 transition-transform ${openCadena ? 'rotate-180' : ''}` })] }), openCadena && (_jsx("div", { className: "p-4 bg-zinc-800/50", children: _jsx(CustomSelect, { placeholder: "Selecciona una cadena (opcional)", options: [
                                                { value: 0, label: 'Sin cadena' },
                                                ...cadenas.map((cadena) => ({
                                                    value: cadena.id_cadena,
                                                    label: `${cadena.nombre_cadena}${cadena.precio ? ` - $${parseFloat(cadena.precio.toString()).toLocaleString('es-CL')}` : ''}`,
                                                })),
                                            ], value: selectedCadena ?? 0, onChange: (value) => setSelectedCadena(value && value !== 0 ? Number(value) : null) }) }))] }), _jsxs("div", { className: "border border-zinc-700 rounded-lg overflow-visible", children: [_jsxs("button", { type: "button", onClick: () => setOpenCosteo((s) => !s), className: "w-full flex items-center justify-between gap-3 px-4 py-3 bg-amber-900 hover:bg-amber-800 transition-colors", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: "text-white font-medium", children: "Costeo de insumos" }) }), _jsx(ChevronDown, { className: `w-5 h-5 text-zinc-400 transition-transform ${openCosteo ? 'rotate-180' : ''}` })] }), openCosteo && (_jsx("div", { className: "p-4 bg-zinc-800/30", children: _jsx(InsumoSelector, { items: insumosTemporales, onChange: setInsumosTemporales, isLoadingItems: isLoadingInsumos, title: "" }) }))] }), _jsx("div", { className: "mt-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Costo fijo:" }), _jsxs("span", { children: ["$", costoFijo.toLocaleString('es-CL')] })] }), _jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Insumos:" }), _jsxs("span", { children: ["$", totalInsumos.toLocaleString('es-CL')] })] }), _jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Cadena:" }), _jsxs("span", { children: ["$", precioCadena.toLocaleString('es-CL')] })] }), _jsxs("div", { className: "flex justify-between text-white font-semibold pt-2 border-t border-zinc-700", children: [_jsx("span", { children: "Costo total:" }), _jsxs("span", { className: "text-amber-400", children: ["$", totalGeneral.toLocaleString('es-CL')] })] })] }) }), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-zinc-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseInsumosModal, className: "flex-1", disabled: updateInsumosMutation.isPending, children: "Cancelar" }), _jsx(Button, { type: "button", onClick: onSubmitInsumos, isLoading: updateInsumosMutation.isPending, className: "flex-1", children: "Guardar" })] })] }));
                })() }), _jsx(Modal, { isOpen: isEmbalajeModalOpen, onClose: handleCloseEmbalajeModal, title: `${selectedProducto?.sku} - ${selectedProducto?.nombre_producto}`, size: "lg", children: (() => {
                    const totalEmbalajes = embalajeTemporales.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                    const precioJoya = parseFloat(selectedProducto?.joya?.toString() || '0');
                    const totalGeneral = totalEmbalajes + precioJoya;
                    return (_jsxs("div", { className: "space-y-6", children: [_jsx(InsumoSelectorEmbalaje, { items: embalajeTemporales, onChange: setEmbalajeTemporales, isLoadingItems: isLoadingEmbalaje, title: "Costo empaque" }), _jsx("div", { className: "p-4 bg-zinc-800/30 rounded-lg border border-zinc-700", children: _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Precio joya:" }), _jsxs("span", { children: ["$", precioJoya.toLocaleString('es-CL')] })] }), _jsxs("div", { className: "flex justify-between text-zinc-400", children: [_jsx("span", { children: "Embalajes:" }), _jsxs("span", { children: ["$", totalEmbalajes.toLocaleString('es-CL')] })] }), _jsxs("div", { className: "flex justify-between text-white font-semibold pt-2 border-t border-zinc-700", children: [_jsx("span", { children: "Costo total:" }), _jsxs("span", { className: "text-amber-400", children: ["$", totalGeneral.toLocaleString('es-CL')] })] })] }) }), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-zinc-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCloseEmbalajeModal, className: "flex-1", disabled: updateEmbalajesMutation.isPending, children: "Cancelar" }), _jsx(Button, { type: "button", onClick: onSubmitEmbalaje, isLoading: updateEmbalajesMutation.isPending, className: "flex-1", children: "Guardar" })] })] }));
                })() }), _jsx(Modal, { isOpen: isStockModalOpen, onClose: handleCloseStockModal, title: `Actualizar Stock - ${selectedProducto?.sku}`, size: "sm", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-zinc-800/50 rounded-lg border border-zinc-700", children: [_jsx("p", { className: "text-sm text-zinc-400", children: "Stock actual" }), _jsx("p", { className: "text-2xl font-semibold text-amber-400", children: selectedProducto?.stock_actual || 0 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-zinc-300 mb-2", children: "Cantidad a a\u00F1adir/retirar" }), _jsx("input", { type: "number", value: stockForm.cantidad, onChange: (e) => {
                                        setStockForm({ ...stockForm, cantidad: Number(e.target.value) });
                                        setStockFormError('');
                                    }, placeholder: "Positivo para a\u00F1adir, negativo para retirar", className: "w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-zinc-300 mb-2", children: "Nota" }), _jsx("textarea", { value: stockForm.nota, onChange: (e) => setStockForm({ ...stockForm, nota: e.target.value }), placeholder: "Ej: A\u00F1adir o retirar stock, correcci\u00F3n, etc.", className: "w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none", rows: 3 })] }), stockFormError && (_jsx("div", { className: "p-3 bg-red-500/10 border border-red-500/30 rounded-lg", children: _jsx("p", { className: "text-sm text-red-400", children: stockFormError }) })), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-zinc-800", children: [_jsx("button", { type: "button", onClick: handleCloseStockModal, disabled: updateStockMutation.isPending, className: "flex-1 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white hover:bg-zinc-800 transition-colors disabled:opacity-50", children: "Cancelar" }), _jsx("button", { type: "button", onClick: handleStockSubmit, disabled: updateStockMutation.isPending, className: "flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2", children: updateStockMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "animate-spin", children: "\u23F3" }), "Guardando..."] })) : ('Guardar') })] })] }) }), _jsx(ProductoCostoModal, { isOpen: isCostoModalOpen, onClose: handleCloseCostoModal, producto: selectedProductoCosto, onUpdate: () => {
                    queryClient.invalidateQueries({ queryKey: ['productos'] });
                    setIsCostoModalOpen(false);
                    setSelectedProductoCosto(null);
                } }), _jsx(ConfirmDialog, { isOpen: isConfirmPublicadoOpen, onClose: () => {
                    setIsConfirmPublicadoOpen(false);
                    setSelectedProducto(null);
                }, onConfirm: () => selectedProducto && togglePublicadoMLMutation.mutate(selectedProducto.id_producto), title: "Cambiar estado de publicaci\u00F3n", message: `¿${selectedProducto?.publicado_ml && selectedProducto?.publicado_ml !== '' && selectedProducto?.publicado_ml === 'si' ? 'Pausar' : 'Publicar'} "${selectedProducto?.nombre_producto}" en MercadoLibre?`, confirmText: selectedProducto?.publicado_ml && selectedProducto?.publicado_ml !== '' && selectedProducto?.publicado_ml === 'si' ? 'Pausar' : 'Publicar', isLoading: togglePublicadoMLMutation.isPending })] }));
}
export default ProductosPage;
