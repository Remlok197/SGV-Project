import React, { useState, useRef } from "react";
import PageHeader from "../../components/shared/PageHeader";
import CategoryDivider from "./components/category/CategoryDivider";
import AddProductCard from "./components/cards/AddProductCard";
import ProductCard from "./components/cards/ProductCard";
import ProductForm from "./components/form/ProductForm";
import ProductGrid from "./components/cards/ProductGrid";
import { useProducts } from "../../hooks/useProducts";
import TabGroup from "./components/tabs/TabGroup";
import Tab from "./components/tabs/Tab";
import { Edit2, Check } from "lucide-react";
import { ReactSVG } from "react-svg";
import CategoryActionButton from "./components/category/CategoryActionButton";
import NewCategoryInput from "./components/category/NewCategoryInput";
import EditableCategoryContent from "./components/category/EditableCategoryContent";


export default function ProductosPage() {
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [actionError, setActionError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formKey, setFormKey] = useState(Date.now());

    // Category edit states
    const [isEditMode, setIsEditMode] = useState(false);

    // Drag to scroll states
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const { catalog, loading, error, addProduct, deleteProduct, updateProduct, addCategory, updateCategory, deleteCategory } = useProducts(activeCategory);

    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const handleEditProduct = (productId) => {
        const prod = catalog.products.find(p => p.id === productId);
        if (prod) {
            setEditingProduct(prod);
            setFormKey(Date.now());
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
            <div className={`flex-1 h-full pb-12 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isPanelOpen ? 'md:pr-[23.5rem] lg:pr-[32.75rem]' : ''}`}>
                <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6">
                    <div className="px-6 md:px-10 lg:px-11">
                        <PageHeader title={"Productos"}>
                        {!isEditMode && catalog.categories.find(c => c.name === "Todos") && (
                            <button
                                onClick={() => setActiveCategory("Todos")}
                                className={`flex items-center w-fit flex-none gap-2 h-10 px-3 rounded-[10px] border font-medium text-sm transition-all duration-200 cursor-pointer select-none flex-shrink-0 ${activeCategory === "Todos"
                                        ? "border-primaryAction bg-transparent text-primaryAction"
                                        : "border-[#E2E8F0] bg-transparent text-secundaryText hover:bg-gray-50 hover:text-primaryText"
                                    }`}
                            >
                                {catalog.categories.find(c => c.name === "Todos").icon && (
                                    <span className="flex-shrink-0 size-[18px] flex items-center justify-center">
                                        <ReactSVG
                                            src={catalog.categories.find(c => c.name === "Todos").icon}
                                            className="size-4 flex items-center justify-center [&_svg]:size-4"
                                        />
                                    </span>
                                )}
                                <span>Todos</span>
                            </button>
                        )}

                        <div
                            ref={scrollContainerRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`overflow-x-auto min-w-0 max-w-full flex px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        >
                            <TabGroup selectedKey={isEditMode ? null : activeCategory} onSelectionChange={(k) => !isEditMode && setActiveCategory(k)}>
                                {catalog.categories
                                    .filter(cat => cat.name !== "Todos")
                                    .map((cat) => (
                                        <Tab
                                            key={cat.id}
                                            id={cat.name}
                                            className={isEditMode ? "!bg-white !border-secundaryText/40 focus-within:!border-primary !text-secundaryText !px-2 !cursor-text hover:!bg-white" : ""}
                                            title={
                                                isEditMode ? (
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
                                                        onDelete={async (categoryId) => {
                                                            try {
                                                                await deleteCategory(categoryId);
                                                                if (activeCategory === cat.name) {
                                                                    setActiveCategory("Todos");
                                                                }
                                                            } catch (err) {
                                                                setActionError(err.message || "Error al eliminar la categoría.");
                                                                setTimeout(() => setActionError(null), 5000);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    cat.name
                                                )
                                            }
                                            icon={
                                                isEditMode ? null : (
                                                    cat.icon ? (
                                                        <ReactSVG
                                                            src={cat.icon}
                                                            className="size-4 flex items-center justify-center [&_svg]:size-4"
                                                        />
                                                    ) : null
                                                )
                                            }
                                        />
                                    ))}
                            </TabGroup>
                        </div>

                        {isEditMode ? (
                            <>
                                <NewCategoryInput
                                    className="flex-shrink-0"
                                    onConfirm={async (data) => {
                                        try {
                                            await addCategory(data);
                                        } catch (err) {
                                            setActionError(err.message || "Error al crear la categoría.");
                                            setTimeout(() => setActionError(null), 5000);
                                        }
                                    }}
                                />
                                <CategoryActionButton
                                    title="Terminar"
                                    icon={<Check className="size-4" />}
                                    onClick={() => setIsEditMode(false)}
                                    isActive={true}
                                    className={`flex-shrink-0 transition-all duration-300 ${isPanelOpen ? 'ml-2' : ''}`}
                                />
                            </>
                        ) : (
                            <CategoryActionButton
                                title="Editar"
                                icon={<Edit2 className="size-4" />}
                                onClick={() => setIsEditMode(true)}
                                isActive={false}
                                className={`flex-shrink-0 transition-all duration-300 ${isPanelOpen ? 'ml-2' : ''}`}
                            />
                        )}
                    </PageHeader>
                    </div>

                    {actionError && (
                        <div className="px-6 md:px-10 lg:px-11">
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between text-sm">
                                <span>{actionError}</span>
                                <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer">
                                    &times;
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="w-full">
                        <CategoryDivider
                            categoryName={activeCategory}
                            itemCount={
                                activeCategory === "Todos" 
                                    ? catalog.products.length 
                                    : catalog.products.filter(p => p.categoryId === catalog.categories.find(c => c.name === activeCategory)?.id).length
                            }
                            leftLineClassName="w-6 md:w-10 lg:w-11"
                            titleClassName="text-base md:text-xl lg:text-2xl"
                            countClassName="text-sm md:text-base lg:text-lg ml-1 md:ml-1.5 lg:ml-2 "
                        />
                    </div>

                    <div className="px-6 md:px-10 lg:px-11">
                        <div className={`grid grid-cols-[repeat(auto-fill,17.28rem)] gap-y-8 pb-4 ${!isPanelOpen ? 'gap-x-4 justify-between' : 'gap-x-6 justify-start'}`}>
                            <div className={`scale-[1.08] origin-top-left ${isPanelOpen ? 'hidden' : ''}`}>
                                <AddProductCard
                                    text={"Añadir nuevo\nproducto"}
                                    onClick={() => {
                                        setEditingProduct(null);
                                        setFormKey(Date.now());
                                        setIsPanelOpen(true);
                                    }}
                                />
                            </div>

                            {catalog.products
                                .filter(product => {
                                    if (activeCategory === "Todos") return true;
                                    const activeCatId = catalog.categories.find(c => c.name === activeCategory)?.id;
                                    return product.categoryId === activeCatId;
                                })
                                .map((product) => (
                                    <div key={product.id} className="scale-[1.08] origin-top-left">
                                        <ProductCard
                                            name={product.name}
                                            price={product.formattedPrice}
                                            modifiers={product.modifiers}
                                            imageUrl={product.imageUrl}
                                            isAvailable={product.isAvailable}
                                            onEdit={() => handleEditProduct(product.id)}
                                            onDelete={() => handleDeleteProduct(product.id)}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className={`absolute top-0 right-0 h-full w-full md:w-100 lg:w-138 bg-background border-l border-secundaryText/20 shadow-xs transition-transform duration-300 ease-in-out z-20 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full p-8">
                    <div className="flex-1 mt-6">
                        <ProductForm
                            key={formKey}
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