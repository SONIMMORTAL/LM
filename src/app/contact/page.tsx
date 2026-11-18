import { redirect } from "next/navigation";

/** Contact was merged into Films (/loaf-films), which handles video shoots & bookings. */
export default function ContactRedirectPage() {
    redirect("/loaf-films");
}
