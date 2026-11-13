// Comprehensive Geographic & Transit Utilities for Traverse Trip Planner

// Built-in Coordinate Lookup for Indian Cities, Travel Hubs & Global Destinations
export const CITY_COORDINATES = {
  // Northern India & Himalayas
  'delhi': { name: 'New Delhi', coords: [28.6139, 77.2090], country: 'India', region: 'North' },
  'new delhi': { name: 'New Delhi', coords: [28.6139, 77.2090], country: 'India', region: 'North' },
  'ncr': { name: 'Delhi NCR', coords: [28.6139, 77.2090], country: 'India', region: 'North' },
  'noida': { name: 'Noida', coords: [28.5355, 77.3910], country: 'India', region: 'Uttar Pradesh' },
  'gurgaon': { name: 'Gurugram', coords: [28.4595, 77.0266], country: 'India', region: 'Haryana' },
  'gurugram': { name: 'Gurugram', coords: [28.4595, 77.0266], country: 'India', region: 'Haryana' },
  'faridabad': { name: 'Faridabad', coords: [28.4089, 77.3178], country: 'India', region: 'Haryana' },
  'ghaziabad': { name: 'Ghaziabad', coords: [28.6692, 77.4538], country: 'India', region: 'Uttar Pradesh' },
  'meerut': { name: 'Meerut', coords: [28.9845, 77.7064], country: 'India', region: 'Uttar Pradesh' },
  'chandigarh': { name: 'Chandigarh', coords: [30.7333, 76.7794], country: 'India', region: 'Punjab' },
  'amritsar': { name: 'Amritsar', coords: [31.6340, 74.8723], country: 'India', region: 'Punjab' },
  'jalandhar': { name: 'Jalandhar', coords: [31.3260, 75.5762], country: 'India', region: 'Punjab' },
  'ludhiana': { name: 'Ludhiana', coords: [30.9010, 75.8573], country: 'India', region: 'Punjab' },
  'shimla': { name: 'Shimla', coords: [31.1048, 77.1734], country: 'India', region: 'Himachal' },
  'manali': { name: 'Manali', coords: [32.2432, 77.1892], country: 'India', region: 'Himachal' },
  'kullu': { name: 'Kullu', coords: [31.9579, 77.1095], country: 'India', region: 'Himachal' },
  'kasol': { name: 'Kasol', coords: [32.0100, 77.3150], country: 'India', region: 'Himachal' },
  'spiti': { name: 'Spiti Valley', coords: [32.2276, 78.0710], country: 'India', region: 'Himachal' },
  'dharamshala': { name: 'Dharamshala', coords: [32.2190, 76.3234], country: 'India', region: 'Himachal' },
  'mcleodganj': { name: 'McLeodGanj', coords: [32.2426, 76.3213], country: 'India', region: 'Himachal' },
  'leh': { name: 'Leh Ladakh', coords: [34.1526, 77.5771], country: 'India', region: 'Ladakh' },
  'ladakh': { name: 'Ladakh', coords: [34.1526, 77.5771], country: 'India', region: 'Ladakh' },
  'pangong': { name: 'Pangong Tso', coords: [33.7595, 78.6674], country: 'India', region: 'Ladakh' },
  'srinagar': { name: 'Srinagar', coords: [34.0837, 74.7973], country: 'India', region: 'Kashmir' },
  'gulmarg': { name: 'Gulmarg', coords: [34.0484, 74.3805], country: 'India', region: 'Kashmir' },
  'jammu': { name: 'Jammu', coords: [32.7266, 74.8570], country: 'India', region: 'Jammu' },
  'dehradun': { name: 'Dehradun', coords: [30.3165, 78.0322], country: 'India', region: 'Uttarakhand' },
  'mussoorie': { name: 'Mussoorie', coords: [30.4598, 78.0644], country: 'India', region: 'Uttarakhand' },
  'rishikesh': { name: 'Rishikesh', coords: [30.0869, 78.2676], country: 'India', region: 'Uttarakhand' },
  'haridwar': { name: 'Haridwar', coords: [29.9457, 78.1642], country: 'India', region: 'Uttarakhand' },
  'nainital': { name: 'Nainital', coords: [29.3919, 79.4542], country: 'India', region: 'Uttarakhand' },

  // Eastern India & Jharkhand / Bengal / Bihar / Odisha
  'jamshedpur': { name: 'Jamshedpur', coords: [22.8046, 86.2029], country: 'India', region: 'Jharkhand' },
  'tatanagar': { name: 'Jamshedpur', coords: [22.8046, 86.2029], country: 'India', region: 'Jharkhand' },
  'ranchi': { name: 'Ranchi', coords: [23.3441, 85.3096], country: 'India', region: 'Jharkhand' },
  'dhanbad': { name: 'Dhanbad', coords: [23.7957, 86.4304], country: 'India', region: 'Jharkhand' },
  'bokaro': { name: 'Bokaro Steel City', coords: [23.6693, 86.1511], country: 'India', region: 'Jharkhand' },
  'deoghar': { name: 'Deoghar', coords: [24.4826, 86.6997], country: 'India', region: 'Jharkhand' },
  'hazaribagh': { name: 'Hazaribagh', coords: [23.9961, 85.3683], country: 'India', region: 'Jharkhand' },

  'kolkata': { name: 'Kolkata', coords: [22.5726, 88.3639], country: 'India', region: 'West Bengal' },
  'calcutta': { name: 'Kolkata', coords: [22.5726, 88.3639], country: 'India', region: 'West Bengal' },
  'howrah': { name: 'Howrah', coords: [22.5958, 88.2636], country: 'India', region: 'West Bengal' },
  'durgapur': { name: 'Durgapur', coords: [23.5204, 87.3119], country: 'India', region: 'West Bengal' },
  'asansol': { name: 'Asansol', coords: [23.6739, 86.9524], country: 'India', region: 'West Bengal' },
  'siliguri': { name: 'Siliguri', coords: [26.7271, 88.3953], country: 'India', region: 'West Bengal' },
  'darjeeling': { name: 'Darjeeling', coords: [27.0410, 88.2663], country: 'India', region: 'West Bengal' },
  'kharagpur': { name: 'Kharagpur', coords: [22.3460, 87.2320], country: 'India', region: 'West Bengal' },
  'purulia': { name: 'Purulia', coords: [23.3322, 86.3652], country: 'India', region: 'West Bengal' },

  'patna': { name: 'Patna', coords: [25.5941, 85.1376], country: 'India', region: 'Bihar' },
  'gaya': { name: 'Gaya', coords: [24.7914, 85.0002], country: 'India', region: 'Bihar' },
  'bodh gaya': { name: 'Bodh Gaya', coords: [24.6961, 84.9869], country: 'India', region: 'Bihar' },
  'sasaram': { name: 'Sasaram', coords: [24.9535, 84.0321], country: 'India', region: 'Bihar' },
  'dehri': { name: 'Dehri on Sone', coords: [24.9080, 84.1880], country: 'India', region: 'Bihar' },
  'aurangabad bihar': { name: 'Aurangabad (Bihar)', coords: [24.7538, 84.3732], country: 'India', region: 'Bihar' },
  'muzaffarpur': { name: 'Muzaffarpur', coords: [26.1209, 85.3647], country: 'India', region: 'Bihar' },
  'bhagalpur': { name: 'Bhagalpur', coords: [25.2425, 86.9842], country: 'India', region: 'Bihar' },

  'bhubaneswar': { name: 'Bhubaneswar', coords: [20.2961, 85.8245], country: 'India', region: 'Odisha' },
  'cuttack': { name: 'Cuttack', coords: [20.4625, 85.8828], country: 'India', region: 'Odisha' },
  'puri': { name: 'Puri', coords: [19.8135, 85.8312], country: 'India', region: 'Odisha' },
  'rourkela': { name: 'Rourkela', coords: [22.2604, 84.8536], country: 'India', region: 'Odisha' },

  // Uttar Pradesh & Central
  'varanasi': { name: 'Varanasi', coords: [25.3176, 82.9739], country: 'India', region: 'Uttar Pradesh' },
  'kashi': { name: 'Varanasi', coords: [25.3176, 82.9739], country: 'India', region: 'Uttar Pradesh' },
  'lucknow': { name: 'Lucknow', coords: [26.8467, 80.9462], country: 'India', region: 'Uttar Pradesh' },
  'kanpur': { name: 'Kanpur', coords: [26.4499, 80.3319], country: 'India', region: 'Uttar Pradesh' },
  'agra': { name: 'Agra', coords: [27.1767, 78.0081], country: 'India', region: 'Uttar Pradesh' },
  'prayagraj': { name: 'Prayagraj', coords: [25.4358, 81.8463], country: 'India', region: 'Uttar Pradesh' },
  'allahabad': { name: 'Prayagraj', coords: [25.4358, 81.8463], country: 'India', region: 'Uttar Pradesh' },
  'gorakhpur': { name: 'Gorakhpur', coords: [26.7606, 83.3732], country: 'India', region: 'Uttar Pradesh' },
  'jhansi': { name: 'Jhansi', coords: [25.4484, 78.5685], country: 'India', region: 'Uttar Pradesh' },
  'bareilly': { name: 'Bareilly', coords: [28.3670, 79.4304], country: 'India', region: 'Uttar Pradesh' },

  'bhopal': { name: 'Bhopal', coords: [23.2599, 77.4126], country: 'India', region: 'Madhya Pradesh' },
  'indore': { name: 'Indore', coords: [22.7196, 75.8577], country: 'India', region: 'Madhya Pradesh' },
  'gwalior': { name: 'Gwalior', coords: [26.2183, 78.1828], country: 'India', region: 'Madhya Pradesh' },
  'jabalpur': { name: 'Jabalpur', coords: [23.1815, 79.9864], country: 'India', region: 'Madhya Pradesh' },
  'raipur': { name: 'Raipur', coords: [21.2514, 81.6296], country: 'India', region: 'Chhattisgarh' },
  'bilaspur': { name: 'Bilaspur', coords: [22.0797, 82.1409], country: 'India', region: 'Chhattisgarh' },
  'bhilai': { name: 'Bhilai', coords: [21.2121, 81.3733], country: 'India', region: 'Chhattisgarh' },

  // Western India & Rajasthan
  'mumbai': { name: 'Mumbai', coords: [19.0760, 72.8777], country: 'India', region: 'Maharashtra' },
  'bombay': { name: 'Mumbai', coords: [19.0760, 72.8777], country: 'India', region: 'Maharashtra' },
  'pune': { name: 'Pune', coords: [18.5204, 73.8567], country: 'India', region: 'Maharashtra' },
  'lonavala': { name: 'Lonavala', coords: [18.7557, 73.4091], country: 'India', region: 'Maharashtra' },
  'nashik': { name: 'Nashik', coords: [19.9975, 73.7898], country: 'India', region: 'Maharashtra' },
  'nagpur': { name: 'Nagpur', coords: [21.1458, 79.0882], country: 'India', region: 'Maharashtra' },
  'aurangabad': { name: 'Chhatrapati Sambhajinagar', coords: [19.8762, 75.3433], country: 'India', region: 'Maharashtra' },
  'chhatrapati sambhajinagar': { name: 'Chhatrapati Sambhajinagar', coords: [19.8762, 75.3433], country: 'India', region: 'Maharashtra' },
  'kolhapur': { name: 'Kolhapur', coords: [16.7050, 74.2433], country: 'India', region: 'Maharashtra' },

  'ahmedabad': { name: 'Ahmedabad', coords: [23.0225, 72.5714], country: 'India', region: 'Gujarat' },
  'surat': { name: 'Surat', coords: [21.1702, 72.8311], country: 'India', region: 'Gujarat' },
  'vadodara': { name: 'Vadodara', coords: [22.3072, 73.1812], country: 'India', region: 'Gujarat' },
  'rajkot': { name: 'Rajkot', coords: [22.3039, 70.8022], country: 'India', region: 'Gujarat' },
  'kutch': { name: 'Rann of Kutch', coords: [23.8344, 69.8327], country: 'India', region: 'Gujarat' },

  'jaipur': { name: 'Jaipur', coords: [26.9124, 75.7873], country: 'India', region: 'Rajasthan' },
  'udaipur': { name: 'Udaipur', coords: [24.5854, 73.7125], country: 'India', region: 'Rajasthan' },
  'jodhpur': { name: 'Jodhpur', coords: [26.2389, 73.0243], country: 'India', region: 'Rajasthan' },
  'jaisalmer': { name: 'Jaisalmer', coords: [26.9157, 70.9083], country: 'India', region: 'Rajasthan' },
  'pushkar': { name: 'Pushkar', coords: [26.4897, 74.5511], country: 'India', region: 'Rajasthan' },
  'ajmer': { name: 'Ajmer', coords: [26.4499, 74.6399], country: 'India', region: 'Rajasthan' },
  'bikaner': { name: 'Bikaner', coords: [28.0229, 73.3119], country: 'India', region: 'Rajasthan' },

  // Southern & Coastal India
  'bengaluru': { name: 'Bengaluru', coords: [12.9716, 77.5946], country: 'India', region: 'Karnataka' },
  'bangalore': { name: 'Bengaluru', coords: [12.9716, 77.5946], country: 'India', region: 'Karnataka' },
  'mysore': { name: 'Mysuru', coords: [12.2958, 76.6394], country: 'India', region: 'Karnataka' },
  'mysuru': { name: 'Mysuru', coords: [12.2958, 76.6394], country: 'India', region: 'Karnataka' },
  'mangalore': { name: 'Mangaluru', coords: [12.9141, 74.8560], country: 'India', region: 'Karnataka' },
  'hubli': { name: 'Hubballi', coords: [15.3647, 75.1240], country: 'India', region: 'Karnataka' },
  'coorg': { name: 'Coorg', coords: [12.4244, 75.7382], country: 'India', region: 'Karnataka' },
  'hampi': { name: 'Hampi', coords: [15.3350, 76.4600], country: 'India', region: 'Karnataka' },
  'gokarna': { name: 'Gokarna', coords: [14.5479, 74.3188], country: 'India', region: 'Karnataka' },

  'hyderabad': { name: 'Hyderabad', coords: [17.3850, 78.4867], country: 'India', region: 'Telangana' },
  'warangal': { name: 'Warangal', coords: [17.9689, 79.5941], country: 'India', region: 'Telangana' },
  'visakhapatnam': { name: 'Visakhapatnam', coords: [17.6868, 83.2185], country: 'India', region: 'Andhra Pradesh' },
  'vizag': { name: 'Visakhapatnam', coords: [17.6868, 83.2185], country: 'India', region: 'Andhra Pradesh' },
  'vijayawada': { name: 'Vijayawada', coords: [16.5062, 80.6480], country: 'India', region: 'Andhra Pradesh' },
  'tirupati': { name: 'Tirupati', coords: [13.6288, 79.4192], country: 'India', region: 'Andhra Pradesh' },

  'chennai': { name: 'Chennai', coords: [13.0827, 80.2707], country: 'India', region: 'Tamil Nadu' },
  'madras': { name: 'Chennai', coords: [13.0827, 80.2707], country: 'India', region: 'Tamil Nadu' },
  'coimbatore': { name: 'Coimbatore', coords: [11.0168, 76.9558], country: 'India', region: 'Tamil Nadu' },
  'madurai': { name: 'Madurai', coords: [9.9252, 78.1198], country: 'India', region: 'Tamil Nadu' },
  'ooty': { name: 'Ooty', coords: [11.4102, 76.6950], country: 'India', region: 'Tamil Nadu' },
  'kodaikanal': { name: 'Kodaikanal', coords: [10.2381, 77.4892], country: 'India', region: 'Tamil Nadu' },
  'pondicherry': { name: 'Pondicherry', coords: [11.9416, 79.8083], country: 'India', region: 'Puducherry' },
  'puducherry': { name: 'Pondicherry', coords: [11.9416, 79.8083], country: 'India', region: 'Puducherry' },

  'goa': { name: 'Goa', coords: [15.2993, 74.1240], country: 'India', region: 'Goa' },
  'panaji': { name: 'Goa', coords: [15.4909, 73.8278], country: 'India', region: 'Goa' },
  'kochi': { name: 'Kochi', coords: [9.9312, 76.2673], country: 'India', region: 'Kerala' },
  'cochin': { name: 'Kochi', coords: [9.9312, 76.2673], country: 'India', region: 'Kerala' },
  'kerala': { name: 'Kerala', coords: [9.9312, 76.2673], country: 'India', region: 'Kerala' },
  'alleppey': { name: 'Alleppey', coords: [9.4981, 76.3388], country: 'India', region: 'Kerala' },
  'alappuzha': { name: 'Alleppey', coords: [9.4981, 76.3388], country: 'India', region: 'Kerala' },
  'munnar': { name: 'Munnar', coords: [10.0889, 77.0595], country: 'India', region: 'Kerala' },
  'varkala': { name: 'Varkala', coords: [8.7379, 76.7163], country: 'India', region: 'Kerala' },
  'thiruvananthapuram': { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366], country: 'India', region: 'Kerala' },
  'trivandrum': { name: 'Thiruvananthapuram', coords: [8.5241, 76.9366], country: 'India', region: 'Kerala' },
  'wayanad': { name: 'Wayanad', coords: [11.6854, 76.1320], country: 'India', region: 'Kerala' },

  // Northeast & Islands
  'guwahati': { name: 'Guwahati', coords: [26.1445, 91.7362], country: 'India', region: 'Assam' },
  'shillong': { name: 'Shillong', coords: [25.5788, 91.8933], country: 'India', region: 'Meghalaya' },
  'meghalaya': { name: 'Meghalaya', coords: [25.5788, 91.8933], country: 'India', region: 'Meghalaya' },
  'cherrapunji': { name: 'Cherrapunji', coords: [25.2986, 91.7317], country: 'India', region: 'Meghalaya' },
  'gangtok': { name: 'Gangtok', coords: [27.3389, 88.6065], country: 'India', region: 'Sikkim' },
  'andaman': { name: 'Andaman & Nicobar', coords: [11.6234, 92.7265], country: 'India', region: 'Islands' },
  'port blair': { name: 'Port Blair', coords: [11.6234, 92.7265], country: 'India', region: 'Islands' },
  'havelock': { name: 'Havelock Island', coords: [11.9761, 92.9876], country: 'India', region: 'Islands' },

  // Key International Places
  'kyoto': { name: 'Kyoto', coords: [35.0116, 135.7681], country: 'Japan', region: 'East Asia' },
  'osaka': { name: 'Osaka', coords: [34.6937, 135.5023], country: 'Japan', region: 'East Asia' },
  'tokyo': { name: 'Tokyo', coords: [35.6762, 139.6503], country: 'Japan', region: 'East Asia' },
  'bali': { name: 'Bali', coords: [-8.4095, 115.1889], country: 'Indonesia', region: 'Southeast Asia' },
  'amalfi': { name: 'Amalfi Coast', coords: [40.6281, 14.4850], country: 'Italy', region: 'Southern Europe' },
  'swiss': { name: 'Swiss Alps', coords: [46.6863, 7.8632], country: 'Switzerland', region: 'Central Europe' },
  'switzerland': { name: 'Swiss Alps', coords: [46.6863, 7.8632], country: 'Switzerland', region: 'Central Europe' },
  'paris': { name: 'Paris', coords: [48.8566, 2.3522], country: 'France', region: 'Europe' },
  'london': { name: 'London', coords: [51.5074, -0.1278], country: 'United Kingdom', region: 'Europe' },
  'dubai': { name: 'Dubai', coords: [25.2048, 55.2708], country: 'UAE', region: 'Middle East' },
  'bangkok': { name: 'Bangkok', coords: [13.7563, 100.5018], country: 'Thailand', region: 'Southeast Asia' },
  'singapore': { name: 'Singapore', coords: [1.3521, 103.8198], country: 'Singapore', region: 'Southeast Asia' }
};

