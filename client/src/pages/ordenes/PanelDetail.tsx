import React from "react";

interface PanelDetailProps {
  orden: any;
  onEntregar: (ordenId: number) => void;
}

export default function PanelDetail({ orden, onEntregar }: PanelDetailProps) {
  if (!orden) return <div className="text-gray-400 text-center mt-10">Selecciona una orden</div>;

  const yaEntregada = orden.estado.toLowerCase() === "entregado";

  return (
    <div className="flex flex-col h-full">
      {/* Cabecera del ticket */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-800">Detalles de la orden:</h2>
        <span className="text-xl font-bold text-gray-600">#{orden.id}</span>
      </div>

      {/* Lista de productos */}
      <div className="flex flex-col gap-6 flex-1 overflow-y-auto">
        {orden.detalles.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay detalles para mostrar en esta simulación.</p>
        ) : (
          orden.detalles.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={item.imagenUrl} 
                  alt={item.nombre} 
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-sm">{item.nombre}</span>
                  <span className="font-semibold text-orange-500 text-sm">${item.precio.toFixed(2)}</span>
                </div>
              </div>
              <span className="font-bold text-gray-600">x{item.cantidad}</span>
            </div>
          ))
        )}
      </div>

      {/* Footer del ticket (Total y Botones) */}
      <div className="pt-6 border-t border-gray-200 mt-auto">
        <div className="flex justify-between items-center mb-8">
          <span className="font-bold text-gray-800">Total:</span>
          <span className="font-bold text-gray-800">${orden.total.toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-3 px-4 bg-white border-2 border-orange-400 text-orange-400 font-bold rounded-lg hover:bg-orange-50 transition-colors">
            IMPRIMIR
          </button>
          <button 
            onClick={() => onEntregar(orden.id)}
            disabled={yaEntregada}
            className={`flex-1 py-3 px-4 font-bold rounded-lg transition-colors ${
              yaEntregada 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {yaEntregada ? 'ENTREGADA' : 'ENTREGAR'}
          </button>
        </div>
      </div>
    </div>
  );
}