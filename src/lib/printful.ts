export interface PrintfulProduct {
    id: number;
    external_id: string;
    name: string;
    variants: number;
    synced: number;
    thumbnail_url: string;
    is_ignored: boolean;
}

export interface PrintfulProductDetails {
    sync_product: PrintfulProduct;
    sync_variants: {
        id: number;
        external_id: string;
        sync_product_id: number;
        name: string;
        synced: boolean;
        variant_id: number;
        retail_price: string;
        currency: string;
        product: {
            variant_id: number;
            product_id: number;
            image: string;
            name: string;
        };
    }[];
}

const PRINTFUL_API_URL = "https://api.printful.com";

export async function getPrintfulProducts() {
    const token = process.env.PRINTFUL_ACCESS_TOKEN;
    const storeId = process.env.PRINTFUL_STORE_ID;

    if (!token || !storeId) {
        console.warn("PRINTFUL_ACCESS_TOKEN or PRINTFUL_STORE_ID is missing");
        return [];
    }

    try {
        const response = await fetch(`${PRINTFUL_API_URL}/sync/products?limit=100`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-PF-Store-Id": storeId,
                "Content-Type": "application/json",
            },
            next: { revalidate: 0 } // No cache for now to ensure all products load
        });

        if (!response.ok) {
            throw new Error(`Printful API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result as PrintfulProduct[];
    } catch (error) {
        console.error("Failed to fetch Printful products:", error);
        return [];
    }
}

export async function getPrintfulProduct(id: number) {
    const token = process.env.PRINTFUL_ACCESS_TOKEN;
    const storeId = process.env.PRINTFUL_STORE_ID;

    if (!token || !storeId) {
        return null;
    }

    try {
        const response = await fetch(`${PRINTFUL_API_URL}/sync/products/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-PF-Store-Id": storeId,
                "Content-Type": "application/json",
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            throw new Error(`Printful API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result as PrintfulProductDetails;
    } catch (error) {
        console.error(`Failed to fetch Printful product ${id}:`, error);
        return null;
    }
}

// Order creation types
export interface PrintfulOrderRecipient {
    name: string;
    address1: string;
    city: string;
    state_code: string;
    zip: string;
    country_code: string;
    email?: string;
    phone?: string;
}

export interface PrintfulOrderItem {
    sync_variant_id: number;
    quantity: number;
}

export interface PrintfulOrderResponse {
    id: number;
    external_id: string;
    status: string;
    shipping: string;
    created: number;
    updated: number;
    recipient: PrintfulOrderRecipient;
    items: {
        id: number;
        external_id: string;
        variant_id: number;
        sync_variant_id: number;
        quantity: number;
        price: string;
        retail_price: string;
        name: string;
    }[];
    costs: {
        subtotal: string;
        discount: string;
        shipping: string;
        tax: string;
        total: string;
    };
}

/**
 * Create a draft order in Printful
 * Draft orders are NOT charged or fulfilled until confirmed
 */
export async function createPrintfulOrder(
    recipient: PrintfulOrderRecipient,
    items: PrintfulOrderItem[],
    externalId?: string
): Promise<{ success: boolean; orderId?: number; error?: string }> {
    const token = process.env.PRINTFUL_ACCESS_TOKEN;
    const storeId = process.env.PRINTFUL_STORE_ID;

    if (!token || !storeId) {
        console.warn("PRINTFUL_ACCESS_TOKEN or PRINTFUL_STORE_ID is missing");
        return { success: false, error: "Printful not configured" };
    }

    try {
        const orderPayload = {
            recipient,
            items: items.map(item => ({
                sync_variant_id: item.sync_variant_id,
                quantity: item.quantity,
            })),
            ...(externalId && { external_id: externalId }),
        };

        console.log("Creating Printful order:", JSON.stringify(orderPayload, null, 2));

        const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-PF-Store-Id": storeId,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderPayload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Printful order creation failed:", data);
            return {
                success: false,
                error: data.result || data.error?.message || "Failed to create order",
            };
        }

        const order = data.result as PrintfulOrderResponse;
        console.log(`Printful order created: ID ${order.id}, Status: ${order.status}`);

        return {
            success: true,
            orderId: order.id,
        };
    } catch (error) {
        console.error("Failed to create Printful order:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
