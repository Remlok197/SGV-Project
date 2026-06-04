import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function ProductCard({ 
  name, 
  price, 
  modifiers, 
  imageUrl, 
  isAvailable = true,
  onEdit,
  onDelete
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
const modificadoresTexto = modifiers && modifiers.trim() !== "" 
    ? modifiers.toLowerCase() 
    : "sin modificadores";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex border border-secundaryText/35 shadow-md rounded-lg 
                    p-3 md:p-3.5 gap-3 max-w-64 min-h-[115px] 
                    items-center
                    relative transition-shadow hover:shadow-md bg-white">
      
      <div className="size-21 md:size-24.5 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400 text-xs">Sin imagen</span>
        )}
      </div>

      <div className="flex flex-col flex-grow justify-center gap-1 overflow-hidden">
        
        <h3 className="font-extrabold text-primaryText text-sm md:text-base pr-4 truncate">
          {name}
        </h3>
        
        <p className="font-bold text-primaryAction text-sm md:text-base">
        {price}
        </p>
        
        <p className="font-regular text-secundaryText text-xs md:text-sm pr-4 truncate">
          {modificadoresTexto}
        </p>

        <div className="flex items-center gap-1.5 mt-auto">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={"font-semibold text-xs md:text-sm text-terciaryText"}>
            {isAvailable ? 'Disponible' : 'Agotado'}
          </span>
        </div>

      </div>

      {/* Options Dropdown Container */}
      <div className="absolute top-2 right-2" ref={dropdownRef}>
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className={`p-1 rounded-full transition-colors cursor-pointer focus:outline-none ${
            showDropdown ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Opciones del producto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl border border-slate-100 shadow-xl py-1.5 z-30 transition-all origin-top-right scale-100 opacity-100">
            <button
              onClick={() => {
                setShowDropdown(false);
                if (onEdit) onEdit();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs md:text-sm font-medium text-slate-700 hover:bg-[#EE791C]/10 hover:text-[#EE791C] transition-colors text-left cursor-pointer"
            >
              <Edit2 className="size-3.5" />
              <span>Editar</span>
            </button>
            <button
              onClick={() => {
                setShowDropdown(false);
                if (onDelete) onDelete();
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs md:text-sm font-medium text-[#FB4646] hover:bg-red-50/50 transition-colors text-left cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Borrar</span>
            </button>
          </div>
        )}
      </div>
      
    </div>
  );
}