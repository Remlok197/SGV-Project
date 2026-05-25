import React from 'react';

export default function ProductCard({ 
  name, 
  price, 
  description, 
  imageUrl, 
  isAvailable = true,
  onOptionsClick 
}) {
  return (
    <div className="flex border border-secundaryText/35 shadow-md rounded-lg 
                    p-3 md:p-3.5 gap-3 max-w-64 min-h-[115px] 
                    items-center
                    relative transition-shadow hover:shadow-md">
      
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
          {description}
        </p>

        <div className="flex items-center gap-1.5 mt-auto">
          <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={"font-semibold text-xs md:text-sm text-terciaryText"}>
            {isAvailable ? 'Disponible' : 'Agotado'}
          </span>
        </div>

      </div>


      <button 
        onClick={onOptionsClick}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
        aria-label="Opciones del producto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        </svg>
      </button>
      
    </div>
  );
}