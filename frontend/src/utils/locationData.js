import axios from "axios";

// Comprehensive Postal Code dictionary for Pakistani Cities
export const PAKISTAN_POSTAL_CODES = {
  // Islamabad Capital Territory
  "Islamabad": "44000",

  // Punjab
  "Lahore": "54000",
  "Faisalabad": "38000",
  "Rawalpindi": "46000",
  "Gujranwala": "52250",
  "Multan": "60000",
  "Bahawalpur": "63100",
  "Sargodha": "40100",
  "Sialkot": "51310",
  "Sheikhupura": "39350",
  "Rahim Yar Khan": "64200",
  "Jhang": "35200",
  "Dera Ghazi Khan": "32200",
  "Gujrat": "50700",
  "Sahiwal": "57000",
  "Wah Cantonment": "47040",
  "Kasur": "55050",
  "Okara": "56300",
  "Chiniot": "35400",
  "Hafizabad": "52110",
  "Sadiqabad": "64350",
  "Burewala": "61010",
  "Khanewal": "58150",
  "Muzaffargarh": "34200",
  "Mandi Bahauddin": "50400",
  "Jhelum": "49600",
  "Chakwal": "48800",
  "Attock": "43600",
  "Bhakkar": "30000",
  "Layyah": "31200",
  "Toba Tek Singh": "36050",
  "Vehari": "61100",
  "Bahawalnagar": "62300",
  "Narowal": "51600",
  "Kamoke": "52500",
  "Muridke": "39000",
  "Taxila": "47080",
  "Daska": "51100",
  "Samundri": "38300",
  "Jaranwala": "37200",
  "Chishtian": "62350",
  "Ahmedpur East": "63250",
  "Hasilpur": "63000",
  "Pattoki": "55300",
  "Mianwali": "42200",
  "Kallar Syedan": "46600",
  "Gujar Khan": "47800",
  "Kot Addu": "34000",
  "Pasrur": "51480",
  "Phalia": "50440",

  // Khyber Pakhtunkhwa
  "Peshawar": "25000",
  "Charsadda": "24420",
  "Shabqadar": "24630",
  "Abbottabad": "22010",
  "Bannu": "28100",
  "Batkhela": "23020",
  "Buner": "19290",
  "Chitral": "17200",
  "Dera Ismail Khan": "29050",
  "Dir": "18300",
  "Hangu": "26190",
  "Haripur": "22620",
  "Karak": "27200",
  "Khyber": "24800",
  "Kohat": "26000",
  "Kohistan": "20100",
  "Lakki Marwat": "28420",
  "Lower Dir": "18300",
  "Malakand": "23050",
  "Mansehra": "21300",
  "Mardan": "23200",
  "Mingora": "19130",
  "Nowshera": "24100",
  "Parachinar": "26300",
  "Swabi": "23430",
  "Swat": "19200",
  "Tank": "29400",
  "Timergara": "18300",
  "Torghar": "21470",
  "Upper Dir": "18300",
  "Wana": "29500",

  // Sindh
  "Karachi": "74000",
  "Hyderabad": "71000",
  "Sukkur": "65200",
  "Larkana": "77150",
  "Nawabshah (Shaheed Benazirabad)": "67450",
  "Mirpur Khas": "69000",
  "Shikarpur": "78100",
  "Jacobabad": "79000",
  "Thatta": "73110",
  "Badin": "72200",
  "Ghotki": "65000",
  "Dadu": "76200",
  "Tando Allahyar": "70010",
  "Tando Muhammad Khan": "70200",
  "Khairpur": "66020",
  "Kashmore": "79200",
  "Matiari": "70140",
  "Umerkot": "69200",
  "Kotri": "76000",
  "Jamshoro": "76080",
  "Daharki": "65010",
  "Sanghar": "68100",
  "Kandiaro": "67130",
  "Shahdadkot": "77300",

  // Balochistan
  "Quetta": "87300",
  "Turbat": "92600",
  "Khuzdar": "89100",
  "Chaman": "86000",
  "Hub": "90150",
  "Gwadar": "91200",
  "Sibi": "82000",
  "Zhob": "85200",
  "Pishin": "86200",
  "Dera Murad Jamali": "80500",
  "Dera Allah Yar": "80400",
  "Nushki": "95200",
  "Loralai": "84800",
  "Kharan": "85100",
  "Panjgur": "93000",
  "Mastung": "88200",
  "Kalat": "88300",
  "Jafarabad": "80400",

  // Azad Jammu & Kashmir
  "Muzaffarabad": "13100",
  "Mirpur": "10250",
  "Rawalakot": "12350",
  "Kotli": "11100",
  "Bhimber": "10040",
  "Bagh": "12500",
  "Hajira": "12300",
  "Neelum Valley": "13200",
  "Pallandri": "12000",

  // Gilgit-Baltistan
  "Gilgit": "15100",
  "Skardu": "16100",
  "Hunza": "15700",
  "Ghanche": "16800",
  "Diamer": "14100",
  "Ghizer": "15200",
  "Nagar": "15650",
  "Astore": "14300"
};

