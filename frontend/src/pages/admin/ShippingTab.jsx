import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Search,
  Check,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import {
  PAKISTAN_CITIES,
  PAKISTAN_SHIPPING_ZONES,
  SHIPPING_ZONE_DETAILS,
  getShippingZoneForCity
} from '@/utils/locationData';

export default function ShippingTab() {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(globalSettings);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Cities Explorer Filter & Search
  const [activeZoneFilter, setActiveZoneFilter] = useState('all');
  const [citySearchQuery, setCitySearchQuery] = useState('');

  // Sync settings when loaded
  useEffect(() => {
    if (globalSettings) {
      setFormData(globalSettings);
    }
  }, [globalSettings]);

  const showNotification = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4500);
  };

  const handleRateChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(value) < 0 ? 0 : Number(value)
    }));
  };

  const handleTextChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await updateSettings(formData);
      if (res?.success) {
        showNotification('success', 'Dynamic shipping rates saved successfully! Changes active in checkout.');
      } else {
        showNotification('success', 'Shipping rates updated!');
      }
    } catch (err) {
      console.error('Error saving shipping settings:', err);
      showNotification('error', 'Failed to save shipping settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Recommended Defaults
  const handleResetDefaults = () => {
    setFormData((prev) => ({
      ...prev,
      freeShippingCity: 'Peshawar',
      shippingRateNear: 250,
      shippingRateFar: 500,
      shippingRateMoreFar: 700,
      flatShippingRate: 250
    }));
    showNotification('success', 'Reset rates to recommended defaults: Near Rs. 250 • Far Rs. 500 • More Far Rs. 700');
  };

  // Filtered Cities List for Explorer
  const filteredCities = useMemo(() => {
    return PAKISTAN_CITIES.map((city) => {
      const zone = getShippingZoneForCity(city, formData.freeShippingCity || 'Peshawar', formData.customCityZones || {});
      let rate = 0;
      if (zone === 'free') rate = 0;
      else if (zone === 'near') rate = formData.shippingRateNear ?? 250;
      else if (zone === 'far') rate = formData.shippingRateFar ?? 500;
      else if (zone === 'more_far') rate = formData.shippingRateMoreFar ?? 700;

      return { city, zone, rate };
    }).filter((item) => {
      const matchesSearch = item.city.toLowerCase().includes(citySearchQuery.toLowerCase());
      const matchesZone = activeZoneFilter === 'all' || item.zone === activeZoneFilter;
      return matchesSearch && matchesZone;
    });
  }, [formData, activeZoneFilter, citySearchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 pb-28">
      {/* ─── HEADER WITH SAVE ACTION ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-500" /> Pakistan Delivery Engine
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Distance Tiers Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Shipping Rates & Delivery Zones
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Configure dynamic delivery charges based on distance from {formData.freeShippingCity || "Peshawar"}: Free in {formData.freeShippingCity || "Peshawar"}, Rs. {formData.shippingRateNear ?? 250} Near, Rs. {formData.shippingRateFar ?? 500} Far, and Rs. {formData.shippingRateMoreFar ?? 700} More Far.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="Reset rates to standard defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save All Rates</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── STATUS NOTIFICATION BANNER ───────────────────────────────────── */}
      {statusMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-sm animate-in slide-in-from-top-2 duration-150 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg({ type: '', text: '' })}
            className="text-gray-400 hover:text-gray-700 cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── 1. THE 4 DISTANCE TIERS FROM PESHAWAR ─────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span>Distance-Based Shipping Tiers</span>
            <span className="text-xs text-gray-400 font-normal">(All amounts in PKR)</span>
          </h2>
          <span className="text-xs font-bold text-gray-500">Origin: {formData.freeShippingCity || "Peshawar"} 🇵🇰</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TIER 0: PESHAWAR FREE */}
          <div className="bg-white border-2 border-emerald-500/80 rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
              100% Free
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Tier 0: Free City
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-1">Rs. 0</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Free delivery for residents</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-700">Free Shipping City</label>
              <input
                type="text"
                value={formData.freeShippingCity ?? 'Peshawar'}
                onChange={(e) => handleTextChange('freeShippingCity', e.target.value)}
                placeholder="Peshawar"
                className="w-full px-3 py-2 text-xs bg-emerald-50/50 border border-emerald-200 rounded-xl font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Selected city automatically gets Rs. 0 shipping at checkout.
            </p>
          </div>

          {/* TIER 1: NEAR TO PESHAWAR */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-blue-400 transition">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-blue-700 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" /> Tier 1: Near {formData.freeShippingCity || "Peshawar"}
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">
                  Rs. {formData.shippingRateNear ?? 250}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">KPK, Islamabad, Rawalpindi</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-700">Delivery Rate (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.shippingRateNear ?? 250}
                  onChange={(e) => handleRateChange('shippingRateNear', e.target.value)}
                  placeholder="250"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Charsadda, Shabqadar, Mardan, Nowshera, Swabi, Kohat, Abbottabad, Swat, Islamabad, etc.
            </p>
          </div>

          {/* TIER 2: FAR FROM PESHAWAR */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-amber-400 transition">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" /> Tier 2: Far Away
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">
                  Rs. {formData.shippingRateFar ?? 500}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Punjab &amp; Central Pakistan</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-700">Delivery Rate (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.shippingRateFar ?? 500}
                  onChange={(e) => handleRateChange('shippingRateFar', e.target.value)}
                  placeholder="500"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Lahore, Faisalabad, Gujranwala, Sialkot, Multan, Sargodha, Gujrat, Bahawalpur, etc.
            </p>
          </div>

          {/* TIER 3: MORE FAR AWAY */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-rose-400 transition">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5" /> Tier 3: More Far Away
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-gray-900">
                  Rs. {formData.shippingRateMoreFar ?? 700}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Sindh, Balochistan &amp; South</p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-700">Delivery Rate (PKR)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Rs.</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.shippingRateMoreFar ?? 700}
                  onChange={(e) => handleRateChange('shippingRateMoreFar', e.target.value)}
                  placeholder="700"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight">
              Karachi, Hyderabad, Sukkur, Larkana, Quetta, Gwadar, Turbat, Hub, Khuzdar, etc.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 2. ZONE CITIES EXPLORER (SEARCHABLE DIRECTORY) ──────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <span>Pakistan Cities Zone Directory</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                {filteredCities.length} Cities
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Browse all Pakistani cities categorized by distance and delivery charges.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search city (e.g. Lahore, Karachi)..."
              value={citySearchQuery}
              onChange={(e) => setCitySearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Zone Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveZoneFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeZoneFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Cities ({PAKISTAN_CITIES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveZoneFilter('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeZoneFilter === 'free'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>Peshawar</span>
            <span className="text-[10px] opacity-80">(Rs. 0)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveZoneFilter('near')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeZoneFilter === 'near'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>Near</span>
            <span className="text-[10px] opacity-80">(Rs. {formData.shippingRateNear ?? 250})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveZoneFilter('far')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeZoneFilter === 'far'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>Far</span>
            <span className="text-[10px] opacity-80">(Rs. {formData.shippingRateFar ?? 500})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveZoneFilter('more_far')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeZoneFilter === 'more_far'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>More Far</span>
            <span className="text-[10px] opacity-80">(Rs. {formData.shippingRateMoreFar ?? 700})</span>
          </button>
        </div>

        {/* Cities Grid List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredCities.map((item) => {
            const badgeClass =
              item.zone === 'free'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : item.zone === 'near'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : item.zone === 'far'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={item.city}
                className="p-2.5 rounded-xl border border-gray-200/80 bg-gray-50/50 flex items-center justify-between text-xs hover:bg-white hover:shadow-xs transition"
              >
                <span className="font-bold text-gray-800 truncate">{item.city}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${badgeClass}`}>
                  {item.rate === 0 ? 'FREE' : `Rs. ${item.rate}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
