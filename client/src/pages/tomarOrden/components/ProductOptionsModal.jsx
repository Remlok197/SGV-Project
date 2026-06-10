import React, { useState, useEffect } from 'react';
import { Modal } from "@heroui/react";
import { X, Minus, Plus } from "lucide-react";

export default function ProductOptionsModal({ isOpen, onOpenChange, product, categoryName, initialItem, onAdd }) {
    const [quantity, setQuantity] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [selectedOptions, setSelectedOptions] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (initialItem) {
                setQuantity(initialItem.quantity);
                setSelectedOptions(initialItem.options || {});
            } else {
                setQuantity(1);
                setSelectedOptions({});
            }
            setErrorMsg('');
        } else {
            setTimeout(() => {
                setQuantity(1);
                setErrorMsg('');
                setSelectedOptions({});
            }, 300);
        }
    }, [isOpen, initialItem]);

    if (!product) return null;

    const modificadores = product?.modificadores || [];
    const hasModifiers = modificadores.length > 0;

    const toggleOption = (category, option, mod) => {
        const isMulti = mod.maximo !== 1;
        
        if (!isMulti) {
            setSelectedOptions(prev => {
                const current = prev[category] || [];
                if (current.includes(option)) {
                    if (mod.minimo === 0) {
                        return { ...prev, [category]: [] };
                    }
                    return prev;
                }
                return { ...prev, [category]: [option] };
            });
            return;
        }

        setSelectedOptions(prev => {
            const current = prev[category] || [];
            if (current.includes(option)) {
                return { ...prev, [category]: current.filter(o => o !== option) };
            }
            
            if (mod.maximo && current.length >= mod.maximo) {
                return prev;
            }

            return { ...prev, [category]: [...current, option] };
        });
    };

    const isSelected = (category, option) => {
        return (selectedOptions[category] || []).includes(option);
    };

    const handleAdd = () => {
        setErrorMsg(''); 
        let finalOptions = {};
        
        if (hasModifiers) {
            finalOptions = selectedOptions;
            
            for (const mod of modificadores) {
                const selected = finalOptions[mod.nombre] || [];
                if (mod.minimo > 0 && selected.length < mod.minimo) {
                    setErrorMsg(`Debes seleccionar al menos ${mod.minimo} opción(es) de ${mod.nombre}`);
                    return;
                }
                if (mod.maximo > 0 && selected.length > mod.maximo) {
                    setErrorMsg(`No puedes seleccionar más de ${mod.maximo} opción(es) de ${mod.nombre}`);
                    return;
                }
            }
        }

        if (onAdd) {
            onAdd({ product, quantity, options: finalOptions });
        }
        onOpenChange(false);
    };

    const basePrice = typeof product.price === 'number' ? product.price : 17.00;
    let surcharge = 0;
    
    if (hasModifiers) {
        Object.entries(selectedOptions).forEach(([modName, selectedOpts]) => {
            const mod = modificadores.find(m => m.nombre === modName);
            if (mod && mod.opciones) {
                const optArray = Array.isArray(selectedOpts) ? selectedOpts : [selectedOpts];
                optArray.forEach(optName => {
                    const opt = mod.opciones.find(o => o.nombre === optName);
                    if (opt && typeof opt.precio_extra === 'number') {
                        surcharge += opt.precio_extra;
                    }
                });
            }
        });
    }

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
                            
                            {hasModifiers && modificadores.map(mod => {
                                const min = mod.minimo;
                                const max = mod.maximo;
                                let ruleText = "Opcional / Sin límite";
                                if (min > 0 && !max) ruleText = `Mín ${min} / Sin límite`;
                                else if (!min && max > 0) ruleText = `Opcional / Max ${max}`;
                                else if (min > 0 && max > 0) ruleText = min === max ? `Debes elegir ${min}` : `Mín ${min} / Max ${max}`;

                                return (
                                    <div key={mod.id} className="mb-6 mt-2 first:mt-4 last:mb-2">
                                        <h3 className="text-lg font-bold text-primaryText">{mod.nombre}</h3>
                                        <p className="text-xs text-secundaryText font-medium mb-3">{ruleText}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {mod.opciones.map(opt => {
                                                const selected = isSelected(mod.nombre, opt.nombre);
                                                return (
                                                    <button 
                                                        key={opt.id}
                                                        onClick={() => toggleOption(mod.nombre, opt.nombre, mod)}
                                                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                                                            selected 
                                                                ? 'bg-primaryAction text-white border-primaryAction' 
                                                                : 'bg-white text-secundaryText border-borderInput hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {opt.nombre} 
                                                        {opt.precio_extra > 0 && (
                                                            <span className={`text-xs font-normal ml-1 ${selected ? 'text-white/80' : 'text-secundaryText/60'}`}>
                                                                +${opt.precio_extra.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
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
