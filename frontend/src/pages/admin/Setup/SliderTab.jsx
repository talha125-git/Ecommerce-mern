import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sliders, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  Check, 
  Image as ImageIcon, 
  Sparkles, 
  Flame, 
  Zap, 
  Eye, 
  ArrowRight,
  MoveUp,
  MoveDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEFAULT_SLIDES = [
  {
    id: 1,
    tag: "SUMMER DROP 2025",
    tagIcon: "Flame",
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
    tagIcon: "Sparkles",
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
    tagIcon: "Zap",
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

const GRADIENTS = [
  { label: "Warm Orange & Amber", value: "from-orange-600/90 via-amber-600/80 to-stone-900" },
  { label: "Cool Blue & Indigo", value: "from-blue-700/90 via-indigo-800/80 to-slate-950" },
  { label: "Emerald & Teal", value: "from-emerald-700/90 via-teal-800/80 to-slate-900" },
  { label: "Purple & Rose Velvet", value: "from-purple-700/90 via-pink-800/80 to-slate-950" },
  { label: "Dark Onyx & Crimson", value: "from-red-800/90 via-rose-950/90 to-slate-950" },
  { label: "Cyberpunk Cyan & Violet", value: "from-cyan-600/90 via-indigo-800/85 to-purple-950" },
  { label: "Golden Sunset & Amber", value: "from-yellow-600/90 via-amber-700/85 to-zinc-950" },
  { label: "Midnight Aurora & Sky", value: "from-teal-600/90 via-sky-800/85 to-indigo-950" },
  { label: "Electric Fuchsia & Magenta", value: "from-fuchsia-700/90 via-purple-800/85 to-slate-950" },
  { label: "Deep Ocean & Navy", value: "from-sky-700/90 via-blue-900/90 to-slate-950" },
  { label: "Lush Forest & Lime", value: "from-lime-600/90 via-emerald-800/85 to-slate-950" },
  // { label: "Volcanic Flame & Blood Orange", value: "from-amber-500/90 via-orange-700/85 to-red-950" },
];

export default function SliderTab() {
  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  // Fetch slides from MongoDB on mount
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '';
    axios.get(`${API_URL}/api/slides`)
      .then(res => {
        if (res.data && res.data.slides && res.data.slides.length > 0) {
          setSlides(res.data.slides);
          localStorage.setItem('admin_hero_slides', JSON.stringify(res.data.slides));
        }
      })
      .catch(err => {
        console.warn("Could not fetch slides from database:", err);
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_hero_slides');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
          } catch (e) { /* ignore */ }
        }
      });
  }, []);

  const currentSlide = slides[activeSlideIndex] || slides[0] || DEFAULT_SLIDES[0];

  const getImageUrl = (url) => {
    if (!url) return '';
    return url;
  };

  const handleUpdateCurrentSlide = (field, value) => {
    const updated = slides.map((s, idx) => {
      if (idx === activeSlideIndex) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setSlides(updated);
  };

  // Upload image to Cloudinary via backend
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadNotice('Uploading to Cloudinary...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;

      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.post(`${API_URL}/api/upload-slider-image`, {
          imageBase64: base64Data,
        });

        if (res.data && res.data.url) {
          handleUpdateCurrentSlide('image', res.data.url);
          setUploadNotice('✅ Uploaded to Cloudinary successfully!');
        } else {
          setUploadNotice('⚠️ Upload returned no URL');
        }
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        setUploadNotice('❌ Upload failed - check API key settings');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save all slides to MongoDB
  const handleSaveAllSlides = async () => {
    setSaving(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${API_URL}/api/slides`, { slides });

      if (res.data && res.data.slides) {
        setSlides(res.data.slides);
      }

      // Also update localStorage for same-tab instant refresh
      localStorage.setItem('admin_hero_slides', JSON.stringify(slides));
      window.dispatchEvent(new Event('hero-slides-updated'));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save slides to MongoDB:", err);
      alert("Failed to save. Please check your backend connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNewSlide = () => {
    const newSlide = {
      id: Date.now(),
      tag: "SPECIAL EVENT",
      tagIcon: "Sparkles",
      title: "New Featured Banner Title",
      subtitle: "Add your captivating description or promotion summary here.",
      badge: "LIMITED TIME",
      ctaPrimary: "Shop Collection",
      ctaPrimaryTarget: "#products",
      ctaSecondary: "Explore Now",
      ctaSecondaryTarget: "#products",
      bgGradient: "from-blue-700/90 via-indigo-800/80 to-slate-950",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      accentColor: "bg-blue-500",
    };
    const updated = [...slides, newSlide];
    setSlides(updated);
    setActiveSlideIndex(updated.length - 1);
  };

  const handleDeleteSlide = (indexToDelete) => {
    if (slides.length <= 1) {
      alert("You must keep at least one slide in the slider.");
      return;
    }
    const updated = slides.filter((_, idx) => idx !== indexToDelete);
    setSlides(updated);
    if (activeSlideIndex >= updated.length) {
      setActiveSlideIndex(updated.length - 1);
    }
  };

  const handleMoveSlide = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setSlides(updated);
    setActiveSlideIndex(newIndex);
  };

  const handleResetDefaults = async () => {
    if (confirm("Reset slider settings to default 3 slides?")) {
      setSlides(DEFAULT_SLIDES);
      setActiveSlideIndex(0);
      localStorage.setItem('admin_hero_slides', JSON.stringify(DEFAULT_SLIDES));
      window.dispatchEvent(new Event('hero-slides-updated'));

      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        await axios.post(`${API_URL}/api/slides`, { slides: DEFAULT_SLIDES });
      } catch (err) {
        console.warn("Could not sync reset defaults to database:", err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Frontend Home Slider Manager
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                Frontend CMS
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Customize home page titles, subheadings, badges, and upload background pictures directly to the public folder.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSaveAllSlides}
            disabled={saving}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition ${saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving to Database...' : saveSuccess ? 'Saved Live!' : 'Save Slider Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>✅ Slider settings saved to MongoDB! Changes are live on all devices.</span>
          <span className="text-[10px] font-mono bg-emerald-200/60 px-2 py-0.5 rounded">Synced: MongoDB + Cloudinary</span>
        </div>
      )}

      {/* Main Content Layout: Left Tabs + Form & Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Slide Selector + Edit Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Slide Switcher Pills */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Slide to Edit ({slides.length})
              </span>
              <button
                onClick={handleAddNewSlide}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-gray-900 text-xs font-bold rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5 text-primary" /> Add New Slide
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {slides.map((s, idx) => (
                <div key={s.id || idx} className="flex items-center">
                  <button
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                      activeSlideIndex === idx
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>Slide #{idx + 1}</span>
                    <span className="w-25 truncate text-[10px] opacity-75 font-normal">
                      {s.title}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form to edit active slide */}
          {currentSlide && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Editing Slide #{activeSlideIndex + 1} Details
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveSlide(activeSlideIndex, -1)}
                    disabled={activeSlideIndex === 0}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-lg text-gray-700"
                    title="Move Up"
                  >
                    <MoveUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveSlide(activeSlideIndex, 1)}
                    disabled={activeSlideIndex === slides.length - 1}
                    className="p-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-lg text-gray-700"
                    title="Move Down"
                  >
                    <MoveDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSlide(activeSlideIndex)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg ml-2"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title / Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                  <span>Slide Name / Heading Title</span>
                  <span className="text-[10px] text-gray-400 font-normal">Appears large on hero banner</span>
                </label>
                <input
                  type="text"
                  value={currentSlide.title || ''}
                  onChange={(e) => handleUpdateCurrentSlide('title', e.target.value)}
                  placeholder="e.g. Step Into Next-Gen Style"
                  className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Subtitle / Description</label>
                <textarea
                  rows={2}
                  value={currentSlide.subtitle || ''}
                  onChange={(e) => handleUpdateCurrentSlide('subtitle', e.target.value)}
                  placeholder="Brief description line under title"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tag & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Tag Line (Top Text)</label>
                  <input
                    type="text"
                    value={currentSlide.tag || ''}
                    onChange={(e) => handleUpdateCurrentSlide('tag', e.target.value)}
                    placeholder="e.g. SUMMER DROP 2025"
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Badge Text (Discount/Offer)</label>
                  <input
                    type="text"
                    value={currentSlide.badge || ''}
                    onChange={(e) => handleUpdateCurrentSlide('badge', e.target.value)}
                    placeholder="e.g. 30% OFF SPECIAL"
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Background Gradient */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Background Overlay Theme</label>
                <select
                  value={currentSlide.bgGradient || GRADIENTS[0].value}
                  onChange={(e) => handleUpdateCurrentSlide('bgGradient', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {GRADIENTS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload Background Picture section */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    Slider Background Picture
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Saved in public/uploads
                  </span>
                </label>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-4 bg-gray-50/50 text-center transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    id="slider-bg-file"
                    className="hidden"
                  />
                  <label htmlFor="slider-bg-file" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800 hover:underline">
                        Click to upload new picture from device
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Image will automatically be saved into the <code className="font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">public/uploads</code> folder
                      </p>
                    </div>
                  </label>
                </div>

                {uploading && (
                  <p className="text-xs text-amber-600 font-semibold animate-pulse flex items-center gap-1">
                    ⏳ Uploading and saving picture to public directory...
                  </p>
                )}

                {uploadNotice && (
                  <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                    ✅ {uploadNotice}
                  </p>
                )}

                {/* Picture URL manual input */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-gray-600">
                    Or specify image URL / public path directly:
                  </span>
                  <input
                    type="text"
                    value={currentSlide.image || ''}
                    onChange={(e) => handleUpdateCurrentSlide('image', e.target.value)}
                    placeholder="/uploads/slider-bg.jpg or https://..."
                    className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column (5 cols): Live Interactive Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                Live Slider Preview
              </h3>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono">
                Storefront View
              </span>
            </div>

            {/* Simulated Hero Slider Card */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 text-white shadow-xl border border-gray-800 min-h-95 flex flex-col justify-end p-6 group">
              {/* Background Picture */}
              {currentSlide?.image ? (
                <img
                  src={getImageUrl(currentSlide.image)}
                  alt={currentSlide.title}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-gray-500 text-xs">
                  No Image Selected
                </div>
              )}

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-linear-to-r ${currentSlide?.bgGradient || 'from-slate-900/90 to-slate-950'} mix-blend-multiply opacity-90`} />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Navigation Arrows for previewing line by line */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlideIndex((prev) => (prev + 1) % slides.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/80 text-white border border-white/20 transition-all cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Content */}
              <div className="relative z-10 space-y-3 pb-6">
                {/* Tag & Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/20">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{currentSlide?.tag || 'TAG'}</span>
                  <span>•</span>
                  <span className="text-amber-200">{currentSlide?.badge || 'BADGE'}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  {currentSlide?.title || 'Slide Title'}
                </h2>

                {/* Subtitle */}
                <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
                  {currentSlide?.subtitle || 'Slide subtitle description will appear here.'}
                </p>


              </div>

              {/* Pagination Dots at Bottom of Card */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeSlideIndex === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Go to Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Information Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                Automatic Homepage Sync
              </div>
              <p className="text-[11px] text-emerald-700 leading-normal">
                When you click <strong>Save Slider Changes</strong>, the Home hero carousel updates instantly across all browser windows and devices.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
