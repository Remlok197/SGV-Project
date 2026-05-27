import { useState } from "react";
import { Button, Form } from "@heroui/react";
import { productFormSchema } from "../../../schemas/productSchema"; 
import ImageUpload from "./ImageUpload";
import { FormTextField } from "./FormTextField";
import { FormSelect } from "./FormSelectField"; // <-- Importa tu nuevo componente
import { FieldLabel } from "../../../components/ui/field";

interface ProductFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
  onSave: (data: any) => Promise<void>; 
}

export default function ProductForm({ onCancel, onSuccess, onSave }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData: Record<string, any> = {};

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

    const finalValidation = productFormSchema.safeParse(rawData);

    if (!finalValidation.success) {
      console.error("Errores en el formulario:", finalValidation.error.format());
      return; 
    }

    try {
      setIsSubmitting(true);
      const validData = finalValidation.data;
      
      await onSave(validData);
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("Hubo un error al guardar el producto. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form className="flex flex-col h-full w-full" onSubmit={onSubmit}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 w-full">
        
        <ImageUpload/>

        {/* NOMBRE */}
        <FormTextField
          name="name"
          label="Nombre del producto"
          placeholder="Introduce el nombre"
          schemaField={productFormSchema.shape.name}
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
        />

        {/* CATEGORÍA */}
        <FormSelect
          name="categoryId"
          label="Categoría"
          options={[
            { value: "alimentos", label: "Alimentos" },
            { value: "bebidas", label: "Bebidas" },
            { value: "postres", label: "Postres" },
          ]}
        />

        {/* UNIDADES */}
        <FormSelect
          name="units"
          label="Unidades"
          options={[
            { value: "pieza", label: "Pieza" },
            { value: "litros", label: "Litros" },
          ]}
        />

        {/* MODIFICADORES */}
        <FormSelect
          name="modifiers"
          label="Modificadores"
          options={[
            { value: "default", label: "Carne / Verdura / Salsa" },
            { value: "none", label: "Sin modificadores" },
          ]}
          headerAction={
            <button type="button" className="text-xs text-gray-500 underline hover:text-gray-800">
              Editar
            </button>
          }
        />

        {/* DISPONIBILIDAD */}
        <div className="flex flex-col gap-1 justify-center">
          <FieldLabel className="mb-1">Disponibilidad</FieldLabel>
          <label className="relative inline-flex items-center cursor-pointer w-max">
            <input type="checkbox" name="isAvailable" defaultChecked className="sr-only peer" />
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
    </Form>
  );
}