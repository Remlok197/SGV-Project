import React from "react";

export default function CategoryActionButton({ title, icon, onClick, isActive, className = "" }) {
    return (
        <button
            onClick={onClick}
            className={`
                h-9 px-4 rounded-xl border transition-all duration-200 flex items-center gap-2 whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/50
                ${isActive
                    ? "bg-primary/10 border-primary text-primary font-semibold"
                    : "bg-white border-secundaryText/20 text-secundaryText hover:bg-secundary/20 hover:border-secundaryText/40"
                }
                ${className}
            `}
        >
            {icon && <span className="flex-shrink-0 size-4 flex items-center justify-center">{icon}</span>}
            <span>{title}</span>
        </button>
    );
}
