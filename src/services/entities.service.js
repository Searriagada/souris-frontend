import { createCrudService } from './crud.service';
import api from './api';
// Insumos
const insumoServiceBase = createCrudService('/insumos');
export const insumoService = {
    ...insumoServiceBase,
    async getAll(page = 1, search = '', categoryId) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '20');
        if (search)
            params.append('search', search);
        if (categoryId)
            params.append('categoryId', categoryId.toString());
        const response = await api.get(`/insumos?${params}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Error al obtener insumos');
        }
        return response.data.data;
    },
};
// Tipo Producto
export const tipoProductoService = createCrudService('/tipo-producto');
// StockInsumos
export const stockInsumoService = createCrudService('/stock-insumos');
// Productos
//export const productoService = createCrudService<Producto, CreateProductoDto, UpdateProductoDto>('/productos');
const productoServiceBase = createCrudService('/productos');
export const productoService = {
    ...productoServiceBase,
    async getAll(page = 1, search = '', tipoProducto) {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '20');
        if (search)
            params.append('search', search);
        if (tipoProducto)
            params.append('tipoProducto', tipoProducto.toString());
        const response = await api.get(`/productos?${params}`);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Error al obtener productos');
        }
        return response.data.data;
    },
};
// Tipo Producto
export const categoriaService = createCrudService('/categoria');
// Cajas
export const cajaService = createCrudService('/cajas');
// Cadenas
export const cadenaService = createCrudService('/cadenas');
// Plataformas de Venta
export const plataformaService = createCrudService('/plataformas');
// Clientes
export const clienteService = createCrudService('/clientes');
// Ventas
export const ventaService = createCrudService('/ventas');
