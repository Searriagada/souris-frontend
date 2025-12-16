import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search,Sticker } from 'lucide-react';
import { Button } from './Button';
import api from '../../services/api';
import { Insumo } from '../../types/index';

const formatCLP = (value?: number | string): string | null => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return num.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ==================== TYPES ====================
export interface InsumoSeleccionado {
  id_insumo: number;
  nombre_insumo: string;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
}

interface InsumoSelectorProps {
  items: InsumoSeleccionado[];
  onChange: (items: InsumoSeleccionado[]) => void;
  isLoadingItems?: boolean;
  title?: string;
}

// ==================== COMPONENT ====================
export function InsumoSelector({ 
  items, 
  onChange, 
  isLoadingItems = false,
  title = 'Insumos'
}: InsumoSelectorProps) {
  const [selectedInsumoId, setSelectedInsumoId] = useState<number | ''>('');
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

  const { data: insumosDisponibles = [], isLoading } = useQuery({
    queryKey: ['insumos-selector'],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '500');
      const response = await api.get(`/insumos/manufacturing?${params}`);
      return response.data?.data?.items || [];
    },
  });

  const insumosArray = Array.isArray(insumosDisponibles) ? insumosDisponibles : [];

  const insumosFiltrados = insumosArray.filter((insumo: Insumo) =>
    insumo.nombre_insumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setSelectedInsumoId('');
    setCantidad(1);
    setSearchTerm('');
    setEditingIndex(null);
    setIsDropdownOpen(false);
  };

  const handleAgregar = () => {
    if (!selectedInsumoId || cantidad <= 0) return;

    const insumo = insumosArray.find((i: Insumo) => i.id_insumo === selectedInsumoId);
    if (!insumo) return;

    const existingIndex = items.findIndex((item) => item.id_insumo === selectedInsumoId);

    if (existingIndex !== -1 && editingIndex === null) {
      const updated = [...items];
      updated[existingIndex].cantidad += cantidad;
      if (insumo.precio_insumo) {
        updated[existingIndex].subtotal = updated[existingIndex].cantidad * insumo.precio_insumo;
      }
      onChange(updated);
    } else if (editingIndex !== null) {
      const updated = [...items];
      updated[editingIndex] = {
        id_insumo: insumo.id_insumo,
        nombre_insumo: insumo.nombre_insumo,
        cantidad,
        precio_unitario: insumo.precio_insumo,
        subtotal: insumo.precio_insumo ? cantidad * insumo.precio_insumo : undefined,
      };
      onChange(updated);
    } else {
      const nuevoItem: InsumoSeleccionado = {
        id_insumo: insumo.id_insumo,
        nombre_insumo: insumo.nombre_insumo,
        cantidad,
        precio_unitario: insumo.precio_insumo,
        subtotal: insumo.precio_insumo ? cantidad * insumo.precio_insumo : undefined,
      };
      onChange([...items, nuevoItem]);
    }

    resetForm();
  };

  const handleEditar = (index: number) => {
    const item = items[index];
    setSelectedInsumoId(item.id_insumo);
    setCantidad(item.cantidad);
    setSearchTerm(item.nombre_insumo);
    setEditingIndex(index);
  };

  const handleEliminar = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  const handleSelectInsumo = (insumo: Insumo) => {
    setSelectedInsumoId(insumo.id_insumo);
    setSearchTerm(insumo.nombre_insumo);
    setIsDropdownOpen(false);
  };

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sticker className="w-5 h-5 text-amber-500" />
        <h3 className="text-white font-medium">{title}</h3>
      </div>

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <p className="text-sm text-zinc-400 mb-4">
          {editingIndex !== null ? 'Editando insumo' : 'Agregar insumo'}
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
                  if (!e.target.value) setSelectedInsumoId('');
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Buscar insumo..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <div className="px-4 py-3 text-sm text-zinc-500">
                      Cargando...
                    </div>
                  ) : insumosFiltrados.length > 0 ? (
                    insumosFiltrados.map((insumo: Insumo) => (
                      <button
                        key={insumo.id_insumo}
                        type="button"
                        onClick={() => handleSelectInsumo(insumo)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors ${
                          selectedInsumoId === insumo.id_insumo
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="block">{insumo.nombre_insumo}</span>
                            {insumo.nombre_categoria && (
                              <span className="text-xs text-zinc-500">{insumo.nombre_categoria}</span>
                            )}
                          </div>
                          {formatCLP(insumo.precio_insumo) && (
                            <span className="text-xs text-zinc-500">
                              ${formatCLP(insumo.precio_insumo)}
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
              disabled={!selectedInsumoId || cantidad <= 0}
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
            <p className="text-zinc-500 text-sm">Cargando insumos...</p>
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-zinc-800">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-800/20 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="col-span-5">Insumo</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">P. Unit.</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1"></div>
            </div>

            {items.map((item, index) => (
              <div
                key={`${item.id_insumo}-${index}`}
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                  editingIndex === index
                    ? 'bg-amber-500/5 border-l-2 border-amber-500'
                    : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="col-span-5">
                  <span className="text-white font-medium text-sm">{item.nombre_insumo}</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 text-sm">{item.cantidad}</span>
                </div>
                <div className="col-span-2 text-right text-zinc-400 text-sm">
                  {formatCLP(item.precio_unitario) ? `$${formatCLP(item.precio_unitario)}` : '-'}
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
            <p className="text-zinc-500 text-sm">No hay insumos agregados</p>
            <p className="text-zinc-600 text-xs mt-1">
              Usa el buscador para agregar insumos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InsumoSelector;