import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductosPage } from './pages/ProductosPage';
import { InsumosPage } from './pages/InsumosPage';
import { ClientesPage } from './pages/ClientesPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});
function App() {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsxs(AuthProvider, { children: [_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsxs(Route, { element: _jsx(ProtectedRoute, { children: _jsx(MainLayout, {}) }), children: [_jsx(Route, { path: "/productos", element: _jsx(ProductosPage, {}) }), _jsx(Route, { path: "/insumos", element: _jsx(InsumosPage, {}) }), _jsx(Route, { path: "/clientes", element: _jsx(ClientesPage, {}) }), _jsx(Route, { path: "/configuracion", element: _jsx(ConfiguracionPage, {}) })] }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/productos", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/productos", replace: true }) })] }) }), _jsx(Toaster, { position: "top-right", toastOptions: {
                        style: {
                            background: '#18181b',
                            border: '1px solid #27272a',
                            color: '#fff',
                        },
                        className: 'sonner-toast',
                    }, richColors: true })] }) }));
}
export default App;
