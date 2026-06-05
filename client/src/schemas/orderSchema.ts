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
