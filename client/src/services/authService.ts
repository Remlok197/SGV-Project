import { AuthApiResponse, UserSession, LoginCredentials } from '../models/authModel';
import { createSessionAdapter } from '../adapters/authAdapter';

const SESSION_KEY = 'user_session';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<UserSession> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: credentials.username,
          contrasena: credentials.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Usuario o contraseña incorrectos';
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errorMessage = errData.detail;
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage);
      }

      const rawData: AuthApiResponse = await response.json();
      const session = createSessionAdapter(rawData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getCurrentSession: (): UserSession | null => {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) return null;
      return JSON.parse(sessionStr) as UserSession;
    } catch (error) {
      console.error('Error parsing session:', error);
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  }
};