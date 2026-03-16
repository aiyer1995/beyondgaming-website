export interface WCImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: WCImage | null;
  menu_order: number;
  count: number;
}

export interface WCProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders_allowed: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  categories: WCProductCategory[];
  tags: { id: number; name: string; slug: string }[];
  images: WCImage[];
  attributes: {
    id: number;
    name: string;
    options: string[];
  }[];
  variations: number[];
  related_ids: number[];
  price_html: string;
}

export interface WCOrderLineItem {
  product_id: number;
  quantity: number;
}

export interface WCOrderBilling {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WCOrderShipping {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WCCreateOrder {
  customer_id?: number;
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: WCOrderBilling;
  shipping: WCOrderShipping;
  line_items: WCOrderLineItem[];
  fee_lines?: WCFeeLine[];
  coupon_lines?: { code: string }[];
}

export interface WCOrder {
  id: number;
  status: string;
  total: string;
  shipping_total: string;
  currency: string;
  date_created: string;
  order_key: string;
  payment_url: string;
  billing: WCOrderBilling;
  shipping_lines: { id: number; method_title: string; total: string }[];
  line_items: {
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
    image?: { src: string };
  }[];
}

export interface WCCustomer {
  id: number;
  date_created: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WCOrderBilling;
  shipping: WCOrderShipping;
  avatar_url: string;
}

export interface WCCreateCustomer {
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  password: string;
}

export interface CartAddOn {
  name: string;
  price: number;
}

export interface CartItem {
  product: WCProduct;
  quantity: number;
  addOns?: CartAddOn[];
}

export interface WCFeeLine {
  name: string;
  total: string;
}
