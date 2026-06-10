import { useState } from "react";
import { orderService } from "../services/orderService";
import { OrdenResponse } from "../schemas/orderSchema";

export function useOrders() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [orders, setOrders] = useState<OrdenResponse[]>([]);

    const createOrder = async (orderItems: any[], options?: { numero_mesa?: number, tipo_pedido?: "mostrador" | "mesa" }) => {
        try {
            setLoading(true);
            setError(null);
            const newOrder = await orderService.createOrder(orderItems, options);
            
            // HACK: Como el backend requiere IDs y estamos en fase de mockup con strings, 
            // guardamos las opciones localmente para que la pantalla de Ordenes pueda leerlas.
            try {
                const optionsMap = orderItems.map(item => {
                    const opts = item.options || {};
                    return {
                        opciones: Object.values(opts).flat().filter(Boolean)
                    };
                });
                localStorage.setItem(`orden_options_${newOrder.id}`, JSON.stringify(optionsMap));
            } catch (e) {
                console.error("No se pudieron guardar las opciones localmente", e);
            }

            return newOrder;
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                throw err;
            } else {
                setError('Error al crear la orden');
                throw new Error('Error al crear la orden');
            }
        } finally {
            setLoading(false);
        }
    };

    const getNextOrderId = async () => {
        try {
            return await orderService.getNextOrderId();
        } catch (err) {
            console.error("Error fetching next order ID", err);
            return null;
        }
    };

    const fetchOrders = async (estado?: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await orderService.getOrders(estado);
            setOrders(data);
            return data;
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al cargar las órdenes');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, estado: string) => {
        try {
            setLoading(true);
            setError(null);
            await orderService.updateOrderStatus(orderId, estado);
            await fetchOrders(); // refresh
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                throw err;
            } else {
                setError('Error al actualizar la orden');
                throw new Error('Error al actualizar la orden');
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelOrder = async (orderId: number) => {
        try {
            setLoading(true);
            setError(null);
            await orderService.cancelOrder(orderId);
            await fetchOrders(); // refresh
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                throw err;
            } else {
                setError('Error al cancelar la orden');
                throw new Error('Error al cancelar la orden');
            }
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        loading,
        error,
        createOrder,
        getNextOrderId,
        fetchOrders,
        updateOrderStatus,
        cancelOrder
    };
}
