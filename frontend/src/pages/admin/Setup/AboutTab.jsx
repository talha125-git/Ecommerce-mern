import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Info,
  Upload,
  Save,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Sparkles,
  Eye,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';

const DEFAULT_ABOUT = {
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

export default function AboutTab() {
  const [formData, setFormData] = useState(DEFAULT_ABOUT);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Fetch saved About section from backend on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/api/about`)
      .then((res) => {
        if (res.data && res.data.about) {
          setFormData((prev) => ({ ...prev, ...res.data.about }));
          localStorage.setItem('admin_about_section', JSON.stringify(res.data.about));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch About details from database:', err);
        const saved = localStorage.getItem('admin_about_section');
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (e) {
            /* ignore */
          }
        }
      });
  }, [API_URL]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (index, field, value) => {
    const updatedStats = [...formData.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    setFormData((prev) => ({ ...prev, stats: updatedStats }));
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData((prev) => ({ ...prev, features: updatedFeatures }));
  };

  // Browse & Upload Image
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadNotice('Uploading image...');

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;

      try {
        const res = await axios.post(`${API_URL}/api/upload-about-image`, {
          imageBase64: base64Data
        });

        if (res.data && res.data.url) {
          handleChange('image', res.data.url);
          setUploadNotice('✅ Image uploaded successfully!');
        } else {
          setUploadNotice('⚠️ Upload returned no URL');
        }
      } catch (err) {
        console.error('Image upload error:', err);
        handleChange('image', base64Data);
        setUploadNotice('✅ Image updated (local preview)');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save changes to MongoDB database
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/about`, formData);
      if (res.data && res.data.about) {
        setFormData(res.data.about);
      }

      localStorage.setItem('admin_about_section', JSON.stringify(formData));
      window.dispatchEvent(new Event('about-section-updated'));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save About section:', err);
      alert('Failed to save to database. Please check your backend connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset About Us section back to default content?')) {
      setFormData(DEFAULT_ABOUT);
      localStorage.setItem('admin_about_section', JSON.stringify(DEFAULT_ABOUT));
      window.dispatchEvent(new Event('about-section-updated'));

      try {
        await axios.post(`${API_URL}/api/about`, DEFAULT_ABOUT);
      } catch (err) {
        console.warn('Could not reset database:', err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-200">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                About Us Setup
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                Frontend Setup
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Edit the "About BloomShop" section text, heading, picture, stats counters, and features.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition cursor-pointer ${
              saving
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving to Database...' : saveSuccess ? 'Saved Live!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>✅ About Us details updated! Changes are live on the homepage.</span>
          <span className="text-[10px] font-mono bg-emerald-200/60 px-2 py-0.5 rounded">
            Synced with MongoDB
          </span>
        </div>
      )}

      {/* Main Content Layout: Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Edit Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Section Title & Description
            </h3>

            {/* Badge & Main Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Badge Text</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => handleChange('badge', e.target.value)}
                  placeholder="e.g. About BloomShop"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Button Text</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  placeholder="e.g. Explore Products"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Main Heading (Title)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Where Modern Style Meets Uncompromised Comfort"
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-extrabold"
              />
            </div>

            {/* Main Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Main Paragraph Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter description text..."
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Column Subheading & Sub Description */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold text-gray-700">Secondary Subheading</label>
              <input
                type="text"
                value={formData.subTitle}
                onChange={(e) => handleChange('subTitle', e.target.value)}
                placeholder="Built for the Street, Designed for the Future"
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Secondary Sub-Description</label>
              <textarea
                rows={2}
                value={formData.subDescription}
                onChange={(e) => handleChange('subDescription', e.target.value)}
                placeholder="Enter secondary paragraph description..."
                className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Section Picture & Browse Button */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <label className="text-xs font-bold text-gray-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Section Showcase Picture
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Image Upload Supported
                </span>
              </label>

              <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-4 bg-gray-50/50 text-center transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  id="about-img-file"
                  className="hidden"
                />
                <label
                  htmlFor="about-img-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-800 hover:underline">
                      Click to Browse & Upload Image from Computer
                    </span>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Select JPG, PNG or WEBP file
                    </p>
                  </div>
                </label>
              </div>

              {uploading && (
                <p className="text-xs text-amber-600 font-semibold animate-pulse">
                  ⏳ Uploading picture...
                </p>
              )}

              {uploadNotice && (
                <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                  {uploadNotice}
                </p>
              )}

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-gray-600">
                  Or paste direct Image URL:
                </span>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => handleChange('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Image Overlay Quote */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Image Quote Badge</label>
                <input
                  type="text"
                  value={formData.quoteBadge}
                  onChange={(e) => handleChange('quoteBadge', e.target.value)}
                  placeholder="e.g. Our Commitment"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Image Overlay Quote Text</label>
                <input
                  type="text"
                  value={formData.quote}
                  onChange={(e) => handleChange('quote', e.target.value)}
                  placeholder="Quote inside image..."
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Checkpoints Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Bullet Checkpoint 1</label>
                <input
                  type="text"
                  value={formData.bullet1}
                  onChange={(e) => handleChange('bullet1', e.target.value)}
                  placeholder="e.g. Ethically Sourced Materials"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Bullet Checkpoint 2</label>
                <input
                  type="text"
                  value={formData.bullet2}
                  onChange={(e) => handleChange('bullet2', e.target.value)}
                  placeholder="e.g. Rigorous 12-Point Quality Checks"
                  className="w-full px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Stats Counter Bar Section */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Store Stats Counter Bar (4 Items)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.stats?.map((st, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">
                      Stat #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                      placeholder="Value (e.g. 50,000+)"
                      className="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg font-extrabold text-amber-600"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                      placeholder="Label (e.g. Happy Shoppers)"
                      className="w-full px-2 py-1 text-[11px] bg-white border border-gray-200 rounded-lg font-medium text-gray-700"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Feature Pillars (4 Items)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formData.features?.map((ft, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      Feature #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={ft.title}
                      onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                      placeholder="Title"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg font-bold"
                    />
                    <textarea
                      rows={2}
                      value={ft.description}
                      onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (5 cols): Live Storefront Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" /> Storefront Preview
              </h3>
              <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-mono">
                Live Mockup
              </span>
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-full">
                  {formData.badge}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  {formData.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {formData.description}
                </p>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md">
                <img
                  src={formData.image || 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600'}
                  alt="Preview"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px]">
                  <span className="font-bold text-amber-300 uppercase block">
                    {formData.quoteBadge}
                  </span>
                  <span className="line-clamp-2">{formData.quote}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-bold text-gray-900">{formData.subTitle}</h4>
                <p className="text-[11px] text-gray-600">{formData.subDescription}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formData.bullet1}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{formData.bullet2}</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-3 grid grid-cols-2 gap-2 text-center text-[10px]">
                {formData.stats?.map((s, i) => (
                  <div key={i}>
                    <p className="font-extrabold text-amber-400">{s.value}</p>
                    <p className="text-[9px] text-slate-300">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
