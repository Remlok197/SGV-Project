import React, { useState } from "react";
import { Modal } from "@heroui/react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { z } from "zod";
import { FormTextField } from "../form/FormTextField";
import { FormSelect } from "../form/FormSelectField";
import { FieldLabel } from "../../../../components/ui/field";
import { Input } from "../../../../components/ui/input";

interface Opcion {
  id: string;
  nombre: string;
  precio_extra: string;
}

function SortableOpcionItem({ opcion, updateOption, handleRemoveOption, isOnlyOne }: { opcion: Opcion, updateOption: any, handleRemoveOption: any, isOnlyOne: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: opcion.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isDisabled = isOnlyOne || !opcion.nombre.trim();

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 bg-white ${isDragging ? "opacity-50 relative" : ""}`}>
      <div {...attributes} {...listeners} className="pt-1 text-gray-300 cursor-grab touch-none flex-shrink-0 hover:text-gray-500 focus:outline-none">
        <GripVertical className="size-5" />
      </div>
      <div className="flex-1">
        <Input 
          type="text" 
          value={opcion.nombre}
          onChange={(e) => updateOption(opcion.id, "nombre", e.target.value)}
          placeholder="Nombre de la opción (Ej. Salsa Verde)"
          className="rounded-lg border-borderInput text-terciaryText bg-backgroundInput focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:border-blue-400/90"
        />
      </div>
      <div className="w-32 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secundaryText text-sm font-medium z-10">$</span>
        <Input 
          type="number"
          min="0"
          step="0.01"
          value={opcion.precio_extra}
          onChange={(e) => updateOption(opcion.id, "precio_extra", e.target.value)}
          placeholder="0.00"
          className="rounded-lg border-borderInput text-terciaryText bg-backgroundInput focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:border-blue-400/90 pl-7"
        />
      </div>
      <button 
        type="button"
        onClick={() => handleRemoveOption(opcion.id)}
        className={`p-2 rounded-lg transition-colors focus:outline-none flex-shrink-0 ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-500 hover:bg-red-50'}`}
        disabled={isDisabled}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

interface NuevoModificadorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: any, id?: number) => void;
  categorias: { id: string | number; name: string }[];
  initialData?: any;
}

