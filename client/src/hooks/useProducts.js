import { useState, useEffect } from "react";
import { productService } from "../services/productService";

export function useProducts() {

    const [catalog, setCatalog] = useState({ 
        categories: [], 
        products: [], 
        totalItems: 0 
    });
    
    const [loading, setLoading] = useState(true); 
    
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                setLoading(true); 
                setError(null);
                
                const data = await productService.getCatalog();
                setCatalog(data);
            } catch (err) {
                setError(err.message || 'Error al cargar el catálogo de productos');
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogData();
    }, []); 

    return {
        catalog,
        loading,
        error
    };
}