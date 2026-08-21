import React from "react";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartTab({ cart, updateQuantity, removeFromCart, cartSubtotal, setActiveTab }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
        <p className="text-xs text-gray-500">Review selected items before checkout</p>
      </div>

      {!cart || cart.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Your shopping cart is empty</p>
          <Button onClick={() => setActiveTab("products")} variant="outline" size="sm" className="rounded-xl">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">${item.price} each</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-xs text-gray-900 w-16 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Subtotal</p>
              <p className="text-xl font-black text-gray-900">${cartSubtotal.toFixed(2)}</p>
            </div>
            <Button onClick={() => setActiveTab("checkout")} className="rounded-xl text-xs gap-1.5">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