// List of all Pakistani cities
export const PAKISTAN_CITIES = Object.keys(PAKISTAN_POSTAL_CODES).sort();

/**
 * Get official Pakistan Post postal code for a city
 */
export function getPostalCodeForCity(cityName) {
  if (!cityName) return "";

  // Exact lookup
  if (PAKISTAN_POSTAL_CODES[cityName]) {
    return PAKISTAN_POSTAL_CODES[cityName];
  }

  // Case-insensitive lookup fallback
  const normalized = cityName.trim().toLowerCase();
  for (const [city, code] of Object.entries(PAKISTAN_POSTAL_CODES)) {
    if (city.toLowerCase() === normalized) {
      return code;
    }
  }

  // Default fallback for unknown Pakistani areas
  return "54000";
}

/**
 * Distance-based Shipping Zones from Peshawar:
 * - Free: Peshawar (Rs. 0)
 * - Near: KPK, Islamabad, Rawalpindi & close northern areas (Default: Rs. 250)
 * - Far: Punjab & central Pakistan (Default: Rs. 500)
 * - More Far: Sindh, Balochistan & remote south areas (Default: Rs. 700)
 */
export const PAKISTAN_SHIPPING_ZONES = {
  near: [
    "Charsadda", "Shabqadar", "Mardan", "Nowshera", "Swabi", "Kohat",
    "Abbottabad", "Haripur", "Attock", "Islamabad", "Rawalpindi",
    "Wah Cantonment", "Taxila", "Swat", "Mingora", "Malakand", "Batkhela",
    "Buner", "Chitral", "Dir", "Lower Dir", "Upper Dir", "Hangu", "Karak",
    "Khyber", "Kohistan", "Lakki Marwat", "Mansehra", "Parachinar", "Tank",
    "Timergara", "Torghar", "Bannu", "Dera Ismail Khan", "Wana", "Murree"
  ],
  far: [
    "Lahore", "Faisalabad", "Gujranwala", "Sialkot", "Multan", "Sargodha",
    "Gujrat", "Sheikhupura", "Jhelum", "Chakwal", "Kasur", "Okara", "Chiniot",
    "Hafizabad", "Sadiqabad", "Burewala", "Khanewal", "Muzaffargarh",
    "Mandi Bahauddin", "Bhakkar", "Layyah", "Toba Tek Singh", "Vehari",
    "Bahawalnagar", "Narowal", "Kamoke", "Muridke", "Daska", "Samundri",
    "Jaranwala", "Chishtian", "Ahmedpur East", "Hasilpur", "Pattoki",
    "Mianwali", "Kallar Syedan", "Gujar Khan", "Kot Addu", "Pasrur", "Phalia",
    "Bahawalpur", "Rahim Yar Khan", "Dera Ghazi Khan", "Muzaffarabad", "Mirpur",
    "Rawalakot", "Kotli", "Bhimber", "Bagh", "Hajira", "Neelum Valley",
    "Pallandri", "Gilgit", "Skardu", "Hunza", "Ghanche", "Diamer", "Ghizer",
    "Nagar", "Astore"
  ],
  more_far: [
    "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah (Shaheed Benazirabad)",
    "Mirpur Khas", "Shikarpur", "Jacobabad", "Thatta", "Badin", "Ghotki",
    "Dadu", "Tando Allahyar", "Tando Muhammad Khan", "Khairpur", "Kashmore",
    "Matiari", "Umerkot", "Kotri", "Jamshoro", "Daharki", "Sanghar",
    "Kandiaro", "Shahdadkot", "Quetta", "Turbat", "Khuzdar", "Chaman", "Hub",
    "Gwadar", "Sibi", "Zhob", "Pishin", "Dera Murad Jamali", "Dera Allah Yar",
    "Nushki", "Loralai", "Kharan", "Panjgur", "Mastung", "Kalat", "Jafarabad"
  ]
};

