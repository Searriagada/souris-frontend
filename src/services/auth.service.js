import api from './api';
export const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Error al iniciar sesión');
        }
        return response.data.data;
    },
    async register(credentials) {
        const response = await api.post('/auth/register', credentials);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error || 'Error al registrar usuario');
        }
        return response.data.data;
    },
};
export default authService;
