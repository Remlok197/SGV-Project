import React from 'react';

export default function ProductGrid({ children }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,16rem)] gap-4">
            {children}
        </div>
    );
}