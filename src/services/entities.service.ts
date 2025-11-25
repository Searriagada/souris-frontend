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
} from '../types';

// Insumos
export const insumoService = createCrudService<Insumo, CreateInsumoDto, UpdateInsumoDto>('/insumos');
// Categorías
export const categoriaService = createCrudService<Categoria, CreateCategoriaDto, UpdateCategoriaDto>('/categoria');

// StockInsumos
export const stockInsumoService = createCrudService<Insumo, CreateInsumoDto, UpdateStockInsumoDto>('/stock-insumos');

// Productos
export const productoService = createCrudService<Producto, CreateProductoDto, UpdateProductoDto>('/productos');

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
