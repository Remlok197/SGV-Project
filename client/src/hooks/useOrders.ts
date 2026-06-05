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
        fetchOrders,
        updateOrderStatus,
        cancelOrder
    };
}
