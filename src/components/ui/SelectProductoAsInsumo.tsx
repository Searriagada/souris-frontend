import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { Button } from './Button';
import api from '../../services/api';

const formatCLP = (value?: number | string): string | null => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ==================== TYPES ====================
interface ProductoAsInsumo {
  id_producto: number;
  sku: string;
  nombre_producto: string;
  costo_fijo: number;
}

export interface ProductoInsumoSeleccionado {
  id_producto_as_insumo: number;
  nombre_producto: string;
  cantidad: number;
  costo_fijo?: number;
  subtotal?: number;
}

interface ProductoInsumoSelectorProps {
  items: ProductoInsumoSeleccionado[];
  onChange: (items: ProductoInsumoSeleccionado[]) => void;
  isLoadingItems?: boolean;
  title?: string;
}

// ==================== COMPONENT ====================
export function ProductoInsumoSelector({ 
  items, 
  onChange, 
  isLoadingItems = false,
  title = 'Productos como Insumo'
}: ProductoInsumoSelectorProps) {
  const [selectedProductoId, setSelectedProductoId] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const productosFiltrados = productosArray.filter((producto: ProductoAsInsumo) =>
    producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (!selectedProductoId || cantidad <= 0) return;

    const producto = productosArray.find((p: ProductoAsInsumo) => p.id_producto === selectedProductoId);
    if (!producto) return;

    const existingIndex = items.findIndex((item) => item.id_producto_as_insumo === selectedProductoId);

    if (existingIndex !== -1 && editingIndex === null) {
      const updated = [...items];
      updated[existingIndex].cantidad += cantidad;
      if (producto.costo_fijo) {
        updated[existingIndex].subtotal = updated[existingIndex].cantidad * producto.costo_fijo;
      }
      onChange(updated);
    } else if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = {
        id_producto_as_insumo: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        cantidad,
        costo_fijo: producto.costo_fijo,
        subtotal: producto.costo_fijo ? cantidad * producto.costo_fijo : undefined,
      };
      onChange(updated);
    } else {
      const nuevoItem: ProductoInsumoSeleccionado = {
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

  const handleEditar = (index: number) => {
    const item = items[index];
    setSelectedProductoId(item.id_producto_as_insumo);
    setCantidad(item.cantidad);
    setSearchTerm(item.nombre_producto);
    setEditingIndex(index);
  };

  const handleEliminar = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleSelectProducto = (producto: ProductoAsInsumo) => {
    setSelectedProductoId(producto.id_producto);
    setSearchTerm(producto.nombre_producto);
    setIsDropdownOpen(false);
  };

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">{title}</h3>
        </div>
      )}

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p className="text-sm text-zinc-400 mb-4">
          {editingIndex !== null ? 'Editando producto' : 'Agregar producto'}
        </p>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 relative" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (!e.target.value) setSelectedProductoId('');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Buscar producto..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      Cargando...
                    </div>
                  ) : productosFiltrados.length > 0 ? (
                    productosFiltrados.map((producto: ProductoAsInsumo) => (
                      <button
                        key={producto.id_producto}
                        type="button"
                        onClick={() => handleSelectProducto(producto)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors ${
                          selectedProductoId === producto.id_producto
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block">{producto.nombre_producto}</span>
                            <span className="text-xs text-zinc-500">{producto.sku}</span>
                          </div>
                          {formatCLP(producto.costo_fijo) && (
                            <span className="text-xs text-zinc-500">
                              ${formatCLP(producto.costo_fijo)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      Sin resultados
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3">
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              placeholder="Cant."
              className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div className="col-span-2">
            <Button
              type="button"
              onClick={handleAgregar}
              disabled={!selectedProductoId || cantidad <= 0}
              className="w-full h-full"
            >
              {editingIndex !== null ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {editingIndex !== null && (
          <button
            type="button"
            onClick={resetForm}
            className="mt-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar edición
          </button>
        )}
      </div>

      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        {isLoadingItems ? (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Cargando productos...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-800/20 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Costo Fijo</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div
                key={`${item.id_producto_as_insumo}-${index}`}
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                  editingIndex === index
                    ? 'bg-amber-500/5 border-l-2 border-amber-500'
                    : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="col-span-5">
                  <span className="text-white font-medium text-sm">{item.nombre_producto}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 text-sm">{item.cantidad}</span>
                </div>
                <div className="col-span-2 text-right text-zinc-400 text-sm">
                  {formatCLP(item.costo_fijo) ? `$${formatCLP(item.costo_fijo)}` : '-'}
                </div>
                <div className="col-span-2 text-right text-amber-400 font-medium text-sm">
                  {formatCLP(item.subtotal) ? `$${formatCLP(item.subtotal)}` : '-'}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => handleEditar(index)}
                    className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEliminar(index)}
                    className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {total > 0 && (
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/30">
                <div className="col-span-9 text-right text-zinc-400 font-medium text-sm">
                  Total:
                </div>
                <div className="col-span-2 text-right text-amber-400 font-semibold">
                  ${formatCLP(total)}
                </div>
                <div className="col-span-1"></div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Package className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No hay productos agregados</p>
            <p className="text-zinc-600 text-xs mt-1">
              Usa el buscador para agregar productos como insumo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductoInsumoSelector;