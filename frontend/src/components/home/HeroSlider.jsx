import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    tag: "SUMMER DROP 2025",
    tagIcon: Flame,
    title: "Step Into Next-Gen Style & Pure Comfort",
    subtitle: "Experience unmatched cushioning and ergonomic designs crafted for urban explorers.",
    badge: "30% OFF SPECIAL",
    ctaPrimary: "Shop Hot Products",
    ctaPrimaryTarget: "#hot-products",
    ctaSecondary: "Explore Collection",
    ctaSecondaryTarget: "#products",
    bgGradient: "from-orange-600/90 via-amber-600/80 to-stone-900",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
    accentColor: "bg-orange-500",
  },
  {
    id: 2,
    tag: "JUST RELEASED",
    tagIcon: Sparkles,
    title: "Fresh Arrivals Crafted For Distinction",
    subtitle: "Elevate your streetwear aesthetic with contemporary silhouettes and premium leather finishes.",
    badge: "NEW ARRIVALS",
    ctaPrimary: "Discover New Arrivals",
    ctaPrimaryTarget: "#new-arrivals",
    ctaSecondary: "View All Sneakers",
    ctaSecondaryTarget: "#products",
    bgGradient: "from-blue-700/90 via-indigo-800/80 to-slate-950",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    accentColor: "bg-blue-500",
  },
  {
    id: 3,
    tag: "HIGH PERFORMANCE",
    tagIcon: Zap,
    title: "Unstoppable Energy & Responsive Motion",
    subtitle: "Built for speed, durability, and supreme agility whether on the track or the streets.",
    badge: "LIMITED EDITION",
    ctaPrimary: "Shop Hot Deals",
    ctaPrimaryTarget: "#hot-products",
    ctaSecondary: "Learn More",
    ctaSecondaryTarget: "#about",
    bgGradient: "from-emerald-700/90 via-teal-800/80 to-slate-900",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?q=80&w=1200&auto=format&fit=crop",
    accentColor: "bg-emerald-500",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused]);

  const handleScrollTo = (targetId) => {
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const slide = slides[currentSlide];
  const TagIcon = slide.tagIcon;

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-950 text-white rounded-2xl md:rounded-3xl shadow-2xl mb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Carousel with Overlay */}
      <div className="relative min-h-120 sm:min-h-135 lg:min-h-150 flex items-center">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000 ease-linear"
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-linear-to-r ${s.bgGradient} mix-blend-multiply opacity-90`} />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-20 container mx-auto px-6 sm:px-10 lg:px-16 py-12 lg:py-16">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-white uppercase shadow-lg">
              <TagIcon className="h-4 w-4 text-amber-300 animate-pulse" />
              <span>{slide.tag}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300 ml-1"></span>
              <span className="text-amber-200 font-bold">{slide.badge}</span>
            </div>

            {/* Slide Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-md">
              {slide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-slate-200 text-base sm:text-lg lg:text-xl font-normal max-w-xl leading-relaxed drop-shadow-sm">
              {slide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={() => handleScrollTo(slide.ctaPrimaryTarget)}
                className="bg-white text-slate-950 hover:bg-slate-100 font-bold px-7 py-6 text-base rounded-xl shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
              >
                {slide.ctaPrimary}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleScrollTo(slide.ctaSecondaryTarget)}
                className="border-white/40 text-white bg-white/10 backdrop-blur-md hover:bg-white/20 font-semibold px-7 py-6 text-base rounded-xl transition-all duration-300"
              >
                {slide.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:scale-110 focus:outline-none"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white backdrop-blur-md border border-white/10 transition-all duration-200 hover:scale-110 focus:outline-none"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Bottom Pagination Dots & Progress */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-8 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
