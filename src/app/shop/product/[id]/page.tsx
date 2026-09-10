import { SITE_URL } from "@/lib/site";
import { getPrintfulProduct } from "@/lib/printful";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) return {};

    const productData = await getPrintfulProduct(productId);
    if (!productData) return {};

    const product = productData.sync_product;
    const firstVariant = productData.sync_variants?.[0];
    const price = firstVariant?.retail_price ? `$${firstVariant.retail_price}` : '';
    const description = `${product.name}${price ? ` — ${price}` : ''} | Official Loaf Records merch. Limited edition, premium quality.`;

    return {
        title: `${product.name} | Loaf Records Shop`,
        description,
        openGraph: {
            title: product.name,
            description,
            images: product.thumbnail_url ? [
                {
                    url: product.thumbnail_url,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ] : [],
            type: "website",
            siteName: "Loaf Records",
        },
        twitter: {
            card: "summary_large_image",
            title: product.name,
            description,
            images: product.thumbnail_url ? [product.thumbnail_url] : [],
        },
    };
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params;

    // Parse ID (Printful uses numbers)
    const productId = parseInt(id);
    if (isNaN(productId)) {
        notFound();
    }

    const productData = await getPrintfulProduct(productId);

    if (!productData) {
        notFound();
    }

    // Build Product + Offer JSON-LD schema
    const { sync_product, sync_variants } = productData;
    const allImages = [
        sync_product.thumbnail_url,
        ...sync_variants.flatMap(v =>
            v.files
                ?.filter(f => f.type === "mockup" || f.type === "preview")
                .map(f => f.preview_url) ?? []
        ),
    ].filter(Boolean);

    const offers = sync_variants.map(v => ({
        "@type": "Offer" as const,
        price: v.retail_price,
        priceCurrency: v.currency || "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/shop/product/${id}`,
        name: v.name,
        itemCondition: "https://schema.org/NewCondition",
    }));

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: sync_product.name,
        image: allImages,
        description: `${sync_product.name} — Official Loaf Records merch. Limited edition, premium quality streetwear.`,
        brand: {
            "@type": "Brand",
            name: "Loaf Records",
        },
        offers: offers.length === 1 ? offers[0] : offers,
    };

    return (
        <div className="min-h-screen pt-24 pb-16">
            {/* Product JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <ProductDetails product={productData} />
        </div>
    );
}
