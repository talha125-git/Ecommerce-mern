import React from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WishlistTab({ wishlist, handleToggleWishlist, addToCart }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" /> My Wishlist
        </h2>
        <p className="text-xs text-gray-500">
          {wishlist.length > 0
            ? `${wishlist.length} saved item${wishlist.length > 1 ? "s" : ""} — move to cart anytime`
            : "Heart products on the store to save them here"}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-16 space-y-4 border border-dashed border-gray-200 rounded-2xl bg-white">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-rose-300" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Your Wishlist is Empty</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
              Browse the store and click the ♥ heart icon on any product to save it here. Your wishlist is tied to your account.
            </p>
          </div>
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl cursor-pointer font-bold text-xs gap-1.5 mt-2"
            >
              Go to Store
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item) => {
            const itemId = item._id || item.id;
            return (
              <div
                key={itemId}
                className="border border-gray-200 rounded-2xl p-4 flex gap-4 items-center bg-white hover:shadow-sm transition group"
              >
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover aspect-square group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm font-black text-gray-900">${Number(item.price).toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        addToCart({
                          id: itemId,
                          _id: itemId,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          quantity: 1,
                        });
                      }}
                      size="sm"
                      className="text-[11px] h-7 rounded-lg gap-1 cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3" /> Move to Cart
                    </Button>
                    <Button
                      onClick={() => handleToggleWishlist(item)}
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 rounded-lg gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
