import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { CreditCard, Heart, Shield, Truck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderSummary() {
  const { cart } = useCart();
  const { settings: storeSettings } = useSettings();

  const shippingRateNear = Number(storeSettings?.shippingRateNear ?? 250);
  const shippingRateFar = Number(storeSettings?.shippingRateFar ?? 500);
  const shippingRateMoreFar = Number(storeSettings?.shippingRateMoreFar ?? 700);
  const freeCity = storeSettings?.freeShippingCity || "Peshawar";

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // In cart preview, estimated shipping starts from Near rate
  const estimatedShipping = cart.length === 0 ? 0 : shippingRateNear;
  const taxRate = Number(storeSettings?.taxRate ?? 0);
  const tax = taxRate > 0 ? (subtotal * taxRate) / 100 : 0;
  const total = subtotal + estimatedShipping + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Summary</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} items)
            </span>
            <span className="font-semibold text-foreground">Rs. {Number(subtotal).toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Est. Shipping</span>
            <span className="font-medium">
              {estimatedShipping === 0 ? (
                <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  FREE Delivery
                </Badge>
              ) : (
                <span className="font-semibold text-foreground">From Rs. {estimatedShipping}</span>
              )}
            </span>
          </div>

          {taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Tax ({taxRate}%)</span>
              <span className="font-semibold text-foreground">Rs. {tax.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between items-baseline">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-xl font-black text-primary">
              Rs. {Number(total).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Shipping Offer Badge */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                FREE delivery to {freeCity}!
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-100/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold border-emerald-300">
              Rs. 0
            </Badge>
          </div>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
            {`Distance delivery: Near: Rs. ${shippingRateNear} • Punjab: Rs. ${shippingRateFar} • Sindh/Balochistan: Rs. ${shippingRateMoreFar}`}
          </p>
        </div>

        <Button
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold py-5 shadow-sm cursor-pointer"
          asChild
        >
          <Link to="/checkout" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Proceed to Checkout
          </Link>
        </Button>

        <div className="space-y-2.5 pt-3 border-t border-border">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>256-Bit SSL encrypted checkout</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-blue-500" />
            <span>Reliable courier tracking across Pakistan</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Heart className="h-3.5 w-3.5 text-rose-500" />
            <span>Customer support helpline &amp; WhatsApp</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
