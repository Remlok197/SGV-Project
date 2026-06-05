import React, { useState } from 'react';
import PageHeader from "../components/shared/PageHeader";
import TabGroup from "./productos/components/tabs/TabGroup";
import Tab from "./productos/components/tabs/Tab";
import { Utensils, Coffee, LayoutGrid } from "lucide-react";
import ProductGrid from "./productos/components/cards/ProductGrid";
import MenuProductCard from "./tomarOrden/components/MenuProductCard";
import ProductOptionsModal from "./tomarOrden/components/ProductOptionsModal";
import { useProducts } from "../hooks/useProducts";
import { ReactSVG } from "react-svg";

export default function TomarOrdenPage() {
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { catalog, loading, error } = useProducts();

    if (loading) return <div className="flex justify-center items-center h-full w-full"><p className="text-secundaryText font-medium">Cargando menú...</p></div>;
    if (error) return <div className="flex justify-center items-center h-full w-full"><p className="text-red-500 font-medium">{error}</p></div>;

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Left Column - Menu */}
            <div className="flex-1 h-full pb-12 flex flex-col overflow-y-auto md:pr-[22rem] lg:pr-[26rem] transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 pl-13 md:pl-20 lg:pl-22 pr-6 md:pr-8 lg:pr-10">
                    <PageHeader title={"MENÚ"}>
                        {catalog.categories.find(c => c.name === "Todos") && (
                            <button
                                onClick={() => setActiveCategory("Todos")}
                                className={`flex items-center w-fit flex-none gap-2 h-10 px-4 rounded-[10px] border font-medium text-sm transition-all duration-200 cursor-pointer select-none flex-shrink-0 ${
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
                        <span className="text-secundaryText font-medium text-lg">#232</span>
                    </div>

                    {/* Order Items List */}
                    <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                        {/* Static mockup item 1 */}
                        <div className="flex items-center gap-4">
                            <div className="size-12 md:size-14 rounded-lg bg-gray-200 border border-gray-300 flex-shrink-0"></div>
                            <div className="flex-1">
                                <h3 className="font-bold text-primaryText text-sm">Taco de bistec</h3>
                                <p className="text-primaryAction font-bold text-sm">$34.00</p>
                            </div>
                            <span className="font-semibold text-primaryText">x2</span>
                        </div>
                        {/* Static mockup item 2 */}
                        <div className="flex items-center gap-4">
                            <div className="size-12 md:size-14 rounded-lg bg-gray-200 border border-gray-300 flex-shrink-0"></div>
                            <div className="flex-1">
                                <h3 className="font-bold text-primaryText text-sm">Torta de chorizo</h3>
                                <p className="text-primaryAction font-bold text-sm">$30.00</p>
                            </div>
                            <span className="font-semibold text-primaryText">x1</span>
                        </div>
                    </div>

                    {/* Order Summary & Actions */}
                    <div className="mt-6 pt-6 border-t border-secundaryText/20">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-primaryText text-base md:text-lg">Total:</span>
                            <span className="font-bold text-primaryText text-base md:text-lg">$64.00</span>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 py-2.5 md:py-3 rounded-xl border border-red-500 text-red-500 font-bold hover:bg-red-50 transition-colors text-sm md:text-base">
                                CANCELAR
                            </button>
                            <button className="flex-1 py-2.5 md:py-3 rounded-xl bg-primaryAction text-white font-bold hover:bg-primaryAction/90 transition-colors shadow-md shadow-primaryAction/20 text-sm md:text-base">
                                COBRAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de opciones de producto */}
            <ProductOptionsModal 
                isOpen={!!selectedProduct} 
                onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)} 
                product={selectedProduct}
                onAdd={(data) => {
                    console.log("Producto añadido:", data);
                    // Aquí se manejaría la adición a la orden
                }}
            />
        </div>
    );
}

