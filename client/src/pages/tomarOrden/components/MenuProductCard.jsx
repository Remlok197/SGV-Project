import React from 'react';

export default function MenuProductCard({ name, price, imageUrl, onClick }) {
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-2.5 cursor-pointer hover:shadow-md transition-shadow hover:border-primaryAction/30 flex flex-col"
        >
            <div className="w-full h-24 md:h-28 rounded-xl overflow-hidden bg-gray-100">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Sin imagen
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center mt-3 mb-1 px-1">
                <span className="font-bold text-primaryText text-[1rem] leading-none truncate pr-2">
                    {name}
                </span>
                <span className="font-bold text-primaryAction text-[1rem] leading-none flex-shrink-0">
                    {price}
                </span>
            </div>
        </div>
    );
}
