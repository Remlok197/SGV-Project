import { useState, useMemo } from 'react';
import { Product } from '../schemas/productSchema';

export interface OrderItem {
    product: Product;
    quantity: number;
    options: Record<string, string | string[]>;
}

export function useCart() {
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    const addItem = (item: OrderItem) => {
        setOrderItems(prev => [...prev, item]);
    };

    const removeItem = (index: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateItemQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(index);
            return;
        }
        setOrderItems(prev => {
            const newItems = [...prev];
            newItems[index] = { ...newItems[index], quantity: newQuantity };
            return newItems;
        });
    };

    const clearCart = () => {
        setOrderItems([]);
    };

    const calculateItemBasePrice = (item: OrderItem) => {
        return typeof item.product.price === 'number' ? item.product.price : 17.00;
    };

    const calculateItemTotal = (item: OrderItem) => {
        return calculateItemBasePrice(item) * item.quantity;
    };

    const total = useMemo(() => {
        return orderItems.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    }, [orderItems]);

    return {
        orderItems,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        calculateItemBasePrice,
        calculateItemTotal,
        total
    };
}
