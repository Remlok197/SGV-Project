import { useState, useEffect } from "react";
import { Button, Form } from "@heroui/react";
import { productFormSchema, Product } from "../../../../schemas/productSchema";
import ImageUpload from "./ImageUpload";
import { FormTextField } from "./FormTextField";
import { FormSelect } from "./FormSelectField";
import ModificadoresModal from "../modals/ModificadoresModal";
import { FieldLabel } from "../../../../components/ui/field";

interface ProductFormProps {
  product?: Product | null;
  categories: { id: string; name: string }[];
  onCancel?: () => void;
  onSuccess?: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ProductForm({ product, categories, onCancel, onSuccess, onSave }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    (product as any)?.id_categoria || (product as any)?.categoryId || ""
  );
  const [checkedMods, setCheckedMods] = useState<number[]>([]);
  const [modificadores, setModificadores] = useState<any[]>([]);

  // Efecto A: Traer TODOS los modificadores desde tu API en FastAPI
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/modificadores")
      .then(res => res.json())
      .then(data => {
          // Extraemos el arreglo sin importar cómo lo haya envuelto Fabian
          const arrayReal = Array.isArray(data) ? data : (data.data || data.modificadores || []);
          setModificadores(arrayReal);
      })
      .catch(err => console.error("Error al cargar modificadores:", err));
  }, []);

  // Efecto B: Sincronizar los checkboxes cuando abres un producto para editar
  useEffect(() => {
    if ((product as any)?.modificadores && Array.isArray((product as any).modificadores)) {
      setCheckedMods((product as any).modificadores.map((m: any) => m.id));
    } else {
      setCheckedMods([]); // Si es nuevo o no tiene, empezamos en blanco
    }
  }, [product]);

  // Efecto C: Sincronizar la categoría seleccionada para que el filtro no reviente
  useEffect(() => {
    const catId = (product as any)?.id_categoria || (product as any)?.categoryId;
    if (catId) {
      setSelectedCategoryId(catId.toString());
    } else {
      setSelectedCategoryId("");
    }
  }, [product]);

  // Función para prender/apagar un checkbox
  const handleToggleMod = (modId: number) => {
    setCheckedMods(prev => 
      prev.includes(modId) 
        ? prev.filter(id => id !== modId) // Si ya estaba, lo quitamos
        : [...prev, modId] // Si no estaba, lo agregamos
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData: Record<string, any> = {};

    // 1. Recopilamos la info básica (nombre, precio, unidades) para Zod
    formData.forEach((value, key) => {
      if (key === "image") {
        if (value instanceof File && value.size > 0) {
          rawData[key] = value;
        }
      } else {
        rawData[key] = value.toString();
      }
    });

    rawData.isAvailable = formData.get("isAvailable") === "on";

    // 2. Dejamos que Zod haga su trabajo de validación básica
    const finalValidation = productFormSchema.safeParse(rawData);

    if (!finalValidation.success) {
      console.error("Errores en el formulario:", finalValidation.error.format());
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 3. ¡EL GOLPE MAESTRO!
      // Sacamos el valor REAL del select desde el FormData, 
      // porque el estado de React puede haber tenido un bache.
      const categoriaDirecta = formData.get("categoryId"); 
      
      const dataToSave = {
        ...finalValidation.data, 
        // Si el usuario no cambió nada, intentamos sacar el valor del producto original
        id_categoria: categoriaDirecta 
            ? parseInt(categoriaDirecta.toString()) 
            : (product as any)?.id_categoria || (product as any)?.categoryId,
        
        ids_modificadores: checkedMods 
      };

      // Limpieza: Aseguramos que no se vaya el campo viejo
      delete (dataToSave as any).categoryId;

      // 👀 IMPRIMIMOS EL PAYLOAD FINAL PARA FESTEJAR ANTES DE ENVIAR
      console.log("🚀 PAYLOAD PERFECTO A ENVIAR:", dataToSave);

      // 4. Mandamos al backend
      await onSave(dataToSave);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("🔍 Categoria Seleccionada:", selectedCategoryId, "| Modificadores en estado:", modificadores);

  return (
    <Form className="flex flex-col h-full w-full" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 w-full">

        <ImageUpload defaultImageUrl={product?.imageUrl} />

        {/* NOMBRE */}
        <FormTextField
          name="name"
          label="Nombre del producto"
          placeholder="Introduce el nombre"
          schemaField={productFormSchema.shape.name}
          defaultValue={product?.name}
        />

        {/* PRECIO */}
        <FormTextField
          name="price"
          label="Precio"
          placeholder="0.00"
          type="number"
          step="0.01"
          startContent="$"
          schemaField={productFormSchema.shape.price}
          defaultValue={product?.price?.toString()}
        />

        {/* CATEGORÍA */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-bold text-gray-800 mb-1">Categoría</label>
          <select
            name="categoryId"
            value={selectedCategoryId} // <-- Esto es clave
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="h-11 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="" disabled>Selecciona...</option>
            {categories.filter(cat => cat.name !== "Todos").map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* UNIDADES */}
        <FormSelect
          name="units"
          label="Unidades"
          defaultValue={product?.units}
          options={[
            { value: "pieza", label: "Pieza" },
            { value: "litros", label: "Litros" },
          ]}
        />

        {/* MODIFICADORES */}
        {/* MODIFICADORES CON CHECKBOXES (FILTRADOS) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center mb-1">
            <FieldLabel className="">Modificadores</FieldLabel>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
            >
              Editar
            </button>
          </div>
          
          <div className="flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto shadow-sm">
            {selectedCategoryId ? (
              modificadores.filter(m => m.categoria_id.toString() === selectedCategoryId.toString()).length > 0 ? (
                modificadores
                  .filter(m => m.categoria_id.toString() === selectedCategoryId.toString())
                  .map(mod => {
                    // Validamos si estamos editando y el producto ya tenía este modificador guardado
                    const isChecked = Array.isArray((product as any)?.modificadores) && 
                  (product as any).modificadores.some((pm: any) => pm.id === mod.id);
                    return (
                      <label key={mod.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={checkedMods.includes(mod.id)}
                          onChange={() => handleToggleMod(mod.id)}
                          className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {mod.nombre} <span className="text-xs text-gray-400 font-normal ml-1">(Mín {mod.minimo})</span>
                        </span>
                      </label>
                    );
                  })
              ) : (
                <span className="text-sm text-gray-400 italic text-center py-2">
                  No hay modificadores para esta categoría.
                </span>
              )
            ) : (
              <span className="text-sm text-orange-400 italic text-center py-2 font-medium">
                Selecciona una categoría primero.
              </span>
            )}
          </div>
        </div>

        {/* DISPONIBILIDAD */}
        <div className="flex flex-col gap-1 justify-center">
          <FieldLabel className="mb-1">Disponibilidad</FieldLabel>
          <label className="relative inline-flex items-center cursor-pointer w-max">
            <input type="checkbox" name="isAvailable" defaultChecked={product ? product.isAvailable : true} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

      </div>

      <div className="mt-auto pt-8 flex gap-4 w-full">
        <Button
          type="button"
          onPress={onCancel}
          isDisabled={isSubmitting}
          className="flex-1 h-12 bg-white border-2 border-orange-500 text-orange-500 rounded-lg font-bold hover:bg-orange-50 transition-colors"
        >
          CANCELAR
        </Button>
        <Button
          type="submit"
          isDisabled={isSubmitting}
          className="flex-1 h-12 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-70"
        >
          {isSubmitting ? 'GUARDANDO...' : 'GUARDAR'}
        </Button>
      </div>

      <ModificadoresModal 
  isOpen={isModalOpen} 
  onOpenChange={setIsModalOpen} 
  categorias={categories} 
/>
    </Form>
  );
}