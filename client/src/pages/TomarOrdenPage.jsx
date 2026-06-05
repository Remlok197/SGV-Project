import React, { useState } from 'react';
import PageHeader from "../components/shared/PageHeader";
import TabGroup from "./productos/components/tabs/TabGroup";
import Tab from "./productos/components/tabs/Tab";
import { Utensils, Coffee } from "lucide-react";

export default function TomarOrdenPage() {
    const [activeCategory, setActiveCategory] = useState("Alimentos");

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Left Column - Menu */}
            <div className="flex-1 h-full pb-12 flex flex-col overflow-y-auto pr-[20rem] md:pr-[24rem] lg:pr-[28rem] transition-all duration-300 ease-in-out">
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 px-8 md:px-12 lg:px-16">
                    <PageHeader title={"MENÚ"}>
                        <TabGroup selectedKey={activeCategory} onSelectionChange={setActiveCategory}>
                            <Tab 
                                id="Alimentos" 
                                title="ALIMENTOS" 
                                icon={<Utensils className="size-4" />} 
                            />
                            <Tab 
                                id="Bebidas" 
                                title="BEBIDAS" 
                                icon={<Coffee className="size-4" />} 
                            />
                        </TabGroup>
                    </PageHeader>
                    
                    {/* Placeholder for Product Grid */}
                    <div className="mt-8 flex justify-center items-center h-64 text-secundaryText border-2 border-dashed border-secundaryText/20 p-10 rounded-xl">
                        [ Grilla de Productos ]
                    </div>
                </div>
            </div>

            {/* Right Column - Order Panel */}
            <div className="absolute top-0 right-0 h-full w-[20rem] md:w-[24rem] lg:w-[28rem] bg-background border-l border-secundaryText/20 shadow-xs z-20">
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
        </div>
    );
}

