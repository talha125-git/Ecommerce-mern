import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CartTab({ cart, updateQuantity, removeFromCart, clearCart, cartSubtotal, setActiveTab }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <p className="text-xs text-gray-500">Review selected items stored permanently in your account</p>
        </div>
        {cart && cart.length > 0 && (
          <Button
            onClick={clearCart}
            variant="outline"
            size="sm"
            className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Cart
          </Button>
        )}
      </div>

      {!cart || cart.length === 0 ? (
        <div className="text-center py-12 space-y-3 border border-dashed border-gray-200 rounded-2xl">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Your shopping cart is empty</p>
          <Button onClick={() => setActiveTab("products")} variant="outline" size="sm" className="rounded-xl cursor-pointer">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl p-2 bg-white">
            {cart.map((item) => {
              const itemId = item._id || item.id;
              const unitPrice = Number(item.price || 0);
              const totalItemPrice = unitPrice * item.quantity;
              return (
                <div key={itemId} className="py-3 px-2 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-muted border border-gray-200">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover aspect-square" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                        No image
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">${unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto sm:ml-0">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden text-xs bg-gray-50">
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity - 1)}
                        className="px-2.5 py-1 hover:bg-gray-200 transition cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(itemId, item.quantity + 1)}
                        className="px-2.5 py-1 hover:bg-gray-200 transition cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-bold text-xs text-gray-900 w-16 text-right">
                      ${totalItemPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="text-gray-400 hover:text-rose-600 p-1 transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Subtotal</p>
              <p className="text-2xl font-black text-gray-900">${cartSubtotal.toFixed(2)}</p>
              <p className="text-[11px] text-emerald-600 font-medium">★ Saved permanently in your account cart</p>
            </div>
            <Button onClick={() => navigate("/checkout")} className="rounded-xl text-xs gap-1.5 font-bold cursor-pointer w-full sm:w-auto">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

