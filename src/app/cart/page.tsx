import { CartView } from "@/components/CartView";

export const metadata = {
  title: "Your cart",
  description: "Review the pieces you are ordering through Butterfly.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="shell page-main">
      <header className="page-head">
        <p className="eyebrow">Bag</p>
        <h1 className="h1 mt-2">Your cart.</h1>
        <p className="lede mt-3">
          Only pieces sold through Butterfly live here. Buy-at-brand items open the brand&apos;s own
          checkout, clearly labelled.
        </p>
      </header>
      <CartView />
      <div className="h-16" />
    </div>
  );
}
