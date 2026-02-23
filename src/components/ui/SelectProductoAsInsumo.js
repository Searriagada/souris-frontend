import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { Button } from './Button';
import api from '../../services/api';
const formatCLP = (value) => {
    if (value === undefined || value === null)
        return null;
    const num = Number(value);
    if (Number.isNaN(num))
        return null;
    return num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
// ==================== COMPONENT ====================
export function ProductoInsumoSelector({ items, onChange, isLoadingItems = false, title = 'Productos como Insumo' }) {
    const [selectedProductoId, setSelectedProductoId] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    const { data: productosDisponibles = [], isLoading } = useQuery({
        queryKey: ['productos-as-insumo-selector'],
        queryFn: async () => {
            const response = await api.get('/productos/as-insumos/all');
            return response.data?.data || [];
        },
    });
    const productosArray = Array.isArray(productosDisponibles) ? productosDisponibles : [];
    const productosFiltrados = productosArray.filter((producto) => producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()));
    console.log('searchTerm:', searchTerm);
    console.log('productosArray:', productosArray);
    console.log('productosFiltrados:', productosFiltrados);
    const resetForm = () => {
        setSelectedProductoId('');
        setCantidad(1);
        setSearchTerm('');
        setEditingIndex(null);
        setIsDropdownOpen(false);
    };
    const handleAgregar = () => {
        if (!selectedProductoId || cantidad <= 0)
            return;
        const producto = productosArray.find((p) => p.id_producto === selectedProductoId);
        if (!producto)
            return;
        const existingIndex = items.findIndex((item) => item.id_producto_as_insumo === selectedProductoId);
        if (existingIndex !== -1 && editingIndex === null) {
            const updated = [...items];
            updated[existingIndex].cantidad += cantidad;
            if (producto.costo_fijo) {
                updated[existingIndex].subtotal = updated[existingIndex].cantidad * producto.costo_fijo;
            }
            onChange(updated);
        }
        else if (editingIndex !== null) {
            const updated = [...items];
            updated[editingIndex] = {
                id_producto_as_insumo: producto.id_producto,
                nombre_producto: producto.nombre_producto,
                cantidad,
                costo_fijo: producto.costo_fijo,
                subtotal: producto.costo_fijo ? cantidad * producto.costo_fijo : undefined,
            };
            onChange(updated);
        }
        else {
            const nuevoItem = {
                id_producto_as_insumo: producto.id_producto,
                nombre_producto: producto.nombre_producto,
                cantidad,
                costo_fijo: producto.costo_fijo,
                subtotal: producto.costo_fijo ? cantidad * producto.costo_fijo : undefined,
            };
            onChange([...items, nuevoItem]);
        }
        resetForm();
    };
    const handleEditar = (index) => {
        const item = items[index];
        setSelectedProductoId(item.id_producto_as_insumo);
        setCantidad(item.cantidad);
        setSearchTerm(item.nombre_producto);
        setEditingIndex(index);
    };
    const handleEliminar = (index) => {
        onChange(items.filter((_, i) => i !== index));
        if (editingIndex === index) {
            resetForm();
        }
    };
    const handleSelectProducto = (producto) => {
        setSelectedProductoId(producto.id_producto);
        setSearchTerm(producto.nombre_producto);
        setIsDropdownOpen(false);
    };
    const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    return (_jsxs("div", { className: "space-y-4", children: [title && (_jsx("div", { className: "flex items-center gap-2", children: _jsx("h3", { className: "text-white font-medium", children: title }) })), _jsxs("div", { className: "p-4 bg-zinc-800/50 rounded-lg border border-zinc-700", children: [_jsx("p", { className: "text-sm text-zinc-400 mb-4", children: editingIndex !== null ? 'Editando producto' : 'Agregar producto' }), _jsxs("div", { className: "grid grid-cols-12 gap-3", children: [_jsx("div", { className: "col-span-7 relative", ref: dropdownRef, children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsx("input", { type: "text", value: searchTerm, onChange: (e) => {
                                                setSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                                if (!e.target.value)
                                                    setSelectedProductoId('');
                                            }, onFocus: () => setIsDropdownOpen(true), placeholder: "Buscar producto...", className: "w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500" }), isDropdownOpen && (_jsx("div", { className: "absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto", children: isLoading ? (_jsx("div", { className: "px-4 py-3 text-sm text-zinc-500", children: "Cargando..." })) : productosFiltrados.length > 0 ? (productosFiltrados.map((producto) => (_jsx("button", { type: "button", onClick: () => handleSelectProducto(producto), className: `w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors ${selectedProductoId === producto.id_producto
                                                    ? 'bg-amber-500/10 text-amber-400'
                                                    : 'text-zinc-300'}`, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "block", children: producto.nombre_producto }), _jsx("span", { className: "text-xs text-zinc-500", children: producto.sku })] }), formatCLP(producto.costo_fijo) && (_jsxs("span", { className: "text-xs text-zinc-500", children: ["$", formatCLP(producto.costo_fijo)] }))] }) }, producto.id_producto)))) : (_jsx("div", { className: "px-4 py-3 text-sm text-zinc-500", children: "Sin resultados" })) }))] }) }), _jsx("div", { className: "col-span-3", children: _jsx("input", { type: "number", min: "1", value: cantidad, onChange: (e) => setCantidad(Number(e.target.value)), placeholder: "Cant.", className: "w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500" }) }), _jsx("div", { className: "col-span-2", children: _jsx(Button, { type: "button", onClick: handleAgregar, disabled: !selectedProductoId || cantidad <= 0, className: "w-full h-full", children: editingIndex !== null ? _jsx(Pencil, { className: "w-4 h-4" }) : _jsx(Plus, { className: "w-4 h-4" }) }) })] }), editingIndex !== null && (_jsx("button", { type: "button", onClick: resetForm, className: "mt-2 text-sm text-zinc-400 hover:text-white transition-colors", children: "Cancelar edici\u00F3n" }))] }), _jsx("div", { className: "border border-zinc-800 rounded-lg overflow-hidden", children: isLoadingItems ? (_jsxs("div", { className: "px-4 py-8 text-center", children: [_jsx("div", { className: "animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" }), _jsx("p", { className: "text-zinc-500 text-sm", children: "Cargando productos..." })] })) : items.length > 0 ? (_jsxs("div", { className: "divide-y divide-zinc-800", children: [_jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-800/20 text-xs font-medium text-zinc-500 uppercase tracking-wider", children: [_jsx("div", { className: "col-span-5", children: "Producto" }), _jsx("div", { className: "col-span-2 text-center", children: "Cantidad" }), _jsx("div", { className: "col-span-2 text-right", children: "Costo Fijo" }), _jsx("div", { className: "col-span-2 text-right", children: "Subtotal" }), _jsx("div", { className: "col-span-1" })] }), items.map((item, index) => (_jsxs("div", { className: `grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${editingIndex === index
                                ? 'bg-amber-500/5 border-l-2 border-amber-500'
                                : 'hover:bg-zinc-800/30'}`, children: [_jsx("div", { className: "col-span-5", children: _jsx("span", { className: "text-white font-medium text-sm", children: item.nombre_producto }) }), _jsx("div", { className: "col-span-2 text-center", children: _jsx("span", { className: "px-2 py-1 bg-zinc-800 rounded text-zinc-300 text-sm", children: item.cantidad }) }), _jsx("div", { className: "col-span-2 text-right text-zinc-400 text-sm", children: formatCLP(item.costo_fijo) ? `$${formatCLP(item.costo_fijo)}` : '-' }), _jsx("div", { className: "col-span-2 text-right text-amber-400 font-medium text-sm", children: formatCLP(item.subtotal) ? `$${formatCLP(item.subtotal)}` : '-' }), _jsxs("div", { className: "col-span-1 flex justify-end gap-1", children: [_jsx("button", { type: "button", onClick: () => handleEditar(index), className: "p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors", title: "Editar", children: _jsx(Pencil, { className: "w-3.5 h-3.5" }) }), _jsx("button", { type: "button", onClick: () => handleEliminar(index), className: "p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors", title: "Eliminar", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] }, `${item.id_producto_as_insumo}-${index}`))), total > 0 && (_jsxs("div", { className: "grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/30", children: [_jsx("div", { className: "col-span-9 text-right text-zinc-400 font-medium text-sm", children: "Total:" }), _jsxs("div", { className: "col-span-2 text-right text-amber-400 font-semibold", children: ["$", formatCLP(total)] }), _jsx("div", { className: "col-span-1" })] }))] })) : (_jsxs("div", { className: "px-4 py-8 text-center", children: [_jsx(Package, { className: "w-10 h-10 text-zinc-700 mx-auto mb-2" }), _jsx("p", { className: "text-zinc-500 text-sm", children: "No hay productos agregados" }), _jsx("p", { className: "text-zinc-600 text-xs mt-1", children: "Usa el buscador para agregar productos como insumo" })] })) })] }));
}
export default ProductoInsumoSelector;
