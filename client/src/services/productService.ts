import { ProductCatalog, ProductApiResponse } from '../models/productModel';
import { createProductCatalogAdapter } from '../adapters/productAdapter';

export const productService = {
    getCatalog: async (): Promise<ProductCatalog> => {
        try {
            const response = await fetch('/api/products', { method: 'GET' });
            
            if (!response.ok) {
                throw new Error('Error al obtener el catálogo de productos');
            }
            
            const rawData: ProductApiResponse = await response.json();
            return createProductCatalogAdapter(rawData);
            
        } catch (error) {
            console.error('Service Error - getCatalog:', error);
            throw error; 
        }
    }
};