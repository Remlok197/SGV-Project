import { ProductApiResponse, ProductCatalog, Product, Category, ProductFormData } from '../schemas/productSchema';

export const createProductCatalogAdapter = (apiResponse: ProductApiResponse): ProductCatalog => {
   
    const { categorias, productos } = apiResponse.data;

    const adaptedCategories: Category[] = categorias.map((cat) => ({
        id: String(cat.id), 
        name: cat.nombre,   
        icon: cat.icono     
    }));

    const priceFormatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const adaptedProducts: Product[] = productos.map((prod) => ({
        id: String(prod.id),
        categoryId: String(prod.id_categoria), 
        name: prod.nombre,
        units: prod.unidades,
        formattedPrice: priceFormatter.format(prod.precio), 
        description: prod.modificadores.join(', '), 
        isAvailable: prod.activo, 
        imageUrl: prod.imagen_url 
    }));

    return {
        categories: adaptedCategories,
        products: adaptedProducts,
        totalItems: apiResponse.metadata.total_items
    };
};

export const createProductPayloadAdapter = (formData: ProductFormData) => {
    return {
        nombre: formData.name,
        precio: Number(formData.price),
        unidades: formData.units,
        activo: formData.isAvailable,
        id_categoria: parseInt(formData.categoryId, 10),
        
        ids_modificadores: formData.modifiers 
            ? formData.modifiers
                .split(',')                  
                .map(id => id.trim())        
                .filter(id => id !== '')     
                .map(id => parseInt(id, 10)) 
                .filter(id => !isNaN(id))    
            : []
    };
};