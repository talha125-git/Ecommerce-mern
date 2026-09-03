import axios from "axios";

// Comprehensive Postal Code dictionary for Pakistani Cities
export const PAKISTAN_POSTAL_CODES = {
  "Islamabad": "44000",
  "Peshawar": "25000",
  "Shabqadar": "24630",
  "Charsadda": "24460",
  "Lahore": "54000",
  "Karachi": "74000",
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
  "Attock City": "43600",
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
  "Goira": "36100",
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

  // KPK
  "Abbottabad": "22010",
  "Bannu": "28100",
  "Batkhela": "23000",
  "Buner": "19290",
  "Chitral": "17200",
  "Dera Ismail Khan": "29050",
  "Dir": "18300",
  "Hangu": "26100",
  "Haripur": "22620",
  "Karak": "27200",
  "Khyber": "24800",
  "Kohat": "26000",
  "Kohistan": "20100",
  "Lakki Marwat": "28420",
  "Lower Dir": "18300",
  "Malakand": "23020",
  "Mansehra": "21300",
  "Mardan": "23200",
  "Mingora": "19200",
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
  "Hyderabad": "71000",
  "Sukkur": "65150",
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
  "Nushki": "85000",
  "Loralai": "84800",
  "Kharan": "85100",
  "Panjgur": "93000",
  "Mastung": "88200",
  "Kalat": "88300",
  "Jafarabad": "80400",

  // AJK
  "Muzaffarabad": "13100",
  "Mirpur": "10250",
  "Rawalakot": "12350",
  "Kotli": "11100",
  "Bhimber": "10040",
  "Bagh": "12500",
  "Bagh District": "12500",
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
