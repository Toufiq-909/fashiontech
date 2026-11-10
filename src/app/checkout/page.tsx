import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { sessionUser } from "@/lib/auth";

export const metadata = {
  title: "Checkout",
  description: "Guest or account checkout for pieces sold through Butterfly.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await sessionUser();
  const address = user?.addresses[0];
  const paymentMode = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_MODE === "live" ? "live" : "test";

  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/cart">Cart</Link>
          <span aria-hidden="true">/</span>
          <span>Checkout</span>
        </nav>
        <p className="eyebrow">Checkout</p>
        <h1 className="h1 mt-2">Almost yours.</h1>
        <p className="lede mt-3">
          {user
            ? `Signed in as ${user.name}. We will attach this order to your account.`
            : "No account needed. You can create one after ordering if you want the history."}
        </p>
      </header>

      <CheckoutForm
        signedIn={Boolean(user)}
        paymentMode={paymentMode}
        prefill={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: address?.phone ?? "",
          line1: address?.line1 ?? "",
          line2: address?.line2 ?? "",
          city: address?.city ?? "",
          state: address?.state ?? "",
          pin: address?.pin ?? "",
        }}
      />
      <div className="h-16" />
    </div>
  );
}
