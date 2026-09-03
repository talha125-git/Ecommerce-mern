import React, { useState } from "react";
import {
  Package,
  Calendar,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OrdersTab({ orders, loading, fetchUserOrders, setActiveTab }) {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const statusTabs = [
    { id: "All",        label: "All",        icon: Package,      color: "slate"   },
    { id: "Pending",    label: "Pending",    icon: Clock,        color: "purple"  },
    { id: "Processing", label: "Processing", icon: RefreshCw,    color: "amber"   },
    { id: "Shipped",    label: "Shipped",    icon: Truck,        color: "blue"    },
    { id: "Delivered",  label: "Delivered",  icon: CheckCircle2, color: "emerald" },
    { id: "Cancelled",  label: "Cancelled",  icon: XCircle,      color: "rose"    },
  ];

  const colorMap = {
    slate:   { tab: "bg-slate-900 text-white",          badge: "bg-slate-100 text-slate-700 border-slate-200",  bar: "bg-slate-900",   dot: "bg-slate-500",   glow: "shadow-slate-200"   },
    purple:  { tab: "bg-purple-600 text-white",         badge: "bg-purple-50 text-purple-700 border-purple-200", bar: "bg-purple-500",  dot: "bg-purple-400",  glow: "shadow-purple-100"  },
    amber:   { tab: "bg-amber-500 text-white",          badge: "bg-amber-50 text-amber-700 border-amber-200",   bar: "bg-amber-400",   dot: "bg-amber-400",   glow: "shadow-amber-100"   },
    blue:    { tab: "bg-blue-600 text-white",           badge: "bg-blue-50 text-blue-700 border-blue-200",      bar: "bg-blue-500",    dot: "bg-blue-400",    glow: "shadow-blue-100"    },
    emerald: { tab: "bg-emerald-600 text-white",        badge: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-400", glow: "shadow-emerald-100" },
    rose:    { tab: "bg-rose-600 text-white",           badge: "bg-rose-50 text-rose-700 border-rose-200",      bar: "bg-rose-500",    dot: "bg-rose-400",    glow: "shadow-rose-100"    },
  };

  const getStatusMeta = (status) => {
    const s = statusTabs.find((t) => t.id === status);
    return s || statusTabs[1]; // default Pending
  };

  const getCount = (statusId) => {
    if (!orders || !Array.isArray(orders)) return 0;
    if (statusId === "All") return orders.length;
    return orders.filter((o) => (o.status || "Pending") === statusId).length;
  };

  const filteredOrders = (orders || []).filter((ord) => {
    if (selectedStatus === "All") return true;
    return (ord.status || "Pending") === selectedStatus;
  });

  const StatusBadge = ({ status }) => {
    const meta = getStatusMeta(status || "Pending");
    const colors = colorMap[meta.color];
    const Icon = meta.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${colors.badge}`}>
        <Icon className={`w-3 h-3 ${status === "Processing" ? "animate-spin" : ""}`} />
        {status || "Pending"}
      </span>
    );
  };

  const StatusBar = ({ status }) => {
    const steps = ["Pending", "Processing", "Shipped", "Delivered"];
    if (status === "Cancelled") {
      return (
        <div className="flex items-center gap-2 text-[11px] text-rose-500 font-semibold">
          <XCircle className="w-3.5 h-3.5" />
          This order was cancelled
        </div>
      );
    }
    const currentIdx = steps.indexOf(status);
    return (
      <div className="flex items-center gap-0">
        {steps.map((step, idx) => {
          const done = idx <= currentIdx;
          const meta = getStatusMeta(step);
          const colors = colorMap[meta.color];
          const Icon = meta.icon;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${done ? `${colors.bar} border-transparent` : "bg-white border-gray-200"}`}>
                  <Icon className={`w-3 h-3 ${done ? "text-white" : "text-gray-300"}`} />
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap ${done ? "text-gray-700" : "text-gray-300"}`}>{step}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 w-8 mb-3 mx-0.5 rounded-full transition-all ${idx < currentIdx ? colors.bar : "bg-gray-150"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </span>
            My Orders
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 ml-10">Live delivery tracking & order history</p>
        </div>
        <button
          onClick={fetchUserOrders}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Status Filter Chips ── */}
      {orders && orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const count = getCount(tab.id);
            const isActive = selectedStatus === tab.id;
            const colors = colorMap[tab.color];
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? `${colors.tab} border-transparent shadow-sm`
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className={`w-3 h-3 ${tab.id === "Processing" && isActive ? "animate-spin" : ""}`} />
                {tab.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── States ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="text-xs font-semibold text-gray-400">Fetching your orders...</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-gray-300" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-sm">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Complete checkout to see your order tracking here in real time.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition"
          >
            Browse Store <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-gray-100 rounded-3xl">
          <Clock className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-bold text-gray-900">No "{selectedStatus}" orders</p>
          <button onClick={() => setSelectedStatus("All")} className="text-xs text-primary font-bold hover:underline cursor-pointer">
            View all {orders.length} orders →
          </button>
        </div>
      ) : (

        /* ── Order Cards ── */
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const orderMongoId = ord._id || ord.orderId;
            const orderCode = ord.orderId || (ord._id ? `ORD-${ord._id.substring(0, 8).toUpperCase()}` : "ORD");
            const dateStr = ord.createdAt
              ? new Date(ord.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : ord.date || "Recent";
            const isExpanded = expandedId === orderMongoId;
            const totalAmt = Number(ord.totalAmount || (ord.total ? parseFloat(ord.total.replace(/[^0-9.]/g, "")) : 0));
            const status = ord.status || "Pending";
            const meta = getStatusMeta(status);
            const colors = colorMap[meta.color];

            return (
              <div
                key={orderMongoId}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md ${isExpanded ? "border-gray-200 shadow-sm" : "border-gray-100 hover:border-gray-200"}`}
              >
                {/* ── Coloured top accent bar ── */}
                <div className={`h-1 w-full ${colors.bar}`} />

                {/* ── Card Main Row ── */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">

                    {/* Left: ID + Date */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-[13px] text-gray-900 tracking-tight">{orderCode}</span>
                        <StatusBadge status={status} />
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                        <span className="mx-1">·</span>
                        <CreditCard className="w-3 h-3" />
                        <span className="capitalize">{ord.paymentMethod || "Card"}</span>
                      </div>
                    </div>

                    {/* Right: Price + expand */}
                    <div className="flex items-center gap-3 ml-auto">
                      {/* Item thumbnails */}
                      {ord.items && Array.isArray(ord.items) && ord.items.length > 0 && (
                        <div className="flex -space-x-2">
                          {ord.items.slice(0, 3).map((it, idx) => (
                            <img
                              key={idx}
                              src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                              alt={it.name}
                              title={it.name}
                              className="w-8 h-8 rounded-lg object-cover border-2 border-white shadow-xs"
                            />
                          ))}
                          {ord.items.length > 3 && (
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-gray-500 shadow-xs">
                              +{ord.items.length - 3}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-right">
                        <p className="text-[11px] text-gray-400 font-medium">Total</p>
                        <p className="font-extrabold text-gray-900 text-sm">${totalAmt.toFixed(2)}</p>
                      </div>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : orderMongoId)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${isExpanded ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* ── Progress tracker ── */}
                  <div className="mt-4 pt-3.5 border-t border-gray-50">
                    <StatusBar status={status} />
                  </div>
                </div>

                {/* ── Expanded Drawer ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">

                    {/* Shipping + Items grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                      {/* Shipping card */}
                      <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-500" /> Shipping Address
                        </p>
                        <p className="font-bold text-gray-900 text-xs">{ord.customer?.fullName || "Customer"}</p>
                        {ord.customer?.address && (
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            {ord.customer.address}<br />{ord.customer.city}{ord.customer.country ? `, ${ord.customer.country}` : ""}
                          </p>
                        )}
                      </div>

                      {/* Items list */}
                      <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-2">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                          <Package className="w-3 h-3 text-primary" /> Items Ordered
                        </p>
                        <div className="space-y-2 max-h-36 overflow-y-auto">
                          {ord.items && Array.isArray(ord.items) ? (
                            ord.items.map((it, idx) => (
                              <div key={idx} className="flex items-center gap-2.5">
                                <img
                                  src={it.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                                  alt={it.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 truncate">{it.name}</p>
                                  <p className="text-[10px] text-gray-400">Qty {it.quantity} × ${it.price}</p>
                                </div>
                                <p className="text-xs font-extrabold text-gray-900 shrink-0">
                                  ${(it.quantity * it.price).toFixed(2)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">No item details available</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Total footer */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Order confirmed · Payment via <strong className="text-gray-600 capitalize">{ord.paymentMethod || "Card"}</strong></span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block">Order Total</span>
                        <span className="text-base font-extrabold text-gray-900">${totalAmt.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
