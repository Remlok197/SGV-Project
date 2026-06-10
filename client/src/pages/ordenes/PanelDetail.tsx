import React from "react";
import { imprimirTicket } from '../../utils/ticketPrinter';

interface PanelDetailProps {
  orden: any;
  onEntregar: (ordenId: number) => void;
}

export default function PanelDetail({ orden, onEntregar }: PanelDetailProps) {
  if (!orden) return null;

  const yaEntregada = orden.estado.toLowerCase() === "entregada";

  return (
    <div className="flex flex-col h-full w-full">
      {/* Cabecera del ticket */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-primaryText">Detalles de la orden:</h2>
        <span className="text-secundaryText font-medium text-lg">#{orden.id}</span>
      </div>

      {/* Lista de productos */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {orden.detalles.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-secundaryText/60 font-medium text-sm">
            No hay productos en la orden
          </div>
        ) : (
          orden.detalles.map((item: any, index: number) => {
            const itemTotal = item.precio * item.cantidad;
            return (
              <div key={item.id} className={`flex flex-col ${index !== orden.detalles.length - 1 ? 'border-b-2 border-borderInput/60 pb-4 mb-4' : 'pb-2'}`}>
                {/* Top Row: Info */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 flex-1">
                    <div className="size-12 md:size-14 rounded-lg bg-gray-200 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imagenUrl && item.imagenUrl !== "https://via.placeholder.com/60" ? (
                        <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">IMG</span>
                      )}
                    </div>
                    <div className="flex flex-col justify-start pt-1">
                      <h3 className="font-bold text-primaryText text-lg leading-none">{item.nombre}</h3>
                      <p className="text-secundaryText font-medium text-base mt-1.5">${item.precio.toFixed(2)} c/u</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <span className="bg-gray-100 text-secundaryText font-bold text-xs md:text-sm px-2 py-1 rounded-md">x{item.cantidad}</span>
                    <span className="font-bold text-primaryText text-sm md:text-base leading-none">${itemTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Bottom Row: Tags (solo si existen) */}
                {item.opciones && item.opciones.length > 0 && (
                  <div className="flex mt-3">
                    <div className="flex flex-wrap gap-2 flex-1">
                      {item.opciones.map((opcion: string, i: number) => (
                        <span key={i} className="bg-gray-50 text-secundaryText font-medium text-[12px] px-2.5 py-1 rounded-md border-[1.5px] border-dashed border-gray-300/80">
                          {opcion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer del ticket (Total y Botones) */}
      <div className="mt-6 pt-6 border-t border-secundaryText/20">
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-primaryText text-base md:text-lg">Total:</span>
          <span className="font-bold text-primaryText text-base md:text-lg">
            ${orden.total.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => {
              const itemsImpresion = orden.detalles.map((item: any) => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio_total: item.precio * item.cantidad 
              }));
              imprimirTicket(itemsImpresion, orden.total, orden.id);
            }}
            className="flex-1 py-2 rounded-xl border border-primaryAction text-primaryAction font-bold hover:bg-primaryAction/5 transition-colors text-sm md:text-base"
          >
            IMPRIMIR
          </button>
          <button 
            onClick={() => onEntregar(orden.id)}
            disabled={yaEntregada}
            className={`flex-1 py-2 rounded-xl text-white font-bold transition-colors shadow-md text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
              yaEntregada 
                ? 'bg-gray-400 shadow-none' 
                : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
            }`}
          >
            {yaEntregada ? 'ENTREGADA' : 'ENTREGAR'}
          </button>
        </div>
      </div>
    </div>
  );
}