export default function NuevoModificadorModal({ isOpen, onOpenChange, onSave, categorias, initialData }: NuevoModificadorModalProps) {
  const [opciones, setOpciones] = useState<Opcion[]>([
    { id: "1", nombre: "", precio_extra: "0.00" }
  ]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      if (initialData && initialData.opciones && initialData.opciones.length > 0) {
        setOpciones(initialData.opciones.map((o: any) => ({
          id: o.id.toString(),
          nombre: o.nombre,
          precio_extra: o.precio_extra.toString()
        })));
      } else {
        setOpciones([{ id: "1", nombre: "", precio_extra: "0.00" }]);
      }
    }
  }, [isOpen, initialData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOpciones((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddOption = () => {
    setOpciones([...opciones, { id: Date.now().toString() + "-new", nombre: "", precio_extra: "0.00" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (opciones.length > 1) {
      setOpciones(opciones.filter(o => o.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof Opcion, value: string) => {
    setOpciones(opciones.map(o => o.id === id ? { ...o, [field]: value } : o));
    if (field === 'nombre' && formErrors.opciones) {
      setFormErrors(prev => {
        const { opciones: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const minimo = formData.get("minimo") as string;
    const maximo = formData.get("maximo") as string;
    const categoriaId = formData.get("categoria_id") as string;

    const newErrors: Record<string, string> = {};
    if (!nombre || !nombre.trim()) newErrors.nombre = "El nombre del modificador es obligatorio";
    if (!categoriaId) newErrors.categoria_id = "Selecciona una categoría";
    
    const emptyOpciones = opciones.filter(o => o.nombre.trim() === "");
    
    if (opciones.length === 1 && emptyOpciones.length === 1) {
      newErrors.opciones = "Debe haber al menos una opción asignada";
    } else if (emptyOpciones.length > 0) {
      newErrors.opciones = "Todas las opciones deben tener un nombre";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    setFormErrors({});
    
    onSave({
      nombre,
      minimo: parseInt(minimo) || 0,
      maximo: maximo ? parseInt(maximo) : null,
      categoria_id: parseInt(categoriaId),
      opciones: opciones.filter(o => o.nombre.trim() !== "").map(o => ({
        id: o.id,
        nombre: o.nombre,
        precio_extra: parseFloat(o.precio_extra) || 0
      }))
    }, initialData?.id);
    
    // Resetear form para la proxima vez
    setOpciones([{ id: "1", nombre: "", precio_extra: "0.00" }]);
    
    onOpenChange(false);
  };

  // Esquemas de validación simples para los FormTextField
  const stringSchema = z.string().min(1, "El nombre del modificador es obligatorio");
  const numberSchema = z.string().regex(/^\d*$/, "Debe ser un número");

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="bg-black/40 fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <Modal.Container size="3xl" className="w-full max-w-2xl outline-none">
          <Modal.Dialog className="outline-none bg-white rounded-[24px] w-full shadow-2xl flex flex-col max-h-[90vh]">
            <form key={initialData ? initialData.id : "new"} onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
              <Modal.Header className="flex flex-col gap-1 px-8 py-5 relative shrink-0">
                <h2 className="text-2xl font-bold text-primaryText">
                  {initialData ? "Editar Modificador" : "Nuevo Modificador"}
                </h2>
                <Modal.CloseTrigger className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                  <X className="size-4" />
                </Modal.CloseTrigger>
              </Modal.Header>
              <Modal.Body className="px-8 pb-4 pt-2 overflow-y-auto hide-scrollbar flex-1">
                <div className="flex flex-col gap-6">
                  
                  {/* Nombre del Modificador */}
                  <FormTextField
                    name="nombre"
                    label="Nombre del modificador"
                    placeholder="Ej. Salsas, Tamaño..."
                    defaultValue={initialData?.nombre || ""}
                    schemaField={stringSchema}
                    labelClassName="text-lg font-bold text-primaryText"
                    errorMessage={formErrors.nombre}
                  />

                  {/* Categoría */}
                  <FormSelect
                    name="categoria_id"
                    label="Categoría"
                    required
                    schemaField={z.string().min(1, "Selecciona una categoría")}
                    defaultValue={initialData?.categoria_id?.toString() || ""}
                    errorMessage={formErrors.categoria_id}
                    labelClassName="text-lg font-bold text-primaryText"
                    options={[
                      ...(initialData?.categoria_id ? [] : [{ value: "", label: "Selecciona una categoría...", disabled: true, hidden: true }]),
                      ...(categorias || []).map(cat => ({ value: cat.id.toString(), label: cat.name }))
                    ]}
                  />

                  {/* Reglas de selección */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormTextField
                      name="minimo"
                      label="Obligatorio (Mínimo)"
                      placeholder="0"
                      type="number"
                      defaultValue={initialData?.minimo !== undefined ? initialData.minimo.toString() : "0"}
                      schemaField={numberSchema}
                      labelClassName="text-lg font-bold text-primaryText"
                    />
                    <FormTextField
                      name="maximo"
                      label="Máximo de opciones"
                      placeholder="Sin límite"
                      type="number"
                      defaultValue={initialData?.maximo !== null && initialData?.maximo !== undefined ? initialData.maximo.toString() : ""}
                      schemaField={numberSchema}
                      labelClassName="text-lg font-bold text-primaryText"
                    />
                  </div>

                <hr className="border-borderInput my-2" />

                {/* Opciones */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primaryText">Opciones</h3>
                    {formErrors.opciones && (
                      <span className="text-[13px] font-medium text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-200">
                        {formErrors.opciones}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
                      <SortableContext items={opciones.map(o => o.id)} strategy={verticalListSortingStrategy}>
                        {opciones.map((opcion) => (
                          <SortableOpcionItem 
                            key={opcion.id} 
                            opcion={opcion} 
                            updateOption={updateOption} 
                            handleRemoveOption={handleRemoveOption} 
                            isOnlyOne={opciones.length === 1} 
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>

                  <button 
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-2 text-secundaryText font-bold text-sm mt-1 hover:opacity-80 transition-opacity w-fit cursor-pointer"
                  >
                    <Plus className="size-4 text-primaryAction" strokeWidth={2.5} />
                    Añadir opción
                  </button>
                </div>
                
                {/* Separador inferior con el ancho del contenido */}
                <hr className="border-borderInput mt-2" />
              </div>
              </Modal.Body>
              <Modal.Footer className="px-8 py-5 flex justify-end gap-3 w-full shrink-0 rounded-b-[24px]">
                <button 
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-11 px-8 bg-transparent text-secundaryText rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="h-11 px-8 rounded-lg font-semibold transition-colors bg-primaryAction text-white hover:bg-orange-600 shadow-sm text-sm"
                >
                  Guardar
                </button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
