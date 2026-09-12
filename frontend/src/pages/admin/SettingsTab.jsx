import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSettings } from '@/context/SettingsContext';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  RotateCcw,
  Globe,
  Share2,
  Copy,
  Check,
  Link as LinkIcon
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

export default function SettingsTab() {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(globalSettings);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  const faviconInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "";

  // Keep local state in sync when global settings load
  useEffect(() => {
    if (globalSettings) {
      setFormData(globalSettings);
    }
  }, [globalSettings]);

  const showNotification = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: "", text: "" }), 4500);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Upload handler for Favicon
  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "File size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      setUploadingFavicon(true);

      try {
        const payload = { imageBase64: base64Data, type: "favicon" };
        const res = await axios.post(`${API_URL}/api/upload-brand-asset`, payload);
        const uploadedUrl = res.data?.url || base64Data;
        handleInputChange("favicon", uploadedUrl);
        showNotification("success", "Favicon uploaded & image link updated!");
      } catch (err) {
        console.warn("Upload fallback to direct base64:", err);
        handleInputChange("favicon", base64Data);
        showNotification("success", "Favicon loaded successfully!");
      } finally {
        setUploadingFavicon(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save All Settings
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await updateSettings(formData);
      if (res?.success) {
        showNotification("success", "Settings saved! Title & Favicon applied dynamically across website!");
      } else {
        showNotification("success", "Settings saved locally!");
      }
    } catch (err) {
      console.error("Save error:", err);
      showNotification("error", "Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const copyFaviconLink = () => {
    if (!formData.favicon) return;
    navigator.clipboard.writeText(formData.favicon);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // WhatsApp number helper for preview
  const cleanWhatsappNumber = (formData.socialWhatsapp || "").replace(/[^0-9]/g, "");

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 pb-24">
      {/* ─── STICKY HEADER WITH INSTANT SAVE ──────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Admin Settings Center
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Dynamic Favicon & Title Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Store Settings & Branding
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure your dynamic Favicon (with image link or upload), dynamic Store Title, Terms & Conditions, Privacy Policy, and WhatsApp helpline.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 shrink-0"
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

      {/* ─── STATUS NOTIFICATION TOAST BANNER ──────────────────────────────── */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-sm animate-in slide-in-from-top-2 duration-150 ${
            statusMsg.type === "success"
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
            className="text-gray-400 hover:text-gray-700 cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── 1. DYNAMIC FAVICON & DYNAMIC STORE TITLE ──────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Browser Favicon & Store Title (Dynamic)
            </h2>
            <p className="text-xs text-gray-500">
              Your favicon and store title dynamically update the browser tab icon and title in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STORE FAVICON CONFIGURATION WITH DIRECT IMAGE LINK */}
          <div className="space-y-4 p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Dynamic Favicon
                </label>
                {formData.favicon && formData.favicon !== "/favicon.svg" && (
                  <button
                    type="button"
                    onClick={() => handleInputChange("favicon", "/favicon.svg")}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Default
                  </button>
                )}
              </div>

              {/* Browser Tab Simulated Preview */}
              <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-white">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2 text-center">
                  Live Browser Tab Preview
                </p>
                <div className="bg-slate-200/80 p-2.5 rounded-xl flex items-center justify-center">
                  <div className="bg-white px-4 py-2 rounded-lg shadow-xs flex items-center gap-2.5 w-full max-w-[240px] border border-gray-200">
                    <img
                      src={formData.favicon || "/favicon.svg"}
                      alt="Favicon Preview"
                      className="w-4 h-4 rounded-xs object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = "/favicon.svg";
                      }}
                    />
                    <span className="text-xs font-bold text-gray-800 truncate">
                      {formData.storeName || "BloomShop"}
                    </span>
                    <span className="text-gray-400 text-[10px] ml-auto">✕</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Updates your active browser tab icon automatically upon saving!
                </p>
              </div>

              {/* Favicon Image Link (URL) & Upload Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-600" /> Favicon Image Link (URL)
                  </label>
                  {formData.favicon && (
                    <button
                      type="button"
                      onClick={copyFaviconLink}
                      className="text-[11px] text-gray-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.favicon}
                    onChange={(e) => handleInputChange("favicon", e.target.value)}
                    placeholder="Enter Image Link: https://example.com/icon.png or /favicon.svg"
                    className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                  />
                  {formData.favicon && (
                    <a
                      href={formData.favicon}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Favicon Image in New Tab"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center transition border border-gray-200"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="file"
                    ref={faviconInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={uploadingFavicon}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {uploadingFavicon ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Upload Favicon File</span>
                  </button>
                  <span className="text-[11px] text-gray-400">ICO, PNG, SVG (32x32)</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC STORE TITLE & TAGLINE */}
          <div className="space-y-4 p-5 rounded-2xl bg-gray-50/70 border border-gray-200/80 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" /> Dynamic Title & Tagline
              </label>

              {/* Title Live Preview Card */}
              <div className="rounded-xl border border-dashed border-gray-300 p-4 bg-white space-y-2">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center">
                  Live Browser Page Title Preview
                </p>
                <div className="p-3 bg-gray-100 rounded-xl text-center">
                  <p className="text-sm font-black text-gray-900 tracking-tight">
                    {formData.storeName || "BloomShop"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {formData.storeTagline || "Premium Footwear & Streetwear Lifestyle"}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Updates <code className="text-slate-800 font-mono">&lt;title&gt;</code> in browser tabs dynamically!
                </p>
              </div>

              {/* Title Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Store Title (Document & Tab Name)
                  </label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange("storeName", e.target.value)}
                    placeholder="e.g. BloomShop"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Store Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.storeTagline}
                    onChange={(e) => handleInputChange("storeTagline", e.target.value)}
                    placeholder="e.g. Premium Footwear & Streetwear Lifestyle"
                    className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. LEGAL POLICIES (TERMS & PRIVACY) ─────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Legal Policies & Store Agreements
            </h2>
            <p className="text-xs text-gray-500">
              Full dynamic Terms & Conditions and Privacy Policy texts directly presented on <code className="text-primary font-mono">/terms</code> and <code className="text-primary font-mono">/privacy</code>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TERMS & CONDITIONS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Terms & Conditions
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {formData.termsConditions?.length || 0} characters
              </span>
            </div>
            <textarea
              rows={8}
              value={formData.termsConditions}
              onChange={(e) => handleInputChange("termsConditions", e.target.value)}
              placeholder="Enter your store's terms of service, ordering policies, returns, and agreements..."
              className="w-full p-4 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-sans"
            />
            <p className="text-[11px] text-gray-400">
              Shown to customers on the <span className="font-semibold text-gray-600">/terms</span> page and referenced during checkout.
            </p>
          </div>

          {/* PRIVACY POLICY */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Privacy Policy
              </label>
              <span className="text-[10px] text-gray-400 font-mono">
                {formData.privacyPolicy?.length || 0} characters
              </span>
            </div>
            <textarea
              rows={8}
              value={formData.privacyPolicy}
              onChange={(e) => handleInputChange("privacyPolicy", e.target.value)}
              placeholder="Enter your store's privacy policy, data collection procedures, and SSL security guarantees..."
              className="w-full p-4 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed font-sans"
            />
            <p className="text-[11px] text-gray-400">
              Shown to customers on the <span className="font-semibold text-gray-600">/privacy</span> page and order placement footer.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. DIRECT CONTACT & WHATSAPP HELPLINE (PLACED BELOW LEGAL POLICIES) ── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Direct Contact & WhatsApp Helpline
            </h2>
            <p className="text-xs text-gray-500">
              These details are dynamically injected into Order Placing (Checkout), Header, Footer, and Contact Us page.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              Customer Helpline / Contact Phone
            </label>
            <input
              type="text"
              value={formData.supportPhone}
              onChange={(e) => handleInputChange("supportPhone", e.target.value)}
              placeholder="+92 347 6722423"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
            />
            <p className="text-[11px] text-gray-400 mt-1">Displayed in Header, Footer, and Order Confirmation.</p>
          </div>

          {/* WhatsApp Phone with Test Action */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="p-1 rounded-md bg-[#25D366] text-white">
                  <WhatsAppIcon className="w-3 h-3" />
                </span>
                Official WhatsApp Number
              </span>
              {cleanWhatsappNumber && (
                <a
                  href={`https://wa.me/${cleanWhatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                >
                  <ExternalLink className="w-2.5 h-2.5" /> Test Link
                </a>
              )}
            </label>
            <input
              type="text"
              value={formData.socialWhatsapp}
              onChange={(e) => handleInputChange("socialWhatsapp", e.target.value)}
              placeholder="e.g. +923476722423 or 03476722423"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-semibold"
            />
            <p className="text-[11px] text-gray-400 mt-1">Directly powers instant WhatsApp support across Checkout and Footer.</p>
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Official Support Email
            </label>
            <input
              type="email"
              value={formData.supportEmail}
              onChange={(e) => handleInputChange("supportEmail", e.target.value)}
              placeholder="support@bloomshop.com"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Physical Store Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Store Physical Address / Location
            </label>
            <input
              type="text"
              value={formData.storeAddress}
              onChange={(e) => handleInputChange("storeAddress", e.target.value)}
              placeholder="e.g. Shabqadar Charsadda, Peshawar, Pakistan"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ─── 4. SOCIAL MEDIA CHANNELS ────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <div className="p-2.5 bg-purple-50 text-purple-700 rounded-2xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              Social Media Channels
            </h2>
            <p className="text-xs text-gray-500">
              Social channels linked from the website footer and brand touchpoints.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Instagram */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white">
                <InstagramIcon className="w-3 h-3" />
              </span>
              Instagram Profile URL
            </label>
            <input
              type="url"
              value={formData.socialInstagram}
              onChange={(e) => handleInputChange("socialInstagram", e.target.value)}
              placeholder="https://instagram.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Facebook */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-[#1877F2] text-white">
                <FacebookIcon className="w-3 h-3" />
              </span>
              Facebook Page URL
            </label>
            <input
              type="url"
              value={formData.socialFacebook}
              onChange={(e) => handleInputChange("socialFacebook", e.target.value)}
              placeholder="https://facebook.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Twitter / X */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <span className="p-1 rounded-md bg-black text-white">
                <TwitterXIcon className="w-3 h-3" />
              </span>
              Twitter / X Profile URL
            </label>
            <input
              type="url"
              value={formData.socialTwitter}
              onChange={(e) => handleInputChange("socialTwitter", e.target.value)}
              placeholder="https://twitter.com/bloomshop"
              className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* ─── BOTTOM FLOATING ACTION BAR ──────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-7 py-3.5 bg-slate-950 hover:bg-black text-white rounded-2xl text-xs font-black shadow-2xl transition flex items-center gap-2 cursor-pointer border border-slate-700 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-amber-400" />
              <span>Save All Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
