import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart, Star, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { isProductInWishlist, toggleWishlistItem } from "@/utils/wishlist";

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  const { addToCart } = useCart();

  const productId = product._id || product.id;

  // Sync heart state on mount and on wishlist updates
  useEffect(() => {
    setIsLiked(isProductInWishlist(productId));

    const handleWishlistUpdated = () => {
      setIsLiked(isProductInWishlist(productId));
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    window.addEventListener("storage", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdated);
      window.removeEventListener("storage", handleWishlistUpdated);
    };
  }, [productId]);

  const availableStock = product?.stock !== undefined && product?.stock !== null
    ? Number(product.stock)
    : 15;
  const isOutOfStock = availableStock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: productId,
      _id: productId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: availableStock,
    });

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const { inWishlist } = toggleWishlistItem(product);
    setIsLiked(inWishlist);
    if (inWishlist) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 1800);
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 rounded-xl sm:rounded-2xl flex flex-col justify-between">
      <div className="relative overflow-hidden bg-muted/30">
        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 sm:gap-1.5 items-start">
          {product.badge === "HOT" && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-red-600 text-white text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md tracking-wider">
              <Flame className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" /> HOT
            </span>
          )}
          {product.badge === "NEW" && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-emerald-600 text-white text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md tracking-wider">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> NEW
            </span>
          )}
          {product.badge === "BESTSELLER" && (
            <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-amber-500 text-slate-950 text-[9px] sm:text-[11px] font-extrabold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-md tracking-wider">
              ★ BESTSELLER
            </span>
          )}
          {discount > 0 && (
            <span className="bg-slate-900 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist / Heart Button */}
        <button
          onClick={handleToggleLike}
          title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
          className={cn(
            "absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-200 bg-background/90 backdrop-blur-md shadow-sm",
            isLiked
              ? "text-rose-500 opacity-100 scale-110"
              : "opacity-75 sm:opacity-0 sm:group-hover:opacity-100 text-slate-500 hover:text-rose-500 hover:scale-110"
          )}
        >
          <Heart
            className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-all", isLiked && "fill-current text-rose-500")}
          />
        </button>

        {/* Liked toast indicator */}
        {justLiked && (
          <div className="absolute top-10 sm:top-12 right-2 z-20 bg-rose-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-md animate-in fade-in slide-in-from-top-2 duration-200 whitespace-nowrap">
            ♥ Added to Wishlist
          </div>
        )}

        {/* Image & Quick View Link */}
        <Link to={`/product/${productId}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {!imageError ? (
              <img
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <div className="text-muted-foreground text-xs sm:text-sm font-medium">
                  Image not available
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 backdrop-blur-[2px]">
            <Button
              size="sm"
              className="bg-white text-slate-950 hover:bg-slate-100 font-semibold shadow-lg rounded-xl"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Quick View
            </Button>
          </div>
        </Link>
      </div>

      {/* Card Details */}
      <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1 sm:space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-primary truncate max-w-[65%]">
              {product.category || "Sneakers"}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold shrink-0">
              <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
              <span>{product.rating || 4.8}</span>
              <span className="text-muted-foreground font-normal hidden sm:inline">
                ({product.reviewsCount || 42})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${productId}`}>
            <h3 className="font-bold text-foreground text-xs sm:text-base lg:text-lg line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="space-y-2 sm:space-y-3 pt-1">
          <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
            <span className="text-sm sm:text-xl font-black text-foreground tracking-tight">
              Rs. {Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-sm font-medium text-muted-foreground line-through">
                Rs. {Number(product.originalPrice).toLocaleString()}
              </span>
            )}
          </div>

          <Button
            className={cn(
              "w-full font-semibold rounded-lg sm:rounded-xl transition-all duration-300 py-2 sm:py-5 text-xs sm:text-sm shadow-sm cursor-pointer",
              isOutOfStock
                ? "bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-not-allowed shadow-none"
                : justAdded
                ? "bg-emerald-600 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
          >
            {isAdding ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm">Adding...</span>
              </div>
            ) : justAdded ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Added!</span>
              </div>
            ) : isOutOfStock ? (
              <span className="text-xs sm:text-sm">Out of Stock</span>
            ) : (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Add to Cart</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
