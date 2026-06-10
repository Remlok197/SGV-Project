import React from "react";

interface PanelListProps {
  ordenes: any[];
  ordenSeleccionadaId: number;
  onSelect: (orden: any) => void;
}

export default function PanelList({ ordenes, ordenSeleccionadaId, onSelect }: PanelListProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-6 rounded-t-2xl shadow-sm border border-b-0 border-gray-100 h-full overflow-y-auto">
      {ordenes.map((orden) => {
        const isSelected = orden.id === ordenSeleccionadaId;
        const totalProductos = orden.detalles.reduce((sum: number, item: any) => sum + item.cantidad, 0) || (orden.id === 231 ? 5 : orden.id === 249 ? 12 : 7); // Simulación rápida

        return (
          <div 
            key={orden.id}
            onClick={() => onSelect(orden)}
            className={`p-5 rounded-xl cursor-pointer transition-all flex flex-col gap-4 ${
              isSelected 
                ? 'bg-[#F08B46] text-white shadow-md' 
                : 'bg-[#F2F2F2] text-gray-800 hover:bg-gray-200'
            }`}
          >
            {/* Fila Superior */}
            <div className="flex justify-between items-center w-full">
              <span className="font-bold text-[1.1rem]">Orden #{orden.id}</span>
              <span className={`font-bold text-[15px] ${
                isSelected 
                  ? 'text-white' 
                  : (orden.estado.toLowerCase() === 'entregada' ? 'text-[#61BA6E]' : 'text-[#F08B46]')
              }`}>
                {orden.estado}
              </span>
            </div>

            {/* Fila Inferior */}
            <div className="flex justify-between items-end w-full">
              <span className={`text-[15px] font-semibold flex-1 ${isSelected ? 'text-white' : 'text-[#566573]'}`}>
                No. mesa: {orden.mesa === "N/A" ? "N/A" : `#${orden.mesa}`}
              </span>
              
              <span className={`text-[15px] font-bold flex-1 text-center ${isSelected ? 'text-white' : 'text-[#566573]'}`}>
                {totalProductos} productos
              </span>

              <span className="font-bold text-[1.35rem] flex-1 text-right tracking-tight">
                ${orden.total.toFixed(0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}