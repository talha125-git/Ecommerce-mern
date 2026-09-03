import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Save,
  Truck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPakistanCities, PAKISTAN_CITIES, getPostalCodeForCity } from "@/utils/locationData";

export default function ProfileTab({
  profileData,
  setProfileData,
  profileSaved,
  handleSaveProfile
}) {
  const displayName = profileData.name || "Customer User";
  const userInitial = displayName.charAt(0).toUpperCase() || "U";

  // Pakistan Cities state
  const [cities, setCities] = useState(PAKISTAN_CITIES);
  const [loadingCities, setLoadingCities] = useState(false);

  // Load complete Pakistan cities list on mount
  useEffect(() => {
    async function loadCities() {
      setLoadingCities(true);
      const data = await getPakistanCities();
      setCities(data);
      setLoadingCities(false);
    }
    loadCities();

    // Ensure country is set to Pakistan
    if (!profileData.country) {
      setProfileData((prev) => ({ ...prev, country: "Pakistan" }));
    }
  }, []);

  const handleChange = (field, value) => {
    setProfileData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "city" && value) {
        const autoPostal = getPostalCodeForCity(value);
        if (autoPostal) {
          updated.postalCode = autoPostal;
        }
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">

      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-primary shadow-inner">
              {userInitial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">{displayName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" /> Verified Account
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profileData.email || "No email added"}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-right">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Account Defaults</span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 justify-end">
              <Truck className="w-3.5 h-3.5" /> Ready for Checkout
            </span>
          </div>

        </div>
      </div>

      {/* ── Toast Notification ── */}
      {profileSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile saved successfully! Your default details will now pre-fill automatically at checkout.</span>
          </div>
          <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded-full text-emerald-900 font-extrabold uppercase">Saved</span>
        </div>
      )}

      {/* ── Main Form ── */}
      <form onSubmit={handleSaveProfile} className="space-y-6">

        {/* Section 1: Personal Info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-4 h-4" />
              </span>
              Personal Details
            </h3>
            <span className="text-[11px] text-gray-400 font-medium">Used for order receipts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Default Delivery Address */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </span>
              Default Shipping Address (Pakistan)
            </h3>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Auto-fills at Checkout
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street Address */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700">Street Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="e.g. House #123, Street 5, Main Boulevard"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            {/* Country (Pakistan Fixed) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value="Pakistan 🇵🇰"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs font-bold bg-gray-100 border border-gray-200 rounded-2xl text-gray-800 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Pakistan City Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>Select City (Pakistan) *</span>
                {loadingCities && <span className="text-[10px] text-gray-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</span>}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                <select
                  value={profileData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="">-- Choose City ({cities.length} available) --</option>
                  {cities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
              </div>
            </div>

            {/* Postal Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">Postal Code</label>
              <input
                type="text"
                value={profileData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="e.g. 54000 / 25000"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition"
              />
            </div>

          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-amber-900">Seamless One-Click Checkout</p>
            <p className="text-amber-800 text-[11px]">
              When you save your profile defaults here, your name, phone, address, city, and country will automatically populate at the checkout page for fast ordering across Pakistan.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="rounded-2xl px-6 py-5 text-xs font-bold gap-2 cursor-pointer shadow-md hover:shadow-lg transition"
          >
            <Save className="w-4 h-4" /> Save Profile Defaults
          </Button>
        </div>
      </form>
    </div>
  );
}
