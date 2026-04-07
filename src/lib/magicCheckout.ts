import crypto from "crypto";
import Razorpay from "razorpay";
import { createOrder } from "@/lib/woocommerce";
import type { WCOrder, WCCreateOrder } from "@/types/woocommerce";

/* eslint-disable @typescript-eslint/no-explicit-any */

// In-process idempotency map. Survives within a single Next.js worker but is
// lost on restart and not shared across instances. Good enough for local
// testing and single-instance deploys; for multi-instance prod use Redis with
// the same payment_id key.
const paymentToWcOrder = new Map<string, number>();

export interface MagicAddress {
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export const razorpayClient = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");
  return expected === razorpay_signature;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export function parseCartSnapshot(
  cart: string | undefined
): { product_id: number; quantity: number }[] {
  if (!cart) return [];
  return cart
    .split(",")
    .map((entry) => {
      const [id, qty] = entry.split(":");
      return { product_id: Number(id), quantity: Number(qty) };
    })
    .filter((it) => it.product_id > 0 && it.quantity > 0);
}

export interface CreateMagicWcOrderParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  cartItems: { product_id: number; quantity: number }[];
  address: MagicAddress;
  shippingPaise: number;
}

/**
 * Idempotently create a WooCommerce order for a successful Magic Checkout
 * payment. Safe to call multiple times with the same payment_id (callback +
 * webhook safety net).
 */
export async function createMagicWcOrder(
  params: CreateMagicWcOrderParams
): Promise<WCOrder | { existingOrderId: number }> {
  const existing = paymentToWcOrder.get(params.razorpay_payment_id);
  if (existing) {
    return { existingOrderId: existing };
  }

  const shippingTotal = (params.shippingPaise / 100).toFixed(2);

  // WC REST API accepts more fields (transaction_id, status, meta_data,
  // shipping_lines) than the local WCCreateOrder type declares — runtime is
  // forwarding the JSON as-is, so any cast is safe here.
  const orderPayload: any = {
    payment_method: "razorpay",
    payment_method_title: "Razorpay Magic Checkout",
    set_paid: true,
    status: "processing",
    transaction_id: params.razorpay_payment_id,
    billing: {
      first_name: params.address.first_name,
      last_name: params.address.last_name,
      address_1: params.address.address_1,
      address_2: params.address.address_2,
      city: params.address.city,
      state: params.address.state,
      postcode: params.address.postcode,
      country: params.address.country || "IN",
      email: params.address.email,
      phone: params.address.contact,
    },
    shipping: {
      first_name: params.address.first_name,
      last_name: params.address.last_name,
      address_1: params.address.address_1,
      address_2: params.address.address_2,
      city: params.address.city,
      state: params.address.state,
      postcode: params.address.postcode,
      country: params.address.country || "IN",
    },
    line_items: params.cartItems.map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
    })),
    shipping_lines: [
      {
        method_id: "flat_rate",
        method_title: "Shipping",
        total: shippingTotal,
      },
    ],
    meta_data: [
      { key: "_razorpay_payment_id", value: params.razorpay_payment_id },
      { key: "_razorpay_order_id", value: params.razorpay_order_id },
      { key: "_checkout_flow", value: "magic_v1" },
    ],
  };

  const order = await createOrder(orderPayload as WCCreateOrder);
  paymentToWcOrder.set(params.razorpay_payment_id, order.id);
  return order;
}

export function getRecordedWcOrderId(payment_id: string): number | undefined {
  return paymentToWcOrder.get(payment_id);
}
