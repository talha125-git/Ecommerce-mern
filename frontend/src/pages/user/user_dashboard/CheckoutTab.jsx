import React from "react";
import { Button } from "@/components/ui/button";

export default function CheckoutTab({ profileData, cartSubtotal }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
        <p className="text-xs text-gray-500">Complete your order details</p>
      </div>

      <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500">Shipping Address</h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
            <input type="text" defaultValue={profileData.name} className="w-full px-3 py-2 border rounded-xl" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Shipping Address</label>
            <input type="text" defaultValue={profileData.address} className="w-full px-3 py-2 border rounded-xl" />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold">
          <span>Order Total:</span>
          <span>${cartSubtotal > 0 ? cartSubtotal.toFixed(2) : "64.99"}</span>
        </div>

        <Button onClick={() => alert("Order Placed Successfully!")} className="w-full rounded-xl text-xs font-bold py-2.5">
          Place Order Now
        </Button>
      </div>
    </div>
  );
}
