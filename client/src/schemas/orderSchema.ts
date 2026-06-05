import { z } from "zod";
import { productReadSchema } from "./productSchema";

export const detalleOrdenCreateSchema = z.object({
  id_producto: z.number(),
  cantidad: z.number().positive(),
  opciones: z.array(z.number()).default([])
});

export const ordenCreateSchema = z.object({
  numero_mesa: z.number().optional(),
  tipo_pedido: z.enum(["mostrador", "mesa"]).default("mostrador"),
  detalles: z.array(detalleOrdenCreateSchema)
});

// Client-side schema for adding items to cart in ProductOptionsModal
export const orderItemClientSchema = z.object({
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1"),
  options: z.object({
      "Carne": z.union([z.string(), z.array(z.string())])
          .transform(val => Array.isArray(val) ? val : [val])
          .refine(val => val.length >= 1 && val.length <= 2, {
              message: "Debes seleccionar entre 1 y 2 opciones de Carne"
          }),
      "Salsa": z.array(z.string()).optional(),
      "Verdura": z.array(z.string()).optional()
  }).optional()
});

export type DetalleOrdenCreate = z.infer<typeof detalleOrdenCreateSchema>;
export type OrdenCreate = z.infer<typeof ordenCreateSchema>;

// Interfaces from API response
export interface DetalleOrdenResponse {
    id: number;
    id_producto: number;
    cantidad: number;
    subtotal: number;
    producto: any; // ProductoBreve
    opciones: any[]; // OpcionBreve[]
}

export interface OrdenResponse {
    id: number;
    serie?: string;
    numero_mesa?: number;
    estado: string;
    fecha: string;
    total: number;
    detalles: DetalleOrdenResponse[];
}
