import { OrdenCreate, OrdenResponse } from '../schemas/orderSchema';
import { createOrderPayloadAdapter } from '../adapters/orderAdapter';

export const orderService = {
    createOrder: async (orderItems: any[], options?: { numero_mesa?: number, tipo_pedido?: "mostrador" | "mesa" }): Promise<OrdenResponse> => {
        try {
            const apiPayload = createOrderPayloadAdapter(orderItems, options);

            const response = await fetch('/api/ordenes/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Detalle del error (FastAPI):", JSON.stringify(errorData, null, 2));
                const backendMsg = errorData.detail?.[0]?.msg || errorData.detail || 'Error al crear la orden';
                throw new Error(backendMsg);
            }

            const data: OrdenResponse = await response.json();
            return data;
            
        } catch (error) {
            console.error('Service Error - createOrder:', error);
            throw error; 
        }
    },
    getNextOrderId: async (): Promise<number> => {
        try {
            const response = await fetch('/api/ordenes/next-id', { method: 'GET' });
            if (!response.ok) {
                throw new Error('Error al obtener el siguiente ID');
            }
            const data = await response.json();
            return data.next_id;
        } catch (error) {
            console.error('Service Error - getNextOrderId:', error);
            throw error;
        }
    },

    getOrders: async (estado?: string): Promise<OrdenResponse[]> => {
        try {
            const url = estado ? `/api/ordenes/?estado=${estado}` : '/api/ordenes/';
            const response = await fetch(url, { method: 'GET' });
            
            if (!response.ok) {
                throw new Error('Error al obtener las órdenes');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Service Error - getOrders:', error);
            throw error; 
        }
    },

    updateOrderStatus: async (orderId: number, estado: string): Promise<OrdenResponse> => {
        try {
            const response = await fetch(`/api/ordenes/${orderId}?estado_nuevo=${estado}`, {
                method: 'PUT',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const backendMsg = errorData.detail || 'Error al actualizar el estado de la orden';
                throw new Error(backendMsg);
            }

            return await response.json();
        } catch (error) {
            console.error('Service Error - updateOrderStatus:', error);
            throw error; 
        }
    },

    cancelOrder: async (orderId: number): Promise<void> => {
        try {
            const response = await fetch(`/api/ordenes/${orderId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const backendMsg = errorData.detail || 'Error al cancelar la orden';
                throw new Error(backendMsg);
            }
        } catch (error) {
            console.error('Service Error - cancelOrder:', error);
            throw error; 
        }
    }
};
