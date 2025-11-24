import api from './api';
import { ApiResponse } from '../types';

export function createCrudService<T, CreateDto, UpdateDto>(endpoint: string) {
  return {
    async getAll(): Promise<T[]> {
      const response = await api.get<ApiResponse<T[]>>(endpoint);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener datos');
      }
      return response.data.data;
    },

    async getById(id: number): Promise<T> {
      const response = await api.get<ApiResponse<T>>(`${endpoint}/${id}`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al obtener datos');
      }
      return response.data.data;
    },

    async create(data: CreateDto): Promise<T> {
      const response = await api.post<ApiResponse<T>>(endpoint, data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear');
      }
      return response.data.data;
    },

    async update(id: number, data: UpdateDto): Promise<T> {
      const response = await api.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar');
      }
      return response.data.data;
    },

    async delete(id: number): Promise<void> {
      const response = await api.delete<ApiResponse<null>>(`${endpoint}/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar');
      }
    },

    async toggleStatus(id: number): Promise<T> {
      const response = await api.patch<ApiResponse<T>>(`${endpoint}/${id}/toggle-status`);
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al cambiar estado');
      }
      return response.data.data;
    },
  };
}

export default createCrudService;