// Popular Quick-Picks for Origin & Destination
export const POPULAR_ORIGIN_CITIES = [
  'New Delhi', 'Jamshedpur', 'Mumbai', 'Bengaluru', 'Kolkata', 'Pune', 'Hyderabad', 'Chennai', 'Jaipur', 'Ranchi'
];

export const POPULAR_DESTINATION_CITIES = [
  'Varanasi', 'Manali', 'Goa', 'Ladakh', 'Kerala', 'Rishikesh', 'Jaipur', 'Meghalaya', 'Udaipur', 'Bali'
];

// Great-circle Haversine Distance in Kilometers
export function calculateHaversineDistanceKm(coords1, coords2) {
  if (!coords1 || !coords2) return 500;
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.max(15, Math.round(d));
}

// Road distance approximation (~1.25x haversine)
export function calculateRoadDistanceKm(haversineKm) {
  return Math.round(haversineKm * 1.25);
}

// Format duration into "Xh Ym" or "Xd Yh"
export function formatDurationHours(hoursFloat) {
  const totalMins = Math.round(hoursFloat * 60);
  const days = Math.floor(totalMins / 1440);
  const hrs = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;

  if (days > 0) {
    return `${days}d ${hrs}h`;
  }
  return `${hrs}h ${mins > 0 ? `${mins}m` : ''}`;
}

