import { useState, useEffect } from "react";
import axios from "axios";
import { ShieldCheck, Truck, Sparkles, RefreshCw, Award, HeartHandshake, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_ABOUT_DATA = {
  badge: "About BloomShop",
  title: "Where Modern Style Meets Uncompromised Comfort",
  description: "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support. We craft shoes for those who walk with confidence.",
  subTitle: "Built for the Street, Designed for the Future",
  subDescription: "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design.",
  quote: "Every stitch is calculated for maximum durability and timeless visual appeal.",
  quoteBadge: "Our Commitment",
  image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  buttonText: "Explore Products",
  bullet1: "Ethically Sourced Materials",
  bullet2: "Rigorous 12-Point Quality Checks",
  stats: [
    { label: "Happy Shoppers", value: "50,000+" },
    { label: "Original Models", value: "250+" },
    { label: "Avg Rating", value: "4.9 ★" },
    { label: "Global Stores", value: "18 Outlets" }
  ],
  features: [
    {
      title: "Premium Craftsmanship",
      description: "Engineered with high-grade breathable mesh, genuine leather, and ultra-responsive soles.",
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30"
    },
    {
      title: "Express Delivery",
      description: "Fast and reliable worldwide shipping with full real-time order tracking.",
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30"
    },
    {
      title: "100% Authentic Guarantee",
      description: "Every pair undergoes rigorous quality inspection before leaving our warehouse.",
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      title: "Hassle-Free Returns",
      description: "30-day effortless return policy with instant refunds or size exchanges.",
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30"
    }
  ]
};

const FEATURE_ICONS = [Award, Truck, ShieldCheck, RefreshCw];

export default function AboutUs() {
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT_DATA);

  const fetchAboutData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const res = await axios.get(`${API_URL}/api/about`);
      if (res.data && res.data.about) {
        setAboutData((prev) => ({ ...prev, ...res.data.about }));
      }
    } catch (err) {
      console.warn("Using fallback About Us details:", err);
      const saved = localStorage.getItem("admin_about_section");
      if (saved) {
        try {
          setAboutData(JSON.parse(saved));
        } catch (e) {
          /* ignore */
        }
      }
    }
  };

  useEffect(() => {
    fetchAboutData();

    const handleUpdate = () => fetchAboutData();
    window.addEventListener("about-section-updated", handleUpdate);
    return () => window.removeEventListener("about-section-updated", handleUpdate);
  }, []);

  const stats = aboutData.stats && aboutData.stats.length > 0 ? aboutData.stats : DEFAULT_ABOUT_DATA.stats;
  const features = aboutData.features && aboutData.features.length > 0 ? aboutData.features : DEFAULT_ABOUT_DATA.features;

  return (
    <section id="about" className="py-16 sm:py-20 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900/50 dark:via-background dark:to-slate-900/50 rounded-3xl my-12 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>{aboutData.badge || "About BloomShop"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            {aboutData.title || "Where Modern Style Meets Uncompromised Comfort"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {aboutData.description || "Founded with a passion for elevated footwear, BloomShop merges aesthetic innovation with day-long ergonomic support."}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          {/* Left Column: Visual Image with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
              <img
                src={aboutData.image || "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop"}
                alt="Crafting Sneaker Quality"
                className="w-full h-110 object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <p className="text-xs uppercase font-semibold text-amber-300 tracking-wider">
                  {aboutData.quoteBadge || "Our Commitment"}
                </p>
                <p className="text-sm font-medium mt-1 text-slate-100">
                  "{aboutData.quote || "Every stitch is calculated for maximum durability and timeless visual appeal."}"
                </p>
              </div>
            </div>

            {/* Floating Highlight Card */}
            <div className="absolute -top-6 -left-4 sm:-left-6 hidden sm:flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-bounce duration-1000">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Loved Worldwide</p>
                <p className="text-sm font-bold text-foreground">Top Rated Brand 2025</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                {aboutData.subTitle || "Built for the Street, Designed for the Future"}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                {aboutData.subDescription || "Whether you're hitting the pavement, training for your next milestone, or making a sleek fashion statement, our curated sneaker lineup delivers optimum support without compromising on trendsetting design."}
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((item, idx) => {
                const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length] || Award;
                return (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 space-y-2 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color || "text-amber-500 bg-amber-50 dark:bg-amber-950/30"} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-foreground text-base pt-1">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Key Bullet list & Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{aboutData.bullet1 || "Ethically Sourced Materials"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{aboutData.bullet2 || "Rigorous 12-Point Quality Checks"}</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  const el = document.querySelector("#products");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-primary text-primary-foreground font-semibold px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {aboutData.buttonText || "Explore Products"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Counter Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {stats.map((stat, i) => (
            <div key={i} className={i > 0 ? "pt-4 md:pt-0" : ""}>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">{stat.value}</p>
              <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

