import { createCrudService } from './crud.service';
import {
  Insumo,
  CreateInsumoDto,
  UpdateInsumoDto,
  Producto,
  CreateProductoDto,
  UpdateProductoDto,
  Caja,
  CreateCajaDto,
  UpdateCajaDto,
  Cadena,
  CreateCadenaDto,
  UpdateCadenaDto,
  PlataformaVenta,
  CreatePlataformaDto,
  UpdatePlataformaDto,
  Cliente,
  CreateClienteDto,
  UpdateClienteDto,
  Venta,
  CreateVentaDto,
  UpdateVentaDto,
  UpdateStockInsumoDto,
  UpdateCategoriaDto,
  Categoria,
  CreateCategoriaDto,
  tipoProducto,
  CreateTipoProductoDto,
  UpdateTipoProductoDto
} from '../types';
import api from './api';

// Insumos
const insumoServiceBase = createCrudService<Insumo, CreateInsumoDto, UpdateInsumoDto>('/insumos');

interface PaginatedResponse<T> {
  data: never[];
  items: T[];
  total: number;
  pages: number;
  page: number;
}

export const insumoService = {
  ...insumoServiceBase,

  async getAll(page: number = 1, search: string = '', categoryId?: number): Promise<PaginatedResponse<Insumo>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId.toString());

    const response = await api.get<{
      error: string;
      success: boolean;
      data: PaginatedResponse<Insumo>;
    }>(`/insumos?${params}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al obtener insumos');
    }

    return response.data.data;
  },
};
// Tipo Producto
export const tipoProductoService = createCrudService<tipoProducto, CreateTipoProductoDto, UpdateTipoProductoDto>('/tipo-producto');

// StockInsumos
export const stockInsumoService = createCrudService<Insumo, CreateInsumoDto, UpdateStockInsumoDto>('/stock-insumos');

// Productos
//export const productoService = createCrudService<Producto, CreateProductoDto, UpdateProductoDto>('/productos');
const productoServiceBase = createCrudService<Producto, CreateProductoDto, UpdateProductoDto>('/productos');

export const productoService = {
  ...productoServiceBase,

  async getAll(page: number = 1, search: string = '', tipoProducto?: number): Promise<PaginatedResponse<Producto>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '20');
    if (search) params.append('search', search);
    if (tipoProducto) params.append('tipoProducto', tipoProducto.toString());

    const response = await api.get<{
      error: string;
      success: boolean;
      data: PaginatedResponse<Producto>;
    }>(`/productos?${params}`);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al obtener productos');
    }

    return response.data.data;
  },
};

// Tipo Producto
export const categoriaService = createCrudService<Categoria, CreateCategoriaDto, UpdateCategoriaDto>('/categoria');


// Cajas
export const cajaService = createCrudService<Caja, CreateCajaDto, UpdateCajaDto>('/cajas');

// Cadenas
export const cadenaService = createCrudService<Cadena, CreateCadenaDto, UpdateCadenaDto>('/cadenas');

// Plataformas de Venta
export const plataformaService = createCrudService<PlataformaVenta, CreatePlataformaDto, UpdatePlataformaDto>('/plataformas');

// Clientes
export const clienteService = createCrudService<Cliente, CreateClienteDto, UpdateClienteDto>('/clientes');

// Ventas
export const ventaService = createCrudService<Venta, CreateVentaDto, UpdateVentaDto>('/ventas');
