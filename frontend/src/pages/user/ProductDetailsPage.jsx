import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import productsData from "@/data/products.json";
import ProductCard from "@/components/home/ProductCard";
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
  Sparkles,
  Flame,
  Ruler,
  Share2,
  X,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isProductInWishlist, toggleWishlistItem } from "@/utils/wishlist";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [allProductsList, setAllProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery and UI state
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [justLiked, setJustLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [stockWarning, setStockWarning] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState("overview");

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

    axios
      .get(`${API_URL}/api/products/${id}`)
      .then((res) => {
        if (res.data?.product) {
          const prod = res.data.product;
          setProduct(prod);
          const initialImg = prod.images && prod.images.length > 0 ? prod.images[0] : prod.image;
          setActiveImage(initialImg || "");
          if (Array.isArray(prod.sizes) && prod.sizes.length > 0) {
            setSelectedSize(prod.sizes[0]);
          } else {
            setSelectedSize(9);
          }
          if (Array.isArray(prod.colors) && prod.colors.length > 0) {
            setSelectedColor(prod.colors[0]);
          }
          setLoading(false);
        } else {
          throw new Error("No product in response");
        }
      })
      .catch(() => {
        axios
          .get(`${API_URL}/api/products`)
          .then((res) => {
            const allProducts =
              res.data && Array.isArray(res.data.products) && res.data.products.length > 0
                ? res.data.products
                : productsData;

            setAllProductsList(allProducts);
            const found = resolveProduct(allProducts, id);
            setProduct(found || null);
            if (found) {
              const initialImg = found.images && found.images.length > 0 ? found.images[0] : found.image;
              setActiveImage(initialImg || "");
              if (Array.isArray(found.sizes) && found.sizes.length > 0) {
                setSelectedSize(found.sizes[0]);
              } else {
                setSelectedSize(9);
              }
              if (Array.isArray(found.colors) && found.colors.length > 0) {
                setSelectedColor(found.colors[0]);
              }
            }
          })
          .catch((err) => {
            console.warn("Could not fetch products from server, using static fallback:", err);
            setAllProductsList(productsData);
            const found = resolveProduct(productsData, id);
            setProduct(found || null);
            if (found) {
              const initialImg = found.images && found.images.length > 0 ? found.images[0] : found.image;
              setActiveImage(initialImg || "");
              if (Array.isArray(found.sizes) && found.sizes.length > 0) {
                setSelectedSize(found.sizes[0]);
              } else {
                setSelectedSize(9);
              }
              if (Array.isArray(found.colors) && found.colors.length > 0) {
                setSelectedColor(found.colors[0]);
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });

    axios
      .get(`${API_URL}/api/products`)
      .then((res) => {
        if (res.data?.products && Array.isArray(res.data.products)) {
          setAllProductsList(res.data.products);
        }
      })
      .catch(() => {});
  }, [id, API_URL]);

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

  useEffect(() => {
    if (allImages.length > 0 && (!activeImage || !allImages.includes(activeImage))) {
      setActiveImage(allImages[0]);
    }
  }, [allImages, activeImage]);

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

  const availableStock =
    product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : 15;
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
      color: selectedColor,
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

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product?.name || "BloomShop Footwear",
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const availableSizes =
    Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes : [26, 27, 28, 29, 30, 31, 32];

  const availableColors =
    Array.isArray(product?.colors) && product.colors.length > 0 ? product.colors : [];

  const discount =
    product?.originalPrice && Number(product.originalPrice) > Number(product.price)
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(allProductsList) && allProductsList.length > 0 ? allProductsList : productsData;
    const targetId = String(product._id || product.id);
    return list
      .filter((p) => String(p._id || p.id) !== targetId && (p.category === product.category || !product.category))
      .slice(0, 4);
  }, [product, allProductsList]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <p className="text-sm font-bold text-muted-foreground">Loading footwear details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Product Not Found</h2>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base max-w-md">
          We couldn't find the product you're looking for. It might have been updated or removed.
        </p>
        <Button asChild size="lg" className="rounded-xl font-bold">
          <Link to="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-16 w-full max-w-full overflow-x-hidden">
      {/* ── Top Bar with Back Link & Quick Actions ── */}
      <div className="bg-background/90 backdrop-blur-md border-b border-border/70 py-2 px-3 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors py-1 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-foreground flex items-center justify-center transition-colors relative cursor-pointer"
              title="Share product link"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink && (
                <span className="absolute -bottom-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>

            <button
              onClick={handleToggleWishlist}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer",
                isLiked ? "bg-rose-50 text-rose-600" : "bg-muted/80 text-foreground hover:text-rose-600"
              )}
              title={isLiked ? "In Wishlist" : "Add to Wishlist"}
            >
              <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-rose-500 text-rose-500")} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-8 sm:space-y-12 w-full max-w-full overflow-hidden">
        {/* ── Main Product Display Grid (Left: Small Pic, Right: Details + Overview/Specs Tabs) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start w-full">
          {/* ========================================================================= */}
          {/* LEFT: Compact Product Gallery + Trust Badges                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4 w-full min-w-0">
            {/* Primary Showcase Card (Compact Height, Object-Contain for whole shoe) */}
            <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-50 dark:bg-card border border-border/80 h-72 sm:h-80 lg:h-96 relative group shadow-xs flex items-center justify-center w-full p-2.5">
              {/* Floating Badges */}
              <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 flex flex-wrap gap-1.5 items-center">
                {product.badge === "HOT" && (
                  <span className="inline-flex items-center gap-1 bg-red-600/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-current animate-pulse" /> HOT
                  </span>
                )}
                {product.badge === "NEW" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600/95 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" /> NEW
                  </span>
                )}
                {product.badge && product.badge !== "HOT" && product.badge !== "NEW" && (
                  <span className="inline-flex items-center gap-1 bg-slate-900/90 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider">
                    ★ {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="inline-flex items-center bg-slate-950 text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 sm:py-1 rounded-full shadow-md">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Wishlist Button on Image */}
              <button
                onClick={handleToggleWishlist}
                className={cn(
                  "absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md cursor-pointer",
                  isLiked ? "text-rose-500 scale-105" : "text-slate-600 hover:text-rose-500"
                )}
                title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5", isLiked && "fill-rose-500 text-rose-500")} />
              </button>

              {/* Liked Toast Popup */}
              {justLiked && (
                <div className="absolute top-13 sm:top-16 right-2.5 sm:right-4 z-20 bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 whitespace-nowrap">
                  ♥ Added to Wishlist
                </div>
              )}

              {/* Main Product Image (Object-Contain so entire boot/shoe fits) */}
              <img
                key={activeImage}
                src={activeImage || product.image}
                alt={product.name}
                className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Prev / Next Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white text-foreground backdrop-blur-md shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    aria-label="Next image"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 dark:bg-slate-900/85 hover:bg-white text-foreground backdrop-blur-md shadow-md flex items-center justify-center opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </>
              )}

              {/* Image Counter Pill */}
              {allImages.length > 1 && (
                <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 bg-slate-950/75 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 sm:py-1 rounded-full shadow">
                  {activeIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip (Compact size) */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                {allImages.map((imgUrl, idx) => {
                  const isActive = activeImage === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={cn(
                        "relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-slate-50 dark:bg-muted p-1 shrink-0 flex items-center justify-center",
                        isActive
                          ? "border-primary ring-2 ring-primary/30 scale-102 shadow-sm"
                          : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
                      )}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── Value & Trust Micro-Cards (Placed on Left under pic) ── */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex flex-col sm:flex-row items-start gap-2 p-2.5 rounded-2xl bg-card border border-border/70 shadow-2xs min-w-0">
                <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold text-foreground truncate">Free Shipping</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    Over Rs. 5,000 &amp; Peshawar
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2 p-2.5 rounded-2xl bg-card border border-border/70 shadow-2xs min-w-0">
                <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold text-foreground truncate">30-Day Returns</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    Effortless exchange guarantee
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2 p-2.5 rounded-2xl bg-card border border-border/70 shadow-2xs min-w-0">
                <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold text-foreground truncate">1-Year Warranty</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    Durability inspection passed
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-2 p-2.5 rounded-2xl bg-card border border-border/70 shadow-2xs min-w-0">
                <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Award className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-bold text-foreground truncate">100% Authentic</h4>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    Verified factory-direct pair
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: Product Info, Price, Sizes, Cart & Overview/Specs Tabs             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 w-full min-w-0">
            {/* Header: Category, Stock Badge, Title, Rating */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-[11px] font-black uppercase tracking-wider">
                    {product.category || "Footwear"}
                  </span>
                  {product.subcategory && (
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-muted text-muted-foreground text-[10px] sm:text-[11px] font-bold">
                      {product.subcategory}
                    </span>
                  )}
                </div>

                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-800 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Only {availableStock} left
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({availableStock})
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground leading-snug break-words">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-foreground">
                  {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  ({product.reviewsCount || 128} verified reviews)
                </span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-3 sm:p-4 bg-muted/40 rounded-2xl border border-border/70 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  Rs. {Number(product.price || 0).toLocaleString()}
                </span>
                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="text-xs sm:text-sm font-semibold text-muted-foreground line-through">
                    Rs. {Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>

              {discount > 0 && (
                <span className="text-[10px] sm:text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border border-emerald-200">
                  Save Rs. {(Number(product.originalPrice) - Number(product.price)).toLocaleString()} ({discount}% OFF)
                </span>
              )}
            </div>

            {/* Color Swatches */}
            {availableColors.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider block">
                  Color: <span className="text-primary font-bold">{selectedColor || availableColors[0]}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((clr) => {
                    const isSelected = (selectedColor || availableColors[0]) === clr;
                    return (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={cn(
                          "px-3 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-card border-border text-foreground hover:bg-muted"
                        )}
                      >
                        {clr}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Select Size (US):
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              {/* Flex-wrapped size buttons that never overflow */}
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={cn(
                        "min-w-11 sm:min-w-12 h-10 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center",
                        isSelected
                          ? "bg-slate-900 text-white shadow-md ring-2 ring-primary ring-offset-1 scale-102"
                          : "bg-card hover:bg-muted text-foreground border border-border/80 hover:border-primary/50"
                      )}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper + Add to Cart + Wishlist */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2">
                  {/* Stepper */}
                  <div className="flex items-center justify-between border border-border rounded-xl bg-card p-1 h-12 flex-1 sm:w-32 sm:flex-none shadow-2xs">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="h-8 w-8 rounded-lg cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="px-2 text-center text-sm font-bold">
                      {isOutOfStock ? 0 : quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= availableStock || isOutOfStock}
                      className="h-8 w-8 rounded-lg cursor-pointer"
                      title={quantity >= availableStock ? `Only ${availableStock} in stock` : "Increase"}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Wishlist Button on Mobile */}
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleToggleWishlist}
                    className={cn(
                      "sm:hidden h-12 w-12 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center shrink-0",
                      isLiked
                        ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    title={isLiked ? "Saved in Wishlist" : "Save to Wishlist"}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-rose-500 text-rose-500")} />
                  </Button>
                </div>

                {/* Add to Cart Button */}
                <Button
                  size="lg"
                  className={cn(
                    "w-full sm:flex-1 h-12 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 shadow-md cursor-pointer px-4",
                    isOutOfStock || inCartQty >= availableStock
                      ? "bg-gray-300 text-gray-600 hover:bg-gray-300 cursor-not-allowed shadow-none"
                      : justAdded
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock || inCartQty >= availableStock}
                >
                  {isAdding ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </div>
                  ) : justAdded ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>Added to Cart!</span>
                    </div>
                  ) : isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : inCartQty >= availableStock ? (
                    <span>Max in Cart ({inCartQty})</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2 truncate">
                      <ShoppingCart className="h-4 w-4 shrink-0" />
                      <span className="truncate">Add to Cart &bull; Rs. {(Number(product.price || 0) * quantity).toLocaleString()}</span>
                    </div>
                  )}
                </Button>

                {/* Wishlist Button on Desktop */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleToggleWishlist}
                  className={cn(
                    "hidden sm:flex h-12 px-4 rounded-xl border-2 transition-all duration-200 cursor-pointer items-center justify-center gap-1.5 font-bold shrink-0",
                    isLiked
                      ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  title={isLiked ? "Saved in Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-rose-500 text-rose-500")} />
                  <span className="text-xs font-bold">{isLiked ? "Saved" : "Save"}</span>
                </Button>
              </div>

              {/* Stock Warning Box */}
              {stockWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900 flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{stockWarning}</span>
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════════════ */}
            {/* OVERVIEW, SPECS & SHIPPING TABS (Placed directly to the RIGHT of the pic) */}
            {/* ══════════════════════════════════════════════════════════════════════════ */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 w-full mt-4">
              <div className="flex items-center gap-1.5 sm:gap-2 border-b border-border pb-2.5 overflow-x-auto no-scrollbar w-full">
                <button
                  type="button"
                  onClick={() => setActiveDetailsTab("overview")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeDetailsTab === "overview"
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailsTab("specs")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeDetailsTab === "specs"
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailsTab("shipping")}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer",
                    activeDetailsTab === "shipping"
                      ? "bg-slate-900 text-white dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  Shipping &amp; Delivery
                </button>
              </div>

              {/* Tab 1: Overview */}
              {activeDetailsTab === "overview" && (
                <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                  <p className="text-sm text-foreground font-medium">
                    {product.description || "Premium footwear engineered for style, all-day support, and superior durability."}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Ultra-light shock-absorbing sole</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Breathable &amp; scuff-resistant upper</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Anatomical arch support comfort</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Non-slip traction rubber outsole</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Specifications */}
              {activeDetailsTab === "specs" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs animate-in fade-in duration-200">
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Department</span>
                    <span className="font-bold text-foreground">{product.category || "Unisex"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Subcategory</span>
                    <span className="font-bold text-foreground">{product.subcategory || "Daily Wear"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Sizes</span>
                    <span className="font-bold text-foreground">{availableSizes.join(", ")}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Stock Status</span>
                    <span className="font-bold text-emerald-600">{availableStock > 0 ? "In Stock" : "Out of Stock"}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Warranty</span>
                    <span className="font-bold text-foreground">1-Year Guarantee</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/60">
                    <span className="text-muted-foreground font-medium">Item Code / SKU</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{String(product._id || product.id).slice(-8).toUpperCase()}</span>
                  </div>
                </div>
              )}

              {/* Tab 3: Shipping */}
              {activeDetailsTab === "shipping" && (
                <div className="space-y-2 text-xs text-muted-foreground animate-in fade-in duration-200">
                  <p>
                    <strong className="text-foreground">Standard Delivery:</strong> 2 to 4 business days nationwide. Same-day delivery available across Peshawar.
                  </p>
                  <p>
                    <strong className="text-foreground">Free Shipping:</strong> Automatically applied at checkout for orders over Rs. 5,000.
                  </p>
                  <p>
                    <strong className="text-foreground">Cash on Delivery:</strong> Available across all major cities and towns in Pakistan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Related Products Carousel/Grid ── */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-foreground tracking-tight">
                  You May Also Like
                </h3>
                <p className="text-xs text-muted-foreground">
                  Popular picks from the {product.category || "Footwear"} catalog
                </p>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent((product.category || "").toLowerCase())}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                View Collection &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((relProd) => (
                <ProductCard key={relProd._id || relProd.id} product={relProd} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Sticky Quick Action Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-2.5 px-4 shadow-xl flex items-center justify-between gap-2.5 w-full max-w-full">
        <div className="flex flex-col min-w-0 shrink">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
          <span className="text-sm font-black text-foreground truncate">
            Rs. {(Number(product.price || 0) * quantity).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={handleToggleWishlist}
            className={cn(
              "h-10 w-10 rounded-xl shrink-0 border cursor-pointer",
              isLiked ? "border-rose-300 bg-rose-50 text-rose-600" : "border-border text-muted-foreground"
            )}
            title={isLiked ? "Saved in Wishlist" : "Save to Wishlist"}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-rose-500 text-rose-500")} />
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock || inCartQty >= availableStock}
            className="h-10 px-4 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md text-xs cursor-pointer"
          >
            {justAdded ? "Added!" : isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* ── Interactive Size Guide Modal ── */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-base sm:text-lg text-foreground">Footwear Size Chart</h3>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Standard international shoe conversion chart. If you are in between sizes, we recommend sizing up for optimum comfort.
            </p>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-foreground uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-2.5">US</th>
                    <th className="p-2.5">UK</th>
                    <th className="p-2.5">EU</th>
                    <th className="p-2.5">CM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="p-2.5 font-bold">26</td><td className="p-2.5">8.5</td><td className="p-2.5">26</td><td className="p-2.5">16.0</td></tr>
                  <tr><td className="p-2.5 font-bold">27</td><td className="p-2.5">9.5</td><td className="p-2.5">27</td><td className="p-2.5">16.8</td></tr>
                  <tr><td className="p-2.5 font-bold">28</td><td className="p-2.5">10.5</td><td className="p-2.5">28</td><td className="p-2.5">17.5</td></tr>
                  <tr><td className="p-2.5 font-bold">29</td><td className="p-2.5">11.5</td><td className="p-2.5">29</td><td className="p-2.5">18.2</td></tr>
                  <tr><td className="p-2.5 font-bold">30</td><td className="p-2.5">12.5</td><td className="p-2.5">30</td><td className="p-2.5">19.0</td></tr>
                  <tr><td className="p-2.5 font-bold">31</td><td className="p-2.5">13.0</td><td className="p-2.5">31</td><td className="p-2.5">19.7</td></tr>
                  <tr><td className="p-2.5 font-bold">32</td><td className="p-2.5">1.0</td><td className="p-2.5">32</td><td className="p-2.5">20.5</td></tr>
                </tbody>
              </table>
            </div>

            <Button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full rounded-xl font-bold text-xs"
            >
              Close Size Guide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
