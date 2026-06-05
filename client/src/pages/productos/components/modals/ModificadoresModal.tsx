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
  categorias: { id: string | number; name: string }[];
}

// Componente para cada ítem arrastrable
function SortableModificadorItem({ mod, onEdit, onDelete }: { mod: any, onEdit: (mod: any) => void, onDelete: (id: number) => void }) {
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
          <button onClick={() => onEdit(mod)} className="text-secundaryText hover:text-primaryText transition-colors cursor-pointer focus:outline-none">
            <Edit2 className="size-4" />
          </button>
          <button onClick={() => onDelete(mod.id)} className="text-red-400 hover:text-red-500 transition-colors cursor-pointer focus:outline-none">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModificadoresModal({ isOpen, onOpenChange, categorias }: ModificadoresModalProps) {
  const [modificadores, setModificadores] = useState<any[]>([]);
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [editingMod, setEditingMod] = useState<any>(null);

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
      const mappedData = data.map((mod: any) => {
        const catName = categorias.find(c => c.id.toString() === mod.categoria_id?.toString())?.name || "Personalizado";
        return {
          id: mod.id,
          name: mod.nombre,
          options: mod.opciones.map((o: any) => o.nombre).join(", ") || "Sin opciones",
          rules: mod.maximo ? `Mín ${mod.minimo} / Max ${mod.maximo}` : (mod.minimo === 0 ? "Opcional / Sin límite" : `Mín ${mod.minimo} / Sin límite`),
          category: catName,
          raw: mod // Guardamos el JSON crudo para la edición
        };
      });
      
      setModificadores(mappedData);
    } catch (error) {
      console.error("Error cargando modificadores:", error);
    }
  };

  const handleDeleteModificador = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este modificador?")) {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/modificadores/${id}`, {
          method: "DELETE"
        });
        if (res.ok) {
          fetchModificadores(); // Recargar después de borrar
        } else {
          const err = await res.json();
          alert(err.detail || "Error al eliminar");
        }
      } catch (error) {
        console.error("Error eliminando modificador:", error);
      }
    }
  };


  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = modificadores.findIndex((i) => i.id === active.id);
      const newIndex = modificadores.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(modificadores, oldIndex, newIndex);
      
      setModificadores(newItems);

      // Send to backend
      const reorderPayload = newItems.map((item, index) => ({ id: item.id, orden: index }));
      try {
        await fetch("http://127.0.0.1:8000/api/modificadores/reorder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reorderPayload)
        });
      } catch (error) {
        console.error("Error reordenando modificadores:", error);
      }
    }
  };

  const handleSaveNuevoModificador = async (data: any, editId?: number) => {
    try {
      if (editId) {
        // 1. Actualizar el Modificador principal
        await fetch(`http://127.0.0.1:8000/api/modificadores/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: data.nombre,
            minimo: data.minimo,
            maximo: data.maximo,
            categoria_id: data.categoria_id
          })
        });

        // 2. Sincronizar Opciones
        const oldMod = modificadores.find(m => m.id === editId)?.raw;
        const oldOpciones = oldMod?.opciones || [];
        const newOpciones = data.opciones || [];

        // - Borradas (Estaban en old, ya no están en new)
        const newIds = newOpciones.map((o: any) => o.id).filter((id: string) => !id.toString().includes("-"));
        for (const oldOp of oldOpciones) {
          if (!newIds.includes(oldOp.id.toString())) {
            await fetch(`http://127.0.0.1:8000/api/opciones/${oldOp.id}`, { method: "DELETE" });
          }
        }

        // - Agregadas y Editadas
        for (let i = 0; i < newOpciones.length; i++) {
          const newOp = newOpciones[i];
          if (newOp.id && newOp.id.toString().includes("-")) {
            // Nueva (generamos un id con '-' en el frontend)
            await fetch(`http://127.0.0.1:8000/api/modificadores/${editId}/opciones`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nombre: newOp.nombre, precio_extra: newOp.precio_extra, disponible: true, orden: i })
            });
          } else if (newOp.id) {
            // Existente
            await fetch(`http://127.0.0.1:8000/api/opciones/${newOp.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nombre: newOp.nombre, precio_extra: newOp.precio_extra, orden: i })
            });
          }
        }

        fetchModificadores();

      } else {
        // MODO CREACION
        // Add sorting index to options before sending
        const payload = {
          ...data,
          orden: modificadores.length, // Add at the end
          opciones: data.opciones.map((op: any, i: number) => ({ ...op, orden: i }))
        };

        const res = await fetch("http://127.0.0.1:8000/api/modificadores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        
        if (res.ok) {
          fetchModificadores();
        }
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
                      <SortableModificadorItem 
                        key={mod.id} 
                        mod={mod} 
                        onEdit={(m) => { setEditingMod(m.raw); setIsNuevoModalOpen(true); }} 
                        onDelete={handleDeleteModificador} 
                      />
                    ))}

                    <button 
                      onClick={() => { setEditingMod(null); setIsNuevoModalOpen(true); }}
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
        onOpenChange={(open) => { setIsNuevoModalOpen(open); if (!open) setEditingMod(null); }} 
        onSave={handleSaveNuevoModificador} 
        categorias={categorias}
        initialData={editingMod}
      />
    </Modal>
  );
}
