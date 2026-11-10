import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { getDb, updateDb } from "@/lib/db";
import { brandById, productById } from "@/lib/catalog";
import { createPaymentIntent } from "@/lib/payments";
import { orderCode } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/types";

interface IncomingItem {
  productId?: string;
  size?: string;
  colour?: string;
  qty?: number;
  customDesignId?: string;
}

interface Body {
  items?: IncomingItem[];
  name?: string;
  email?: string;
  address?: Record<string, string>;
  paymentMethod?: "upi" | "card" | "cod";
  acceptedTerms?: boolean;
}

export async function POST(request: Request) {
  const user = await sessionUser();
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? user?.name ?? "").trim().slice(0, 80);
  const email = (body.email ?? user?.email ?? "").trim().toLowerCase().slice(0, 160);
  if (name.length < 2) return NextResponse.json({ error: "Enter the recipient name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!body.acceptedTerms) {
    return NextResponse.json({ error: "Please accept the terms and privacy notice." }, { status: 400 });
  }

  const address = body.address ?? {};
  const cleanedAddress = {
    label: "Delivery",
    line1: (address.line1 ?? "").trim().slice(0, 160),
    line2: (address.line2 ?? "").trim().slice(0, 160) || undefined,
    city: (address.city ?? "").trim().slice(0, 80),
    state: (address.state ?? "").trim().slice(0, 80),
    pin: (address.pin ?? "").trim().slice(0, 10),
    phone: (address.phone ?? "").trim().slice(0, 20),
  };
  if (!cleanedAddress.line1 || !cleanedAddress.city || !cleanedAddress.state) {
    return NextResponse.json({ error: "Complete the delivery address." }, { status: 400 });
  }
  if (!/^\d{6}$/.test(cleanedAddress.pin)) {
    return NextResponse.json({ error: "Enter a 6-digit PIN code." }, { status: 400 });
  }
  if (!/^[+\d][\d\s-]{7,}$/.test(cleanedAddress.phone)) {
    return NextResponse.json({ error: "Enter a contact phone number." }, { status: 400 });
  }

  const incoming = Array.isArray(body.items) ? body.items : [];
  if (!incoming.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  if (incoming.length > 25) return NextResponse.json({ error: "Too many items." }, { status: 400 });

  const db = getDb();
  const items: OrderItem[] = [];

  for (const raw of incoming) {
    const product = raw.productId ? productById(raw.productId) : null;
    if (!product || product.status !== "approved") {
      return NextResponse.json({ error: "A piece in your cart is no longer available." }, { status: 409 });
    }
    const brand = brandById(product.brandId);
    if (!brand || brand.fulfilment !== "order-via-butterfly") {
      return NextResponse.json(
        { error: `${product.name} is sold at the brand. Please buy it there.` },
        { status: 409 },
      );
    }
    if (!product.sizes.includes(raw.size ?? "")) {
      return NextResponse.json({ error: `Choose a valid size for ${product.name}.` }, { status: 400 });
    }
    const colour = product.colours.find((option) => option.name === raw.colour);
    if (!colour) {
      return NextResponse.json({ error: `Choose a valid colour for ${product.name}.` }, { status: 400 });
    }
    const qty = Math.max(1, Math.min(Number(raw.qty) || 1, 10));

    let unitPrice = product.priceINR;
    let customDesignId: string | undefined;
    let customSummary: string | undefined;
    if (raw.customDesignId) {
      const design = db.designs.find((entry) => entry.id === raw.customDesignId);
      if (!design || design.garmentProductId !== product.id || design.status === "rejected") {
        return NextResponse.json({ error: "The custom design is no longer valid." }, { status: 409 });
      }
      unitPrice = design.price;
      customDesignId = design.id;
      customSummary = `${design.colour} · "${design.text || "artwork only"}" · Butterfly Original`;
    }

    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandId: product.brandId,
      brandName: brand.name,
      fabric: product.fabric,
      composition: product.composition,
      size: raw.size ?? "",
      colour: colour.name,
      qty,
      unitPrice,
      fulfilment: "order-via-butterfly",
      customDesignId,
      customSummary,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const shipping = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + shipping;
  const code = orderCode();
  const method = (["upi", "card", "cod"] as const).includes(body.paymentMethod ?? "upi")
    ? (body.paymentMethod ?? "upi")
    : "upi";

  let payment;
  try {
    payment = await createPaymentIntent({ amount: total, method, code, email });
  } catch {
    return NextResponse.json(
      { error: "The payment gateway could not start this order. Nothing was charged; please retry." },
      { status: 502 },
    );
  }

  const now = new Date();
  const order: Order = {
    code,
    userId: user?.id ?? null,
    email,
    name,
    items,
    subtotal,
    shipping,
    total,
    address: cleanedAddress,
    payment: {
      method,
      status: payment.status,
      providerRef: payment.providerRef,
      mode: payment.mode,
    },
    status: payment.status === "paid" ? "confirmed" : "placed",
    timeline: [
      { at: now.toISOString(), label: "Order placed" },
      ...(payment.status === "paid"
        ? [{ at: now.toISOString(), label: `Payment confirmed (${payment.mode} mode)` }]
        : [{ at: now.toISOString(), label: payment.notice }]),
    ],
    createdAt: now.toISOString(),
  };

  updateDb((database) => {
    database.orders.push(order);
    if (user) {
      const target = database.users.find((candidate) => candidate.id === user.id);
      if (target && !target.addresses.some((entry) => entry.pin === cleanedAddress.pin && entry.line1 === cleanedAddress.line1)) {
        target.addresses.push(cleanedAddress);
      }
    }
  });

  return NextResponse.json({
    ok: true,
    code,
    paymentStatus: payment.status,
    paymentNotice: payment.notice,
    mode: payment.mode,
  });
}
