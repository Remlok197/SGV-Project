import React, { useState } from "react"; 
import PageHeader from "../../components/shared/PageHeader";
import CategoryDivider from "./components/CategoryDivider";
import AddProductCard from "./components/AddProductCard";
import ProductCard from "./components/ProductCard";
import ProductForm from "./components/ProductForm";
import ProductGrid from "./components/ProductGrid";
import { useProducts } from "../../hooks/useProducts";
import TabGroup from "./components/TabGroup";
import Tab from "./components/Tab";
import { Edit2, Check } from "lucide-react";
import { ReactSVG } from "react-svg";
import CategoryActionButton from "./components/CategoryActionButton";
import NewCategoryInput from "./components/NewCategoryInput";
import EditableCategoryContent from "./components/EditableCategoryContent";


export default function ProductosPage() {
    const [activeCategory, setActiveCategory] = useState("Todos"); 
    const [actionError, setActionError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Category edit states
    const [isEditMode, setIsEditMode] = useState(false);

    const { catalog, loading, error, addProduct, deleteProduct, updateProduct, addCategory, updateCategory } = useProducts(activeCategory); 
    
    const [isPanelOpen, setIsPanelOpen] = useState(false); 

    const handleEditProduct = (productId) => {
        const prod = catalog.products.find(p => p.id === productId);
        if (prod) {
            setEditingProduct(prod);
            setIsPanelOpen(true);
        }
    };

    const handleDeleteProduct = async (productId) => {
        setActionError(null);
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                await deleteProduct(productId);
            } catch (err) {
                setActionError(err.message || "Error al eliminar el producto.");
                setTimeout(() => setActionError(null), 5000);
            }
        }
    };

    const handleSaveProduct = async (data) => {
        if (editingProduct) {
            await updateProduct(editingProduct.id, data);
        } else {
            await addProduct(data);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><p className="text-secundaryText font-medium">Cargando productos...</p></div>;
    if (error) return <div className="flex justify-center items-center h-64"><p className="text-red-500 font-medium">{error}</p></div>;

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <div className={`flex-1 h-full pb-12 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isPanelOpen ? 'pr-100 lg:pr-130 ' : ''}`}>
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 px-13 md:px-20 lg:px-22">
                    <PageHeader title={"Productos"}>
                        <TabGroup selectedKey={isEditMode ? null : activeCategory} onSelectionChange={(k) => !isEditMode && setActiveCategory(k)}>
                            {catalog.categories
                                .filter(cat => !(isEditMode && cat.name === "Todos"))
                                .map((cat) => (
                                <Tab 
                                    key={cat.id} 
                                    id={cat.name} 
                                    className={isEditMode ? "!bg-white !border-secundaryText/40 focus-within:!border-primary !text-primaryText !px-2 !cursor-text hover:!bg-white" : ""}
                                    title={
                                        isEditMode && cat.name !== "Todos" ? (
                                            <EditableCategoryContent 
                                                category={cat}
                                                onSave={async (newData) => {
                                                    try {
                                                        await updateCategory(newData.id, { nombre: newData.nombre, icono: newData.icono });
                                                    } catch (err) {
                                                        setActionError(err.message || "Error al actualizar la categoría.");
                                                        setTimeout(() => setActionError(null), 5000);
                                                    }
                                                }}
                                                onDelete={(categoryId) => {
                                                    console.log("Eliminar categoría con ID:", categoryId);
                                                    // Aquí irá el llamado de eliminación al back
                                                }}
                                            />
                                        ) : (
                                            cat.name
                                        )
                                    } 
                                    icon={
                                        isEditMode && cat.name !== "Todos" ? null : (
                                            cat.icon ? (
                                                <ReactSVG 
                                                    src={cat.icon} 
                                                    className="size-4 flex items-center justify-center [&_svg]:size-4 [&_svg]:fill-current" 
                                                />
                                            ) : null
                                        )
                                    } 
                                />
                            ))}
                        </TabGroup>
                        
                        {isEditMode && (
                            <NewCategoryInput 
                                onConfirm={async (data) => {
                                    try {
                                        await addCategory(data);
                                    } catch (err) {
                                        setActionError(err.message || "Error al crear la categoría.");
                                        setTimeout(() => setActionError(null), 5000);
                                    }
                                }} 
                            />
                        )}

                        <CategoryActionButton 
                            title={isEditMode ? "Terminar" : "Editar"} 
                            icon={isEditMode ? <Check className="size-4" /> : <Edit2 className="size-4" />} 
                            onClick={() => setIsEditMode(!isEditMode)} 
                            isActive={isEditMode}
                        />
                    </PageHeader>
                    
                    {actionError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
                            <span>{actionError}</span>
                            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer">
                                &times;
                            </button>
                        </div>
                    )}
                    
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
                            onClick={() => {
                                setEditingProduct(null);
                                setIsPanelOpen(true);
                            }}
                            className={`${isPanelOpen ? 'hidden' : ''}`}
                        />

                        {catalog.products
                            .filter(product => {
                                if (activeCategory === "Todos") return true;
                                const activeCatId = catalog.categories.find(c => c.name === activeCategory)?.id;
                                return product.categoryId === activeCatId;
                            })
                            .map((product) => (
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
                        key={editingProduct?.id || "new"}
                        product={editingProduct}
                        categories={catalog.categories}
                        onCancel={() => setIsPanelOpen(false)} 
                        onSave={handleSaveProduct} 
                        onSuccess={() => setIsPanelOpen(false)} 
                    />
                </div>
                </div>
            </div>

        </div>
    );
}