export const SHIPPING_ZONE_DETAILS = {
  free: {
    id: "free",
    label: "Free Delivery City",
    description: "Peshawar (100% Free Shipping)",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
  },
  near: {
    id: "near",
    label: "Near to Peshawar",
    description: "KPK, Islamabad, Rawalpindi & close areas",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
  },
  far: {
    id: "far",
    label: "Far from Peshawar",
    description: "Punjab & Central Pakistan",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
  },
  more_far: {
    id: "more_far",
    label: "More Far Away",
    description: "Sindh, Balochistan & Southern Pakistan",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
  }
};

/**
 * Determine the shipping zone for a given city
 */
export function getShippingZoneForCity(cityName, freeCity = "Peshawar", customOverrides = {}) {
  if (!cityName) return "near";

  const normalized = cityName.trim().toLowerCase();
  const freeNorm = (freeCity || "Peshawar").trim().toLowerCase();

  // 1. Free Shipping City (Peshawar)
  if (normalized === freeNorm) {
    return "free";
  }

  // 2. Custom Admin Override (if configured)
  if (customOverrides && typeof customOverrides === "object") {
    for (const [city, zone] of Object.entries(customOverrides)) {
      if (city.toLowerCase() === normalized && zone) {
        return zone;
      }
    }
  }

  // 3. Check Near Zone (KPK, Islamabad, etc.)
  for (const c of PAKISTAN_SHIPPING_ZONES.near) {
    if (c.toLowerCase() === normalized || normalized.includes(c.toLowerCase()) || c.toLowerCase().includes(normalized)) {
      return "near";
    }
  }

  // 4. Check More Far Zone (Sindh, Balochistan)
  for (const c of PAKISTAN_SHIPPING_ZONES.more_far) {
    if (c.toLowerCase() === normalized || normalized.includes(c.toLowerCase()) || c.toLowerCase().includes(normalized)) {
      return "more_far";
    }
  }

  // 5. Check Far Zone (Punjab, etc.)
  for (const c of PAKISTAN_SHIPPING_ZONES.far) {
    if (c.toLowerCase() === normalized || normalized.includes(c.toLowerCase()) || c.toLowerCase().includes(normalized)) {
      return "far";
    }
  }

  // Default for unknown or remote Pakistani city
  return "more_far";
}

/**
 * Calculate dynamic shipping charge in PKR based purely on distance tiers:
 * - Peshawar: Free (Rs. 0)
 * - Near: Rs. 250
 * - Far: Rs. 500
 * - More Far: Rs. 700
 */
export function calculateShippingRate(cityName, subtotal = 0, storeSettings = {}) {
  const freeCity = storeSettings.freeShippingCity || "Peshawar";
  const customOverrides = storeSettings.customCityZones || {};
  const zone = getShippingZoneForCity(cityName, freeCity, customOverrides);

  if (zone === "free") return 0;
  if (zone === "near") return Number(storeSettings.shippingRateNear ?? 250);
  if (zone === "far") return Number(storeSettings.shippingRateFar ?? 500);
  if (zone === "more_far") return Number(storeSettings.shippingRateMoreFar ?? 700);

  return Number(storeSettings.flatShippingRate ?? 250);
}

/**
 * Fetch complete list of Pakistani cities from API, merged with comprehensive local list
 */
export async function getPakistanCities() {
  try {
    const res = await axios.post(
      "https://countriesnow.space/api/v0.1/countries/cities",
      { country: "Pakistan" },
      { timeout: 4000 }
    );
    if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const apiCities = res.data.data;
      const combined = Array.from(new Set([...PAKISTAN_CITIES, ...apiCities])).sort();
      return combined;
    }
  } catch (err) {
    console.warn("Could not fetch Pakistan cities from API, using complete local list:", err.message);
  }
  return PAKISTAN_CITIES;
}
