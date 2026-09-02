import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WishlistTab({ wishlist, handleToggleWishlist, addToCart }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Wishlist</h2>
        <p className="text-xs text-gray-500">Items you saved for later</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Heart className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm font-semibold text-gray-500">Your wishlist is currently empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item) => {
            const itemId = item._id || item.id;
            return (
              <div key={itemId} className="border border-gray-200 rounded-2xl p-4 flex gap-4 items-center">
                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-muted border border-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover aspect-square" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-xs text-gray-900">{item.name}</h4>
                  <p className="text-xs font-black text-gray-900">${item.price.toFixed(2)}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        addToCart({
                          id: itemId,
                          _id: itemId,
                          name: item.name,
                          price: item.price,
                          image: item.image,
                          quantity: 1,
                        })
                      }
                      size="sm"
                      className="text-[11px] h-7 rounded-lg"
                    >
                      Move to Cart
                    </Button>
                    <Button
                      onClick={() => handleToggleWishlist(item)}
                      variant="outline"
                      size="sm"
                      className="text-[11px] h-7 rounded-lg"
                    >
                      Remove
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
