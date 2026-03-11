export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getStockLabel(
  status: string,
  quantity: number | null
): { text: string; color: string } {
  if (status === "outofstock") {
    return { text: "Out of Stock", color: "text-red-500" };
  }
  if (quantity !== null && quantity <= 5) {
    return { text: "Low Stock", color: "text-orange-500" };
  }
  return { text: "In Stock", color: "text-green-600" };
}
