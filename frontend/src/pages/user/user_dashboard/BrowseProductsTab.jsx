import React, { useState } from "react";
import { ShoppingCart, Heart, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BrowseProductsTab({ productsList, wishlist, handleToggleWishlist, addToCart, setActiveTab }) {
  const [addedIds, setAddedIds] = useState({});

  const handleAdd = (prod, prodId) => {
    addToCart({
      id: prodId,
      _id: prodId,
      name: prod.name,
      price: prod.price,
      image: prod.image,
      quantity: 1,
    });
    setAddedIds((prev) => ({ ...prev, [prodId]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prodId]: false }));
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Browse Store Products</h2>
        <p className="text-xs text-gray-500">Explore items and add them directly to your permanent dashboard cart</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productsList.map((prod) => {
          const prodId = prod._id || prod.id;
          const isWishlisted = wishlist.some((w) => (w._id || w.id) === prodId);
          const isJustAdded = !!addedIds[prodId];
          return (
            <div
              key={prodId}
              className="border border-gray-200 rounded-2xl p-4 flex gap-4 items-center shadow-2xs hover:shadow-xs transition"
            >
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-muted border border-gray-100">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover aspect-square"
                />
              </div>
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wider">
                  {prod.cat}
                </span>
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{prod.name}</h3>
                <p className="text-sm font-black text-gray-900">${prod.price.toFixed(2)}</p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {isJustAdded ? (
                    <Button
                      onClick={() => setActiveTab && setActiveTab("cart")}
                      size="sm"
                      className="text-xs rounded-xl h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> View Cart <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleAdd(prod, prodId)}
                      size="sm"
                      className="text-xs rounded-xl h-8 px-3 cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
                    </Button>
                  )}
                  <button
                    onClick={() => handleToggleWishlist(prod)}
                    className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                      isWishlisted
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "border-gray-200 text-gray-400 hover:text-gray-600"
                    }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
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

