import { useState, useEffect, useRef } from 'react';
import { useUsers } from '../../../hooks/useUsers';
import { Edit, UserPlus, Shield, User, MoreVertical, Key } from 'lucide-react';
import UserModal from './UserModal';
import PasswordModal from './PasswordModal';
import UserAvatar from '../../../components/header/UserAvatar';

const formatLastLogin = (dateString) => {
    if (!dateString) return 'Nunca';
    // Append 'Z' to treat the naive datetime from the backend as UTC
    const dateStrUtc = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    const date = new Date(dateStrUtc);
    if (isNaN(date)) return 'Nunca';
    return date.toLocaleString('es-MX', { 
        day: 'numeric', month: 'short', 
        hour: '2-digit', minute: '2-digit', hour12: true 
    });
};

function UserRow({ user, onSaveUser, onChangePassword }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ ...user });
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSave = async () => {
        await onSaveUser(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData({ ...user });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr className="hover:bg-gray-50 transition-colors bg-white border-b border-[#E2E8F0]/50">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <UserAvatar userName={editData.nombre} className="text-background size-8 text-xs font-medium" />
                        <input 
                            type="text" 
                            className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1.5 w-full focus:outline-none focus:border-[var(--color-primaryAction)]"
                            value={editData.nombre}
                            onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                        />
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                        className="text-sm border border-gray-300 rounded px-2 py-1.5 w-full focus:outline-none focus:border-[var(--color-primaryAction)]"
                        value={editData.rol}
                        onChange={(e) => setEditData({...editData, rol: e.target.value})}
                    >
                        <option value="admin">Administrador</option>
                        <option value="mesero">Mesero</option>
                        <option value="cajero">Cajero</option>
                    </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setEditData({...editData, activo: !editData.activo})}
                            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editData.activo ? 'bg-green-500' : 'bg-gray-200'}`}
                            role="switch"
                        >
                            <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editData.activo ? 'translate-x-3' : 'translate-x-0'}`} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">{editData.activo ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastLogin(user.ultimo_acceso)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-start items-center gap-2">
                    <button onClick={handleSave} className="text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md transition-colors">Guardar</button>
                    <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors">Cancelar</button>
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-gray-50 transition-colors bg-white border-b border-[#E2E8F0]/50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    <UserAvatar userName={user.nombre} className="text-background size-8 text-xs font-medium" />
                    <span className="text-sm font-medium text-gray-900">{user.nombre}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${user.rol === 'admin' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                    {user.rol === 'admin' ? <Shield size={14} /> : <User size={14} />}
                    <span className="capitalize">{user.rol}</span>
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.activo ? 'bg-green-500' : 'bg-[var(--color-error)]'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{user.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatLastLogin(user.ultimo_acceso)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center items-center">
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Opciones"
                    >
                        <MoreVertical size={18} />
                    </button>
                    
                    {showDropdown && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-30">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    setIsEditing(true);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[#EE791C]/10 hover:text-[#EE791C] transition-colors text-left cursor-pointer"
                            >
                                <Edit size={16} />
                                <span>Editar</span>
                            </button>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    onChangePassword(user);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-[#EE791C]/10 hover:text-[#EE791C] transition-colors text-left cursor-pointer"
                            >
                                <Key size={16} />
                                <span>Cambiar contraseña</span>
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default function UsuariosTab() {
    const { users, loading, error, createUser, updateUser } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordChangeUser, setPasswordChangeUser] = useState(null);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveUser = async (userData) => {
        try {
            if (userData.id) {
                await updateUser(userData.id, userData);
            } else {
                await createUser(userData);
            }
            setIsModalOpen(false);
            setPasswordChangeUser(null);
        } catch (err) {
            alert(err.message || 'Error al guardar usuario');
        }
    };

    if (loading) return <div className="p-4 text-[var(--color-secundaryText)]">Cargando usuarios...</div>;
    if (error) return <div className="p-4 text-[var(--color-error)]">Error: {error}</div>;

    return (
        <div className="h-full flex flex-col bg-white rounded-t-2xl shadow-md border-t border-l border-r border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-primaryText)]">Administración de Usuarios</h3>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primaryAction)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                    <UserPlus size={18} />
                    Nuevo Usuario
                </button>
            </div>

            <div className="flex-1 overflow-auto bg-white">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-[#F9FAFB] border-b border-gray-200 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-500">Nombre</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-500">Rol</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-500">Estado</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-500">Última Conexión</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-500 w-56 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <UserRow 
                                key={user.id} 
                                user={user} 
                                onSaveUser={handleSaveUser} 
                                onChangePassword={(u) => setPasswordChangeUser(u)}
                            />
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-[var(--color-secundaryText)]">
                                    No hay usuarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <UserModal 
                    user={null} 
                    onClose={handleCloseModal} 
                    onSave={handleSaveUser} 
                />
            )}

            {passwordChangeUser && (
                <PasswordModal
                    user={passwordChangeUser}
                    onClose={() => setPasswordChangeUser(null)}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
}
