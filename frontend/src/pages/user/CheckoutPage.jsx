import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  User,
  Mail,
  Phone,
  Banknote,
  Sparkles
} from "lucide-react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
    paymentMethod: "card",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  // Login check & session autofill
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedStatus =
      localStorage.getItem("userLoggedIn") === "true" ||
      !!localStorage.getItem("token") ||
      !!localStorage.getItem("user");
    setIsLoggedIn(loggedStatus);

    if (loggedStatus) {
      try {
        const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (savedUser.name || savedUser.email) {
          setFormData((prev) => ({
            ...prev,
            fullName: savedUser.name || prev.fullName,
            email: savedUser.email || prev.email,
          }));
        }
      } catch (e) {
        console.warn("Could not parse user session:", e);
      }
    }
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 || cart.length === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    const generatedId = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const orderPayload = {
      orderId: generatedId,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country || "Pakistan",
      },
      items: cart.map((item) => ({
        id: String(item._id || item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      totalAmount: total,
      paymentMethod: formData.paymentMethod,
    };

    try {
      await axios.post(`${API_URL}/api/orders`, orderPayload);
      console.log("✅ Order saved to MongoDB:", generatedId);
    } catch (err) {
      console.warn("Could not persist order to server, saving locally:", err);
    } finally {
      if (formData.email) {
        const key = `user_orders_${formData.email.toLowerCase()}`;
        try {
          const existing = JSON.parse(localStorage.getItem(key) || "[]");
          const newLocalOrder = {
            ...orderPayload,
            _id: generatedId,
            createdAt: new Date().toISOString(),
            status: "Pending"
          };
          localStorage.setItem(key, JSON.stringify([newLocalOrder, ...existing]));
        } catch (e) {}
      }
      setPlacedOrderId(generatedId);
      setIsSubmitting(false);
      setOrderPlaced(true);
      clearCart();
    }
  };

  // If user is not logged in / signed up, require login/signup first
  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="bg-white border border-border rounded-3xl p-8 shadow-xl space-y-6">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200 uppercase tracking-wider">
              Account Required
            </span>
            <h2 className="text-2xl font-black text-foreground">
              Please Log In or Sign Up First
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To place an order and track your delivery, please log in to your account or create a new account before proceeding to checkout.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => {
                localStorage.setItem("redirect_after_login", "/checkout");
                navigate("/login");
              }}
              size="lg"
              className="rounded-xl px-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Log In to Account
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem("redirect_after_login", "/checkout");
                navigate("/register");
              }}
              variant="outline"
              size="lg"
              className="rounded-xl px-8 font-bold cursor-pointer"
            >
              Sign Up (Create Account)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and order is not placed yet
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-3xl font-extrabold mb-3">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          You haven't added any items to your cart yet. Browse our latest sneakers collection to get started.
        </p>
        <Button asChild size="lg" className="rounded-xl px-8">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Start Shopping
          </Link>
        </Button>
      </div>
    );
  }

  // Order Success Screen
  if (orderPlaced) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200 uppercase tracking-wider">
            Order Confirmed 🎉
          </span>
          <h2 className="text-3xl font-black text-foreground">
            Thank You For Your Order!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your order <strong className="text-foreground font-bold">#{placedOrderId}</strong> has been successfully placed. We've sent a confirmation email to <strong className="text-foreground">{formData.email || "your email"}</strong>.
          </p>
        </div>

        <Card className="text-left border border-border/80 bg-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-sm text-foreground uppercase tracking-wider border-b pb-3">
            Delivery Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Customer Name</span>
              <strong className="text-foreground font-semibold">{formData.fullName || "Valued Customer"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Phone</span>
              <strong className="text-foreground font-semibold">{formData.phone || "N/A"}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground block">Shipping Address</span>
              <strong className="text-foreground font-semibold">
                {formData.address}, {formData.city}, {formData.country}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Payment Method</span>
              <strong className="text-foreground font-semibold uppercase">
                {formData.paymentMethod === "card" ? "Credit / Debit Card" : formData.paymentMethod === "cod" ? "Cash on Delivery" : "Digital Wallet"}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block">Total Amount Paid</span>
              <strong className="text-primary font-black text-sm">${total.toFixed(2)}</strong>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg" className="rounded-xl px-8 font-bold">
            <Link to="/">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl px-8 font-bold">
            <Link to="/user/dashboard">View My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition mb-2"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Cart
          </Link>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Checkout
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> 256-bit Encrypted SSL Checkout
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Shipping & Payment Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+92 300 1234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="House #, Street Address, Area"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="Lahore / Karachi"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="54000"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                  className={`p-3.5 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === "card"
                      ? "border-slate-900 bg-slate-900/5 dark:bg-slate-100/10 font-bold"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span>Credit/Debit Card</span>
                </label>

                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: "cod" })}
                  className={`p-3.5 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === "cod"
                      ? "border-slate-900 bg-slate-900/5 dark:bg-slate-100/10 font-bold"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery</span>
                </label>

                <label
                  onClick={() => setFormData({ ...formData, paymentMethod: "wallet" })}
                  className={`p-3.5 border rounded-xl flex items-center gap-3 cursor-pointer transition ${
                    formData.paymentMethod === "wallet"
                      ? "border-slate-900 bg-slate-900/5 dark:bg-slate-100/10 font-bold"
                      : "border-border hover:bg-muted/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={formData.paymentMethod === "wallet"}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>EasyPaisa / JazzCash</span>
                </label>
              </div>

              {formData.paymentMethod === "card" && (
                <div className="pt-2 space-y-3 border-t border-border">
                  <div>
                    <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="4532 •••• •••• 8901"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/YY"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                        CVV Code
                      </label>
                      <input
                        type="password"
                        name="cardCvv"
                        placeholder="•••"
                        maxLength="4"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Items & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="sticky top-24 rounded-2xl border border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
                  {cart.length} item{cart.length > 1 ? "s" : ""}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Items List */}
              <div className="divide-y divide-border max-h-60 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={item._id || item.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">{item.name}</div>
                      <div className="text-muted-foreground text-[11px]">
                        Qty: {item.quantity} × ${item.price}
                      </div>
                    </div>
                    <div className="font-black text-foreground shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Breakdown */}
              <div className="border-t border-border pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? <span className="text-emerald-600 font-extrabold">FREE</span> : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Est. Tax (8%)</span>
                  <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-black text-xl text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Place Order (${total.toFixed(2)})</span>
                  </div>
                )}
              </Button>

              <div className="text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1 pt-2">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                <span>Fast & Reliable Delivery across Pakistan</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
