import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { Modal, Button, Input } from './index';

// ==================== TYPES ====================
export interface InsumoOption {
  id: number;
  nombre: string;
  precio?: number;
  // Campos adicionales que podrías necesitar mostrar
  categoria?: string;
  stock?: number;
}

export interface InsumoSeleccionado {
  id_insumo: number;
  nombre_insumo: string;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
}

interface InsumoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insumos: InsumoSeleccionado[]) => void;
  title?: string;
  // Para edición: insumos ya existentes
  initialItems?: InsumoSeleccionado[];
  // Función para obtener la lista de insumos disponibles
  fetchInsumos: () => Promise<InsumoOption[]>;
  // Query key para react-query
  queryKey?: string;
}

// ==================== COMPONENT ====================
export function InsumoSelectorModal({
  isOpen,
  onClose,
  onSave,
  title = 'Gestionar Insumos',
  initialItems = [],
  fetchInsumos,
  queryKey = 'insumos-selector',
}: InsumoSelectorModalProps) {
  // Estado para la tabla temporal
  const [itemsTemporales, setItemsTemporales] = useState<InsumoSeleccionado[]>([]);
  
  // Estado para el formulario de agregar/editar
  const [selectedInsumoId, setSelectedInsumoId] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Estado para edición
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Query para obtener insumos disponibles
  const { data: insumosDisponibles = [], isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchInsumos,
    enabled: isOpen,
  });

  // Cargar items iniciales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setItemsTemporales(initialItems);
      resetForm();
    }
  }, [isOpen, initialItems]);

  // Filtrar insumos por búsqueda
  const insumosFiltrados = insumosDisponibles.filter((insumo) =>
    insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Insumo seleccionado actual
  const insumoSeleccionado = insumosDisponibles.find(
    (i) => i.id === selectedInsumoId
  );

  // Reset del formulario
  const resetForm = () => {
    setSelectedInsumoId('');
    setCantidad(1);
    setSearchTerm('');
    setEditingIndex(null);
    setIsDropdownOpen(false);
  };

  // Agregar insumo a la tabla temporal
  const handleAgregar = () => {
    if (!selectedInsumoId || cantidad <= 0) return;

    const insumo = insumosDisponibles.find((i) => i.id === selectedInsumoId);
    if (!insumo) return;

    // Verificar si ya existe (actualizar cantidad si es así)
    const existingIndex = itemsTemporales.findIndex(
      (item) => item.id_insumo === selectedInsumoId
    );

    if (existingIndex !== -1 && editingIndex === null) {
      // Ya existe y no estamos editando: sumar cantidad
      const updated = [...itemsTemporales];
      updated[existingIndex].cantidad += cantidad;
      if (insumo.precio) {
        updated[existingIndex].subtotal =
          updated[existingIndex].cantidad * insumo.precio;
      }
      setItemsTemporales(updated);
    } else if (editingIndex !== null) {
      // Modo edición: actualizar el item
      const updated = [...itemsTemporales];
      updated[editingIndex] = {
        id_insumo: insumo.id,
        nombre_insumo: insumo.nombre,
        cantidad,
        precio_unitario: insumo.precio,
        subtotal: insumo.precio ? cantidad * insumo.precio : undefined,
      };
      setItemsTemporales(updated);
    } else {
      // Nuevo item
      const nuevoItem: InsumoSeleccionado = {
        id_insumo: insumo.id,
        nombre_insumo: insumo.nombre,
        cantidad,
        precio_unitario: insumo.precio,
        subtotal: insumo.precio ? cantidad * insumo.precio : undefined,
      };
      setItemsTemporales([...itemsTemporales, nuevoItem]);
    }

    resetForm();
  };

  // Editar item de la tabla
  const handleEditar = (index: number) => {
    const item = itemsTemporales[index];
    setSelectedInsumoId(item.id_insumo);
    setCantidad(item.cantidad);
    setSearchTerm(item.nombre_insumo);
    setEditingIndex(index);
  };

  // Eliminar item de la tabla
  const handleEliminar = (index: number) => {
    setItemsTemporales(itemsTemporales.filter((_, i) => i !== index));
    if (editingIndex === index) {
      resetForm();
    }
  };

  // Guardar y cerrar
  const handleGuardar = () => {
    onSave(itemsTemporales);
    onClose();
  };

  // Cancelar y cerrar
  const handleCancelar = () => {
    setItemsTemporales([]);
    resetForm();
    onClose();
  };

  // Seleccionar insumo del dropdown
  const handleSelectInsumo = (insumo: InsumoOption) => {
    setSelectedInsumoId(insumo.id);
    setSearchTerm(insumo.nombre);
    setIsDropdownOpen(false);
  };

  // Calcular total
  const total = itemsTemporales.reduce(
    (sum, item) => sum + (item.subtotal || 0),
    0
  );

  return (
    <Modal isOpen={isOpen} onClose={handleCancelar} title={title} size="lg">
      <div className="space-y-6">
        {/* Formulario para agregar/editar */}
        <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">
            {editingIndex !== null ? 'Editar Insumo' : 'Agregar Insumo'}
          </h3>

          <div className="grid grid-cols-12 gap-4">
            {/* Selector de Insumo con búsqueda */}
            <div className="col-span-7 relative">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Insumo
              </label>
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

                {/* Dropdown de opciones */}
                {isDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {isLoading ? (
                      <div className="px-4 py-3 text-sm text-zinc-500">
                        Cargando...
                      </div>
                    ) : insumosFiltrados.length > 0 ? (
                      insumosFiltrados.map((insumo) => (
                        <button
                          key={insumo.id}
                          type="button"
                          onClick={() => handleSelectInsumo(insumo)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-800 transition-colors flex items-center justify-between ${
                            selectedInsumoId === insumo.id
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-zinc-300'
                          }`}
                        >
                          <span>{insumo.nombre}</span>
                          {insumo.precio && (
                            <span className="text-xs text-zinc-500">
                              ${insumo.precio.toLocaleString('es-CL')}
                            </span>
                          )}
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

            {/* Cantidad */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>

            {/* Botón Agregar/Actualizar */}
            <div className="col-span-2 flex items-end">
              <Button
                type="button"
                onClick={handleAgregar}
                disabled={!selectedInsumoId || cantidad <= 0}
                className="w-full"
                leftIcon={editingIndex !== null ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </div>

          {/* Botón cancelar edición */}
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

        {/* Tabla temporal de insumos */}
        <div className="border border-zinc-800 rounded-lg overflow-hidden">
          <div className="bg-zinc-800/30 px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              Insumos Seleccionados ({itemsTemporales.length})
            </h3>
          </div>

          {itemsTemporales.length > 0 ? (
            <div className="divide-y divide-zinc-800">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-zinc-800/20 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <div className="col-span-5">Insumo</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">P. Unitario</div>
                <div className="col-span-2 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {/* Filas */}
              {itemsTemporales.map((item, index) => (
                <div
                  key={`${item.id_insumo}-${index}`}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors ${
                    editingIndex === index
                      ? 'bg-amber-500/5 border-l-2 border-amber-500'
                      : 'hover:bg-zinc-800/30'
                  }`}
                >
                  <div className="col-span-5">
                    <span className="text-white font-medium">
                      {item.nombre_insumo}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-zinc-400">
                    {item.precio_unitario
                      ? `$${item.precio_unitario.toLocaleString('es-CL')}`
                      : '-'}
                  </div>
                  <div className="col-span-2 text-right text-amber-400 font-medium">
                    {item.subtotal
                      ? `$${item.subtotal.toLocaleString('es-CL')}`
                      : '-'}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditar(index)}
                      className="p-1.5 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(index)}
                      className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              {total > 0 && (
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-800/30 border-t border-zinc-700">
                  <div className="col-span-9 text-right text-zinc-400 font-medium">
                    Total:
                  </div>
                  <div className="col-span-2 text-right text-amber-400 font-semibold text-lg">
                    ${total.toLocaleString('es-CL')}
                  </div>
                  <div className="col-span-1"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <Package className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No hay insumos agregados</p>
              <p className="text-zinc-600 text-sm mt-1">
                Usa el buscador de arriba para agregar insumos
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancelar}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGuardar}
            disabled={itemsTemporales.length === 0}
            className="flex-1"
          >
            Guardar ({itemsTemporales.length} insumos)
          </Button>
        </div>
      </div>

      {/* Click fuera del dropdown para cerrarlo */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </Modal>
  );
}

export default InsumoSelectorModal;
