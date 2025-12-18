/**
 * Hook para cálculos de costos y precios de venta
 * Implementa la misma lógica del backend para validación en frontend
 */

interface ProductoCostosInput {
  costoTotal: number;
  precioVenta: number;
  utilidad: number; 
  costoDespacho: number;
  comision: number; 
  montoEnvioGratis: number;
}

interface ProductoCostosOutput {
  utilidad: number; 
  despacho: number;
  comision: number; 
  neto: number;
  iva: number;
  precioVentaEstimado: number;
  precioVentaFinal: number;
}

/**
 * Calcula todos los valores de costos y precios basado en el precio de venta
 */
export function useProductoCostos(input: ProductoCostosInput): ProductoCostosOutput {
  const {
    costoTotal,
    precioVenta,
    utilidad,
    costoDespacho,
    comision,
    montoEnvioGratis,
  } = input;

  // Validaciones básicas
  if (!costoTotal || costoTotal <= 0) {
    return {
      utilidad: 0,
      despacho: 0,
      comision: 0,
      neto: 0,
      iva: 0,
      precioVentaEstimado: 0,
      precioVentaFinal: precioVenta,
    };
  }

  // Cálculos basados en el precio de venta ingresado
  const valorUtilidad = utilidad * costoTotal;
  
  // Desglose del precio de venta
  const neto = precioVenta / 1.19;
  const iva = precioVenta - neto;
  
  // Comisión sobre el neto
  const montoComision = neto * comision;
  
  // Despacho (aplica si el precio está por debajo del monto de envío gratis)
  let despachoFinal = costoDespacho;
  if (precioVenta < montoEnvioGratis) {
    despachoFinal = 0;
  }

  return {
    utilidad: valorUtilidad,
    despacho: despachoFinal,
    comision: montoComision,
    neto,
    iva,
    precioVentaEstimado: precioVenta,
    precioVentaFinal: precioVenta,
  };
}

/**
 * Calcula el precio de venta estimado basándose en los parámetros
 * (Útil para mostrar el precio sugerido)
 */
export function calcularPrecioVentaEstimado(input: ProductoCostosInput): number {
  const {
    costoTotal,
    utilidad,
    costoDespacho,
    comision,
    montoEnvioGratis,
  } = input;

  if (!costoTotal || costoTotal <= 0) return 0;

  const valorUtilidad = utilidad * costoTotal;
  const variableCostos = 1 / 1.19 - comision;
  
  let precioEstimado = 0;
  const precalculo = (costoTotal + valorUtilidad) / variableCostos;

  if (precalculo < montoEnvioGratis) {
    precioEstimado = precalculo;
  } else {
    precioEstimado = (costoTotal + valorUtilidad + costoDespacho) / variableCostos;
  }

  return precioEstimado;
}

/**
 * Formatea un número como moneda chilena
 */
export function formatCLP(value: number | undefined): string {
  if (!value && value !== 0) return '$0';
  return `$${Math.round(value).toLocaleString('es-CL')}`;
}