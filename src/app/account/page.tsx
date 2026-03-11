"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { WCOrder } from "@/types/woocommerce";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  "on-hold": "bg-yellow-100 text-yellow-700",
  pending: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
  failed: "bg-red-100 text-red-700",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuthStore();
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WCOrder | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/account/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data.orders || []);
          setOrdersLoading(false);
        })
        .catch(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500 mb-2">
            My Account
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">
            Hey, {user.first_name}!
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-[#1a0030] rounded-3xl p-6 text-white relative overflow-hidden noise">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-[40px]" />
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-500 rounded-2xl flex items-center justify-center text-purple-900 text-2xl font-black mb-4">
              {user.first_name[0]}
            </div>
            <h3 className="text-lg font-bold">{user.first_name} {user.last_name}</h3>
            <p className="text-purple-300 text-sm mt-1">{user.email}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-3xl border border-purple-100/50 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Total Orders</h3>
          <p className="text-4xl font-black text-gray-900">{orders.length}</p>
        </div>

        <div className="bg-white rounded-3xl border border-purple-100/50 p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Quick Links</h3>
          <div className="space-y-2">
            <Link href="/shop" className="block text-sm text-purple-700 hover:text-purple-900 font-medium">
              Browse Shop
            </Link>
            <Link href="/cart" className="block text-sm text-purple-700 hover:text-purple-900 font-medium">
              View Cart
            </Link>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Order History</h2>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-purple-100/50 p-12 text-center">
            <svg className="w-16 h-16 text-purple-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-700 to-purple-800 text-white font-bold px-6 py-3 rounded-xl hover:from-purple-800 hover:to-purple-900 transition-all shadow-lg shadow-purple-700/20"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-purple-100/50 p-6 hover:shadow-lg hover:shadow-purple-100/30 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">#{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.date_created && (
                      <span className="text-sm text-gray-400">
                        {new Date(order.date_created).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    <span className="text-lg font-black text-purple-700">
                      {formatPrice(parseFloat(order.total))}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.line_items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} <span className="text-gray-400">x{item.quantity}</span>
                      </span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(parseFloat(item.total))}
                      </span>
                    </div>
                  ))}
                  {order.line_items.length > 3 && (
                    <p className="text-xs text-gray-400">+{order.line_items.length - 3} more items</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-purple-100/50 flex items-center justify-end">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors group"
                  >
                    View Order Details
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-3xl border-b border-purple-100/50 p-6 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-black text-gray-900">Order #{selectedOrder.id}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[selectedOrder.status] || "bg-gray-100 text-gray-600"}`}>
                    {selectedOrder.status}
                  </span>
                  {selectedOrder.date_created && (
                    <span className="text-xs text-gray-400">
                      {new Date(selectedOrder.date_created).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Items</h4>
              <div className="space-y-3">
                {selectedOrder.line_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0 ml-4">
                      {formatPrice(parseFloat(item.total))}
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              {selectedOrder.billing && (
                <div className="mt-6 pt-6 border-t border-purple-100/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Billing Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">
                      {selectedOrder.billing.first_name} {selectedOrder.billing.last_name}
                    </p>
                    {selectedOrder.billing.address_1 && <p>{selectedOrder.billing.address_1}</p>}
                    {selectedOrder.billing.address_2 && <p>{selectedOrder.billing.address_2}</p>}
                    <p>
                      {[selectedOrder.billing.city, selectedOrder.billing.state, selectedOrder.billing.postcode]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {selectedOrder.billing.phone && <p>Phone: {selectedOrder.billing.phone}</p>}
                    {selectedOrder.billing.email && <p>Email: {selectedOrder.billing.email}</p>}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-purple-100/50 flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-black text-purple-700">
                  {formatPrice(parseFloat(selectedOrder.total))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
