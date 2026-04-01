import { WCProduct, WCCategory, WCOrder, WCCreateOrder, WCCustomer, WCCreateCustomer } from "@/types/woocommerce";
import { getCached } from "./cache";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

// Cache TTLs in seconds
const CACHE_TTL = {
  products: 300,     // 5 min
  product: 300,      // 5 min
  categories: 600,   // 10 min
  related: 300,      // 5 min
};

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
  const cacheKey = `products:all:${params.category || "all"}:${params.orderby || "date"}:${params.order || "desc"}:${params.search || ""}`;

  return getCached(cacheKey, async () => {
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
  }, CACHE_TTL.products);
}

// Fetch a single page of products with total count (fast — single API call)
export async function getProductsPage(params: GetProductsParams & { page?: number; per_page?: number } = {}): Promise<{ products: WCProduct[]; total: number }> {
  const cacheKey = `products:page:v2:${params.page || 1}:${params.per_page || 12}:${params.category || "all"}:${params.orderby || "date"}:${params.order || "desc"}:${params.search || ""}`;

  return getCached(cacheKey, async () => {
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
  }, CACHE_TTL.products);
}

export async function getProduct(slug: string): Promise<WCProduct | null> {
  return getCached(`product:slug:${slug}`, async () => {
    const products = await wcFetch<WCProduct[]>("products", { slug });
    return products[0] || null;
  }, CACHE_TTL.product);
}

export async function getProductById(id: number): Promise<WCProduct> {
  return getCached(`product:id:${id}`, async () => {
    return wcFetch<WCProduct>(`products/${id}`);
  }, CACHE_TTL.product);
}

export async function getCategories(): Promise<WCCategory[]> {
  return getCached("categories:all", async () => {
    return wcFetch<WCCategory[]>("products/categories", {
      per_page: 100,
      orderby: "count",
      order: "desc",
    });
  }, CACHE_TTL.categories);
}

export async function getCategoryBySlug(slug: string): Promise<WCCategory | null> {
  return getCached(`category:slug:${slug}`, async () => {
    const categories = await wcFetch<WCCategory[]>("products/categories", { slug });
    return categories[0] || null;
  }, CACHE_TTL.categories);
}

export async function getSubcategoryIds(parentId: number): Promise<number[]> {
  return getCached(`subcategories:${parentId}`, async () => {
    const subs = await wcFetch<WCCategory[]>("products/categories", { parent: parentId, per_page: 100 });
    return subs.map((c) => c.id);
  }, CACHE_TTL.categories);
}

export async function getRelatedProducts(productIds: number[]): Promise<WCProduct[]> {
  if (productIds.length === 0) return [];
  const ids = productIds.slice(0, 4);
  const cacheKey = `related:${ids.join(",")}`;
  return getCached(cacheKey, async () => {
    const products = await Promise.all(ids.map((id) => getProductById(id).catch(() => null)));
    return products.filter((p): p is WCProduct => p !== null);
  }, CACHE_TTL.related);
}

// --- Write operations (never cached) ---

export async function createOrder(orderData: WCCreateOrder): Promise<WCOrder> {
  return wcFetch<WCOrder>("orders", {}, "POST", orderData);
}

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
