import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  productoService,
  insumoService,
  clienteService,
  ventaService,
} from '../services/entities.service';

export function ReportesPage() {
  // Fetch all data
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: productoService.getAll,
  });

  const { data: insumos = [] } = useQuery({
    queryKey: ['insumos'],
    queryFn: insumoService.getAll,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.getAll,
  });

  const { data: ventas = [] } = useQuery({
    queryKey: ['ventas'],
    queryFn: ventaService.getAll,
  });

  // Calculate stats
  const productosActivos = productos.filter((p) => p.status === 'activo').length;
  const insumosActivos = insumos.filter((i) => i.status === 'activo').length;
  const totalDespachos = ventas.reduce((sum, v) => sum + v.costo_despacho, 0);

  // Get this month's ventas
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const ventasEsteMes = ventas.filter((v) => {
    const fecha = new Date(v.fecha_venta);
    return fecha.getMonth() === thisMonth && fecha.getFullYear() === thisYear;
  });

  const stats = [
    {
      name: 'Productos Activos',
      value: productosActivos,
      total: productos.length,
      icon: Package,
      color: 'amber',
      trend: 'up',
      change: '+12%',
    },
    {
      name: 'Insumos Activos',
      value: insumosActivos,
      total: insumos.length,
      icon: Package,
      color: 'blue',
      trend: 'up',
      change: '+5%',
    },
    {
      name: 'Total Clientes',
      value: clientes.length,
      total: clientes.length,
      icon: Users,
      color: 'emerald',
      trend: 'up',
      change: '+8%',
    },
    {
      name: 'Ventas del Mes',
      value: ventasEsteMes.length,
      total: ventas.length,
      icon: ShoppingCart,
      color: 'purple',
      trend: 'down',
      change: '-3%',
    },
  ];

  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-500',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-serif text-white">Reportes</h1>
        </div>
        <p className="text-zinc-500">
          Resumen y estadísticas del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div
                  className={`
                    flex items-center gap-1 text-sm font-medium
                    ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}
                  `}
                >
                  {stat.change}
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-1">{stat.name}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-500">/ {stat.total} total</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Overview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Resumen de Ventas</h2>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Total de ventas</span>
              <span className="font-semibold text-white">{ventas.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Ventas este mes</span>
              <span className="font-semibold text-white">{ventasEsteMes.length}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Total en despachos</span>
              <span className="font-semibold text-emerald-400">
                ${totalDespachos.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Promedio despacho</span>
              <span className="font-semibold text-white">
                ${ventas.length > 0 ? Math.round(totalDespachos / ventas.length).toLocaleString('es-CL') : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Products Overview */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Estado del Inventario</h2>
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Productos activos</span>
              <span className="font-semibold text-emerald-400">{productosActivos}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Productos inactivos</span>
              <span className="font-semibold text-zinc-500">
                {productos.length - productosActivos}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-800">
              <span className="text-zinc-400">Insumos activos</span>
              <span className="font-semibold text-emerald-400">{insumosActivos}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-400">Insumos inactivos</span>
              <span className="font-semibold text-zinc-500">
                {insumos.length - insumosActivos}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Resumen de Precios</h2>
          <DollarSign className="w-5 h-5 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-500 text-sm mb-2">Precio promedio productos</p>
            <p className="text-2xl font-semibold text-white">
              ${productos.length > 0
                ? Math.round(
                    productos.reduce((sum, p) => sum + p.precio_venta, 0) / productos.length
                  ).toLocaleString('es-CL')
                : 0}
            </p>
          </div>
          <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-500 text-sm mb-2">Producto más caro</p>
            <p className="text-2xl font-semibold text-amber-500">
              ${productos.length > 0
                ? Math.max(...productos.map((p) => p.precio_venta)).toLocaleString('es-CL')
                : 0}
            </p>
          </div>
          <div className="text-center p-4 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-500 text-sm mb-2">Producto más barato</p>
            <p className="text-2xl font-semibold text-emerald-400">
              ${productos.length > 0
                ? Math.min(...productos.map((p) => p.precio_venta)).toLocaleString('es-CL')
                : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Info note */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-amber-500 text-sm">
          💡 <strong>Nota:</strong> Los porcentajes de cambio son ilustrativos. 
          Próximamente se implementará el tracking histórico para mostrar datos reales de crecimiento.
        </p>
      </div>
    </div>
  );
}

export default ReportesPage;
