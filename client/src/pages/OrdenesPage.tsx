import React, { useState, useEffect } from "react";
import PanelLista from "./ordenes/PanelList";
import PanelDetalle from "./ordenes/PanelDetail";
import { imprimirTicket } from '../utils/ticketPrinter';
import PageHeader from "../components/shared/PageHeader";

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<any>(null);

  // 1. Efecto para ir por los datos reales al montar la pantalla
  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/ordenes/");
      const data = await res.json();
      
      // 2. Mapeamos el JSON del backend para que encaje perfecto con las tarjetas de Fabian
      const ordenesFormateadas = data.map((orden: any) => ({
        id: orden.id,
        mesa: orden.numero_mesa ? orden.numero_mesa.toString() : "N/A",
        // Capitalizamos la primera letra del estado para que se vea bien en la etiqueta
        estado: orden.estado.charAt(0).toUpperCase() + orden.estado.slice(1),
        total: orden.total,
        detalles: orden.detalles.map((det: any) => ({
          id: det.id,
          nombre: det.producto.nombre,
          precio: det.producto.precio,
          cantidad: det.cantidad,
          // Si no tiene imagen, le ponemos el placeholder gris que tenías en el mockup
          imagenUrl: det.producto.imagen_url || "https://via.placeholder.com/60"
        }))
      }));

      // 3. Ordenamos de la más reciente a la más vieja para que las nuevas salgan hasta arriba
      const ordenesOrdenadas = ordenesFormateadas.sort((a: any, b: any) => b.id - a.id);

      setOrdenes(ordenesOrdenadas);
      
      // 4. Seleccionamos la primera orden por defecto si es que hay datos en la DB
      if (ordenesOrdenadas.length > 0) {
        setOrdenSeleccionada(ordenesOrdenadas[0]);
      }
    } catch (error) {
      console.error("Error al traer las órdenes:", error);
    }
  };

  const marcarComoEntregada = async (ordenId: number) => {
    try {
      // Mandamos el estado_nuevo por la URL como lo definimos en FastAPI
      const res = await fetch(`http://127.0.0.1:8000/api/ordenes/${ordenId}?estado_nuevo=entregado`, {
        method: "PUT"
      });
      
      if (res.ok) {
        // Si se actualizó bien, recargamos la lista para que se pinte de verde
        fetchOrdenes();
      }
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Panel Izquierdo */}
      <div className="flex-1 h-full flex flex-col pt-6 overflow-y-auto border-r border-secundaryText/20">
        <div className="px-6 md:px-10 lg:px-11 flex-shrink-0 mb-6">
            <PageHeader title={"Órdenes Recientes"} />
        </div>
        <div className="px-6 md:px-10 lg:px-11 pb-12">
          <PanelLista 
            ordenes={ordenes} 
            // Si no hay orden seleccionada, mandamos 0 para que no truene
            ordenSeleccionadaId={ordenSeleccionada?.id || 0}
            onSelect={setOrdenSeleccionada} 
          />
        </div>
      </div>

      {/* Panel Derecho */}
      <div className="w-[400px] bg-white p-8 shadow-sm flex flex-col">
        {/* Validamos que ya haya cargado una orden antes de pintar el ticket */}
        {ordenSeleccionada ? (
          <PanelDetalle 
            orden={ordenSeleccionada} 
            onEntregar={marcarComoEntregada} // Pasamos la función al panel derecho
          />
        ) : (
          <div className="text-gray-400 text-center mt-10 font-medium">
            No hay órdenes para mostrar...
          </div>
        )}
      </div>
    </div>
  );
}