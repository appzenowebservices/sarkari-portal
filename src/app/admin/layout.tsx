import Link from "next/link";
import { redirect } from "next/navigation";
import { SidebarClient } from "@/components/admin/sidebar-client";
import { getAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin", icon: "dashboard", label: "डैशबोर्ड", exact: true },
  { href: "/admin/services", icon: "link", label: "सेवाएं (लिंक)" },
  { href: "/admin/categories", icon: "folder", label: "श्रेणियाँ" },
  { href: "/admin/jobs", icon: "users", label: "नौकरियां", exact: true },
  { href: "/admin/jobs/new/government", icon: "building", label: "Government Job", exact: true },
  { href: "/admin/jobs/new/private", icon: "briefcase", label: "Private Job", exact: true },
  { href: "/admin/ads", icon: "megaphone", label: "विज्ञापन (Ads)" },
  { href: "/admin/ad-requests", icon: "inbox", label: "Ad अनुरोध" },
  { href: "/admin/advertisements", icon: "fileText", label: "Advertisements" },
  { href: "/admin/ad-pricing", icon: "star", label: "Ad Pricing" },
  { href: "/admin/payments", icon: "wallet", label: "Payments" },
  { href: "/admin/contact-requests", icon: "mail", label: "Contact Requests" },
  { href: "/admin/privacy-requests", icon: "shield", label: "Privacy Requests" },
  { href: "/admin/newsletter", icon: "mail", label: "Newsletter", exact: true },
  { href: "/admin/newsletter/subscribers", icon: "users", label: "Subscribers" },
  { href: "/admin/newsletter/campaigns", icon: "chart", label: "Campaigns" },
  { href: "/admin/newsletter/create", icon: "plus", label: "Create Newsletter" },
  { href: "/admin/settings", icon: "settings", label: "सेटिंगें" },
  { href: "/admin/settings/upi", icon: "wallet", label: "UPI Settings" },
];

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let admin = null;
  try {
    admin = await getAdmin();
  } catch {
    // MongoDB unavailable during build — allow rendering without auth guard
  }

  if (!admin) {
    redirect("/login");
  }

  return <SidebarClient admin={{ name: admin.name, username: admin.username }} nav={NAV}>{children}</SidebarClient>;
}
