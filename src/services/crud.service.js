import api from './api';
export function createCrudService(endpoint) {
    return {
        async getAll() {
            const response = await api.get(endpoint);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Error al obtener datos');
            }
            return response.data.data;
        },
        async getById(id) {
            const response = await api.get(`${endpoint}/${id}`);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Error al obtener datos');
            }
            return response.data.data;
        },
        async create(data) {
            const response = await api.post(endpoint, data);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Error al crear');
            }
            return response.data.data;
        },
        async update(id, data) {
            const response = await api.put(`${endpoint}/${id}`, data);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Error al actualizar');
            }
            return response.data.data;
        },
        async delete(id) {
            const response = await api.delete(`${endpoint}/${id}`);
            if (!response.data.success) {
                throw new Error(response.data.error || 'Error al eliminar');
            }
        },
        async toggleStatus(id) {
            const response = await api.patch(`${endpoint}/${id}/toggle-status`);
            if (!response.data.success || !response.data.data) {
                throw new Error(response.data.error || 'Error al cambiar estado');
            }
            return response.data.data;
        },
    };
}
export default createCrudService;
