import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

// Brand SVG Icons
const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterXIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.861.861 2.796.862h.005c3.179 0 5.767-2.586 5.768-5.766 0-1.541-.601-2.99-1.69-4.08-1.09-1.09-2.54-1.689-4.083-1.67zm0-2.172c4.418 0 8 3.582 8 8s-3.582 8-8 8c-1.42 0-2.753-.374-3.916-1.028l-4.115 1.028 1.054-3.987c-.742-1.214-1.173-2.645-1.173-4.013 0-4.418 3.582-8 8-8z" />
  </svg>
);

const DEFAULT_SETTINGS = {
  storeName: "BloomShop",
  supportEmail: "support@bloomshop.com",
  supportPhone: "+92 347 6722423",
  currency: "USD ($)",
  currencySymbol: "$",
  socialInstagram: "https://instagram.com/bloomshop",
  socialFacebook: "https://facebook.com/bloomshop",
  socialTwitter: "https://twitter.com/bloomshop",
  socialWhatsapp: "+923476722423"
};

export default function SettingsTab() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/settings`);
      if (res.data && res.data.settings) {
        setSettings((prev) => ({ ...prev, ...res.data.settings }));
        localStorage.setItem("bloom_admin_settings", JSON.stringify(res.data.settings));
      }
    } catch (err) {
      console.warn("Using local settings fallback:", err);
      const cached = localStorage.getItem("bloom_admin_settings");
      if (cached) {
        try {
          setSettings(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4000);
  };

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Save Store & Social Settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/settings`, settings);
      if (res.data && res.data.settings) {
        setSettings(res.data.settings);
        localStorage.setItem("bloom_admin_settings", JSON.stringify(res.data.settings));
      }
      showNotification("success", "Settings saved successfully!");
    } catch (err) {
      console.error("Save settings error:", err);
      localStorage.setItem("bloom_admin_settings", JSON.stringify(settings));
      showNotification("success", "Settings saved locally!");
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-xs max-w-5xl mx-auto">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold text-gray-500">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* ─── TOP HEADER (WIDE & CENTERED) ─────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Admin Settings Center
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Data Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Store Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your store's social media links shown in the website footer.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── STATUS NOTIFICATION BANNER ───────────────────────────────────── */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-xs animate-in slide-in-from-top-2 duration-150 ${statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
            }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg({ type: "", text: "" })}
            className="text-gray-400 hover:text-gray-700 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── 2. SOCIAL MEDIA LINKS WITH REAL ICONS & LIVE PREVIEWS ────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Social Media Links
            </h2>
            <p className="text-xs text-gray-500">
              Add links here to connect with the social media icons displayed in the website footer
            </p>
          </div>
        </div>

        {/* Inputs with brand SVG icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Instagram input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
                <InstagramIcon className="w-3 h-3" />
              </span>
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={settings.socialInstagram}
              onChange={(e) => handleInputChange("socialInstagram", e.target.value)}
              placeholder="https://instagram.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Facebook input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-[#1877F2] text-white">
                <FacebookIcon className="w-3 h-3" />
              </span>
              Facebook Page URL
            </label>
            <input
              type="url"
              value={settings.socialFacebook}
              onChange={(e) => handleInputChange("socialFacebook", e.target.value)}
              placeholder="https://facebook.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Twitter / X input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-black text-white">
                <TwitterXIcon className="w-3 h-3" />
              </span>
              Twitter / X Profile URL
            </label>
            <input
              type="url"
              value={settings.socialTwitter}
              onChange={(e) => handleInputChange("socialTwitter", e.target.value)}
              placeholder="https://twitter.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* WhatsApp input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-[#25D366] text-white">
                <WhatsAppIcon className="w-3 h-3" />
              </span>
              WhatsApp Phone / Helpline
            </label>
            <input
              type="text"
              value={settings.socialWhatsapp}
              onChange={(e) => handleInputChange("socialWhatsapp", e.target.value)}
              placeholder="+923476722423"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
