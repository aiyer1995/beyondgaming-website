import { WCProduct, WCCategory, WCOrder, WCCreateOrder, WCCustomer, WCCreateCustomer } from "@/types/woocommerce";
import { getCached } from "./cache";

const BASE_URL = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL!;
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!;

const CACHE_TTL = {
  master: 300,       // 5 min — single master product list
  categories: 600,   // 10 min
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
    const text = await res.text().catch(() => "");
    throw new Error(`WooCommerce API error: ${res.status} ${res.statusText}${text ? ` - ${text.slice(0, 200)}` : ""}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`WooCommerce returned invalid JSON: ${text.slice(0, 200)}`);
  }
}

// ─── Master product list (single source of truth) ───

async function fetchAllProducts(): Promise<WCProduct[]> {
  return getCached("master:products", async () => {
    const allProducts: WCProduct[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const batch = await wcFetch<WCProduct[]>("products", {
        page,
        per_page: perPage,
        status: "publish",
        orderby: "date",
        order: "desc",
      });
      allProducts.push(...batch);
      if (batch.length < perPage) break;
      page++;
    }

    return allProducts;
  }, CACHE_TTL.master);
}

// Get all in-stock products, optionally filtered
function filterProducts(
  all: WCProduct[],
  opts: { category?: number; search?: string; orderby?: string; order?: string } = {}
): WCProduct[] {
  let products = all.filter(
    (p) => p.stock_status === "instock" &&
      !p.categories.every((c) => c.slug === "uncategorized")
  );

  if (opts.category) {
    products = products.filter((p) => p.categories.some((c) => c.id === opts.category));
  }

  if (opts.search) {
    const q = opts.search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.short_description.toLowerCase().includes(q)
    );
  }

  const orderby = opts.orderby || "date";
  const order = opts.order || "desc";

  products.sort((a, b) => {
    let cmp = 0;
    if (orderby === "price") {
      cmp = parseFloat(a.price) - parseFloat(b.price);
    } else if (orderby === "popularity") {
      cmp = a.total_sales - b.total_sales;
    } else {
      cmp = new Date(a.date_created).getTime() - new Date(b.date_created).getTime();
    }
    return order === "asc" ? cmp : -cmp;
  });

  return products;
}

// ─── Public API ───

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
  const all = await fetchAllProducts();
  return filterProducts(all, params);
}

export async function getProduct(slug: string): Promise<WCProduct | null> {
  const all = await fetchAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: number): Promise<WCProduct> {
  const all = await fetchAllProducts();
  const product = all.find((p) => p.id === id);
  if (!product) throw new Error(`Product ${id} not found`);
  return product;
}

export async function getRelatedProducts(productIds: number[]): Promise<WCProduct[]> {
  if (productIds.length === 0) return [];
  const all = await fetchAllProducts();
  const ids = productIds.slice(0, 2);
  return ids
    .map((id) => all.find((p) => p.id === id))
    .filter((p): p is WCProduct => p !== null && p !== undefined);
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
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}

export async function getSubcategoryIds(parentId: number): Promise<number[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.parent === parentId).map((c) => c.id);
}

// ─── Write operations (never cached) ───

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
