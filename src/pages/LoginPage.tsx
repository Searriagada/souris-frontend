import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { loginSchema, LoginFormData } from '../schemas/auth.schema';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('¡Bienvenido de vuelta!');
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Credenciales inválidas';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Panel izquierdo - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />
        
        {/* Patrón de líneas */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 1px,
              #d97706 1px,
              #d97706 2px
            )`,
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <Package className="w-5 h-5 text-amber-500" />
              <span className="text-amber-500 font-medium tracking-wide text-sm">
                SOURIS STORE
              </span>
            </div>
          </div>
          
          <h1 className="font-serif text-5xl text-white mb-6 leading-tight">
            Sistema de<br />
            <span className="text-amber-500">Control de Inventario</span>
          </h1>
          
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Gestiona productos, insumos y ventas de manera eficiente. 
            Todo el control de tu negocio en un solo lugar.
          </p>
          
          {/* Decoración */}
          <div className="mt-12 flex gap-4">
            <div className="w-16 h-1 bg-amber-500 rounded-full" />
            <div className="w-8 h-1 bg-amber-500/50 rounded-full" />
            <div className="w-4 h-1 bg-amber-500/25 rounded-full" />
          </div>
        </div>
        
        {/* Elemento decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <div className="lg:hidden mb-10 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <Package className="w-5 h-5 text-amber-500" />
              <span className="text-amber-500 font-medium tracking-wide text-sm">
                SOURIS STORE
              </span>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="font-serif text-3xl text-white mb-3">
              Iniciar Sesión
            </h2>
            <p className="text-zinc-500">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300"
              >
                Usuario
              </label>
              <input
                {...register('username')}
                id="username"
                type="text"
                autoComplete="username"
                placeholder="tu_usuario"
                className={`
                  w-full px-4 py-3.5 bg-zinc-900 border rounded-lg
                  text-white placeholder-zinc-600
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  ${errors.username 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-zinc-800 hover:border-zinc-700'
                  }
                `}
              />
              {errors.username && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`
                    w-full px-4 py-3.5 pr-12 bg-zinc-900 border rounded-lg
                    text-white placeholder-zinc-600
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    ${errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-zinc-800 hover:border-zinc-700'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-4 px-6 
                bg-gradient-to-r from-amber-600 to-amber-500
                hover:from-amber-500 hover:to-amber-400
                disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed
                text-zinc-950 font-semibold
                rounded-lg
                transition-all duration-200
                flex items-center justify-center gap-2
                shadow-lg shadow-amber-500/20
                hover:shadow-amber-500/30
                disabled:shadow-none
              "
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <p className="text-center text-zinc-500">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
