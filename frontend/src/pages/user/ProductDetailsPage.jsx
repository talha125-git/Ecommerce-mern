import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import productsData from "@/data/products.json";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  Check,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  Minus,
  Plus,
  Loader2,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isProductInWishlist, toggleWishlistItem } from "@/utils/wishlist";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery and UI state
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(9);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [stockWarning, setStockWarning] = useState("");

  const { addToCart, cart } = useCart();
  const API_URL = import.meta.env.VITE_API_URL || "";

  const resolveProduct = (candidateList, targetId) => {
    if (!targetId) return null;
    const list = Array.isArray(candidateList) ? candidateList : [];
    const fallbackList = Array.isArray(productsData) ? productsData : [];

    // 1. Direct check on candidate list by _id or id
    let match = list.find(
      (p) => String(p._id) === String(targetId) || (p.id != null && String(p.id) === String(targetId))
    );
    if (match) return match;

    // 2. Check local fallback productsData
    const localMatch = fallbackList.find(
      (p) => String(p._id) === String(targetId) || (p.id != null && String(p.id) === String(targetId))
    );
    if (localMatch) {
      // Find server version with the same name if exists
      const serverMatch = list.find(
        (p) => p.name?.toLowerCase().trim() === localMatch.name?.toLowerCase().trim()
      );
      return serverMatch || localMatch;
    }

    // 3. Match 1-based index (e.g. /product/1 -> first product in catalog)
    const num = parseInt(targetId, 10);
    if (!isNaN(num) && num > 0) {
      if (list.length >= num) return list[num - 1];
      if (fallbackList.length >= num) return fallbackList[num - 1];
    }

    return null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // 1. Try single product endpoint
    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => {
        if (res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          const initialImg = (prod.images && prod.images.length > 0) ? prod.images[0] : prod.image;
          setActiveImage(initialImg || "");
          setLoading(false);
          return;
        }
        throw new Error("No product found in response");
      })
      .catch(() => {
        // 2. Fallback: fetch catalog and match flexibly
        axios
          .get(`${API_URL}/api/products`)
          .then((res) => {
            const allProducts =
              res.data && Array.isArray(res.data.products) && res.data.products.length > 0
                ? res.data.products
                : productsData;

            const found = resolveProduct(allProducts, id);
            setProduct(found || null);
            if (found) {
              const initialImg = (found.images && found.images.length > 0) ? found.images[0] : found.image;
              setActiveImage(initialImg || "");
            }
          })
          .catch((err) => {
            console.warn("Could not fetch products from server, using static fallback:", err);
            const found = resolveProduct(productsData, id);
            setProduct(found || null);
            if (found) {
              const initialImg = (found.images && found.images.length > 0) ? found.images[0] : found.image;
              setActiveImage(initialImg || "");
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });
  }, [id]);

  // Compute all available images directly from the product
  const allImages = useMemo(() => {
    if (!product) return [];
    let list = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      list = [...product.images];
      if (product.image && !list.includes(product.image)) {
        list.unshift(product.image);
      }
    } else if (product.image) {
      list = [product.image];
    }
    return Array.from(new Set(list.filter(Boolean)));
  }, [product]);

  // Sync activeImage if current one is not in the list
  useEffect(() => {
    if (allImages.length > 0 && (!activeImage || !allImages.includes(activeImage))) {
      setActiveImage(allImages[0]);
    }
  }, [allImages, activeImage]);

  // Sync wishlist status with localStorage / API (must be placed before conditional returns)
  useEffect(() => {
    if (!product) return;
    const prodId = product._id || product.id;
    setIsLiked(isProductInWishlist(prodId));

    const handleWishlistUpdated = () => {
      setIsLiked(isProductInWishlist(prodId));
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    window.addEventListener("storage", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdated);
      window.removeEventListener("storage", handleWishlistUpdated);
    };
  }, [product]);

  const activeIndex = allImages.indexOf(activeImage);

  const handleNextImage = () => {
    if (allImages.length === 0) return;
    const nextIdx = (activeIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIdx]);
  };

  const handlePrevImage = () => {
    if (allImages.length === 0) return;
    const prevIdx = (activeIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIdx]);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-slate-900 mx-auto" />
        <p className="text-sm font-bold text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <h2 className="text-4xl font-bold mb-4 tracking-tight">Product Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg max-w-md">
          We couldn't find the product you're looking for. It might have been removed or the link is incorrect.
        </p>
        <Button asChild size="lg">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>
    );
  }

  const availableStock = product?.stock !== undefined && product?.stock !== null
    ? Number(product.stock)
    : 15;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  const existingCartItem = (cart || []).find(
    (c) => String(c._id || c.id) === String(product?._id || product?.id)
  );
  const inCartQty = existingCartItem ? Number(existingCartItem.quantity) || 0 : 0;

  const handleIncreaseQuantity = () => {
    if (quantity >= availableStock) {
      setStockWarning(`Only ${availableStock} item(s) available in stock!`);
      return;
    }
    setStockWarning("");
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setStockWarning("");
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      setStockWarning("Sorry, this item is currently Out of Stock.");
      return;
    }
    if (quantity > availableStock) {
      setStockWarning(`Cannot add ${quantity} items. Only ${availableStock} in stock!`);
      return;
    }
    if (inCartQty + quantity > availableStock) {
      setStockWarning(
        `You already have ${inCartQty} in your cart. Only ${availableStock} total available in stock!`
      );
      return;
    }

    setStockWarning("");
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const targetId = product._id || product.id;
    addToCart({
      id: targetId,
      _id: targetId,
      name: product.name,
      price: product.price,
      image: activeImage || product.image,
      size: selectedSize,
      quantity: quantity,
      stock: availableStock,
    });
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };



  const handleToggleWishlist = () => {
    if (!product) return;
    const itemToToggle = {
      ...product,
      image: activeImage || product.image || (Array.isArray(product.images) && product.images[0]) || "",
    };
    const { inWishlist } = toggleWishlistItem(itemToToggle);
    setIsLiked(inWishlist);
    if (inWishlist) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 2200);
    }
  };

  const availableSizes = (Array.isArray(product.sizes) && product.sizes.length > 0)
    ? product.sizes
    : [7, 8, 9, 10, 11, 12];

  const discount = product.originalPrice && Number(product.originalPrice) > Number(product.price)
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Navigation Breadcrumb */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products Catalog
        </Link>
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
          {product.category || "Footwear"} / {product.name}
        </span>
      </div>

      {/* Main Hero Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Main Large Image & Interactive Thumbnails                    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image Container */}
          <div className="rounded-3xl overflow-hidden bg-slate-50 border border-border/70 aspect-square sm:aspect-4/3 relative group shadow-sm flex items-center justify-center">
            {/* Badges Overlay */}
            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
              {product.badge && (
                <span className="bg-primary text-primary-foreground text-xs font-extrabold px-3 py-1 rounded-full shadow-md uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                  -{discount}% OFF
                </span>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-5 right-5 z-10 h-11 w-11 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all hover:scale-105 shadow-md",
                isLiked ? "text-rose-500 hover:text-rose-600" : "text-slate-600 hover:text-rose-500"
              )}
              onClick={handleToggleWishlist}
              title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
              aria-label={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={cn("h-5 w-5 transition-transform duration-200", isLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-slate-600 hover:text-rose-500")} />
            </Button>

            {/* Added to Wishlist Toast Indicator */}
            {justLiked && (
              <div className="absolute top-18 right-5 z-20 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 whitespace-nowrap flex items-center gap-1.5">
                ♥ Added to Wishlist
              </div>
            )}

            {/* Main Product Image with Smooth Transition */}
            <img
              key={activeImage}
              src={activeImage || product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-103"
            />

            {/* Image Navigation Arrows (prev / next) */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer text-slate-800"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer text-slate-800"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow">
                {activeIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* INTERACTIVE THUMBNAILS STRIP (Below Large Image)                          */}
          {/* ========================================================================= */}
          {allImages.length > 1 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Product Angles & Perspectives:</span>
                <span className="text-[11px] text-primary font-bold">Click to switch view</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {allImages.map((imgUrl, idx) => {
                  const isActive = activeImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={cn(
                        "relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-200 cursor-pointer bg-slate-50 shadow-2xs group",
                        isActive
                          ? "border-primary ring-2 ring-primary/30 ring-offset-2 scale-105 shadow-md"
                          : "border-gray-200 hover:border-gray-400 opacity-75 hover:opacity-100 hover:scale-102"
                      )}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} angle ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isActive && (
                        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Product Details, Sizes, Price & Purchase Actions           */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:pl-4">
          {/* Product Header & Rating */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-extrabold uppercase tracking-wider">
                {product.category || "Footwear"}
              </span>
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Only {availableStock} left in stock &bull; Order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({availableStock} available)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-bold text-foreground">
                {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({product.reviewsCount || 128} verified customer reviews)
              </span>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="flex items-baseline gap-3 p-4 bg-muted/40 rounded-2xl border border-border/60">
            <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Rs. {Number(product.price || 0).toLocaleString()}
            </span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-lg font-semibold text-muted-foreground line-through">
                Rs. {Number(product.originalPrice).toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Save Rs. {(Number(product.originalPrice) - Number(product.price)).toLocaleString()}
              </span>
            )}
          </div>

          {/* Description Snippet */}
          {product.description && (
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Select Shoe Size (US Men's):
              </span>
              <span className="text-xs text-primary font-semibold hover:underline cursor-pointer">
                Size Guide
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {availableSizes.map((sz) => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center",
                      isSelected
                        ? "bg-slate-900 text-white shadow-md scale-105"
                        : "bg-muted/70 hover:bg-muted text-foreground border border-border/80 hover:border-border"
                    )}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Add to Cart Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-border rounded-xl bg-background p-1 h-12 w-full sm:w-36 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="h-9 w-9 rounded-lg cursor-pointer"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-3 text-center text-base font-bold">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= availableStock || isOutOfStock}
                  className={cn(
                    "h-9 w-9 rounded-lg cursor-pointer",
                    (quantity >= availableStock || isOutOfStock) && "opacity-50 cursor-not-allowed"
                  )}
                  title={quantity >= availableStock ? `Only ${availableStock} in stock` : "Increase quantity"}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-12 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 shadow-md cursor-pointer",
                  isOutOfStock || (inCartQty >= availableStock)
                    ? "bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed shadow-none"
                    : justAdded
                    ? "bg-emerald-600 text-white hover:bg-emerald-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock || (inCartQty >= availableStock)}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Adding to Cart...
                  </>
                ) : justAdded ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart!
                  </>
                ) : isOutOfStock ? (
                  <>Out of Stock</>
                ) : inCartQty >= availableStock ? (
                  <>Max Stock in Cart ({inCartQty}/{availableStock})</>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart &bull; Rs. {(Number(product.price || 0) * quantity).toLocaleString()}
                  </>
                )}
              </Button>

              {/* Wishlist Button next to Add to Cart */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleToggleWishlist}
                className={cn(
                  "h-12 px-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-2 font-bold",
                  isLiked
                    ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-400"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={cn("h-5 w-5 transition-colors", isLiked ? "fill-rose-500 text-rose-500" : "")} />
                <span className="hidden sm:inline text-xs font-bold">
                  {isLiked ? "Saved to Wishlist" : "Add to Wishlist"}
                </span>
              </Button>
            </div>

            {/* Warning Message when selecting more than stock or low stock */}
            {stockWarning ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{stockWarning}</span>
              </div>
            ) : isLowStock ? (
              <p className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Hurry! Only {availableStock} {availableStock === 1 ? "pair" : "pairs"} left in stock.
              </p>
            ) : null}

            {/* Guarantee / Value Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>Free shipping in Peshawar &amp; over Rs. 5,000</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                <RotateCcw className="h-4 w-4 text-primary shrink-0" />
                <span>30-Day effortless returns</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                <Shield className="h-4 w-4 text-primary shrink-0" />
                <span>1-Year quality warranty</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                <Award className="h-4 w-4 text-primary shrink-0" />
                <span>100% Authentic verified</span>
              </div>
            </div>

            {/* Product Description */}
            {product.description && product.description.trim() && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground italic">
                  Product Description
                </h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                  {(() => {
                    const desc = product.description.trim();
                    let bullets = [];
                    if (desc.includes("•") || desc.includes("- ")) {
                      bullets = desc.split(/[•\-]/).map((s) => s.trim()).filter(Boolean);
                    } else if (desc.includes("\n")) {
                      bullets = desc.split("\n").map((s) => s.trim()).filter(Boolean);
                    } else {
                      bullets = [desc];
                    }

                    return bullets.map((point, idx) => (
                      <p key={idx} className="flex items-start gap-2">
                        <span className="text-foreground mt-0.5 shrink-0">•</span>
                        <span>{point}</span>
                      </p>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


