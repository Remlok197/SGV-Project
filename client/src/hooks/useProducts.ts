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

    const addCategory = async (categoryData: { nombre: string; icono: string }) => {
        await productService.createCategory(categoryData);
        await fetchCatalogData();
    };

    const updateCategory = async (categoryId: number, categoryData: { nombre?: string; icono?: string }) => {
        await productService.updateCategory(categoryId, categoryData);
        await fetchCatalogData();
    };

    const deleteCategory = async (categoryId: number) => {
        await productService.deleteCategory(categoryId);
        await fetchCatalogData();
    };

    const deleteProduct = async (productId: string) => {
        await productService.deleteProduct(productId);
        await fetchCatalogData();
    };

    const updateProduct = async (productId: string, formData: ProductFormData) => {
        await productService.updateProduct(productId, formData);
        await fetchCatalogData();
    };

    return {
        catalog,
        loading,
        error,
        addProduct, 
        addCategory,
        updateCategory,
        deleteCategory,
        deleteProduct,
        updateProduct,
        refreshCatalog: fetchCatalogData
    };
}