import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/userModel';

export const userService = {
  getUsers: async (): Promise<Usuario[]> => {
    const response = await fetch('/api/usuarios');
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return response.json();
  },
  createUser: async (user: UsuarioCreate): Promise<Usuario> => {
    const response = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear usuario');
    }
    return response.json();
  },
  updateUser: async (id: number, user: UsuarioUpdate): Promise<Usuario> => {
    const response = await fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al actualizar usuario');
    }
    return response.json();
  }
};
