import { Instagram, Youtube } from "lucide-react";

// Custom Facebook icon (Lucide doesn't include one)
function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 7.834 7.834 0 0 0-.567-.01c-.69 0-1.18.093-1.544.298-.356.2-.594.474-.733.874-.13.382-.2.86-.2 1.467v1.342h3.266l-.391 1.69-.34 1.493-.455 1.484H13.27v7.98h-4.17z" />
        </svg>
    );
}

/** The label's socials — in the desktop footer, and in the bio block that ends every phone page. */
export const socialLinks = [
    { href: "https://instagram.com/loafrecords", icon: Instagram, label: "Instagram" },
    { href: "https://www.youtube.com/@LoafRecords", icon: Youtube, label: "YouTube" },
    { href: "https://www.facebook.com/loafrecords", icon: FacebookIcon, label: "Facebook" },
];
