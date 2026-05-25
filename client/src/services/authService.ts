import { AuthApiResponse, UserSession } from '../models/authModel';
import { createSessionAdapter } from '../adapters/authAdapter';

export const authService = {
  getCurrentSession: async (): Promise<UserSession> => {
    try {
      const response = await fetch('/api/auth/login', { method: 'GET' });
      if (!response.ok) throw new Error('No se pudo obtener la sesión del mock');
      
      const rawData: AuthApiResponse = await response.json();
      return createSessionAdapter(rawData);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};