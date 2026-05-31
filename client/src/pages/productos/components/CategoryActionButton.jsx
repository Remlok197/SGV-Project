import React from "react";

export default function CategoryActionButton({ title, icon, onClick, isActive, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`
                h-10 px-4 rounded-[10px] border font-medium text-sm transition-all duration-200 flex items-center gap-2 whitespace-nowrap outline-none cursor-pointer select-none
                ${isActive
                    ? "bg-primaryAction border-primaryAction text-white"
                    : "bg-[#F8FAFC] border-dashed border-[#CBD5E1] text-secundaryText hover:bg-gray-100 hover:text-primaryText"
                }
                ${className}
            `}
        >
            {icon && <span className="flex-shrink-0 size-[18px] flex items-center justify-center">{icon}</span>}
            <span>{title}</span>
        </button>
    );
}
