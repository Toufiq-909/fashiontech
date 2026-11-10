"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/feeds", label: "Feeds & import" },
  { href: "/admin/feedback", label: "Feedback & reviews" },
  { href: "/admin/designs", label: "Custom designs" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      <h2>Butterfly admin</h2>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
      <Link href="/" className="admin-exit">
        ← Back to the shop
      </Link>
    </nav>
  );
}
