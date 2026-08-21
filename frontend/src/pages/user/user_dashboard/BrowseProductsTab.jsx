import React from "react";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowseProductsTab({ productsList, wishlist, handleToggleWishlist, addToCart }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Browse Store Products</h2>
        <p className="text-xs text-gray-500">Explore items and add them directly to your cart or wishlist</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productsList.map((prod) => {
          const isWishlisted = wishlist.some((w) => w.id === prod.id);
          return (
            <div
              key={prod.id}
              className="border border-gray-200 rounded-2xl p-4 flex gap-4 items-center shadow-2xs hover:shadow-xs transition"
            >
              <img
                src={prod.image}
                alt={prod.name}
                className="w-20 h-20 object-cover rounded-xl shrink-0"
              />
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                  {prod.cat}
                </span>
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{prod.name}</h3>
                <p className="text-sm font-black text-gray-900">${prod.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    onClick={() =>
                      addToCart({
                        id: prod.id,
                        name: prod.name,
                        price: prod.price,
                        image: prod.image,
                        quantity: 1,
                      })
                    }
                    size="sm"
                    className="text-xs rounded-xl h-8 px-3"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
                  </Button>
                  <button
                    onClick={() => handleToggleWishlist(prod)}
                    className={`p-2 rounded-xl border text-xs transition ${
                      isWishlisted
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "border-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-600" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
