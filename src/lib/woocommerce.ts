import { WCProduct, WCCategory, WCOrder, WCCreateOrder, WCCustomer, WCCreateCustomer } from "@/types/woocommerce";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

interface FetchParams {
  [key: string]: string | number | undefined;
}

async function wcFetch<T>(endpoint: string, params: FetchParams = {}, method = "GET", body?: unknown): Promise<T> {
  const url = new URL(`${BASE_URL}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const options: RequestInit = {
    method,
    next: { revalidate: 60 },
    headers: { "Content-Type": "application/json" },
  } as RequestInit;

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url.toString(), options);

  if (!res.ok) {
    throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Single-page fetch that also returns total count from WC headers
async function wcFetchPage(endpoint: string, params: FetchParams = {}): Promise<{ products: WCProduct[]; total: number }> {
  const url = new URL(`${BASE_URL}/wp-json/wc/v3/${endpoint}`);
  url.searchParams.set("consumer_key", CONSUMER_KEY);
  url.searchParams.set("consumer_secret", CONSUMER_SECRET);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { "Content-Type": "application/json" },
  } as RequestInit);

  if (!res.ok) {
    throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}`);
  }

  const total = parseInt(res.headers.get("X-WP-Total") || "0", 10);
  const products: WCProduct[] = await res.json();
  return { products, total };
}

export interface GetProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
  orderby?: string;
  order?: string;
  featured?: boolean;
  status?: string;
}

export async function getProducts(params: GetProductsParams = {}): Promise<WCProduct[]> {
  // Fetch all pages of products
  const allProducts: WCProduct[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const batch = await wcFetch<WCProduct[]>("products", {
      page,
      per_page: perPage,
      search: params.search,
      category: params.category,
      orderby: params.orderby || "date",
      order: params.order || "desc",
      status: "publish",
    });
    allProducts.push(...batch);
    if (batch.length < perPage) break;
    page++;
  }

  return allProducts.filter(
    (p) => p.stock_status === "instock" &&
      !p.categories.every((c) => c.slug === "uncategorized")
  );
}

// Fetch a single page of products with total count (fast — single API call)
export async function getProductsPage(params: GetProductsParams & { page?: number; per_page?: number } = {}): Promise<{ products: WCProduct[]; total: number }> {
  const { products, total } = await wcFetchPage("products", {
    page: params.page || 1,
    per_page: params.per_page || 12,
    search: params.search,
    category: params.category,
    orderby: params.orderby || "date",
    order: params.order || "desc",
    status: "publish",
  });

  return {
    products: products.filter(
      (p) => p.stock_status === "instock" &&
        !p.categories.every((c) => c.slug === "uncategorized")
    ),
    total,
  };
}

export async function getProduct(slug: string): Promise<WCProduct | null> {
  const products = await wcFetch<WCProduct[]>("products", { slug });
  return products[0] || null;
}

export async function getProductById(id: number): Promise<WCProduct> {
  return wcFetch<WCProduct>(`products/${id}`);
}

export async function getCategories(): Promise<WCCategory[]> {
  return wcFetch<WCCategory[]>("products/categories", {
    per_page: 100,
    orderby: "count",
    order: "desc",
  });
}

export async function getCategoryBySlug(slug: string): Promise<WCCategory | null> {
  const categories = await wcFetch<WCCategory[]>("products/categories", { slug });
  return categories[0] || null;
}

export async function getSubcategoryIds(parentId: number): Promise<number[]> {
  const subs = await wcFetch<WCCategory[]>("products/categories", { parent: parentId, per_page: 100 });
  return subs.map((c) => c.id);
}

export async function createOrder(orderData: WCCreateOrder): Promise<WCOrder> {
  return wcFetch<WCOrder>("orders", {}, "POST", orderData);
}

export async function getRelatedProducts(productIds: number[]): Promise<WCProduct[]> {
  if (productIds.length === 0) return [];
  const ids = productIds.slice(0, 4);
  const products = await Promise.all(ids.map((id) => getProductById(id).catch(() => null)));
  return products.filter((p): p is WCProduct => p !== null);
}

// Customer functions
export async function getCustomer(id: number): Promise<WCCustomer> {
  return wcFetch<WCCustomer>(`customers/${id}`);
}

export async function createCustomer(data: WCCreateCustomer): Promise<WCCustomer> {
  return wcFetch<WCCustomer>("customers", {}, "POST", data);
}

export async function getCustomerOrders(customerId: number): Promise<WCOrder[]> {
  return wcFetch<WCOrder[]>("orders", { customer: customerId, per_page: 20 });
}

export async function verifyCustomerLogin(identifier: string, password: string): Promise<{ customer_id: number; email: string; first_name: string; last_name: string } | null> {
  const res = await fetch(`${BASE_URL}/wp-json/bg/v1/login`, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: identifier, password }),
  });
  if (!res.ok) return null;
  return res.json();
}
