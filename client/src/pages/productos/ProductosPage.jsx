import PageHeader from "../../components/shared/PageHeader";
import CategoryDivider from "./components/CategoryDivider";
import AddGridCard from "./components/AddProductCard";
import ProductCard from "./components/ProductCard";
import { useProducts } from "../../hooks/useProducts";

export default function ProductosPage() {
    
    const { catalog, loading, error } = useProducts();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-secundaryText font-medium">Cargando productos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500 font-medium">{error}</p>
            </div>
        );
    }

    return (
        // className="overflow-x-hidden"className="overflow-x-hidden"
        <div className="h-[calc(100vh-130px)] md:h-full flex flex-col overflow-x-hidden">
            <div className="flex flex-col gap-2 md:gap-2 lg:gap-3 pt-6 px-13 md:px-20 lg:px-22">
                <PageHeader title={"Productos"} />
                
                <div className="-mx-13 md:-mx-20 lg:-mx-22">
                    <CategoryDivider 
                        categoryName="Todos" 
                        itemCount={catalog.totalItems || 0}
                        leftLineClassName="w-[3.5rem] md:w-[5rem] lg:w-[5.5rem]" 
                        titleClassName="text-base md:text-xl lg:text-2xl"
                        countClassName="text-sm md:text-base lg:text-lg ml-1 md:ml-1.5 lg:ml-2 "
                    />
                </div>
                
                <div className="grid grid-cols-[repeat(auto-fill,16rem)] gap-4">
                    <AddGridCard 
                        text={"Añadir nuevo\nproducto"} 
                        onClick={() => console.log("Abrir modal de creación")} 
                    />

                    {catalog.products.map((product) => (
                        <ProductCard 
                            key={product.id}
                            name={product.name}
                            price={product.formattedPrice} 
                            description={product.description}
                            imageUrl={product.imageUrl}
                            isAvailable={product.isAvailable}
                            onOptionsClick={() => console.log(`Abrir menú para: ${product.name}`)}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}