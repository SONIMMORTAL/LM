import { getPrintfulProduct } from "@/lib/printful";
import { ProductDetails } from "@/components/shop/ProductDetails";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
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

    return (
        <div className="min-h-screen pt-24 pb-16">
            <ProductDetails product={productData} />
        </div>
    );
}
