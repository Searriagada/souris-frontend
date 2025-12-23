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

type PrecioVentaFormData = z.infer<typeof precioVentaSchema>;

export function ProductoCostoModal({
  isOpen,
  onClose,
  producto,
  onUpdate,
}: any) {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<PrecioVentaFormData>({
    resolver: zodResolver(precioVentaSchema),
    defaultValues: { precio_venta: producto?.precio_venta || 0 },
  });

  const precioVentaActual = watch('precio_venta');

  useEffect(() => {
    if (producto) reset({ precio_venta: Number(producto.precio_venta) || 0 });
  }, [producto, reset]);

  if (!producto) return null;

  const costoTotal = Number(producto.costo_total) || 0;
  const utilidad = Number(producto.utilidad) || 0;
  const costoDespacho = Number(producto.despacho) || 0;
  const comision = Number(producto.comision) || 0;
  const montoEnvioGratis = Number(producto.monto_envio_gratis) || 0;
  const precioVenta = precioVentaActual || Number(producto.precio_venta) || 0;

  const precioEstimado = Number(producto.precio_venta_estimado) || precioVenta;
  const neto =  precioVenta / 1.19;
  const iva = precioVenta - neto;
  const montoComision = precioVenta * comision;
  const despachoFinal = precioVenta >= montoEnvioGratis ? costoDespacho : 0;

console.log({ precioVenta, montoEnvioGratis, costoDespacho, despachoFinal });

  const onSubmit = async (data: PrecioVentaFormData) => {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${producto.nombre_producto}`} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-zinc-400">Costo total:</span><span className="text-white">{formatCLP(costoTotal)}</span></div>
            {(() => {
              const gananciaReal = precioVenta - costoTotal - montoComision - despachoFinal - iva;
              const esNegativa = gananciaReal < 0;
              return (
                <>
                  <div className="flex justify-between"><span className="text-zinc-400">Utilidad esperada:</span><span className="text-white-400">{formatCLP(utilidad)}</span></div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-semibold">Ganancia real:</span>
                    <span className={`font-bold text-lg ${esNegativa ? 'text-pink-400' : 'text-green-400'}`}>
                      {esNegativa ? '-' : ''}{formatCLP(Math.abs(gananciaReal))}
                    </span>
                  </div>
                </>
              );
            })()}
            <div className="border-t border-zinc-700 pt-3" />
            <div className="flex justify-between"><span className="text-zinc-400">Despacho:</span><span className="text-white">{formatCLP(despachoFinal)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Comisión ({(comision * 100).toFixed(0)}%):</span><span className="text-white">{formatCLP(montoComision)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">Neto:</span><span className="text-white">{formatCLP(neto)}</span></div>
            <div className="flex justify-between"><span className="text-zinc-400">IVA:</span><span className="text-white">{formatCLP(iva)}</span></div>
            <div className="flex justify-between"><span className="text-white font-semibold">Precio final:</span><span className="text-amber-400 font-bold text-lg">{formatCLP(precioVenta)}</span></div>
            <div className="flex justify-between py-2 px-2 bg-zinc-700/30 rounded"><span className="text-zinc-300 text-xs">Sugerido:</span><span className="text-amber-300">{formatCLP(precioEstimado)}</span></div>
          </div>
        </div>

        <div className="p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Actualizar Precio</h3>
          <Input label="" type="number" placeholder="0" step="1" error={errors.precio_venta?.message} {...register('precio_venta', { valueAsNumber: true })} />
        </div>

        {(() => {
          const diferencia = precioEstimado - precioVenta;
          const umbralMinimo = 1; // umbral mínimo para diferencia decimal
          return diferencia > umbralMinimo && precioVenta > 0 && (
            <div className="p-3 bg-amber-950/50 border border-amber-700 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-200 font-medium">Precio por debajo del sugerido</p>
                <p className="text-amber-100/70 text-xs mt-1">Diferencia: {formatCLP(diferencia)}</p>
              </div>
            </div>
          );
        })()}
        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={isSubmitting || isLoading}>Cancelar</Button>
          <Button type="submit" isLoading={isSubmitting || isLoading} className="flex-1">Guardar Precio</Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductoCostoModal;