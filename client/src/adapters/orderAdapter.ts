import { OrdenCreate } from '../schemas/orderSchema';

export const createOrderPayloadAdapter = (orderItems: any[], options?: { numero_mesa?: number, tipo_pedido?: "mostrador" | "mesa" }): OrdenCreate => {
    return {
        numero_mesa: options?.numero_mesa,
        tipo_pedido: options?.tipo_pedido || "mostrador",
        detalles: orderItems.map(item => ({
            id_producto: parseInt(item.product.id, 10),
            cantidad: item.quantity,
            // Si en el futuro ProductOptionsModal devuelve IDs en vez de strings, mapearlos aquí
            // Por ahora, como es un mock de strings, enviamos array vacío para no quebrar el backend
            opciones: Array.isArray(item.selectedOptionsIds) ? item.selectedOptionsIds : [] 
        }))
    };
};
