import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateDb } from "@/lib/db";

/**
 * Small admin mutation endpoint. Every branch re-checks the admin session; the
 * client never supplies prices, statuses or brand ownership.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const type = String(body.type ?? "");
  const now = new Date().toISOString();

  try {
    updateDb((db) => {
      switch (type) {
        case "product": {
          const product = db.products.find((entry) => entry.id === body.productId);
          if (!product) throw new Error("Product not found.");
          const action = String(body.action);
          if (action === "approve") product.status = "approved";
          else if (action === "reject") product.status = "rejected";
          else if (action === "feature") product.butterflyPick = Boolean(body.value);
          else throw new Error("Unknown product action.");
          break;
        }
        case "order": {
          const order = db.orders.find((entry) => entry.code === body.code);
          if (!order) throw new Error("Order not found.");
          const action = String(body.action);
          if (action === "forward") {
            order.status = "forwarded";
            order.timeline.push({ at: now, label: "Forwarded to partner brand for fulfilment" });
          } else if (action === "ship") {
            order.status = "shipped";
            order.timeline.push({ at: now, label: "Shipped by the brand" });
          } else if (action === "deliver") {
            order.status = "delivered";
            order.timeline.push({ at: now, label: "Delivered" });
          } else if (action === "cancel") {
            order.status = "cancelled";
            order.timeline.push({ at: now, label: "Cancelled by Butterfly" });
          } else if (action === "paid") {
            order.payment.status = "paid";
            order.timeline.push({ at: now, label: "Payment marked received" });
          } else {
            throw new Error("Unknown order action.");
          }
          break;
        }
        case "feedback": {
          const item = db.feedback.find((entry) => entry.id === body.id);
          if (!item) throw new Error("Feedback not found.");
          item.featured = Boolean(body.value);
          break;
        }
        case "review": {
          const review = db.reviews.find((entry) => entry.id === body.reviewId);
          if (!review) throw new Error("Review not found.");
          review.featured = Boolean(body.value);
          break;
        }
        case "feed": {
          const feed = db.feeds.find((entry) => entry.id === body.feedId);
          if (!feed) throw new Error("Feed not found.");
          if (body.enabled !== undefined) feed.enabled = Boolean(body.enabled);
          if (body.run) {
            if (feed.adapter === "api" && feed.credentialEnvVars.some((name) => !process.env[name])) {
              throw new Error("Brand API credentials are not configured for this feed.");
            }
            feed.lastRunAt = now;
          }
          break;
        }
        case "brand": {
          const brand = db.brands.find((entry) => entry.id === body.brandId);
          if (!brand) throw new Error("Brand not found.");
          if (body.fulfilment === "buy-at-brand" || body.fulfilment === "order-via-butterfly") {
            brand.fulfilment = body.fulfilment;
          }
          if (body.featured !== undefined) brand.featured = Boolean(body.featured);
          if (typeof body.termsNote === "string") brand.termsNote = body.termsNote.slice(0, 600);
          break;
        }
        case "design": {
          const design = db.designs.find((entry) => entry.id === body.designId);
          if (!design) throw new Error("Design not found.");
          const status = String(body.status);
          if (status === "approved" || status === "rejected" || status === "pending-review") {
            design.status = status;
          }
          design.moderationNote = String(body.note ?? design.moderationNote).slice(0, 400);
          break;
        }
        case "settings": {
          const tiers = body.tiers as Record<string, { min?: number; max?: number }> | undefined;
          if (!tiers) throw new Error("No tiers supplied.");
          for (const key of ["luxury-comfort", "everyday-value"] as const) {
            const incoming = tiers[key];
            if (!incoming) continue;
            const min = Math.max(0, Math.round(Number(incoming.min)));
            const max = Math.max(min, Math.round(Number(incoming.max)));
            db.settings.tiers[key].min = min;
            db.settings.tiers[key].max = max;
          }
          break;
        }
        default:
          throw new Error("Unknown admin action.");
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action failed." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
