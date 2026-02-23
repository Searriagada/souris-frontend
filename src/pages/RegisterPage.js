import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2, Package, CheckCircle2, XCircle, } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { registerSchema } from '../schemas/auth.schema';
export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors, isSubmitting }, } = useForm({
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
    const onSubmit = async (data) => {
        try {
            await registerUser({
                username: data.username,
                password: data.password,
                nombre: data.nombre,
            });
            toast.success('¡Cuenta creada exitosamente!');
            navigate('/login');
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Error al crear la cuenta';
            toast.error(message);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-zinc-950 flex", children: [_jsx("div", { className: "flex-1 flex items-center justify-center px-6 py-12", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsx("div", { className: "lg:hidden mb-10 text-center", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4", children: [_jsx(Package, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "text-amber-500 font-medium tracking-wide text-sm", children: "SOURIS STORE" })] }) }), _jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "font-serif text-3xl text-white mb-3", children: "Crear Cuenta" }), _jsx("p", { className: "text-zinc-500", children: "Completa el formulario para registrarte" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "nombre", className: "block text-sm font-medium text-zinc-300", children: "Nombre completo" }), _jsx("input", { ...register('nombre'), id: "nombre", type: "text", autoComplete: "name", placeholder: "Juan P\u00E9rez", className: `
                  w-full px-4 py-3.5 bg-zinc-900 border rounded-lg
                  text-white placeholder-zinc-600
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  ${errors.nombre
                                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                : 'border-zinc-800 hover:border-zinc-700'}
                ` }), errors.nombre && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), errors.nombre.message] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-zinc-300", children: "Nombre de usuario" }), _jsx("input", { ...register('username'), id: "username", type: "text", autoComplete: "username", placeholder: "juanperez", className: `
                  w-full px-4 py-3.5 bg-zinc-900 border rounded-lg
                  text-white placeholder-zinc-600
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  ${errors.username
                                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                : 'border-zinc-800 hover:border-zinc-700'}
                ` }), errors.username && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), errors.username.message] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-zinc-300", children: "Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register('password'), id: "password", type: showPassword ? 'text' : 'password', autoComplete: "new-password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: `
                    w-full px-4 py-3.5 pr-12 bg-zinc-900 border rounded-lg
                    text-white placeholder-zinc-600
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    ${errors.password
                                                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                        : 'border-zinc-800 hover:border-zinc-700'}
                  ` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors", children: showPassword ? (_jsx(EyeOff, { className: "w-5 h-5" })) : (_jsx(Eye, { className: "w-5 h-5" })) })] }), password && (_jsx("div", { className: "grid grid-cols-2 gap-2 mt-3", children: passwordChecks.map((check) => (_jsxs("div", { className: `
                        flex items-center gap-1.5 text-xs
                        ${check.valid ? 'text-emerald-400' : 'text-zinc-500'}
                      `, children: [check.valid ? (_jsx(CheckCircle2, { className: "w-3.5 h-3.5" })) : (_jsx(XCircle, { className: "w-3.5 h-3.5" })), check.label] }, check.label))) }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-zinc-300", children: "Confirmar contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register('confirmPassword'), id: "confirmPassword", type: showConfirmPassword ? 'text' : 'password', autoComplete: "new-password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: `
                    w-full px-4 py-3.5 pr-12 bg-zinc-900 border rounded-lg
                    text-white placeholder-zinc-600
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    ${errors.confirmPassword
                                                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                        : 'border-zinc-800 hover:border-zinc-700'}
                  ` }), _jsx("button", { type: "button", onClick: () => setShowConfirmPassword(!showConfirmPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors", children: showConfirmPassword ? (_jsx(EyeOff, { className: "w-5 h-5" })) : (_jsx(Eye, { className: "w-5 h-5" })) })] }), errors.confirmPassword && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), errors.confirmPassword.message] }))] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "\n                w-full py-4 px-6 mt-2\n                bg-gradient-to-r from-amber-600 to-amber-500\n                hover:from-amber-500 hover:to-amber-400\n                disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed\n                text-zinc-950 font-semibold\n                rounded-lg\n                transition-all duration-200\n                flex items-center justify-center gap-2\n                shadow-lg shadow-amber-500/20\n                hover:shadow-amber-500/30\n                disabled:shadow-none\n              ", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), "Creando cuenta..."] })) : (_jsxs(_Fragment, { children: [_jsx(UserPlus, { className: "w-5 h-5" }), "Crear cuenta"] })) })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-zinc-800", children: _jsxs("p", { className: "text-center text-zinc-500", children: ["\u00BFYa tienes una cuenta?", ' ', _jsx(Link, { to: "/login", className: "text-amber-500 hover:text-amber-400 font-medium transition-colors", children: "Inicia sesi\u00F3n" })] }) })] }) }), _jsxs("div", { className: "hidden lg:flex lg:w-1/2 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-bl from-zinc-900 via-zinc-800 to-zinc-900" }), _jsx("div", { className: "absolute top-1/4 -right-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute bottom-1/4 -left-32 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" }), _jsx("div", { className: "absolute inset-0 opacity-5", style: {
                            backgroundImage: `
              linear-gradient(to right, #d97706 1px, transparent 1px),
              linear-gradient(to bottom, #d97706 1px, transparent 1px)
            `,
                            backgroundSize: '40px 40px',
                        } }), _jsxs("div", { className: "relative z-10 flex flex-col justify-center px-16", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full", children: [_jsx(Package, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "text-amber-500 font-medium tracking-wide text-sm", children: "SOURIS STORE" })] }) }), _jsxs("h1", { className: "font-serif text-5xl text-white mb-6 leading-tight", children: ["\u00DAnete a", _jsx("br", {}), _jsx("span", { className: "text-amber-500", children: "Nuestra Plataforma" })] }), _jsx("p", { className: "text-zinc-400 text-lg max-w-md leading-relaxed", children: "Crea tu cuenta y comienza a gestionar tu inventario de manera profesional y eficiente." }), _jsx("div", { className: "mt-10 space-y-4", children: [
                                    'Control total de productos e insumos',
                                    'Registro de ventas y clientes',
                                    'Reportes y análisis detallados',
                                ].map((feature) => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-amber-500 rounded-full" }), _jsx("span", { className: "text-zinc-300", children: feature })] }, feature))) })] }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" })] })] }));
}
export default RegisterPage;
