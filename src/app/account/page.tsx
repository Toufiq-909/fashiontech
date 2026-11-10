import Link from "next/link";
import { AuthPanel } from "@/components/AuthPanel";
import { AddressForm, LogoutButton } from "@/components/AccountActions";
import { ProductCard } from "@/components/ProductCard";
import { sessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { brandById, productById } from "@/lib/catalog";
import { formatDate, formatINR } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your account",
  description: "Sign in to see Butterfly orders, wishlist, addresses and saved looks.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ next?: string }>;

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const user = await sessionUser();
  const next = params.next?.startsWith("/") ? params.next : "/account";

  if (!user) {
    return (
      <div className="shell page-main">
        <header className="page-head">
          <p className="eyebrow">Account</p>
          <h1 className="h1 mt-2">Your side of Butterfly.</h1>
          <p className="lede mt-3">
            Guest checkout works fine. An account just keeps the pieces, addresses and looks in one
            place.
          </p>
        </header>
        <AuthPanel next={next} />
        <div className="h-16" />
      </div>
    );
  }

  const db = getDb();
  const orders = db.orders
    .filter((order) => order.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const wishlist = user.wishlist
    .map((id) => productById(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product && product.status === "approved"));
  const looks = db.looks.filter((look) => look.userId === user.id).slice(0, 6);

  return (
    <div className="shell page-main">
      <header className="page-head">
        <p className="eyebrow">Account</p>
        <h1 className="h1 mt-2">{user.name.split(" ")[0]}&apos;s Butterfly.</h1>
        <p className="lede mt-3">
          {orders.length} {orders.length === 1 ? "order" : "orders"} · {wishlist.length} saved{" "}
          {wishlist.length === 1 ? "piece" : "pieces"} · member since {formatDate(user.createdAt)}
        </p>
      </header>

      <div className="account-grid">
        <aside className="account-aside">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <nav className="account-links" aria-label="Account sections">
            <a href="#orders">Order history</a>
            <a href="#wishlist">Wishlist</a>
            <a href="#looks">Saved looks</a>
            <a href="#addresses">Addresses</a>
            <Link href="/track">Track an order</Link>
            <Link href="/feedback">Share feedback</Link>
            {user.role === "admin" && <Link href="/admin">Admin panel</Link>}
          </nav>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </aside>

        <div>
          <section id="orders" className="account-block" style={{ borderTop: 0, marginTop: 0, paddingTop: 0 }}>
            <h2>Order history</h2>
            {orders.length === 0 ? (
              <div className="empty-state" style={{ textAlign: "left", padding: "1.5rem" }}>
                <p>No orders yet. <Link className="link-under" href="/shop">Start with a tee.</Link></p>
              </div>
            ) : (
              orders.map((order) => (
                <div className="order-row" key={order.code}>
                  <div>
                    <Link className="link-under font-semibold" href={`/order/${order.code}`}>
                      {order.code}
                    </Link>
                    <p className="micro muted">
                      {formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} ·{" "}
                      {order.items.map((item) => item.brandName).filter((name, index, list) => list.indexOf(name) === index).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                    <span className="font-semibold">{formatINR(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </section>

          <section id="wishlist" className="account-block">
            <h2>Wishlist</h2>
            {wishlist.length === 0 ? (
              <p className="text-[0.88rem] muted">
                Nothing saved yet. Use “Save to wishlist” on any product page.
              </p>
            ) : (
              <div className="product-grid product-grid-3">
                {wishlist.map((product) => {
                  const brand = brandById(product.brandId);
                  return brand ? <ProductCard key={product.id} product={product} brand={brand} compact /> : null;
                })}
              </div>
            )}
          </section>

          <section id="looks" className="account-block">
            <h2>Saved looks</h2>
            {looks.length === 0 ? (
              <p className="text-[0.88rem] muted">
                No saved try-on looks.{" "}
                <Link className="link-under" href="/try-on">
                  Try a piece on
                </Link>{" "}
                and save it if you want to come back to it.
              </p>
            ) : (
              <div className="look-gallery">
                {looks.map((look) => {
                  const product = productById(look.garmentProductId);
                  return (
                    <figure className="look-tile" key={look.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/uploads/${look.imageFile}`} alt={`Saved try-on look${product ? ` in ${product.name}` : ""}`} />
                      <figcaption>{product?.name ?? "Saved look"}</figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </section>

          <section id="addresses" className="account-block">
            <h2>Saved addresses</h2>
            {user.addresses.length === 0 ? (
              <p className="text-[0.88rem] muted mb-3">No addresses saved yet.</p>
            ) : (
              user.addresses.map((address) => (
                <div className="address-card" key={`${address.line1}-${address.pin}`}>
                  <strong>{address.label}</strong>
                  <p>
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.pin}
                    <br />
                    {address.phone}
                  </p>
                </div>
              ))
            )}
            <AddressForm />
          </section>
        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}
