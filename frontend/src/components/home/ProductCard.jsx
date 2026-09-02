import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart, Star, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const targetId = product._id || product.id;

    addToCart({
      id: targetId,
      _id: targetId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    setIsAdding(false);
    setJustAdded(true);

    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const productId = product._id || product.id;

  return (
    <Card className="group overflow-hidden bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 rounded-2xl flex flex-col justify-between">
      <div className="relative overflow-hidden bg-muted/30">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.badge === "HOT" && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md tracking-wider">
              <Flame className="h-3 w-3 fill-current" /> HOT
            </span>
          )}
          {product.badge === "NEW" && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md tracking-wider">
              <Sparkles className="h-3 w-3" /> NEW
            </span>
          )}
          {product.badge === "BESTSELLER" && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md tracking-wider">
              ★ BESTSELLER
            </span>
          )}
          {discount > 0 && (
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="icon"
          name="Like Button"
          className={cn(
            "absolute top-3 right-3 z-10 transition-all duration-200 bg-background/90 backdrop-blur-md hover:bg-background shadow-sm rounded-full",
            isLiked ? "text-red-500 fill-current opacity-100" : "opacity-0 group-hover:opacity-100 text-slate-600"
          )}
          onClick={handleToggleLike}
        >
          <Heart
            name="Like Icon"
            className={cn("h-4 w-4", isLiked && "fill-current")}
          />
        </Button>

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
                <div className="text-muted-foreground text-sm font-medium">
                  Image not available
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
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
      <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wider text-primary">
              {product.category || "Sneakers"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{product.rating || 4.8}</span>
              <span className="text-muted-foreground font-normal">
                ({product.reviewsCount || 42})
              </span>
            </div>
          </div>

          {/* Product Name */}
          <Link to={`/product/${productId}`}>
            <h3 className="font-bold text-foreground text-lg line-clamp-1 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart */}
        <div className="space-y-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-foreground tracking-tight">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm font-medium text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Button
            className={cn(
              "w-full font-semibold rounded-xl transition-all duration-300 py-5 shadow-sm",
              justAdded
                ? "bg-emerald-600 text-white hover:bg-emerald-600 shadow-emerald-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Adding...</span>
              </div>
            ) : justAdded ? (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Added to Cart!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
