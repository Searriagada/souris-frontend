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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/productos" element={<ProductosPage />} />
              <Route path="/insumos" element={<InsumosPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/configuracion" element={<ConfiguracionPage />} />
            </Route>

            {/* Redirect root to productos */}
            <Route path="/" element={<Navigate to="/productos" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/productos" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              border: '1px solid #27272a',
              color: '#fff',
            },
            className: 'sonner-toast',
          }}
          richColors
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
