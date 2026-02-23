import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { loginSchema } from '../schemas/auth.schema';
export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/productos';
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });
    const onSubmit = async (data) => {
        try {
            await login(data);
            toast.success('¡Bienvenido de vuelta!');
            navigate(from, { replace: true });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : 'Credenciales inválidas';
            toast.error(message);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-zinc-950 flex", children: [_jsxs("div", { className: "hidden lg:flex lg:w-1/2 relative overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" }), _jsx("div", { className: "absolute inset-0 opacity-10", style: {
                            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 1px,
              #d97706 1px,
              #d97706 2px
            )`,
                            backgroundSize: '20px 20px',
                        } }), _jsxs("div", { className: "relative z-10 flex flex-col justify-center px-16", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full", children: [_jsx(Package, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "text-amber-500 font-medium tracking-wide text-sm", children: "SOURIS STORE" })] }) }), _jsxs("h1", { className: "font-serif text-5xl text-white mb-6 leading-tight", children: ["Sistema de", _jsx("br", {}), _jsx("span", { className: "text-amber-500", children: "Control de Inventario" })] }), _jsx("p", { className: "text-zinc-400 text-lg max-w-md leading-relaxed", children: "Gestiona productos, insumos y ventas de manera eficiente. Todo el control de tu negocio en un solo lugar." }), _jsxs("div", { className: "mt-12 flex gap-4", children: [_jsx("div", { className: "w-16 h-1 bg-amber-500 rounded-full" }), _jsx("div", { className: "w-8 h-1 bg-amber-500/50 rounded-full" }), _jsx("div", { className: "w-4 h-1 bg-amber-500/25 rounded-full" })] })] }), _jsx("div", { className: "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent" })] }), _jsx("div", { className: "flex-1 flex items-center justify-center px-6 py-12", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsx("div", { className: "lg:hidden mb-10 text-center", children: _jsxs("div", { className: "inline-flex items-center gap-3 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4", children: [_jsx(Package, { className: "w-5 h-5 text-amber-500" }), _jsx("span", { className: "text-amber-500 font-medium tracking-wide text-sm", children: "SOURIS STORE" })] }) }), _jsxs("div", { className: "mb-10", children: [_jsx("h2", { className: "font-serif text-3xl text-white mb-3", children: "Iniciar Sesi\u00F3n" }), _jsx("p", { className: "text-zinc-500", children: "Ingresa tus credenciales para continuar" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "username", className: "block text-sm font-medium text-zinc-300", children: "Usuario" }), _jsx("input", { ...register('username'), id: "username", type: "text", autoComplete: "username", placeholder: "tu_usuario", className: `
                  w-full px-4 py-3.5 bg-zinc-900 border rounded-lg
                  text-white placeholder-zinc-600
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                  ${errors.username
                                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                : 'border-zinc-800 hover:border-zinc-700'}
                ` }), errors.username && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), errors.username.message] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-zinc-300", children: "Contrase\u00F1a" }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...register('password'), id: "password", type: showPassword ? 'text' : 'password', autoComplete: "current-password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: `
                    w-full px-4 py-3.5 pr-12 bg-zinc-900 border rounded-lg
                    text-white placeholder-zinc-600
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500
                    ${errors.password
                                                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                                                        : 'border-zinc-800 hover:border-zinc-700'}
                  ` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors", children: showPassword ? (_jsx(EyeOff, { className: "w-5 h-5" })) : (_jsx(Eye, { className: "w-5 h-5" })) })] }), errors.password && (_jsxs("p", { className: "text-sm text-red-400 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1 h-1 bg-red-400 rounded-full" }), errors.password.message] }))] }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "\r\n                w-full py-4 px-6 \r\n                bg-gradient-to-r from-amber-600 to-amber-500\r\n                hover:from-amber-500 hover:to-amber-400\r\n                disabled:from-zinc-700 disabled:to-zinc-600 disabled:cursor-not-allowed\r\n                text-zinc-950 font-semibold\r\n                rounded-lg\r\n                transition-all duration-200\r\n                flex items-center justify-center gap-2\r\n                shadow-lg shadow-amber-500/20\r\n                hover:shadow-amber-500/30\r\n                disabled:shadow-none\r\n              ", children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-5 h-5 animate-spin" }), "Ingresando..."] })) : (_jsxs(_Fragment, { children: [_jsx(LogIn, { className: "w-5 h-5" }), "Ingresar"] })) })] }), _jsx("div", { className: "mt-8 pt-8 border-t border-zinc-800", children: _jsxs("p", { className: "text-center text-zinc-500", children: ["\u00BFNo tienes una cuenta?", ' ', _jsx(Link, { to: "/register", className: "text-amber-500 hover:text-amber-400 font-medium transition-colors", children: "Reg\u00EDstrate aqu\u00ED" })] }) })] }) })] }));
}
export default LoginPage;
