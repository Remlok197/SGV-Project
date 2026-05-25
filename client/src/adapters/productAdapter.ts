import { ProductApiResponse, ProductCatalog, Product, Category } from '../models/productModel';

export const createProductCatalogAdapter = (apiResponse: ProductApiResponse): ProductCatalog => {
    const { categories, products } = apiResponse.data;

    const adaptedCategories: Category[] = categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon
    }));

    const priceFormatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
    });

    const adaptedProducts: Product[] = products.map(prod => ({
        id: prod.id,
        categoryId: prod.categoryId,
        name: prod.name,
        formattedPrice: priceFormatter.format(prod.price),
        description: prod.modifiers.join(', '), 
        isAvailable: prod.isAvailable,
        imageUrl: prod.imageUrl
    }));

    return {
        categories: adaptedCategories,
        products: adaptedProducts,
        totalItems: apiResponse.metadata.totalItems
    };
};