// Real-time High-Precision Reverse Geocoding with Fallback
export async function reverseGeocodeCoordinates(lat, lng) {
  // 1. First attempt: BigDataCloud Reverse Geocode Client API (free, fast, CORS enabled)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const place = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name;
      const state = data.principalSubdivision;
      if (place && place.trim().length > 0) {
        return {
          cityName: place,
          fullName: state && state !== place ? `${place}, ${state}` : place,
          coords: [lat, lng],
          country: data.countryName || 'India'
        };
      }
    }
  } catch (err) {
    // Silently fall through to next provider
  }

  // 2. Second attempt: OpenStreetMap Nominatim reverse geocode
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=10`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const place = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district;
      const state = addr.state;
      if (place) {
        return {
          cityName: place,
          fullName: state && state !== place ? `${place}, ${state}` : place,
          coords: [lat, lng],
          country: addr.country || 'India'
        };
      }
    }
  } catch (err) {
    // Silently fall through to dictionary matching
  }

  // 3. Fallback: Find closest matching city in our comprehensive offline dictionary
  let closest = null;
  let minDistance = Infinity;

  Object.entries(CITY_COORDINATES).forEach(([key, val]) => {
    const dist = calculateHaversineDistanceKm([lat, lng], val.coords);
    if (dist < minDistance) {
      minDistance = dist;
      closest = val;
    }
  });

  if (closest) {
    return {
      cityName: closest.name,
      fullName: closest.region ? `${closest.name}, ${closest.region}` : closest.name,
      coords: [lat, lng],
      country: closest.country || 'India'
    };
  }

  return {
    cityName: 'New Delhi',
    fullName: 'New Delhi',
    coords: [lat, lng],
    country: 'India'
  };
}

// Fuzzy coordinate resolution from string query
export function resolveCityCoordinates(query) {
  if (!query || typeof query !== 'string') {
    return { name: 'New Delhi', coords: [28.6139, 77.2090], country: 'India' };
  }

  const clean = query.toLowerCase().trim();

  // 1. Direct match
  if (CITY_COORDINATES[clean]) {
    return CITY_COORDINATES[clean];
  }

  // 2. Substring matching
  const keys = Object.keys(CITY_COORDINATES);
  for (const k of keys) {
    if (clean.includes(k) || k.includes(clean)) {
      return CITY_COORDINATES[k];
    }
  }

  // 3. Match individual words
  const words = clean.split(/[\s,&/-]+/);
  for (const w of words) {
    if (w.length > 2 && CITY_COORDINATES[w]) {
      return CITY_COORDINATES[w];
    }
  }

  // Fallback defaults to New Delhi with user query name
  return {
    name: query,
    coords: [28.6139, 77.2090],
    country: 'India',
    isFallback: true
  };
}

// Get comprehensive Transit details (Bus, Train, Bike)
export function getTransitEstimates(originCity, destCity, roadDistanceKm) {
  const cleanOrigin = originCity.trim();
  const cleanDest = destCity.trim();

  // 1. Bus Estimates (Avg speed ~50 km/h)
  const busHours = Math.max(1.5, roadDistanceKm / 48);
  const busMinFare = Math.round(Math.max(350, roadDistanceKm * 1.4));
  const busMaxFare = Math.round(Math.max(650, roadDistanceKm * 2.2));
  
  // RedBus Search URL
  const redbusOrigin = encodeURIComponent(cleanOrigin.replace(/\s+/g, '-').toLowerCase());
  const redbusDest = encodeURIComponent(cleanDest.replace(/\s+/g, '-').toLowerCase());
  const redbusUrl = `https://www.redbus.in/bus-tickets/${redbusOrigin}-to-${redbusDest}`;

  // 2. Train Estimates (Avg speed ~70 km/h Express / Vande Bharat)
  const trainHours = Math.max(1.2, roadDistanceKm / 68);
  const trainSleeper = Math.round(Math.max(180, roadDistanceKm * 0.45));
  const train3AC = Math.round(Math.max(550, roadDistanceKm * 1.15));
  const train2AC = Math.round(Math.max(850, roadDistanceKm * 1.65));
  const trainVandeBharat = Math.round(Math.max(750, roadDistanceKm * 1.45));

  // IRCTC Direct Search URL
  const irctcUrl = 'https://www.irctc.co.in/nget/train-search';

  // 3. Bike Estimates (Avg speed ~55 km/h + 15 min rest every 100km)
  const pitStops = Math.max(1, Math.floor(roadDistanceKm / 110));
  const bikeHours = Math.max(1, (roadDistanceKm / 55) + (pitStops * 0.25));
  const bikeMileage = 35; // km per liter
  const fuelLitres = Math.max(2, Math.round(roadDistanceKm / bikeMileage));
  const petrolPrice = 98; // average INR per liter
  const estimatedFuelCost = fuelLitres * petrolPrice;

  // Google Maps Driving / Bike Route URL
  const gmapsBikeUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(cleanOrigin)}&destination=${encodeURIComponent(cleanDest)}&travelmode=driving`;

  // 4. Flight Estimates (Cruising speed ~720 km/h + 45 mins climb/approach/taxi)
  const flightHours = Math.max(1.0, (roadDistanceKm / 720) + 0.75);
  const flightEconomy = Math.round(Math.max(2600, 2400 + roadDistanceKm * 3.6));
  const flightPremium = Math.round(Math.max(4200, 3800 + roadDistanceKm * 5.2));
  const flightBusiness = Math.round(Math.max(7900, 7500 + roadDistanceKm * 8.5));

  // Google Flights Direct Search URL
  const googleFlightsUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(cleanDest)}%20from%20${encodeURIComponent(cleanOrigin)}`;

  return {
    roadDistanceKm,
    bus: {
      mode: 'bus',
      title: 'Via Bus',
      duration: formatDurationHours(busHours),
      hoursFloat: busHours,
      estimatedFare: `₹${busMinFare.toLocaleString('en-IN')} - ₹${busMaxFare.toLocaleString('en-IN')}`,
      busTypes: 'Volvo Multi-Axle, AC Sleeper, BharatBenz, Zingbus',
      redbusUrl,
      features: ['Live GPS Tracking', 'Direct Sleeper Berth', 'Convenient Boarding Points', 'Luggage Space']
    },
    train: {
      mode: 'train',
      title: 'Via Train',
      duration: formatDurationHours(trainHours),
      hoursFloat: trainHours,
      estimatedFare: `₹${trainSleeper} (SL) / ₹${train3AC} (3A)`,
      fareBreakdown: {
        sleeper: `₹${trainSleeper}`,
        threeAC: `₹${train3AC}`,
        twoAC: `₹${train2AC}`,
        vandeBharat: `₹${trainVandeBharat}`
      },
      irctcUrl,
      features: ['Tatkal Quota (10 AM AC / 11 AM Non-AC)', 'Comfortable Overnight Journey', 'On-seat e-Catering', 'Zero Traffic Delays']
    },
    flight: {
      mode: 'flight',
      title: 'Via Flight',
      duration: formatDurationHours(flightHours),
      hoursFloat: flightHours,
      estimatedFare: `₹${flightEconomy.toLocaleString('en-IN')} - ₹${flightPremium.toLocaleString('en-IN')}`,
      fareBreakdown: {
        economy: `₹${flightEconomy.toLocaleString('en-IN')}`,
        premium: `₹${flightPremium.toLocaleString('en-IN')}`,
        business: `₹${flightBusiness.toLocaleString('en-IN')}`
      },
      googleFlightsUrl,
      airlines: 'IndiGo, Air India, Akasa Air, Vistara, SpiceJet',
      features: [
        `Fastest Travel Time (~${formatDurationHours(flightHours)})`,
        'Direct Aerial Air Corridor (Zero Highway Traffic)',
        'Baggage: 15 kg Check-in + 7 kg Cabin Allowance',
        'Airport Lounge & Priority Gate Boarding'
      ],
      flightTips: [
        'Mandatory Web Check-in opens 48 hours prior to scheduled departure',
        'Arrive at terminal departure gate at least 2 hours in advance with valid photo ID',
        'Power banks, e-cigarettes & spare lithium batteries must remain in cabin hand luggage',
        'Liquid containers exceeding 100ml must be packed inside checked-in baggage'
      ]
    },
    bike: {
      mode: 'bike',
      title: 'Via Bike',
      duration: formatDurationHours(bikeHours),
      hoursFloat: bikeHours,
      fuelLitres: `${fuelLitres} Litres`,
      fuelCost: `₹${estimatedFuelCost.toLocaleString('en-IN')}`,
      mileage: '~35 km/L avg',
      pitStops: `${pitStops} Rest Breaks`,
      gmapsUrl: gmapsBikeUrl,
      features: ['Complete Route Freedom', 'Scenic Ghats & Highway Cafes', 'Direct Door-to-Door', 'Photographic Pitstops'],
      riderTips: [
        'Full-face DOT/ECE certified helmet & armored jacket',
        'Tubeless tire puncture repair kit & portable inflator',
        'Hydration pack & weatherproof phone handlebar mount',
        'Offline GPS maps cached for remote sections'
      ]
    }
  };
}

