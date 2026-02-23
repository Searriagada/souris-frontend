import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Box, Users, LogOut, Menu, X, ChevronRight, Settings, } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
const navigation = [
    { name: 'Productos', href: '/productos', icon: Box },
    { name: 'Insumos', href: '/insumos', icon: Package },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
];
export function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        toast.success('Sesión cerrada correctamente');
        navigate('/login');
    };
    const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');
    return (_jsxs("div", { className: "min-h-screen bg-zinc-950", children: [sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black/60 z-40 lg:hidden", onClick: () => setSidebarOpen(false) })), _jsx("aside", { className: `
          fixed top-0 left-0 z-50 h-full w-72 bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `, children: _jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "p-6 border-b border-zinc-800", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs(Link, { to: "/dashboard", className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center", children: _jsx(Package, { className: "w-6 h-6 text-zinc-950" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-white font-semibold", children: "Souris Store" }), _jsx("p", { className: "text-zinc-500 text-xs", children: "Control de Inventario" })] })] }), _jsx("button", { onClick: () => setSidebarOpen(false), className: "lg:hidden text-zinc-400 hover:text-white", children: _jsx(X, { className: "w-6 h-6" }) })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-1 overflow-y-auto", children: navigation.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (_jsxs(Link, { to: item.href, onClick: () => setSidebarOpen(false), className: `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${active
                                        ? 'bg-pink-500/10 text-pink-500'
                                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
                  `, children: [_jsx(Icon, { className: `w-5 h-5 ${active ? 'text-pink-500' : ''}` }), _jsx("span", { className: "font-medium", children: item.name }), active && (_jsx(ChevronRight, { className: "w-4 h-4 ml-auto" }))] }, item.name));
                            }) }), _jsxs("div", { className: "p-4 border-t border-zinc-800", children: [_jsxs("div", { className: "flex items-center gap-3 px-4 py-3 mb-2", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center", children: _jsx("span", { className: "text-pink-500 font-semibold text-sm", children: user?.nombre?.charAt(0).toUpperCase() || 'U' }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-white font-medium truncate", children: user?.nombre }), _jsxs("p", { className: "text-zinc-500 text-sm truncate", children: ["@", user?.username] })] })] }), _jsxs("button", { onClick: handleLogout, className: "\r\n                w-full flex items-center gap-3 px-4 py-3 rounded-lg\r\n                text-zinc-400 hover:bg-red-500/10 hover:text-red-400\r\n                transition-all duration-200\r\n              ", children: [_jsx(LogOut, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Cerrar sesi\u00F3n" })] })] })] }) }), _jsxs("div", { className: "lg:pl-72", children: [_jsx("header", { className: "sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800", children: _jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "lg:hidden text-zinc-400 hover:text-white", children: _jsx(Menu, { className: "w-6 h-6" }) }), _jsx("div", { className: "hidden lg:block", children: _jsx("h2", { className: "text-zinc-400 text-sm", children: navigation.find((n) => isActive(n.href))?.name || 'Dashboard' }) }), _jsx("div", { className: "flex items-center gap-4" })] }) }), _jsx("main", { className: "p-6", children: _jsx(Outlet, {}) })] })] }));
}
export default MainLayout;
