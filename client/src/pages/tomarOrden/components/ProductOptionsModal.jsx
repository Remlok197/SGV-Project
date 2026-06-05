import React, { useState, useEffect } from 'react';
import { Modal } from "@heroui/react";
import { X, Minus, Plus } from "lucide-react";
import { orderItemClientSchema } from "../../../schemas/orderSchema";

export default function ProductOptionsModal({ isOpen, onOpenChange, product, categoryName, initialItem, onAdd }) {
    const [quantity, setQuantity] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [selectedOptions, setSelectedOptions] = useState({
        "Carne": [],
        "Salsa": [],
        "Verdura": []
    });

    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setQuantity(initialItem.quantity);
                setSelectedOptions(initialItem.options || { "Carne": [], "Salsa": [], "Verdura": [] });
            } else {
                setQuantity(1);
                setSelectedOptions({ "Carne": [], "Salsa": [], "Verdura": [] });
            }
            setErrorMsg('');
        } else {
            setTimeout(() => {
                setQuantity(1);
                setErrorMsg('');
                setSelectedOptions({ "Carne": [], "Salsa": [], "Verdura": [] });
            }, 300);
        }
    }, [isOpen, initialItem]);

    if (!product) return null;

    const toggleOption = (category, option, isMulti = true) => {
        if (!isMulti) {
            setSelectedOptions(prev => ({ ...prev, [category]: option }));
            return;
        }

        setSelectedOptions(prev => {
            const current = prev[category] || [];
            if (current.includes(option)) {
                return { ...prev, [category]: current.filter(o => o !== option) };
            }
            
            // Límite de opciones para Carne
            if (category === "Carne" && current.length >= 2) {
                return prev;
            }

            return { ...prev, [category]: [...current, option] };
        });
    };

    const isSelected = (category, option, isMulti = true) => {
        if (!isMulti) return selectedOptions[category] === option;
        return (selectedOptions[category] || []).includes(option);
    };

    const hasModifiers = !['Bebidas', 'Postres', 'Cervezas'].includes(categoryName);

    const handleAdd = () => {
        setErrorMsg(''); // clear previous error
        let finalOptions = {};
        
        if (hasModifiers) {
            finalOptions = selectedOptions;
            const payload = { quantity, options: finalOptions };
            const validation = orderItemClientSchema.safeParse(payload);
            
            if (!validation.success) {
                setErrorMsg(validation.error.issues[0].message);
                return;
            }
        }

        if (onAdd) {
            onAdd({ product, quantity, options: finalOptions });
        }
        onOpenChange(false);
    };

    // Obtenemos el precio base numérico para calcular el total
    const basePrice = typeof product.price === 'number' ? product.price : 17.00;
    const surcharge = hasModifiers && (selectedOptions["Carne"] || []).includes("Tripa") ? 2.00 : 0;
    const finalPricePerUnit = basePrice + surcharge;
    const totalPrice = (finalPricePerUnit * quantity).toFixed(2);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Backdrop className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <Modal.Container size="4xl" className="w-full max-w-[800px] outline-none">
                    <Modal.Dialog className="outline-none bg-white rounded-3xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="relative px-6 pt-8 pb-6 flex gap-6 shrink-0">
                            <Modal.CloseTrigger className="absolute top-6 right-6 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors z-10">
                                <X className="size-4" />
                            </Modal.CloseTrigger>
                            
                            <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-gray-400 text-xs font-medium">IMG</div>
                                )}
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <h2 className="text-3xl font-bold text-primaryText leading-tight">{product.name}</h2>
                                <p className="text-base font-medium text-secundaryText mt-1">Precio Base: <span className="font-bold">{product.formattedPrice || '$17.00'}</span></p>
                            </div>
                        </div>

                        <hr className="mx-6 border-t border-borderInput/50" />

                        {errorMsg && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                                {errorMsg}
                            </div>
                        )}

                        {/* Opciones (Body) */}
                        <Modal.Body className="p-6 pt-2 overflow-y-auto flex-1 hide-scrollbar">
                            {!hasModifiers && (
                                <div className="flex flex-col items-center justify-center py-8 text-secundaryText">
                                    <p className="font-medium">Este producto no requiere preparación especial.</p>
                                </div>
                            )}
                            
                            {hasModifiers && (
                                <>
                                    {/* Categoría: Carne */}
                            <div className="mb-6 mt-4">
                                <h3 className="text-lg font-bold text-primaryText">Carne</h3>
                                <p className="text-xs text-secundaryText font-medium mb-3">Mín 1 / Max 2</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Bistec', 'Chorizo', 'Pastor', 'Costilla', 'Cabeza'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => toggleOption('Carne', opt, true)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                                isSelected('Carne', opt, true) 
                                                    ? 'bg-primaryAction text-white border-primaryAction' 
                                                    : 'bg-white text-secundaryText border-borderInput hover:border-gray-300'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button 
                                        onClick={() => toggleOption('Carne', 'Tripa', true)}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                            isSelected('Carne', 'Tripa', true) 
                                                ? 'bg-primaryAction text-white border-primaryAction' 
                                                : 'bg-white text-secundaryText border-borderInput hover:border-gray-300'
                                        }`}
                                    >
                                        Tripa <span className={`text-xs font-normal ml-1 ${isSelected('Carne', 'Tripa', true) ? 'text-white/80' : 'text-secundaryText/60'}`}>+$2.00</span>
                                    </button>
                                </div>
                            </div>

                            {/* Categoría: Salsa */}
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-primaryText">Salsa</h3>
                                <p className="text-xs text-secundaryText font-medium mb-3">Opcional / Sin límite</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Verde', 'Roja'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => toggleOption('Salsa', opt)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                                isSelected('Salsa', opt) 
                                                    ? 'bg-primaryAction text-white border-primaryAction' 
                                                    : 'bg-white text-secundaryText border-borderInput hover:border-gray-300'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categoría: Verdura */}
                            <div className="mb-2">
                                <h3 className="text-lg font-bold text-primaryText">Verdura</h3>
                                <p className="text-xs text-secundaryText font-medium mb-3">Opcional / Sin límite</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Cebolla', 'Cilantro'].map(opt => (
                                        <button 
                                            key={opt}
                                            onClick={() => toggleOption('Verdura', opt)}
                                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                                isSelected('Verdura', opt) 
                                                    ? 'bg-primaryAction text-white border-primaryAction' 
                                                    : 'bg-white text-secundaryText border-borderInput hover:border-gray-300'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                    </div>
                                </>
                            )}

                        </Modal.Body>

                        <hr className="mx-6 border-t border-borderInput/50" />

                        {/* Footer (Cantidad + Botón Añadir) */}
                        <div className="p-6 pt-4 flex gap-4 items-center shrink-0">
                            <div className="flex items-center rounded-lg overflow-hidden shrink-0 h-10">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, (parseInt(quantity) || 1) - 1))}
                                    className="w-10 h-full bg-primaryAction text-white flex items-center justify-center hover:bg-primaryAction/90 transition-colors"
                                >
                                    <Minus className="size-4" />
                                </button>
                                <input 
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={quantity}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '') {
                                            setQuantity('');
                                        } else {
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num) && num >= 1) setQuantity(num);
                                        }
                                    }}
                                    onBlur={() => {
                                        if (quantity === '' || quantity < 1) setQuantity(1);
                                    }}
                                    className="font-bold text-lg text-primaryText w-10 text-center bg-white h-full border-y border-borderInput outline-none m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button 
                                    onClick={() => setQuantity((parseInt(quantity) || 0) + 1)}
                                    className="w-10 h-full bg-primaryAction text-white flex items-center justify-center hover:bg-primaryAction/90 transition-colors"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                            
                            <button 
                                onClick={handleAdd}
                                className="flex-1 h-10 rounded-lg bg-primaryAction text-white font-bold hover:bg-primaryAction/90 transition-colors shadow-md shadow-primaryAction/20 text-sm flex items-center justify-center uppercase tracking-wide"
                            >
                                {initialItem ? 'Actualizar Orden' : 'Añadir a la orden'} • ${totalPrice}
                            </button>
                        </div>
                        
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
