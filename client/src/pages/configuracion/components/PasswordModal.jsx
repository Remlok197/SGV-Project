import { useState } from 'react';
import { X } from 'lucide-react';

export default function PasswordModal({ user, onClose, onSave }) {
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (newPassword.trim().length < 6) {
            return alert('La contraseña debe tener al menos 6 caracteres.');
        }

        onSave({ ...user, contrasena: newPassword });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#FCFDFD]">
                    <h3 className="text-lg font-semibold text-[var(--color-primaryText)]">
                        Cambiar Contraseña
                    </h3>
                    <button onClick={onClose} className="text-[var(--color-secundaryText)] hover:text-[var(--color-error)] transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-primaryText)] mb-4">
                            Nueva contraseña para <b>{user?.nombre}</b>
                        </label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            autoFocus
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
                            Guardar Contraseña
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
