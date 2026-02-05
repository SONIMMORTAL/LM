export interface ShopifyImage {
    url: string;
    altText: string;
}

export interface ShopifyPrice {
    amount: string;
    currencyCode: string;
}

export interface ShopifySelectedOption {
    name: string;
    value: string;
}

export interface ShopifyVariant {
    id: string;
    title: string;
    availableForSale: boolean;
    price: ShopifyPrice;
    selectedOptions?: ShopifySelectedOption[];
    image?: ShopifyImage;
}

export interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    descriptionHtml?: string;
    featuredImage: ShopifyImage;
    images: {
        edges: {
            node: ShopifyImage;
        }[];
    };
    priceRange: {
        minVariantPrice: ShopifyPrice;
    };
    compareAtPriceRange?: {
        minVariantPrice: ShopifyPrice;
    };
    variants: {
        edges: {
            node: ShopifyVariant;
        }[];
    };
    tags: string[];
    availableForSale: boolean;
}

export interface ShopifyCollection {
    handle: string;
    title: string;
    description: string;
    products: {
        edges: {
            node: ShopifyProduct;
        }[];
    };
}

export interface CartItem {
    id: string; // This is the line item ID after adding to cart, or variant ID for local state
    variantId: string;
    productTitle: string;
    variantTitle: string;
    quantity: number;
    price: string;
    currencyCode: string;
    image: string;
    handle: string;
}

export interface Cart {
    id: string;
    webUrl: string;
    lines: {
        edges: {
            node: CartItem;
        }[];
    };
}
