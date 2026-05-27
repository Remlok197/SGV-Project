import React, { useState } from "react"; 
import PageHeader from "../../components/shared/PageHeader";
import CategoryDivider from "./components/CategoryDivider";
import AddProductCard from "./components/AddProductCard";
import ProductCard from "./components/ProductCard";
import ProductForm from "./components/ProductForm";
import ProductGrid from "./components/ProductGrid";
import { useProducts } from "../../hooks/useProducts";

export default function ProductosPage() {
    const [activeCategory, setActiveCategory] = useState("Todos"); 
    
    const { catalog, loading, error, addProduct } = useProducts(activeCategory); 
    
    const [isPanelOpen, setIsPanelOpen] = useState(false); 

    const handleEditProduct = (productId) => {
        console.log(`Abriendo panel para editar producto: ${productId}`);
    };

    const handleDeleteProduct = (productId) => {
        console.log(`Borrando producto: ${productId}`);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><p className="text-secundaryText font-medium">Cargando productos...</p></div>;
    if (error) return <div className="flex justify-center items-center h-64"><p className="text-red-500 font-medium">{error}</p></div>;

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <div className={`flex-1 h-full pb-12 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isPanelOpen ? 'pr-100 lg:pr-130 ' : ''}`}>
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 px-13 md:px-20 lg:px-22">
                    <PageHeader title={"Productos"} />
                    
                    <div className="-mx-13 md:-mx-20 lg:-mx-22">
                        <CategoryDivider 
                            categoryName={activeCategory}
                            itemCount={catalog.totalItems || 0}
                            leftLineClassName="w-[3.5rem] md:w-[5rem] lg:w-[5.5rem]" 
                            titleClassName="text-base md:text-xl lg:text-2xl"
                            countClassName="text-sm md:text-base lg:text-lg ml-1 md:ml-1.5 lg:ml-2 "
                        />
                    </div>
                    
                    <ProductGrid>
                        <AddProductCard
                            text={"Añadir nuevo\nproducto"} 
                            onClick={() => setIsPanelOpen(true)}
                            className={`${isPanelOpen ? 'hidden' : ''}`}
                        />

                        {catalog.products.map((product) => (
                            <ProductCard 
                                key={product.id}
                                name={product.name}
                                price={product.formattedPrice} 
                                modifiers={product.modifiers}
                                imageUrl={product.imageUrl}
                                isAvailable={product.isAvailable}
                                onEdit={() => handleEditProduct(product.id)}    
                                onDelete={() => handleDeleteProduct(product.id)} 
                            />
                        ))}
                    </ProductGrid>
                </div>
            </div>
            <div 
                className={`absolute top-0 right-0 h-full w-full md:w-100 lg:w-138 bg-background border-l border-secundaryText/20 shadow-xs transition-transform duration-300 ease-in-out z-20 ${
                    isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full p-8">
                    <div className="flex-1 mt-6">
                    <ProductForm 
                        onCancel={() => setIsPanelOpen(false)} 
                        onSave={addProduct} 
                        onSuccess={() => setIsPanelOpen(false)} 
                    />
                </div>
                </div>
            </div>

        </div>
    );
}