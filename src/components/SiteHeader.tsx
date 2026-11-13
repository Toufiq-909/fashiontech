"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/ButterflyMark";
import { nav } from "@/lib/config";
import { useCart } from "./cart/CartProvider";

function Icon({ name }: { name: "search" | "account" | "bag" | "menu" | "close" }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m16.2 16.2 4.3 4.3" />
      </svg>
    );
  if (name === "account")
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21c.6-4 3.6-6 7.5-6s6.9 2 7.5 6" />
      </svg>
    );
  if (name === "bag")
    return (
      <svg {...common}>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
    );
  if (name === "close")
    return (
      <svg {...common}>
        <path d="M5 5l14 14M19 5 5 19" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      {/* <div className="announcement">
        <div className="shell announcement-inner">
          <span>Fabric composition and source shown on every piece</span>
          <span className="announcement-secondary">Free delivery over ₹2,000 · Ships across India</span>
        </div>
      </div> */}
      <div className="shell header-bar">
        <Link href="/" aria-label="Butterfly home" className="shrink-0">
          <Logo light compact />
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
              aria-current={pathname === item.href || pathname.startsWith(item.href + "/") ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <Link href="/shop" className="header-icon" aria-label="Search the shop">
            <Icon name="search" />
          </Link>
          <Link href="/account" className="header-icon hidden sm:inline-flex" aria-label="Your account">
            <Icon name="account" />
          </Link>
          <Link href="/cart" className="header-icon relative" aria-label={`Cart, ${ready ? count : 0} items`}>
            <Icon name="bag" />
            {ready && count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button
            type="button"
            className="header-icon lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="mobile-menu">
          <nav className="shell flex flex-col" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="mobile-link">
                {item.label}
              </Link>
            ))}
            <div className="mobile-menu-meta">
              <Link href="/account">Your account</Link>
              <Link href="/track">Track an order</Link>
              <Link href="/feedback">Feedback</Link>
              <Link href="/about">Our story</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
