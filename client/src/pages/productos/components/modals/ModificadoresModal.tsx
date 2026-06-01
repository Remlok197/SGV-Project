import React, { useState, useEffect } from "react";
import { Modal } from "@heroui/react";
import { GripVertical, Edit2, Trash2, Plus, X } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import NuevoModificadorModal from "./NuevoModificadorModal";

interface ModificadoresModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// Componente para cada ítem arrastrable
function SortableModificadorItem({ mod }: { mod: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mod.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between border-b border-borderInput pb-5 last:border-0 last:pb-0 bg-white ${isDragging ? "opacity-50 relative" : ""}`}>
      <div className="flex items-start gap-4">
        <div {...attributes} {...listeners} className="pt-1 text-gray-400 cursor-grab focus:outline-none touch-none hover:text-gray-600 transition-colors">
          <GripVertical className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-base text-primaryText">{mod.name}</span>
          <span className="text-sm text-secundaryText">{mod.options}</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-end">
          <span className="text-sm text-secundaryText">{mod.rules}</span>
          <span className="text-sm text-secundaryText">{mod.category}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-secundaryText hover:text-primaryText transition-colors cursor-pointer focus:outline-none">
            <Edit2 className="size-4" />
          </button>
          <button className="text-red-400 hover:text-red-500 transition-colors cursor-pointer focus:outline-none">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModificadoresModal({ isOpen, onOpenChange }: ModificadoresModalProps) {
  const [modificadores, setModificadores] = useState<any[]>([]);
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);

  // 1. Efecto para cargar los datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchModificadores();
    }
  }, [isOpen]);

  const fetchModificadores = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/modificadores");
      const data = await res.json();
      
      // Traducimos el JSON del backend al formato visual de Fabian
      const mappedData = data.map((mod: any) => ({
        id: mod.id,
        name: mod.nombre,
        options: mod.opciones.map((o: any) => o.nombre).join(", ") || "Sin opciones",
        rules: mod.maximo ? `Mín ${mod.minimo} / Max ${mod.maximo}` : (mod.minimo === 0 ? "Opcional / Sin límite" : `Mín ${mod.minimo} / Sin límite`),
        category: "Personalizado" // El backend no tiene categoría para modificadores, lo dejamos genérico
      }));
      
      setModificadores(mappedData);
    } catch (error) {
      console.error("Error cargando modificadores:", error);
    }
  };


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setModificadores((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveNuevoModificador = async (data: any) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/modificadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        // Si se guardó bien en la BD, recargamos la lista
        fetchModificadores();
      }
    } catch (error) {
      console.error("Error guardando el modificador:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <Modal.Container size="2xl" className="w-full max-w-2xl outline-none">
          <Modal.Dialog className="outline-none bg-white rounded-[24px] w-full shadow-xl">
            <Modal.Header className="flex flex-col gap-1 px-8 py-5 relative">
              <h2 className="text-2xl font-bold text-primaryText">Modificadores</h2>
              <Modal.CloseTrigger className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                <X className="size-4" />
              </Modal.CloseTrigger>
            </Modal.Header>
            <Modal.Body className="px-8 pb-8 pt-2">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                <SortableContext items={modificadores.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-5 max-h-[60vh] overflow-y-auto hide-scrollbar pr-2">
                    {modificadores.map((mod) => (
                      <SortableModificadorItem key={mod.id} mod={mod} />
                    ))}

                    <button 
                      onClick={() => setIsNuevoModalOpen(true)}
                      className="flex items-center gap-2 text-secundaryText font-bold text-base mt-2 hover:opacity-80 transition-opacity w-fit cursor-pointer"
                    >
                      <Plus className="size-5 text-primaryAction" strokeWidth={2.5} />
                      Nuevo modificador
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <NuevoModificadorModal 
        isOpen={isNuevoModalOpen} 
        onOpenChange={setIsNuevoModalOpen} 
        onSave={handleSaveNuevoModificador} 
      />
    </Modal>
  );
}
