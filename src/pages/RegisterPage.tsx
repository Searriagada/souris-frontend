import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { registerSchema, RegisterFormData } from '../schemas/auth.schema';

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      nombre: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = watch('password');

  // Validaciones de contraseña para mostrar en tiempo real
  const passwordChecks = [
    { label: 'Al menos 6 caracteres', valid: password?.length >= 6 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(password || '') },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(password || '') },
    { label: 'Un número', valid: /\d/.test(password || '') },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        nombre: data.nombre,
      });
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/login');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al crear la cuenta';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Panel izquierdo - Formulario */}
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

          <div className="mb-8">
            <h2 className="font-serif text-3xl text-white mb-3">
              Crear Cuenta
            </h2>
            <p className="text-zinc-500">
              Completa el formulario para registrarte
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Nombre */}
            <div className="space-y-2">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-zinc-300"
              >
                Nombre completo
              </label>
              <input
                {...register('nombre')}
                id="nombre"
                type="text"
                autoComplete="name"
                placeholder="Juan Pérez"
                className={`
                  w-full px-4 py-3.5 bg-zinc-900 border rounded-lg
                  text-white placeholder-zinc-600
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  ${errors.nombre 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-zinc-800 hover:border-zinc-700'
                  }
                `}
              />
              {errors.nombre && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.nombre.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-300"
              >
                Nombre de usuario
              </label>
              <input
                {...register('username')}
                id="username"
                type="text"
                autoComplete="username"
                placeholder="juanperez"
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
                  autoComplete="new-password"
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

              {/* Indicadores de validación */}
              {password && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className={`
                        flex items-center gap-1.5 text-xs
                        ${check.valid ? 'text-emerald-400' : 'text-zinc-500'}
                      `}
                    >
                      {check.valid ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {check.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`
                    w-full px-4 py-3.5 pr-12 bg-zinc-900 border rounded-lg
                    text-white placeholder-zinc-600
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    ${errors.confirmPassword 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' 
                      : 'border-zinc-800 hover:border-zinc-700'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-4 px-6 mt-2
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Crear cuenta
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 pt-8 border-t border-zinc-800">
            <p className="text-center text-zinc-500">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho - Decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-bl from-zinc-900 via-zinc-800 to-zinc-900" />
        
        {/* Círculos decorativos */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(to right, #d97706 1px, transparent 1px),
              linear-gradient(to bottom, #d97706 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
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
            Únete a<br />
            <span className="text-amber-500">Nuestra Plataforma</span>
          </h1>
          
          <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
            Crea tu cuenta y comienza a gestionar tu inventario 
            de manera profesional y eficiente.
          </p>
          
          {/* Features */}
          <div className="mt-10 space-y-4">
            {[
              'Control total de productos e insumos',
              'Registro de ventas y clientes',
              'Reportes y análisis detallados',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-zinc-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Elemento decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>
    </div>
  );
}

export default RegisterPage;
