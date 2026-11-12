import Link from "next/link";
import { ButterflyMark } from "@/components/brand/ButterflyMark";
import { affiliateDisclosure, footerNav, site } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="site-footer on-green">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <ButterflyMark size={54} wing="#FFDD9C" accent="#F9B637" body="#FEFBF6" />
            <p className="footer-wordmark">butterfly</p>
            <p className="footer-tagline">Live to Love</p>
            <p className="footer-note">
              Merino and Lyocell clothing made under our own label, for people who would rather move
              than adjust what they are wearing.
            </p>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social"
            >
              Instagram
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="footer-cols">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h2 className="footer-heading">{group.title}</h2>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="footer-heading">Contact</h2>
              <ul>
                <li>
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </li>
                <li>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a>
                </li>
                <li className="footer-address">{site.address}</li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Brand &amp; site terms</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-legal">
          <p>{affiliateDisclosure}</p>
          <p>
            Every listing on this site is a Butterfly Original piece: designed by Butterfly and made
            with our manufacturing partner in India. Butterfly takes your order, payment and returns.
          </p>
          <p className="footer-fine">© {new Date().getFullYear()} Butterfly · Bengaluru, India</p>
        </div>
      </div>
      <div className="footer-peacock peacock" aria-hidden="true" />
    </footer>
  );
}
