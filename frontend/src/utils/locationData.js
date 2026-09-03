import axios from "axios";

// Comprehensive, exhaustive list of all major & minor Pakistani cities across all provinces
export const PAKISTAN_CITIES = [
  // Federal Capital
  "Islamabad",

  // Khyber Pakhtunkhwa (KPK)
  "Peshawar", "Abbottabad", "Attock", "Bannu", "Batkhela", "Buner", "Charsadda",
  "Chitral", "Dera Ismail Khan", "Dir", "Hangu", "Haripur", "Karak", "Khyber",
  "Kohat", "Kohistan", "Lakki Marwat", "Lower Dir", "Malakand", "Mansehra", "Mardan",
  "Mingora", "Nowshera", "Parachinar", "Shabqadar", "Swabi", "Swat", "Tank",
  "Timergara", "Torghar", "Upper Dir", "Wana",

  // Punjab
  "Lahore", "Faisalabad", "Rawalpindi", "Gujranwala", "Multan", "Bahawalpur",
  "Sargodha", "Sialkot", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan",
  "Gujrat", "Sahiwal", "Wah Cantonment", "Kasur", "Okara", "Chiniot", "Hafizabad",
  "Sadiqabad", "Burewala", "Khanewal", "Muzaffargarh", "Mandi Bahauddin", "Jhelum",
  "Chakwal", "Bhakkar", "Layyah", "Toba Tek Singh", "Vehari", "Bahawalnagar",
  "Narowal", "Kamoke", "Muridke", "Taxila", "Attock City", "Daska", "Goira",
  "Samundri", "Jaranwala", "Chishtian", "Ahmedpur East", "Hasilpur", "Pattoki",
  "Mianwali", "Kallar Syedan", "Gujar Khan", "Kot Addu", "Pasrur", "Phalia",

  // Sindh
  "Karachi", "Hyderabad", "Sukkur", "Larkana", "Nawabshah (Shaheed Benazirabad)",
  "Mirpur Khas", "Shikarpur", "Jacobabad", "Thatta", "Badin", "Ghotki", "Dadu",
  "Tando Allahyar", "Tando Muhammad Khan", "Khairpur", "Kashmore", "Matiari",
  "Umerkot", "Kotri", "Jamshoro", "Daharki", "Sanghar", "Kandiaro", "Shahdadkot",

  // Balochistan
  "Quetta", "Turbat", "Khuzdar", "Chaman", "Hub", "Gwadar", "Sibi", "Zhob",
  "Pishin", "Dera Murad Jamali", "Dera Allah Yar", "Nushki", "Loralai", "Kharan",
  "Panjgur", "Mastung", "Kalat", "Jafarabad",

  // Azad Jammu & Kashmir (AJK)
  "Muzaffarabad", "Mirpur", "Rawalakot", "Kotli", "Bhimber", "Bagh", "Bagh District",
  "Hajira", "Neelum Valley", "Pallandri",

  // Gilgit-Baltistan
  "Gilgit", "Skardu", "Hunza", "Ghanche", "Diamer", "Ghizer", "Nagar", "Astore"
].sort();

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
