import { z } from "zod";

export const baseProductSchema = z.object({
  name: z.string().min(1, { message: "El nombre del producto es obligatorio" }),
  price: z.coerce.number().positive({ message: "El precio debe ser mayor a $0.00" }),
  categoryId: z.string().min(1, { message: "Selecciona una categoría" }),
  
  units: z.enum(["pieza", "litros"], {
    errorMap: () => ({ message: "Selecciona una unidad válida" })
  }),
  
  modifiers: z.string().optional(),
  isAvailable: z.boolean().default(true),
  
  imageUrl: z.url().optional(), 
});

export const productFormSchema = baseProductSchema
  .omit({ imageUrl: true }) 
  .extend({
    image: z.any().optional(), 
  });

export type ProductFormData = z.infer<typeof productFormSchema>;

export const productReadSchema = baseProductSchema
  .omit({ 
    modifiers: true 
  })
  .extend({
    id: z.string(),
    formattedPrice: z.string(),
    modifiers: z.string(), 
    imageUrl: z.string().optional(),
  });

export type Product = z.infer<typeof productReadSchema>;


export interface Category {
    id: string;
    name: string;
    icon?: string; 
}

export interface ProductCatalog {
    categories: Category[];
    products: Product[];
    totalItems: number;
}

export interface RawApiCategory {
    id: number;
    nombre: string;
    icono?: string;
}

export interface RawApiProduct {
    id: number;
    id_categoria: number | null;
    nombre: string;
    precio: number; 
    unidades: "pieza" | "litros";
    modificadores: string[];
    activo: boolean;
    imagen_url?: string;
}

export interface ProductApiResponse {
    data: {
        categorias: RawApiCategory[];
        productos: RawApiProduct[];
    };
    metadata: {
        total_items: number; 
    };
}

