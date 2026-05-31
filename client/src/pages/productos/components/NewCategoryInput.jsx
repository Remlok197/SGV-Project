import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { ReactSVG } from "react-svg";
import CategoryActionButton from "./CategoryActionButton";

export default function NewCategoryInput({ onConfirm }) {
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("");
    const [icons, setIcons] = useState([]);
    
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const isPopoverOpenRef = useRef(false);
    const inputRef = useRef(null);

    useEffect(() => {
        isPopoverOpenRef.current = isPopoverOpen;
    }, [isPopoverOpen]);

    useEffect(() => {
        if (isInputVisible && icons.length === 0) {
            fetch("/api/iconos_categorias")
                .then((res) => res.json())
                .then((data) => {
                    setIcons(data);
                    if (data.length > 0) {
                        // Intentar poner uno de comida por defecto si existe, o el primero
                        const defaultIcon = data.find(i => i.includes("pizza")) || data[0];
                        setSelectedIcon(defaultIcon);
                    }
                })
                .catch(console.error);
        }
    }, [isInputVisible]);

    useEffect(() => {
        if (isInputVisible && inputRef.current && !isPopoverOpen) {
            inputRef.current.focus();
        }
    }, [isInputVisible, isPopoverOpen]);

    const handleConfirm = () => {
        if (inputValue.trim()) {
            // Mandamos un objeto para que luego el padre tenga el icono
            onConfirm({ nombre: inputValue.trim(), icono: selectedIcon });
        }
        setIsInputVisible(false);
        setInputValue("");
    };

    if (isInputVisible) {
        return (
            <div className="h-9 pl-2 pr-4 rounded-xl border bg-white border-primary text-primaryText flex items-center shadow-sm w-60 transition-all duration-200">
                <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement="bottom-start">
                    <PopoverTrigger>
                        <button 
                            onMouseDown={() => { isPopoverOpenRef.current = true; }}
                            className="h-6 w-6 rounded-md hover:bg-secundary/20 flex items-center justify-center mr-2 flex-shrink-0 transition-colors"
                        >
                            {selectedIcon ? (
                                <ReactSVG src={selectedIcon} className="size-4 flex items-center justify-center [&_svg]:size-4 [&_svg]:fill-current text-primary" />
                            ) : (
                                <Plus className="size-4 text-primary" />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="p-3 w-56 max-h-56 overflow-y-auto hide-scrollbar grid grid-cols-4 gap-2">
                            {icons.map((iconPath) => (
                                <button
                                    key={iconPath}
                                    onClick={() => {
                                        setSelectedIcon(iconPath);
                                        setIsPopoverOpen(false);
                                        setTimeout(() => inputRef.current?.focus(), 50);
                                    }}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                                        selectedIcon === iconPath 
                                            ? 'bg-primary/20 text-primary' 
                                            : 'hover:bg-secundary/20 text-secundaryText'
                                    }`}
                                >
                                    <ReactSVG src={iconPath} className="size-5 flex items-center justify-center [&_svg]:size-5 [&_svg]:fill-current" />
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={() => {
                        setTimeout(() => {
                            if (!isPopoverOpenRef.current) {
                                if (inputValue.trim()) {
                                    handleConfirm();
                                } else {
                                    setIsInputVisible(false);
                                    setInputValue("");
                                }
                            }
                        }, 150);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirm();
                        if (e.key === "Escape") {
                            setIsInputVisible(false);
                            setInputValue("");
                        }
                    }}
                    className="bg-transparent outline-none w-full text-sm font-semibold"
                    placeholder="Categoría..."
                />
            </div>
        );
    }

    return (
        <CategoryActionButton 
            title="Nueva Categoría" 
            icon={<Plus className="size-4" />} 
            onClick={() => setIsInputVisible(true)} 
        />
    );
}
