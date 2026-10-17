import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-noir-void">
            <AdminSidebar />
            <main className="lg:pl-64">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
