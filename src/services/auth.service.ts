import api from './api';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  ApiResponse,
  Usuario,
} from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al iniciar sesión');
    }

    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<Usuario> {
    const response = await api.post<ApiResponse<Usuario>>(
      '/auth/register',
      credentials
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al registrar usuario');
    }

    return response.data.data;
  },
};

export default authService;
