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
        
        if (item.options && item.product.modificadores) {
            Object.entries(item.options).forEach(([modName, selectedOpts]) => {
                const mod = item.product.modificadores.find((m: any) => m.nombre === modName);
                if (mod && mod.opciones) {
                    const optArray = Array.isArray(selectedOpts) ? selectedOpts : [selectedOpts];
                    optArray.forEach(optName => {
                        const opt = mod.opciones.find((o: any) => o.nombre === optName);
                        if (opt && typeof opt.precio_extra === 'number') {
                            surcharge += opt.precio_extra;
                        }
                    });
                }
            });
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
