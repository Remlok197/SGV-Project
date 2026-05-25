export interface ApiCategory {
    id: number;
    name: string;
    icon: string;
}

export interface ApiProduct {
    id: number;
    categoryId: number;
    name: string;
    price: number;
    modifiers: string[];
    isAvailable: boolean;
    imageUrl: string;
}

export interface ProductApiResponse {
    data: {
        categories: ApiCategory[];
        products: ApiProduct[];
    };
    metadata: {
        totalItems: number;
    };
}

export interface Category {
    id: number;
    name: string;
    icon: string;
}

export interface Product {
    id: number;
    categoryId: number;
    name: string;
    formattedPrice: string; 
    description: string;   
    isAvailable: boolean;
    imageUrl: string;
}

export interface ProductCatalog {
    categories: Category[];
    products: Product[];
    totalItems: number;
}