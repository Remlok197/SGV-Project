import React, { useState, useEffect } from 'react';
import PageHeader from "../components/shared/PageHeader";
import TabGroup from "./productos/components/tabs/TabGroup";
import Tab from "./productos/components/tabs/Tab";
import { Utensils, Coffee, LayoutGrid, Trash2, Minus, Plus } from "lucide-react";
import ProductGrid from "./productos/components/cards/ProductGrid";
import MenuProductCard from "./tomarOrden/components/MenuProductCard";
import ProductOptionsModal from "./tomarOrden/components/ProductOptionsModal";
import { useProducts } from "../hooks/useProducts";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../hooks/useCart";
import { ReactSVG } from "react-svg";
import { Modal } from "@heroui/react";
import { X, Banknote, CreditCard } from "lucide-react";
import { imprimirTicket } from '../utils/ticketPrinter';

export default function TomarOrdenPage() {
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("Efectivo");
    const [nextOrderId, setNextOrderId] = useState(null);
    const { catalog, loading, error } = useProducts();
    const { createOrder, getNextOrderId, loading: isCreatingOrder } = useOrders();
    const { 
        orderItems, 
        addItem, 
        updateItem,
        removeItem, 
        updateItemQuantity, 
        clearCart, 
        calculateItemBasePrice, 
        calculateItemTotal, 
        total 
    } = useCart();

    const fetchNextId = async () => {
        const id = await getNextOrderId();
        if (id) setNextOrderId(id);
    };

    useEffect(() => {
        fetchNextId();
    }, []);

    const handleEditItem = (index) => {
        setEditingItemIndex(index);
        setSelectedProduct(orderItems[index].product);
    };

    const handleCreateOrder = async () => {
        if (orderItems.length === 0) return;
        try {
            imprimirTicket(orderItems, total, "Nueva");

            await createOrder(orderItems, { tipo_pedido: "mostrador" });
            clearCart();
            setIsPaymentModalOpen(false);
            fetchNextId(); // Refresh ID for the next order
        } catch (err) {
            alert(err.message || "Hubo un error al crear la orden");
        }
    };

    const handleCancelOrder = () => {
        clearCart();
        setEditingItemIndex(null);
        setSelectedProduct(null);
    };

    if (loading) return <div className="flex justify-center items-center h-full w-full"><p className="text-secundaryText font-medium">Cargando menú...</p></div>;
    if (error) return <div className="flex justify-center items-center h-full w-full"><p className="text-red-500 font-medium">{error}</p></div>;

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Left Column - Menu */}
            <div className="flex-1 h-full pb-12 flex flex-col overflow-y-auto md:pr-[22rem] lg:pr-[26rem] transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 pl-6 md:pl-10 lg:pl-11 pr-3 md:pr-4 lg:pr-5">
                    <PageHeader title={"MENÚ"}>
                        {catalog.categories.find(c => c.name === "Todos") && (
                            <button
                                onClick={() => setActiveCategory("Todos")}
                                className={`flex items-center w-fit flex-none gap-2 h-10 px-3 rounded-[10px] border font-medium text-sm transition-all duration-200 cursor-pointer select-none flex-shrink-0 ${
                                    activeCategory === "Todos"
                                        ? "border-primaryAction bg-transparent text-primaryAction"
                                        : "border-[#E2E8F0] bg-transparent text-secundaryText hover:bg-gray-50 hover:text-primaryText"
                                }`}
                            >
                                {catalog.categories.find(c => c.name === "Todos").icon ? (
                                    <span className="flex-shrink-0 size-[18px] flex items-center justify-center">
                                        <ReactSVG
                                            src={catalog.categories.find(c => c.name === "Todos").icon}
                                            className="size-4 flex items-center justify-center [&_svg]:size-4 [&_svg]:fill-current"
                                        />
                                    </span>
                                ) : (
                                    <span className="flex-shrink-0 size-[18px] flex items-center justify-center">
                                        <LayoutGrid className="size-4" />
                                    </span>
                                )}
                                <span>Todos</span>
                            </button>
                        )}

                        <div className="overflow-x-auto min-w-0 max-w-full flex px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            <TabGroup selectedKey={activeCategory} onSelectionChange={setActiveCategory}>
                                {catalog.categories
                                    .filter(cat => cat.name !== "Todos")
                                    .map((cat) => (
                                        <Tab 
                                            key={cat.id}
                                            id={cat.name} 
                                            title={cat.name} 
                                            icon={cat.icon ? <ReactSVG src={cat.icon} className="size-4 flex items-center justify-center [&_svg]:size-4 [&_svg]:fill-current" /> : null} 
                                        />
                                    ))}
                            </TabGroup>
                        </div>
                    </PageHeader>
                    
                    {/* Product Grid */}
                    <div className="mt-4 lg:mt-3 pb-8">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                            {catalog.products
                                .filter(product => {
                                    if (activeCategory === "Todos") return true;
                                    const activeCatId = catalog.categories.find(c => c.name === activeCategory)?.id;
                                    return product.categoryId === activeCatId;
                                })
                                .map((product) => (
                                    <MenuProductCard 
                                        key={product.id}
                                        name={product.name}
                                        price={product.formattedPrice}
                                        imageUrl={product.imageUrl}
                                        onClick={() => setSelectedProduct(product)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Order Panel */}
            <div className="absolute top-0 right-0 h-full w-full md:w-[22rem] lg:w-[26rem] bg-background border-l border-secundaryText/20 shadow-xs z-20">
                <div className="flex flex-col h-full p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-primaryText">Detalles de la orden:</h2>
                        <span className="text-secundaryText font-medium text-lg">#{nextOrderId || '...'}</span>
                    </div>

                    {/* Order Items List */}
                    <div className="flex-1 overflow-y-auto flex flex-col">
                        {orderItems.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-secundaryText/60 font-medium text-sm">
                                No hay productos en la orden
                            </div>
                        ) : (
                            orderItems.map((item, index) => {
                                const basePrice = calculateItemBasePrice(item);
                                const itemTotal = calculateItemTotal(item);
                                return (
                                    <div key={index} className={`flex flex-col ${index !== orderItems.length - 1 ? 'border-b-2 border-borderInput/60 pb-4 mb-4' : 'pb-2'}`}>
                                        {/* Top Row: Info and Counter */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors flex-1" onClick={() => handleEditItem(index)}>
                                                <div className="size-12 md:size-14 rounded-lg bg-gray-200 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                    {item.product.imageUrl ? (
                                                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 font-medium">IMG</span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col justify-start pt-1">
                                                    <h3 className="font-bold text-primaryText text-lg leading-none">{item.product.name}</h3>
                                                    <p className="text-secundaryText font-medium text-base mt-1.5">${basePrice.toFixed(2)} c/u</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end justify-start">
                                                <button 
                                                    onClick={() => removeItem(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors shrink-0 mt-2"
                                                >
                                                    <Trash2 className="size-4 md:size-5" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Row: Pills and Counter/Total */}
                                        <div className="flex justify-between items-end">
                                            <div className="flex flex-wrap gap-2 flex-1 pr-4">
                                                {item.options && Object.entries(item.options).flatMap(([cat, val]) => {
                                                    if (!val || val.length === 0) return [];
                                                    const valArray = Array.isArray(val) ? val : [val];
                                                    return valArray.map((v, i) => (
                                                        <span key={`${cat}-${i}`} className="bg-gray-50 text-secundaryText font-medium text-[12px] px-2.5 py-1 rounded-md border-[1.5px] border-dashed border-gray-300/80">
                                                            {v}
                                                        </span>
                                                    ));
                                                })}
                                            </div>
                                            <div className="flex flex-col items-end gap-2.5">
                                                <div className="flex items-center gap-2 scale-90 origin-right">
                                                    <button 
                                                        onClick={() => updateItemQuantity(index, Math.max(1, item.quantity - 1))}
                                                        className="size-6 md:size-7 rounded bg-primaryAction flex items-center justify-center hover:bg-primaryAction/90 text-white transition-colors"
                                                    >
                                                        <Minus className="size-3 md:size-4" />
                                                    </button>
                                                    <input 
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val !== '') {
                                                                const num = parseInt(val, 10);
                                                                if (!isNaN(num) && num >= 1) {
                                                                    updateItemQuantity(index, num);
                                                                }
                                                            }
                                                        }}
                                                        className="font-bold text-sm md:text-base text-primaryText w-6 md:w-8 text-center bg-transparent border-none outline-none m-0 [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <button 
                                                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                                        className="size-6 md:size-7 rounded bg-primaryAction flex items-center justify-center hover:bg-primaryAction/90 text-white transition-colors"
                                                    >
                                                        <Plus className="size-3 md:size-4" />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-primaryText text-sm md:text-base leading-none">${itemTotal.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="mt-6 pt-6 border-t border-secundaryText/20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-primaryText text-base md:text-lg">Total:</span>
                            <span className="font-bold text-primaryText text-base md:text-lg">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleCancelOrder}
                                disabled={orderItems.length === 0 || isCreatingOrder}
                                className="flex-1 py-2 rounded-xl border border-red-500 text-red-500 font-bold hover:bg-red-50 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                CANCELAR
                            </button>
                            <button 
                                onClick={() => setIsPaymentModalOpen(true)}
                                disabled={orderItems.length === 0 || isCreatingOrder}
                                className="flex-1 py-2 rounded-xl bg-primaryAction text-white font-bold hover:bg-primaryAction/90 transition-colors shadow-md shadow-primaryAction/20 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                COBRAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de opciones de producto */}
            <ProductOptionsModal 
                isOpen={!!selectedProduct} 
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedProduct(null);
                        setEditingItemIndex(null);
                    }
                }} 
                product={selectedProduct}
                categoryName={selectedProduct ? catalog.categories.find(c => c.id === selectedProduct.categoryId)?.name : ''}
                initialItem={editingItemIndex !== null ? orderItems[editingItemIndex] : null}
                onAdd={(data) => {
                    if (editingItemIndex !== null) {
                        updateItem(editingItemIndex, data);
                    } else {
                        addItem(data);
                    }
                    setSelectedProduct(null);
                    setEditingItemIndex(null);
                }}
            />

            {/* Modal de Pago */}
            <Modal isOpen={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <Modal.Backdrop className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center p-4">
                    <Modal.Container className="w-full max-w-md outline-none">
                        <Modal.Dialog className="outline-none bg-white rounded-2xl w-full shadow-xl overflow-hidden flex flex-col p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-primaryText">Confirmar Pago</h3>
                                <Modal.CloseTrigger className="bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors">
                                    <X className="size-4" />
                                </Modal.CloseTrigger>
                            </div>
                            
                            <div className="mb-6 flex flex-col items-center">
                                <p className="text-secundaryText text-sm mb-1">Total a cobrar</p>
                                <p className="text-4xl font-bold text-primaryText">${total.toFixed(2)}</p>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={() => setPaymentMethod('Efectivo')}
                                    className={`flex-1 py-4 flex flex-col items-center gap-2 rounded-xl border-2 transition-colors ${paymentMethod === 'Efectivo' ? 'border-primaryAction bg-primaryAction/5 text-primaryAction' : 'border-gray-200 hover:border-gray-300 text-secundaryText'}`}
                                >
                                    <Banknote className="size-6" />
                                    <span className="font-semibold text-sm">Efectivo</span>
                                </button>
                            </div>

                            <button 
                                onClick={handleCreateOrder}
                                disabled={isCreatingOrder}
                                className="w-full py-3.5 rounded-xl bg-primaryAction text-white font-bold hover:bg-primaryAction/90 transition-colors shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex justify-center items-center gap-2"
                            >
                                {isCreatingOrder ? 'PROCESANDO...' : `Confirmar pago e imprimir ticket`}
                            </button>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </div>
    );
}

