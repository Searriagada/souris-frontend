// Auth Types
export interface Usuario {
  id_usuario: number;
  username: string;
  nombre: string;
  status: 'activo' | 'inactivo';
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  nombre: string;
}

export interface AuthResponse {
  user: Usuario;
  token: string;
}

// Insumo
export interface Insumo {
  id_insumo: number;
  nombre_insumo: string;
  id_categoria?: number;
  nombre_categoria?: string;
  precio_insumo?: number;
  link_insumo?: string;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: string;
  updated_at: string;
  cantidad?: number;
}

export interface CreateInsumoDto {
  nombre_insumo: string;
  id_categoria?: number;
  precio_insumo?: number;
  link_insumo?: string;
}

export interface UpdateInsumoDto {
  nombre_insumo?: string;
  id_categoria?: number;
  precio_insumo?: number;
  link_insumo?: string;
  status?: 'activo' | 'inactivo';
  cantidad?: number;
}

export interface UpdateStockInsumoDto {
  cantidad: number;
}

// Stock Insumo
export interface StockInsumo {
  id_stock: number;
  id_insumo: number;
  cantidad: number;
  usuario?: string;
  created_at: string;
  updated_at: string;
  insumo?: Insumo;
}

// Producto
export interface Producto {
  id_producto: number;
  sku: string;
  nombre_producto: string;
  descripcion?: string;
  cantidad: number;
  precio_venta: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: string;
  updated_at: string;
  id_tipo?: number;
  nombre_tipo_producto?: string;
  costo_total?: number;
  joya?: number;
  stock_actual?: number;
  publicado_ml: '';
  valor_caja?: number;
  valor_cadena?: number;
  despacho?: number;
  comision?: number;
  utilidad?: number;
  id_cadena?: number;
  monto_envio_gratis: number;
  costo_embalaje?: number;
  precio_venta_estimado?: number;
  neto: number;
  iva: number;
  costo_fijo?: number;
}

export interface CreateProductoDto {
  sku: string;
  nombre_producto: string;
  descripcion?: string;
  precio_venta: number;
  id_tipo_producto?: number;
}

export interface UpdateProductoDto {
  sku?: string;
  nombre_producto?: string;
  descripcion?: string;
  precio_venta?: number;
  status?: 'activo' | 'inactivo';
}

// Stock Producto
export interface StockProducto {
  id_stock: number;
  id_producto: number;
  cantidad: number;
  usuario?: string;
  created_at: string;
  updated_at: string;
  producto?: Producto;
}

// Producto Insumo (relación)
export interface ProductoInsumo {
  id_producto: number;
  id_insumo: number;
  cantidad: number;
  neto?: number;
  iva?: number;
  total?: number;
  usuario?: string;
  created_at: string;
  updated_at: string;
  insumo?: Insumo;
}

export interface CreateProductoInsumoDto {
  id_insumo: number;
  cantidad: number;
  neto?: number;
  iva?: number;
  total?: number;
}

// Caja
export interface Caja {
  id_caja: number;
  nombre_caja: string;
  precio: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCajaDto {
  nombre_caja: string;
  precio: number;
}

export interface UpdateCajaDto {
  nombre_caja?: string;
  precio?: number;
  status?: 'activo' | 'inactivo';
}

// Cadena
export interface Cadena {
  id_cadena: number;
  nombre_cadena: string;
  precio: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCadenaDto {
  nombre_cadena: string;
  precio: number;
}

export interface UpdateCadenaDto {
  nombre_cadena?: string;
  precio?: number;
  status?: 'activo' | 'inactivo';
}

// Plataforma de Venta
export interface PlataformaVenta {
  id_plataforma: number;
  nombre_plataforma: string;
  comision: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePlataformaDto {
  nombre_plataforma: string;
  comision: number;
}

export interface UpdatePlataformaDto {
  nombre_plataforma?: string;
  comision?: number;
  status?: 'activo' | 'inactivo';
}

// Cliente
export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  usuario?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClienteDto {
  nombre_cliente: string;
}

export interface UpdateClienteDto {
  nombre_cliente?: string;
}

// Venta
export interface Venta {
  id_venta: number;
  id_plataforma: number;
  id_cliente: number;
  costo_despacho: number;
  fecha_venta: string;
  usuario?: string;
  created_at: string;
  updated_at: string;
  plataforma?: PlataformaVenta;
  cliente?: Cliente;
}

export interface CreateVentaDto {
  id_plataforma: number;
  id_cliente: number;
  costo_despacho: number;
  fecha_venta: string;
}

export interface UpdateVentaDto {
  id_plataforma?: number;
  id_cliente?: number;
  costo_despacho?: number;
  fecha_venta?: string;
}

// Costo Producto
export interface CostoProducto {
  id_costo: number;
  id_producto: number;
  id_caja: number;
  id_cadena: number;
  id_plataforma: number;
  neto?: number;
  iva?: number;
  total?: number;
  usuario?: string;
  created_at: string;
  updated_at: string;
  producto?: Producto;
  caja?: Caja;
  cadena?: Cadena;
  plataforma?: PlataformaVenta;
}

// Categoría Insumo
export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface CreateCategoriaDto {
  nombre_categoria: string;
}

export interface UpdateCategoriaDto {
  nombre_categoria?: string;
}

// Tipo de Producto
export interface tipoProducto {
  id_tipo: number;
  nombre_tipo_producto: string;
}

export interface CreateTipoProductoDto {
  nombre_tipo_producto: string;
}

export interface UpdateTipoProductoDto {
  nombre_tipo_producto?: string;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth Context
export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}