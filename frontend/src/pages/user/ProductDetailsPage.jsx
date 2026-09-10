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
  Sparkles,
  PackageCheck,
  CheckCircle2,
  Info,
  Layers,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery and UI state
  const [activeImage, setActiveImage] = useState("");
  const [selectedSize, setSelectedSize] = useState(9);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "specs" | "shipping" | "reviews"

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
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

  // Compute all available images, ensuring at least 3-4 complementary angles exist for any product
  const allImages = useMemo(() => {
    if (!product) return [];
    let list = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

    // If only 1 image is in the dataset, provide curated alternate angles so the user can interact
    if (list.length === 1 && list[0]) {
      list = [
        list[0],
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800&auto=format&fit=crop"
      ];
    }
    return list;
  }, [product]);

  // Sync activeImage if current one is not in the list
  useEffect(() => {
    if (allImages.length > 0 && (!activeImage || !allImages.includes(activeImage))) {
      setActiveImage(allImages[0]);
    }
  }, [allImages, activeImage]);

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

  const handleAddToCart = async () => {
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
    });
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
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
                isLiked && "text-rose-500 hover:text-rose-600"
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current text-rose-500")} />
            </Button>

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
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock &bull; Ready to Ship
              </span>
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
              ${Number(product.price || 0).toFixed(2)}
            </span>
            {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
              <span className="text-lg font-semibold text-muted-foreground line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            {product.description || "Crafted with lightweight materials and responsive athletic cushioning for ultimate all-day comfort and trendsetting aesthetics."}
          </p>

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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-9 w-9 rounded-lg"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-3 text-center text-base font-bold">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-9 w-9 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-12 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 shadow-md cursor-pointer",
                  justAdded
                    ? "bg-emerald-600 text-white hover:bg-emerald-600"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
                onClick={handleAddToCart}
                disabled={isAdding}
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
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart &bull; ${(Number(product.price || 0) * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </div>

            {/* Guarantee / Value Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border/50">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>Free express shipping over $50</span>
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
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LOWER SECTION: Comprehensive Product Details, Specs, & Reviews            */}
      {/* ========================================================================= */}
      <div className="mt-16 sm:mt-24 pt-10 border-t border-border">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 border-b border-border scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Product Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "specs"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Layers className="w-4 h-4" />
            Technical Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "shipping"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <PackageCheck className="w-4 h-4" />
            Delivery & Returns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
              activeTab === "reviews"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            Reviews ({product.reviewsCount || 128})
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="py-8">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-200">
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xl font-bold text-foreground">
                  Engineered for Performance and Elevated Everyday Style
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description || "This sneaker combines premium craftsmanship with modern sports ergonomics. Developed with breathable multi-layer knit mesh and reinforced overlays to ensure durable wear, while the ergonomic arch structure guarantees all-day support."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-1">
                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Dynamic Cloud Cushioning
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Shock-absorbing EVA foam absorbs impact with every stride.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/40 rounded-2xl border border-border/60 space-y-1">
                    <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Ultra-Grip Outsole
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Tread pattern engineered for high-traction grip across all surfaces.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-muted/40 p-6 rounded-3xl border border-border/60 space-y-4">
                <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wider">
                  Product Highlights
                </h4>
                <ul className="space-y-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Category:</strong> {product.category || "Casual"}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Release:</strong> {product.isNew ? "Current Season Release" : "Classic Edition"}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Fit:</strong> True to size (Standard D width)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <strong>Care:</strong> Spot clean with damp cloth
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-3xl space-y-4 animate-in fade-in duration-200">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Technical Specifications & Materials
              </h3>
              <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border text-xs sm:text-sm">
                <div className="grid grid-cols-2 p-3.5 bg-muted/30">
                  <span className="font-bold text-muted-foreground">Upper Material</span>
                  <span className="font-medium text-foreground">Engineered Breathable Mesh & Leather Overlays</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="font-bold text-muted-foreground">Midsole</span>
                  <span className="font-medium text-foreground">Responsive Molded Cloud EVA Foam</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-muted/30">
                  <span className="font-bold text-muted-foreground">Outsole</span>
                  <span className="font-medium text-foreground">High-Traction Vulcanized Rubber</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="font-bold text-muted-foreground">Closure Type</span>
                  <span className="font-medium text-foreground">Traditional Lace-Up with Padded Tongue</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-muted/30">
                  <span className="font-bold text-muted-foreground">Average Weight</span>
                  <span className="font-medium text-foreground">Approx. 310 grams (Single shoe, Size 9)</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="font-bold text-muted-foreground">Gender & Cut</span>
                  <span className="font-medium text-foreground">Unisex / Low-to-Mid Profile</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Truck className="w-5 h-5" />
                  Fast Express Shipping
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All orders placed before 3:00 PM are packaged and dispatched on the same business day. Delivery takes 2-4 working days worldwide with full online tracking.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <RotateCcw className="w-5 h-5" />
                  30-Day Free Returns
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If the shoe does not fit perfectly, take advantage of our 30-day effortless return policy. We provide free size exchanges or instant full refunds.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 max-w-3xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/40 border border-border">
                <div>
                  <div className="text-4xl font-black text-foreground">
                    {product.rating ? Number(product.rating).toFixed(1) : "4.9"}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {product.reviewsCount || 128} verified purchases
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground w-full sm:w-64">
                  <div className="flex items-center gap-2">
                    <span>5★</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[88%]" />
                    </div>
                    <span>88%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4★</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[10%]" />
                    </div>
                    <span>10%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3★</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-amber-500 h-full w-[2%]" />
                    </div>
                    <span>2%</span>
                  </div>
                </div>
              </div>

              {/* Sample Verified Reviews */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl border border-border space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground">Tariq M. &bull; Verified Buyer</span>
                    <span className="text-muted-foreground text-[10px]">3 days ago</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground pt-1">
                    "Exceptional comfort right out of the box. Cushioning feels great during morning runs and looks super stylish with joggers."
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-foreground">Sara K. &bull; Verified Buyer</span>
                    <span className="text-muted-foreground text-[10px]">1 week ago</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground pt-1">
                    "True to size and very lightweight. Colors look even better in person than on screen. Delivery took only 2 days."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

