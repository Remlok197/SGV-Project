import React, { useState, useRef, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { ReactSVG } from "react-svg";
import { X } from "lucide-react";

export default function EditableCategoryContent({ category, onSave, onDelete }) {
    const [inputValue, setInputValue] = useState(category.name);
    const [selectedIcon, setSelectedIcon] = useState(category.icon);
    const [icons, setIcons] = useState([]);
    
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const isPopoverOpenRef = useRef(false);
    const inputRef = useRef(null);

    useEffect(() => {
        isPopoverOpenRef.current = isPopoverOpen;
    }, [isPopoverOpen]);

    useEffect(() => {
        if (icons.length === 0) {
            fetch("/api/iconos_categorias")
                .then((res) => res.json())
                .then(setIcons)
                .catch(console.error);
        }
    }, [icons.length]);

    const handleConfirm = (overrideIcon = null) => {
        const iconToSave = overrideIcon !== null ? overrideIcon : selectedIcon;
        if (inputValue.trim() && (inputValue.trim() !== category.name || iconToSave !== category.icon)) {
            onSave({ id: category.id, nombre: inputValue.trim(), icono: iconToSave });
        }
    };

    return (
        <div 
            className="flex items-center w-full" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen} placement="bottom-start">
                <PopoverTrigger>
                    <button 
                        onMouseDown={() => { isPopoverOpenRef.current = true; }}
                        className="h-6 w-6 rounded-md hover:bg-secundary/20 flex items-center justify-center mr-1 flex-shrink-0 transition-colors"
                    >
                        {selectedIcon ? (
                            <ReactSVG src={selectedIcon} className="size-4 flex items-center justify-center [&_svg]:size-4 [&_svg]:fill-current text-secundaryText" />
                        ) : (
                            <span className="w-4 h-4 bg-gray-200 rounded-full" />
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
                                    handleConfirm(iconPath);
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
                            handleConfirm();
                        }
                    }, 150);
                }}
                onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") {
                        handleConfirm();
                        inputRef.current?.blur();
                    }
                }}
                className="bg-transparent outline-none w-16 md:w-20 text-sm font-semibold text-secundaryText"
                placeholder="Nombre..."
            />
            
            <div
                role="button"
                className="ml-1 opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all flex-shrink-0 cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (onDelete) onDelete(category.id);
                }}
            >
                <X className="size-3.5" />
            </div>
        </div>
    );
}
