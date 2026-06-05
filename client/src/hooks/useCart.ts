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

    const updateItem = (index: number, newItem: OrderItem) => {
        setOrderItems(prev => {
            const newItems = [...prev];
            newItems[index] = newItem;
            return newItems;
        });
    };

    const clearCart = () => {
        setOrderItems([]);
    };

    const calculateItemBasePrice = (item: OrderItem) => {
        const base = typeof item.product.price === 'number' ? item.product.price : 17.00;
        let surcharge = 0;
        
        if (item.options?.["Carne"]) {
            const carneOpts = Array.isArray(item.options["Carne"]) ? item.options["Carne"] : [item.options["Carne"]];
            if (carneOpts.includes("Tripa")) {
                surcharge += 2.00;
            }
        }
        
        return base + surcharge;
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
        updateItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        calculateItemBasePrice,
        calculateItemTotal,
        total
    };
}
