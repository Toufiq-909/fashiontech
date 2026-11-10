import "server-only";

export interface PaymentIntent {
  provider: string;
  providerRef: string;
  status: "paid" | "pending";
  mode: "test" | "live";
  notice: string;
}

/**
 * Payment adapter. With no gateway keys, orders run in an explicitly labelled test
 * mode and no money is collected. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET to create
 * a Razorpay order reference server-side (amount in paise, INR). The checkout UI and
 * webhook verification are the next integration step documented in the README.
 */
export async function createPaymentIntent(input: {
  amount: number;
  method: "upi" | "card" | "cod";
  code: string;
  email: string;
}): Promise<PaymentIntent> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const live = process.env.RAZORPAY_MODE === "live";

  if (!keyId || !keySecret) {
    return {
      provider: "test",
      providerRef: `test_${input.code.toLowerCase()}`,
      status: input.method === "cod" ? "pending" : "paid",
      mode: "test",
      notice:
        "Test mode: no payment gateway keys are configured, so no money is collected. Add Razorpay keys for a live checkout.",
    };
  }

  if (input.method === "cod") {
    return {
      provider: "razorpay",
      providerRef: `cod_${input.code.toLowerCase()}`,
      status: "pending",
      mode: live ? "live" : "test",
      notice: "Cash on delivery: payment is collected at the door. No gateway charge is made now.",
    };
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      currency: "INR",
      receipt: input.code,
      notes: { email: input.email, brand: "Butterfly" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Razorpay order creation failed", response.status, detail.slice(0, 400));
    throw new Error("PAYMENT_GATEWAY_ERROR");
  }

  const payload = (await response.json()) as { id: string };
  return {
    provider: "razorpay",
    providerRef: payload.id,
    status: "pending",
    mode: live ? "live" : "test",
    notice:
      "Razorpay order created. Payment is pending until the Razorpay checkout and webhook are connected.",
  };
}
