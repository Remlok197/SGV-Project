import { useState, useEffect } from "react";
import { productService } from "../services/productService";
import { ProductCatalog, ProductFormData } from "../schemas/productSchema"; 

export function useProducts() {
    const [catalog, setCatalog] = useState<ProductCatalog>({ 
        categories: [], 
        products: [], 
        totalItems: 0 
    });
    
    const [loading, setLoading] = useState<boolean>(true); 
    const [error, setError] = useState<string | null>(null);

    const fetchCatalogData = async () => {
        try {
            setLoading(true); 
            setError(null);
            
            const data = await productService.getCatalog();
            setCatalog(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al cargar el catálogo de productos');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCatalogData();
    }, []); 

    const addProduct = async (formData: ProductFormData) => {
        await productService.createProduct(formData);
        
        await fetchCatalogData();
    };

    const deleteProduct = async (productId: string) => {
        await productService.deleteProduct(productId);
        await fetchCatalogData();
    };

    return {
        catalog,
        loading,
        error,
        addProduct, 
        deleteProduct,
        refreshCatalog: fetchCatalogData
    };
}