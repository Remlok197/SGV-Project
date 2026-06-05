import { useState, useEffect, useRef } from "react";
import { Button, Form } from "@heroui/react";
import { Pencil, ChevronDown } from "lucide-react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar el dropdown si se hace click afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Función para prender/apagar un checkbox
  const handleToggleMod = (modId: number) => {
    setCheckedMods(prev => 
      prev.includes(modId) 
        ? prev.filter(id => id !== modId) // Si ya estaba, lo quitamos
        : [...prev, modId] // Si no estaba, lo agregamos
    );
  };

  // Función para prender/apagar todos los modificadores de una categoría
  const handleToggleCategory = (catModIds: number[]) => {
    setCheckedMods(prev => {
      const allIncluded = catModIds.every(id => prev.includes(id));
      if (allIncluded) {
        // Si ya están todos seleccionados, los deseleccionamos todos
        return prev.filter(id => !catModIds.includes(id));
      } else {
        // Si falta alguno, los agregamos todos sin duplicar
        const missing = catModIds.filter(id => !prev.includes(id));
        return [...prev, ...missing];
      }
    });
  };

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
      const newErrors: Record<string, string> = {};
      finalValidation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setFormErrors(newErrors);
      console.error("Errores en el formulario:", finalValidation.error.format());
      return;
    }
    setFormErrors({});

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
    <>
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
          errorMessage={formErrors.name}
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
          errorMessage={formErrors.price}
        />

        {/* CATEGORÍA */}
        <FormSelect
          name="categoryId"
          label="Categoría"
          required
          schemaField={productFormSchema.shape.categoryId}
          defaultValue={selectedCategoryId || ""}
          errorMessage={formErrors.categoryId}
          onChange={(e: any) => setSelectedCategoryId(e.target.value)}
          options={[
            ...(selectedCategoryId ? [] : [{ value: "", label: "Selecciona una categoría", disabled: true, hidden: true }]),
            ...Array.from(new Map(categories.filter(cat => cat.name !== "Todos").map(cat => [cat.name, cat])).values()).map(cat => ({ value: String(cat.id), label: cat.name }))
          ]}
        />

        {/* UNIDADES */}
        <FormSelect
          name="units"
          label="Unidades"
          required
          schemaField={productFormSchema.shape.units}
          defaultValue={product?.unidades || "pieza"}
          errorMessage={formErrors.units}
          options={[
            { value: "pieza", label: "Pieza" },
            { value: "litros", label: "Litros" },
          ]}
        />

        {/* MODIFICADORES */}
        {/* MODIFICADORES CON DROPDOWN MULTISELECT AGRUPADO */}
        <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
          <div className="flex justify-between items-center min-h-[24px]">
            <FieldLabel className="text-md font-semibold text-foreground transition-colors duration-200 group-data-[invalid]:text-destructive">
              Modificadores
            </FieldLabel>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs text-terciaryText hover:text-foreground transition-colors"
            >
              <Pencil className="w-3 h-3" />
              <span className="underline">Editar</span>
            </button>
          </div>
          
          {(() => {
            const todosCatId = categories.find(c => c.name === "Todos")?.id?.toString();
            const filteredMods = selectedCategoryId 
              ? modificadores.filter(m => 
                  m.categoria_id?.toString() === selectedCategoryId.toString() || 
                  (todosCatId && m.categoria_id?.toString() === todosCatId)
                )
              : [];

            return (
              <div className="relative">
                <button
                  type="button"
                  disabled={!selectedCategoryId || filteredMods.length === 0}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between bg-backgroundInput border border-borderInput hover:bg-backgroundInput/80 h-10 px-3 rounded-lg text-sm text-terciaryText transition-colors outline-none focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-blue-400/90 focus-visible:border-blue-400/90 disabled:opacity-60 disabled:hover:bg-backgroundInput disabled:cursor-not-allowed"
                >
                  <span className={`truncate flex-1 text-left pr-2 ${checkedMods.length > 0 && selectedCategoryId && filteredMods.length > 0 ? "text-terciaryText" : ""}`}>
                    {!selectedCategoryId 
                      ? "Selecciona una categoría" 
                      : filteredMods.length === 0 
                        ? "Sin modificadores para esta categoría"
                        : checkedMods.length > 0 
                          ? `${checkedMods.length} seleccionado${checkedMods.length !== 1 ? 's' : ''}` 
                          : "Agregar modificadores"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-terciaryText transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && filteredMods.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-background border border-borderInput rounded-lg shadow-xl max-h-64 overflow-y-auto flex flex-col p-2 animate-in fade-in zoom-in-95 duration-200">
                    {[
                      ...categories.filter(cat => filteredMods.some(m => m.categoria_id?.toString() === cat.id.toString())),
                    ].map((cat) => {
                      const catMods = filteredMods.filter(m => m.categoria_id?.toString() === cat.id.toString());
                      if (catMods.length === 0) return null;

                      return (
                        <div key={cat.id} className="flex flex-col mb-3 last:mb-0">
                          <div className="px-2 py-1.5 bg-backgroundInput/50 rounded-md mb-1.5 flex items-center gap-2.5">
                            <label className="flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={catMods.length > 0 && catMods.every(mod => checkedMods.includes(mod.id))}
                                onChange={() => handleToggleCategory(catMods.map(m => m.id))}
                                className="w-3.5 h-3.5 rounded border-borderInput text-primaryAction focus-visible:ring-2 focus-visible:ring-blue-400/90 cursor-pointer transition-all"
                              />
                            </label>
                            <span className="text-[11px] font-bold text-primaryAction uppercase tracking-wider">{cat.name}</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {catMods.map(mod => (
                              <label key={mod.id} className="flex items-center gap-3 pl-8 pr-2 py-1.5 hover:bg-backgroundInput rounded-md cursor-pointer group transition-colors">
                                <input 
                                  type="checkbox" 
                                  checked={checkedMods.includes(mod.id)}
                                  onChange={() => handleToggleMod(mod.id)}
                                  className="w-4 h-4 rounded border-borderInput text-primaryAction focus-visible:ring-2 focus-visible:ring-blue-400/90 cursor-pointer transition-all"
                                />
                                <span className="text-sm font-medium text-primaryText group-hover:text-primaryText/80 transition-colors">
                                  {mod.nombre}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* DISPONIBILIDAD */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center min-h-[24px]">
            <FieldLabel className="text-md font-semibold text-foreground">Disponibilidad</FieldLabel>
          </div>
          <div className="h-10 flex items-center">
            <label className="relative inline-flex items-center cursor-pointer w-max">
              <input type="checkbox" name="isAvailable" defaultChecked={product ? product.isAvailable : true} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
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
      </Form>

      <ModificadoresModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        categorias={categories} 
      />
    </>
  );
}