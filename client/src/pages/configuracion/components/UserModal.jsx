import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserModal({ user, onClose, onSave }) {
    const isEdit = !!user;
    
    const [formData, setFormData] = useState({
        nombre: '',
        rol: 'mesero',
        contrasena: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre,
                rol: user.rol,
                contrasena: '' // Leave empty when editing unless changing it
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.nombre) return alert('El nombre es obligatorio');
        if (!isEdit && !formData.contrasena) return alert('La contraseña es obligatoria para nuevos usuarios');

        const submitData = {
            nombre: formData.nombre,
            rol: formData.rol,
        };

        if (formData.contrasena) {
            submitData.contrasena = formData.contrasena;
        }

        onSave(submitData);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FCFDFD]">
                    <h3 className="text-lg font-semibold text-[var(--color-primaryText)]">
                        {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h3>
                    <button onClick={onClose} className="text-[var(--color-secundaryText)] hover:text-[var(--color-error)] transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-primaryText)] mb-1">Nombre de Usuario</label>
                        <input 
                            type="text" 
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="ej. juan.perez"
                            className="w-full px-3 py-2 border border-[var(--color-borderInput)] bg-[var(--color-backgroundInput)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primaryAction)]/20 focus:border-[var(--color-primaryAction)] transition-colors text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-primaryText)] mb-1">Rol en el Sistema</label>
                        <select 
                            name="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-[var(--color-borderInput)] bg-[var(--color-backgroundInput)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primaryAction)]/20 focus:border-[var(--color-primaryAction)] transition-colors text-sm"
                        >
                            <option value="admin">Administrador</option>
                            <option value="mesero">Mesero</option>
                            <option value="cajero">Cajero</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-primaryText)] mb-1">
                            Contraseña {isEdit && <span className="text-xs font-normal text-[var(--color-secundaryText)]">(Dejar en blanco para no cambiar)</span>}
                        </label>
                        <input 
                            type="password" 
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            placeholder="********"
                            className="w-full px-3 py-2 border border-[var(--color-borderInput)] bg-[var(--color-backgroundInput)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primaryAction)]/20 focus:border-[var(--color-primaryAction)] transition-colors text-sm"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-[var(--color-secundaryText)] hover:text-[var(--color-primaryText)] transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-[var(--color-primaryAction)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                        >
                            {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
