import React, { useState } from "react";
import { Modal } from "@heroui/react";
import { X, Plus, Trash2, GripVertical } from "lucide-react";
import { z } from "zod";
import { FormTextField } from "../form/FormTextField";
import { FieldLabel } from "../../../../components/ui/field";
import { Input } from "../../../../components/ui/input";

interface Opcion {
  id: string;
  nombre: string;
  precio_extra: string;
}

interface NuevoModificadorModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: any) => void;
}

export default function NuevoModificadorModal({ isOpen, onOpenChange, onSave }: NuevoModificadorModalProps) {
  const [opciones, setOpciones] = useState<Opcion[]>([
    { id: "1", nombre: "", precio_extra: "0.00" }
  ]);

  const handleAddOption = () => {
    setOpciones([...opciones, { id: Date.now().toString(), nombre: "", precio_extra: "0.00" }]);
  };

  const handleRemoveOption = (id: string) => {
    if (opciones.length > 1) {
      setOpciones(opciones.filter(o => o.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof Opcion, value: string) => {
    setOpciones(opciones.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const minimo = formData.get("minimo") as string;
    const maximo = formData.get("maximo") as string;

    if (!nombre || !nombre.trim()) return; // Valida que tenga nombre
    
    onSave({
      nombre,
      minimo: parseInt(minimo) || 0,
      maximo: maximo ? parseInt(maximo) : null,
      opciones: opciones.filter(o => o.nombre.trim() !== "").map(o => ({
        nombre: o.nombre,
        precio_extra: parseFloat(o.precio_extra) || 0
      }))
    });
    
    // Resetear form para la proxima vez
    setOpciones([{ id: "1", nombre: "", precio_extra: "0.00" }]);
    
    onOpenChange(false);
  };

  // Esquemas de validación simples para los FormTextField
  const stringSchema = z.string().min(1, "Requerido");
  const numberSchema = z.string().regex(/^\d*$/, "Debe ser un número");

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop className="bg-black/40 fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <Modal.Container size="3xl" className="w-full max-w-2xl outline-none">
          <Modal.Dialog className="outline-none bg-white rounded-[24px] w-full shadow-2xl flex flex-col max-h-[90vh]">
            <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
              <Modal.Header className="flex flex-col gap-1 px-8 py-5 relative shrink-0">
                <h2 className="text-2xl font-bold text-primaryText">Nuevo Modificador</h2>
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
                    schemaField={stringSchema}
                    labelClassName="text-lg font-bold text-primaryText"
                  />

                  {/* Reglas de selección */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormTextField
                      name="minimo"
                      label="Obligatorio (Mínimo)"
                      placeholder="0"
                      type="number"
                      defaultValue="0"
                      schemaField={numberSchema}
                      labelClassName="text-lg font-bold text-primaryText"
                    />
                    <FormTextField
                      name="maximo"
                      label="Máximo de opciones"
                      placeholder="Sin límite"
                      type="number"
                      schemaField={numberSchema}
                      labelClassName="text-lg font-bold text-primaryText"
                    />
                  </div>

                <hr className="border-borderInput my-2" />

                {/* Opciones */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-primaryText">Opciones</h3>
                  
                  <div className="flex flex-col gap-3">
                    {opciones.map((opcion, idx) => (
                      <div key={opcion.id} className="flex items-center gap-3">
                        <div className="pt-1 text-gray-300 cursor-grab touch-none flex-shrink-0">
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
                          className={`p-2 rounded-lg transition-colors focus:outline-none flex-shrink-0 ${opciones.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-500 hover:bg-red-50'}`}
                          disabled={opciones.length === 1}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
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
