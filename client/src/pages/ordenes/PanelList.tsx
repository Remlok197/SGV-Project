import React from "react";

interface PanelListProps {
  ordenes: any[];
  ordenSeleccionadaId: number;
  onSelect: (orden: any) => void;
}

export default function PanelList({ ordenes, ordenSeleccionadaId, onSelect }: PanelListProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] overflow-y-auto">
      {ordenes.map((orden) => {
        const isSelected = orden.id === ordenSeleccionadaId;
        const totalProductos = orden.detalles.reduce((sum: number, item: any) => sum + item.cantidad, 0) || (orden.id === 231 ? 5 : orden.id === 249 ? 12 : 7); // Simulación rápida

        return (
          <div 
            key={orden.id}
            onClick={() => onSelect(orden)}
            className={`p-5 rounded-xl cursor-pointer transition-all flex justify-between items-center ${
              isSelected 
                ? 'bg-orange-400 text-white shadow-md' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {/* Izquierda de la tarjeta */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-lg">Orden #{orden.id}</span>
              <span className={`text-sm ${isSelected ? 'text-orange-100' : 'text-gray-500'}`}>
                No. mesa: {orden.mesa === "N/A" ? "N/A" : `#${orden.mesa}`}
              </span>
            </div>

            {/* Centro de la tarjeta */}
            <div className="flex items-center">
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                {totalProductos} productos
              </span>
            </div>

            {/* Derecha de la tarjeta */}
            <div className="flex flex-col gap-3 items-end">
              <span className={`font-bold text-sm ${
                isSelected ? 'text-white' : (orden.estado === 'Entregado' ? 'text-green-500' : 'text-orange-400')
              }`}>
                {orden.estado}
              </span>
              <span className="font-bold text-xl">${orden.total}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}