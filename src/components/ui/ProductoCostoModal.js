import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { Modal, Input, Button } from './../ui';
import { formatCLP } from '../../components/hooks/useProductoCostos';
const precioVentaSchema = z.object({
    precio_venta: z.coerce
        .number()
        .min(0, 'El precio de venta debe ser mayor a 0')
        .max(999999999, 'Precio demasiado alto'),
});
export function ProductoCostoModal({ isOpen, onClose, producto, onUpdate, }) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(precioVentaSchema),
        defaultValues: { precio_venta: producto?.precio_venta || 0 },
    });
    const precioVentaActual = watch('precio_venta');
    useEffect(() => {
        if (producto)
            reset({ precio_venta: Number(producto.precio_venta) || 0 });
    }, [producto, reset]);
    if (!producto)
        return null;
    const costoTotal = Number(producto.costo_total) || 0;
    const utilidad = Number(producto.utilidad) || 0;
    const costoDespacho = Number(producto.despacho) || 0;
    const comision = Number(producto.comision) || 0;
    const montoEnvioGratis = Number(producto.monto_envio_gratis) || 0;
    const precioVenta = precioVentaActual || Number(producto.precio_venta) || 0;
    const precioEstimado = Number(producto.precio_venta_estimado) || precioVenta;
    const neto = precioVenta / 1.19;
    const iva = precioVenta - neto;
    const montoComision = precioVenta * comision;
    const despachoFinal = precioVenta >= montoEnvioGratis ? costoDespacho : 0;
    console.log({ precioVenta, montoEnvioGratis, costoDespacho, despachoFinal });
    const onSubmit = async (data) => {
        if (!producto) {
            toast.error('Producto no válido');
            return;
        }
        setIsLoading(true);
        try {
            await api.put(`/productos/${producto.id_producto}`, { precio_venta: data.precio_venta });
            toast.success('Precio de venta actualizado exitosamente');
            onUpdate?.();
            onClose();
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Error al actualizar');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx(Modal, { isOpen: isOpen, onClose: onClose, title: `${producto.nombre_producto}`, size: "lg", children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsx("div", { className: "p-4 bg-zinc-800/50 rounded-lg border border-zinc-700", children: _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Costo total:" }), _jsx("span", { className: "text-white", children: formatCLP(costoTotal) })] }), (() => {
                                const gananciaReal = precioVenta - costoTotal - montoComision - despachoFinal - iva;
                                const esNegativa = gananciaReal < 0;
                                return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Utilidad esperada:" }), _jsx("span", { className: "text-white-400", children: formatCLP(utilidad) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400 font-semibold", children: "Ganancia real:" }), _jsxs("span", { className: `font-bold text-lg ${esNegativa ? 'text-pink-400' : 'text-green-400'}`, children: [esNegativa ? '-' : '', formatCLP(Math.abs(gananciaReal))] })] })] }));
                            })(), _jsx("div", { className: "border-t border-zinc-700 pt-3" }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Despacho:" }), _jsx("span", { className: "text-white", children: formatCLP(despachoFinal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsxs("span", { className: "text-zinc-400", children: ["Comisi\u00F3n (", (comision * 100).toFixed(0), "%):"] }), _jsx("span", { className: "text-white", children: formatCLP(montoComision) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "Neto:" }), _jsx("span", { className: "text-white", children: formatCLP(neto) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-zinc-400", children: "IVA:" }), _jsx("span", { className: "text-white", children: formatCLP(iva) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-white font-semibold", children: "Precio final:" }), _jsx("span", { className: "text-amber-400 font-bold text-lg", children: formatCLP(precioVenta) })] }), _jsxs("div", { className: "flex justify-between py-2 px-2 bg-zinc-700/30 rounded", children: [_jsx("span", { className: "text-zinc-300 text-xs", children: "Sugerido:" }), _jsx("span", { className: "text-amber-300", children: formatCLP(precioEstimado) })] })] }) }), _jsxs("div", { className: "p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg", children: [_jsx("h3", { className: "text-white font-semibold mb-3", children: "Actualizar Precio" }), _jsx(Input, { label: "", type: "number", placeholder: "0", step: "1", error: errors.precio_venta?.message, ...register('precio_venta', { valueAsNumber: true }) })] }), (() => {
                    const diferencia = precioEstimado - precioVenta;
                    const umbralMinimo = 1; // umbral mínimo para diferencia decimal
                    return diferencia > umbralMinimo && precioVenta > 0 && (_jsxs("div", { className: "p-3 bg-amber-950/50 border border-amber-700 rounded-lg flex gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "text-sm", children: [_jsx("p", { className: "text-amber-200 font-medium", children: "Precio por debajo del sugerido" }), _jsxs("p", { className: "text-amber-100/70 text-xs mt-1", children: ["Diferencia: ", formatCLP(diferencia)] })] })] }));
                })(), _jsxs("div", { className: "flex gap-3 pt-4 border-t border-zinc-800", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: onClose, className: "flex-1", disabled: isSubmitting || isLoading, children: "Cancelar" }), _jsx(Button, { type: "submit", isLoading: isSubmitting || isLoading, className: "flex-1", children: "Guardar Precio" })] })] }) }));
}
export default ProductoCostoModal;