// Compute at least 2 realistic highway / transit stoppages along the route corridor
export function computeRouteStoppages(originCoords, destCoords, originName = '', destName = '', transitMode = 'bus') {
  if (!originCoords || !destCoords) return [];

  const [lat1, lon1] = originCoords;
  const [lat2, lon2] = destCoords;
  const totalStraightKm = calculateHaversineDistanceKm(originCoords, destCoords);
  const totalRoadKm = calculateRoadDistanceKm(totalStraightKm);

  // Normalization for endpoint check
  const oClean = (originName || '').toLowerCase().trim();
  const dClean = (destName || '').toLowerCase().trim();

  // Target fraction points along the journey corridor
  const t1 = 0.35; // ~35% distance
  const t2 = 0.70; // ~70% distance

  const target1 = [lat1 + t1 * (lat2 - lat1), lon1 + t1 * (lon2 - lon1)];
  const target2 = [lat1 + t2 * (lat2 - lat1), lon1 + t2 * (lon2 - lon1)];

  // Helper: check if a city entry matches origin or destination
  const isEndpoint = (key, val) => {
    const k = key.toLowerCase();
    const n = val.name.toLowerCase();
    return (
      (oClean && (k === oClean || oClean.includes(k) || k.includes(oClean) || n === oClean)) ||
      (dClean && (k === dClean || dClean.includes(k) || k.includes(dClean) || n === dClean))
    );
  };

  // Find candidate for Stop 1
  let bestCity1 = null;
  let bestDist1 = Infinity;

  // Find candidate for Stop 2
  let bestCity2 = null;
  let bestDist2 = Infinity;

  Object.entries(CITY_COORDINATES).forEach(([key, val]) => {
    if (isEndpoint(key, val)) return;

    // Check distance to target1
    const d1 = calculateHaversineDistanceKm(target1, val.coords);
    if (d1 < bestDist1) {
      bestDist1 = d1;
      bestCity1 = val;
    }

    // Check distance to target2
    const d2 = calculateHaversineDistanceKm(target2, val.coords);
    if (d2 < bestDist2) {
      bestDist2 = d2;
      bestCity2 = val;
    }
  });

  // Ensure Stop 1 and Stop 2 are distinct cities
  if (bestCity1 && bestCity2 && bestCity1.name === bestCity2.name) {
    bestDist2 = Infinity;
    Object.entries(CITY_COORDINATES).forEach(([key, val]) => {
      if (isEndpoint(key, val) || val.name === bestCity1.name) return;
      const d2 = calculateHaversineDistanceKm(target2, val.coords);
      if (d2 < bestDist2) {
        bestDist2 = d2;
        bestCity2 = val;
      }
    });
  }

  // Construct Stoppage 1
  const stop1Name = bestCity1 ? bestCity1.name : 'Midway Express Plaza & Rest Halt';
  const stop1Coords = bestCity1 ? bestCity1.coords : target1;
  const stop1Dist = Math.max(25, Math.round(totalRoadKm * 0.35));

  // Construct Stoppage 2
  const stop2Name = bestCity2 ? bestCity2.name : 'Highway Interchange Transit Stop';
  const stop2Coords = bestCity2 ? bestCity2.coords : target2;
  const stop2Dist = Math.max(stop1Dist + 35, Math.round(totalRoadKm * 0.70));

  // Mode specific purposes
  const getStopDetails = (index) => {
    if (index === 1) {
      if (transitMode === 'flight') {
        return {
          haltTime: '45 - 60 mins',
          purpose: 'Midway Connecting Air Hub & Passenger Transit Lounge',
          type: 'Connecting Airport Hub'
        };
      }
      if (transitMode === 'train') {
        return {
          haltTime: '10 - 15 mins',
          purpose: 'Major Railway Junction Station (Platform snacks, tea & water refill)',
          type: 'Rail Junction Halt'
        };
      }
      if (transitMode === 'bike') {
        return {
          haltTime: '20 - 25 mins',
          purpose: 'Highway Dhaba, Petrol Refuel & Chain Lube Inspection',
          type: 'Fuel & Morning Rest'
        };
      }
      return {
        haltTime: '25 - 30 mins',
        purpose: 'NH Express Food Court & Restroom Comfort Halt',
        type: 'Express Bus Rest Stop'
      };
    } else {
      if (transitMode === 'flight') {
        return {
          haltTime: '30 - 45 mins',
          purpose: 'Final Descent Airspace Corridor & Runway Approach Sector',
          type: 'Approach & Arrival Sector'
        };
      }
      if (transitMode === 'train') {
        return {
          haltTime: '15 - 20 mins',
          purpose: 'Divisional Railway Interchange (Signal pass & meal carriage)',
          type: 'Divisional Rail Station'
        };
      }
      if (transitMode === 'bike') {
        return {
          haltTime: '35 - 45 mins',
          purpose: 'Lunch Halt, Hydration Pack Refill & Engine Cool Down',
          type: 'Lunch & Vehicle Check'
        };
      }
      return {
        haltTime: '30 - 45 mins',
        purpose: 'Midway Lunch / Dinner Highway Plaza & Driver Shift Switch',
        type: 'Meal & Comfort Halt'
      };
    }
  };

  const details1 = getStopDetails(1);
  const details2 = getStopDetails(2);

  return [
    {
      id: 'stop_1',
      index: 1,
      name: stop1Name,
      coords: stop1Coords,
      distanceFromOrigin: stop1Dist,
      haltTime: details1.haltTime,
      purpose: details1.purpose,
      type: details1.type
    },
    {
      id: 'stop_2',
      index: 2,
      name: stop2Name,
      coords: stop2Coords,
      distanceFromOrigin: stop2Dist,
      haltTime: details2.haltTime,
      purpose: details2.purpose,
      type: details2.type
    }
  ];
}
