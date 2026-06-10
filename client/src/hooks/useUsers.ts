import { useState, useEffect } from 'react';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../models/userModel';
import { userService } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createUser = async (user: UsuarioCreate) => {
    try {
      const newUser = await userService.createUser(user);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err: any) {
      throw err;
    }
  };

  const updateUser = async (id: number, userUpdate: UsuarioUpdate) => {
    try {
      const updatedUser = await userService.updateUser(id, userUpdate);
      setUsers(users.map(u => u.id === id ? updatedUser : u));
      return updatedUser;
    } catch (err: any) {
      throw err;
    }
  };

  return { users, loading, error, createUser, updateUser, refetch: fetchUsers };
};
