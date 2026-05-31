import { ProductCatalog, ProductApiResponse, ProductFormData } from '../schemas/productSchema';
import { createProductCatalogAdapter, createProductPayloadAdapter } from '../adapters/productAdapter';

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
    },

    createCategory: async (categoryData: { nombre: string; icono: string }): Promise<void> => {
        try {
            const response = await fetch('/api/categorias/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(categoryData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.detail || 'Error al crear la categoría';
                throw new Error(errMsg);
            }
        } catch (error) {
            console.error('Service Error - createCategory:', error);
            throw error;
        }
    },

    createProduct: async (formData: ProductFormData): Promise<void> => {
        try {
            const apiPayload = createProductPayloadAdapter(formData);

            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                console.error("Detalle del error 422 (FastAPI):", JSON.stringify(errorData, null, 2));
                
                const backendMsg = errorData.detail?.[0]?.msg || errorData.detail;
                const fieldName = errorData.detail?.[0]?.loc?.[1]; 
                
                throw new Error(`Error en el campo '${fieldName}': ${backendMsg}`);
            }

            const newProduct = await response.json();
            const productoId = newProduct.id;

            if (formData.image) {
                const imageFormData = new FormData();
     
                const fileToUpload = formData.image instanceof FileList ? formData.image[0] : formData.image;
                
                imageFormData.append('file', fileToUpload);

                const imageResponse = await fetch(`/api/products/${productoId}/imagen`, {
                    method: 'POST',
                    body: imageFormData
                });

                if (!imageResponse.ok) {
                    console.warn(`Producto ${productoId} creado, pero falló la subida de imagen.`);
                    throw new Error('El producto fue creado, pero hubo un problema al subir la imagen');
                }
            }

        } catch (error) {
            console.error('Service Error - createProduct:', error);
            throw error;
        }
    },

    deleteProduct: async (productId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errMsg = errorData.detail || 'Error al eliminar el producto';
                throw new Error(errMsg);
            }
        } catch (error) {
            console.error('Service Error - deleteProduct:', error);
            throw error;
        }
    },

    updateProduct: async (productId: string, formData: ProductFormData): Promise<void> => {
        try {
            const apiPayload = createProductPayloadAdapter(formData);

            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiPayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Detalle del error 422 (FastAPI):", JSON.stringify(errorData, null, 2));
                const backendMsg = errorData.detail?.[0]?.msg || errorData.detail;
                const fieldName = errorData.detail?.[0]?.loc?.[1]; 
                throw new Error(`Error en el campo '${fieldName}': ${backendMsg}`);
            }

            if (formData.image) {
                const imageFormData = new FormData();
                const fileToUpload = formData.image instanceof FileList ? formData.image[0] : formData.image;
                imageFormData.append('file', fileToUpload);

                const imageResponse = await fetch(`/api/products/${productId}/imagen`, {
                    method: 'POST',
                    body: imageFormData
                });

                if (!imageResponse.ok) {
                    console.warn(`Producto ${productId} actualizado, pero falló la subida de imagen.`);
                    throw new Error('El producto fue actualizado, pero hubo un problema al subir la imagen');
                }
            }
        } catch (error) {
            console.error('Service Error - updateProduct:', error);
            throw error;
        }
    }
};