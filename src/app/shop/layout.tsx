import { StreetBackdrop } from "@/components/layout/StreetBackdrop";

/** The store wears the landing's street atmosphere, product pages included. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return <StreetBackdrop>{children}</StreetBackdrop>;
}
