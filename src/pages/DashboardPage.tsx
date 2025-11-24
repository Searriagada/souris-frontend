import { Package, Box, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const stats = [
  {
    name: 'Total Productos',
    value: '—',
    change: '+0%',
    trend: 'up',
    icon: Box,
  },
  {
    name: 'Total Insumos',
    value: '—',
    change: '+0%',
    trend: 'up',
    icon: Package,
  },
  {
    name: 'Ventas del Mes',
    value: '—',
    change: '+0%',
    trend: 'up',
    icon: ShoppingCart,
  },
  {
    name: 'Clientes Activos',
    value: '—',
    change: '+0%',
    trend: 'up',
    icon: Users,
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-white mb-2">
          Bienvenido, <span className="text-amber-500">{user?.nombre}</span>
        </h1>
        <p className="text-zinc-500">
          Aquí tienes un resumen de tu inventario
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          return (
            <div
              key={stat.name}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-amber-500" />
                </div>
                <div
                  className={`
                    flex items-center gap-1 text-sm font-medium
                    ${isUp ? 'text-emerald-400' : 'text-red-400'}
                  `}
                >
                  {stat.change}
                  {isUp ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              <p className="text-zinc-500 text-sm mb-1">{stat.name}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Actividad Reciente</h2>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500">
              Las actividades aparecerán aquí
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Stock Bajo</h2>
            <Box className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Box className="w-8 h-8 text-zinc-600" />
            </div>
            <p className="text-zinc-500">
              Las alertas de stock bajo aparecerán aquí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
