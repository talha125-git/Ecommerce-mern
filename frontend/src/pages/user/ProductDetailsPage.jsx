import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import productsData from "@/data/products.json";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Check, Heart, ShoppingCart, Truck, Shield, Minus, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    axios
      .get(`${API_URL}/api/products`)
      .then((res) => {
        const allProducts = (res.data && Array.isArray(res.data.products) && res.data.products.length > 0)
          ? res.data.products
          : productsData;

        const found = allProducts.find(
          (p) => String(p._id) === String(id) || String(p.id) === String(id)
        );
        setProduct(found || null);
      })
      .catch((err) => {
        console.warn("Could not fetch products from server, using static fallback:", err);
        const found = productsData.find(
          (p) => String(p._id) === String(id) || String(p.id) === String(id)
        );
        setProduct(found || null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

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
        <p className="text-muted-foreground mb-8 text-lg max-w-md">We couldn't find the product you're looking for. It might have been removed or the link is incorrect.</p>
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
      image: product.image,
      quantity: quantity,
    });
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 md:mb-12">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="rounded-3xl overflow-hidden bg-muted aspect-square relative group shadow-sm border border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-6 right-6 z-10 h-12 w-12 rounded-full bg-background/80 backdrop-blur-md hover:bg-background transition-all hover:scale-105 shadow-sm",
              isLiked && "text-destructive"
            )}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
          </Button>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-center space-y-8 py-4">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            <p>{product.description}</p>
          </div>

          <div className="space-y-6 pt-8 border-t border-border">
            {/*  + - btn */}
            <div className="flex items-center w-fit border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-12 w-12 rounded-r-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 py-2 min-w-12 text-center text-lg font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 w-12 rounded-l-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className={cn(
                "w-full sm:w-auto min-w-60 h-14 text-lg font-semibold rounded-xl transition-all duration-300",
                justAdded
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
              )}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
                  Adding to Cart...
                </>
              ) : justAdded ? (
                <>
                  <Check className="h-5 w-5 mr-3" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Add to Cart
                </>
              )}
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-md">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <span>1 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
