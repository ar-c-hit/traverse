const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { getStatus } = require('../config/db');

// In-Memory store as robust fallback and instant starter
const inMemory = {
  users: [],
  trips: [],
  chats: [],
  inquiries: [],
  destinations: [],
  notifications: [],
  initialized: false
};

const generateId = () => new mongoose.Types.ObjectId().toString();

const seedInitialData = async () => {
  if (inMemory.initialized) return;

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('archit123', salt);
  const userPassword = await bcrypt.hash('password123', salt);

  const adminUser = {
    _id: '670000000000000000000001',
    name: 'Archit (Super Admin)',
    username: 'archit',
    email: 'archit@traverse.com',
    password: adminPassword,
    role: 'admin',
    bio: 'Platform Super Administrator & Lead Explorer. Traveled across 48+ destinations worldwide.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Adventure & Expeditions',
    homeCity: 'New Delhi, India',
    visitedCountries: ['India', 'Canada', 'Norway', 'Chile', 'Japan', 'New Zealand', 'Iceland'],
    followers: ['670000000000000000000002', '670000000000000000000003', '670000000000000000000004'],
    following: ['670000000000000000000002', '670000000000000000000003'],
    followersCount: 3,
    followingCount: 2,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000)
  };

  const user1 = {
    _id: '670000000000000000000002',
    name: 'Kai Tanaka',
    username: 'kai',
    email: 'kai@traverse.com',
    password: userPassword,
    role: 'user',
    bio: 'Backpacker, photographer, ramen hunter. Heading to South East Asia next!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Backpacker',
    homeCity: 'Tokyo, Japan',
    visitedCountries: ['Japan', 'South Korea', 'Vietnam', 'Taiwan', 'Thailand'],
    followers: ['670000000000000000000001', '670000000000000000000003'],
    following: ['670000000000000000000001'],
    followersCount: 2,
    followingCount: 1,
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000)
  };

  const user2 = {
    _id: '670000000000000000000003',
    name: 'Sofia Morales',
    username: 'sofia',
    email: 'sofia@traverse.com',
    password: userPassword,
    role: 'user',
    bio: 'Digital nomad and cultural storyteller. Love slow travels and historical architecture.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Cultural',
    homeCity: 'Barcelona, Spain',
    visitedCountries: ['Spain', 'Morocco', 'Italy', 'Greece', 'Portugal', 'France'],
    followers: ['670000000000000000000001'],
    following: ['670000000000000000000001', '670000000000000000000002'],
    followersCount: 1,
    followingCount: 2,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000)
  };

  const user3 = {
    _id: '670000000000000000000004',
    name: 'Liam Vance',
    username: 'liam',
    email: 'liam@traverse.com',
    password: userPassword,
    role: 'user',
    bio: 'Alpine hiker, landscape lover. Currently finishing a Swiss-Austrian mountain trek.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    travelStyle: 'Adventure',
    homeCity: 'Zurich, Switzerland',
    visitedCountries: ['Switzerland', 'Austria', 'Germany', 'Norway', 'Slovenia'],
    followers: ['670000000000000000000001'],
    following: ['670000000000000000000001'],
    followersCount: 1,
    followingCount: 1,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000)
  };

  inMemory.users = [adminUser, user1, user2, user3];

  // Seed Destinations - National (India) and International (9 Places)
  inMemory.destinations = [
    // NATIONAL DESTINATIONS (INDIA)
    {
      _id: '671000000000000000000010',
      name: 'Ladakh & Pangong Tso',
      country: 'India',
      category: 'National',
      region: 'North India (Himalayas)',
      image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80',
      description: 'High-altitude cold mountain desert, shimmering cobalt Pangong Lake, thrilling Khardung La pass, and ancient Tibetan monasteries.',
      highlights: ['Pangong Tso Blue Lake', 'Khardung La Pass (17,982 ft)', 'Nubra Valley Sand Dunes & Camels', 'Thiksey Monastery Sunrise'],
      bestTimeToVisit: 'May - September',
      averageBudgetPerDay: '₹2,500/day',
      vibe: 'High Adventure & Spiritual',
      activeTravelersCount: 32,
      pastTravelersCount: 210
    },
    {
      _id: '671000000000000000000011',
      name: 'Goa Beaches & Coastal Forts',
      country: 'India',
      category: 'National',
      region: 'West Coast India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
      description: 'Sun-drenched golden beaches, Portuguese heritage churches, Chapora cliff fort, vibrant flea markets, and fresh seafood shacks.',
      highlights: ['Palolem & Anjuna Sunset', 'Chapora Fort Clifftop', 'Scuba Diving at Grande Island', 'Old Goa Basilica & Spice Farm'],
      bestTimeToVisit: 'November - February',
      averageBudgetPerDay: '₹2,000/day',
      vibe: 'Coastal & Vibrant',
      activeTravelersCount: 45,
      pastTravelersCount: 420
    },
    {
      _id: '671000000000000000000012',
      name: 'Kerala Backwaters & Munnar',
      country: 'India',
      category: 'National',
      region: 'South India',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=80',
      description: 'Serene palm-fringed lagoons of Alleppey on traditional houseboats, rolling misty emerald tea estates of Munnar, and Varkala sea cliffs.',
      highlights: ['Overnight Alleppey Houseboat', 'Munnar Tea Garden Treks', 'Kathakali Dance & Ayurveda', 'Varkala Cliff Sunset Beach'],
      bestTimeToVisit: 'September - March',
      averageBudgetPerDay: '₹2,200/day',
      vibe: 'Tranquil & Nature',
      activeTravelersCount: 29,
      pastTravelersCount: 310
    },
    {
      _id: '671000000000000000000013',
      name: 'Manali & Spiti Valley',
      country: 'India',
      category: 'National',
      region: 'Himachal Pradesh',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
      description: 'Spectacular snow-crowned Himalayan valleys, Solang adventure sports, remote Tibetan villages, and lunar landscapes of Spiti.',
      highlights: ['Rohtang & Atal Tunnel Pass', 'Key Monastery in Spiti', 'Chandratal Moon Lake Trek', 'Old Manali Bohemian Cafes'],
      bestTimeToVisit: 'May - October (Spiti) / Year-round',
      averageBudgetPerDay: '₹1,800/day',
      vibe: 'Himalayan Trekking & Roadtrip',
      activeTravelersCount: 38,
      pastTravelersCount: 280
    },
    {
      _id: '671000000000000000000014',
      name: 'Jaipur & Udaipur Royal Palaces',
      country: 'India',
      category: 'National',
      region: 'Rajasthan',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
      description: 'The Royal Pink City, majestic Amer Fort, floating marble palaces of Lake Pichola, and colorful bazaars of Mewar.',
      highlights: ['Amer Fort Elephant Path', 'Hawa Mahal Palace of Winds', 'Lake Pichola Boat Cruise', 'Jodhpur Blue City & Thar Desert'],
      bestTimeToVisit: 'October - March',
      averageBudgetPerDay: '₹2,400/day',
      vibe: 'Royal Heritage & Culture',
      activeTravelersCount: 26,
      pastTravelersCount: 340
    },
    {
      _id: '671000000000000000000015',
      name: 'Varanasi Spiritual Ghats',
      country: 'India',
      category: 'National',
      region: 'Uttar Pradesh',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
      description: 'One of the oldest continuously inhabited cities on earth, mesmerizing evening Ganga Aarti, and sunrise boat rides along the sacred river.',
      highlights: ['Dashashwamedh Ghat Evening Aarti', 'Dawn Wooden Boat Ride on Ganges', 'Kashi Vishwanath Corridor', 'Sarnath Deer Park Stupa'],
      bestTimeToVisit: 'October - March',
      averageBudgetPerDay: '₹1,500/day',
      vibe: 'Spiritual & Ancient History',
      activeTravelersCount: 22,
      pastTravelersCount: 260
    },
    {
      _id: '671000000000000000000016',
      name: 'Rishikesh & Ganga Trails',
      country: 'India',
      category: 'National',
      region: 'Uttarakhand',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80',
      description: 'The Yoga Capital of the World along the roaring turquoise Ganges, white-water rapids, cliff camping, and mountain meditation ashrams.',
      highlights: ['Grade-4 White Water Rafting', 'Beatles Ashram Graffiti Walk', 'Triveni Ghat Evening Ceremony', 'Kunjapuri Sunrise Himalaya View'],
      bestTimeToVisit: 'September - November & March - May',
      averageBudgetPerDay: '₹1,600/day',
      vibe: 'Adventure & Wellness',
      activeTravelersCount: 34,
      pastTravelersCount: 390
    },
    {
      _id: '671000000000000000000017',
      name: 'Andaman & Havelock Island',
      country: 'India',
      category: 'National',
      region: 'Andaman & Nicobar Islands',
      image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=80',
      description: 'Pristine white sands of Radhanagar Beach, exotic scuba diving in coral trenches, sea-kayaking through bioluminescent mangroves.',
      highlights: ['Radhanagar Beach Sunset', 'Scuba Diving at Elephant Beach', 'Cellular Jail Light & Sound', 'Neil Island Natural Rock Bridge'],
      bestTimeToVisit: 'October - May',
      averageBudgetPerDay: '₹3,500/day',
      vibe: 'Tropical Island & Marine Life',
      activeTravelersCount: 19,
      pastTravelersCount: 175
    },
    {
      _id: '671000000000000000000018',
      name: 'Meghalaya Living Root Bridges',
      country: 'India',
      category: 'National',
      region: 'Northeast India',
      image: 'https://images.unsplash.com/photo-1626014303757-6466258c7075?auto=format&fit=crop&w=1000&q=80',
      description: 'The Abode of Clouds featuring double-decker living bio-bridges of Cherrapunji, crystal-glass Umngot River in Dawki, and plunging waterfalls.',
      highlights: ['Nongriat Double Decker Root Bridge Trek', 'Crystal River Boating at Dawki', 'Nohkalikai Falls (India tallest plunge)', 'Mawlynnong Cleanest Village'],
      bestTimeToVisit: 'October - April',
      averageBudgetPerDay: '₹2,000/day',
      vibe: 'Mystical Nature & Bio-Trails',
      activeTravelersCount: 17,
      pastTravelersCount: 155
    },

    // INTERNATIONAL DESTINATIONS (9 PLACES)
    {
      _id: '671000000000000000000001',
      name: 'Kyoto & Osaka',
      country: 'Japan',
      category: 'International',
      region: 'East Asia',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      description: 'Ancient bamboo groves, zen temples, vibrant culinary alleys, and bullet trains through scenic cedar peaks.',
      highlights: ['Fushimi Inari Shrine', 'Dotonbori Street Food', 'Arashiyama Bamboo Grove', 'Kiyomizu-dera'],
      bestTimeToVisit: 'March - May & October - November',
      averageBudgetPerDay: '₹7,800/day',
      vibe: 'Cultural & Culinary',
      activeTravelersCount: 24,
      pastTravelersCount: 140
    },
    {
      _id: '671000000000000000000002',
      name: 'Amalfi Coast & Capri',
      country: 'Italy',
      category: 'International',
      region: 'Southern Europe',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      description: 'Cliffside pastel villages plunging into turquoise waters, fragrant lemon terraces, and Mediterranean sunsets.',
      highlights: ['Positano Cliff Walks', 'Path of the Gods Hike', 'Capri Blue Grotto', 'Ravello Gardens'],
      bestTimeToVisit: 'May - September',
      averageBudgetPerDay: '₹11,500/day',
      vibe: 'Scenic & Coastal',
      activeTravelersCount: 18,
      pastTravelersCount: 195
    },
    {
      _id: '671000000000000000000003',
      name: 'Swiss Alpine Trails',
      country: 'Switzerland',
      category: 'International',
      region: 'Central Europe',
      image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
      description: 'Snow-capped peaks, crystal alpine lakes, scenic rack railways, and cozy fondue chalets in the clouds.',
      highlights: ['Matterhorn Views', 'Lauterbrunnen Valley', 'Glacier Express', 'Grindelwald First'],
      bestTimeToVisit: 'June - September & Dec - March (Ski)',
      averageBudgetPerDay: '₹13,200/day',
      vibe: 'High Adventure & Mountains',
      activeTravelersCount: 15,
      pastTravelersCount: 112
    },
    {
      _id: '671000000000000000000004',
      name: 'Bali & Nusa Penida',
      country: 'Indonesia',
      category: 'International',
      region: 'Southeast Asia',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
      description: 'Lush emerald rice terraces, cliffside surf spots, spiritual water temples, and vibrant nomadic cafe culture.',
      highlights: ['Ubud Rice Terraces', 'Kelingking T-Rex Beach', 'Ulun Danu Beratan', 'Mount Batur Sunrise'],
      bestTimeToVisit: 'April - October',
      averageBudgetPerDay: '₹3,800/day',
      vibe: 'Tropical, Wellness & Surf',
      activeTravelersCount: 38,
      pastTravelersCount: 310
    },
    {
      _id: '671000000000000000000005',
      name: 'Reykjavik & Golden Circle',
      country: 'Iceland',
      category: 'International',
      region: 'Northern Europe',
      image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80',
      description: 'Land of fire and ice with thunderous waterfalls, volcanic geysers, thermal lagoons, and aurora borealis.',
      highlights: ['Gullfoss Waterfall', 'Blue Lagoon', 'Thingvellir Rift', 'Black Sand Beach Vik'],
      bestTimeToVisit: 'Sept - April (Auroras) or June - Aug',
      averageBudgetPerDay: '₹12,400/day',
      vibe: 'Geothermal & Wilderness',
      activeTravelersCount: 11,
      pastTravelersCount: 88
    },
    {
      _id: '671000000000000000000006',
      name: 'Banff National Park',
      country: 'Canada',
      category: 'International',
      region: 'North America',
      image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1000&q=80',
      description: 'Glacial turquoise waters of Lake Louise and Moraine Lake surrounded by majestic Rocky Mountain pinnacles.',
      highlights: ['Moraine Lake Canoe', 'Icefields Parkway', 'Lake Louise Teahouse', 'Johnston Canyon'],
      bestTimeToVisit: 'Late June - September',
      averageBudgetPerDay: '₹9,100/day',
      vibe: 'Nature & Wilderness',
      activeTravelersCount: 14,
      pastTravelersCount: 92
    },
    {
      _id: '671000000000000000000007',
      name: 'Santorini & Cyclades',
      country: 'Greece',
      category: 'International',
      region: 'Southern Europe',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1000&q=80',
      description: 'Iconic whitewashed caldera cliff villas, sapphire domed churches, fiery Aegean sunsets, and volcanic black sand beaches.',
      highlights: ['Oia Sunset Castle View', 'Fira to Oia Caldera Hike', 'Red Beach Sailing Cruise', 'Akrotiri Prehistoric Ruins'],
      bestTimeToVisit: 'May - October',
      averageBudgetPerDay: '₹10,800/day',
      vibe: 'Island Romance & Scenic',
      activeTravelersCount: 22,
      pastTravelersCount: 205
    },
    {
      _id: '671000000000000000000008',
      name: 'Paris & French Riviera',
      country: 'France',
      category: 'International',
      region: 'Western Europe',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
      description: 'City of light romantic boulevards, Louvre museum treasures, followed by turquoise Mediterranean waters of Nice and Cannes.',
      highlights: ['Eiffel Tower Sparkle at Night', 'Louvre & Montmartre Walk', 'Nice Promenade des Anglais', 'Monaco & Eze Village'],
      bestTimeToVisit: 'April - October',
      averageBudgetPerDay: '₹11,200/day',
      vibe: 'Art, Architecture & Riviera',
      activeTravelersCount: 31,
      pastTravelersCount: 340
    },
    {
      _id: '671000000000000000000009',
      name: 'Queenstown & Milford Sound',
      country: 'New Zealand',
      category: 'International',
      region: 'Oceania',
      image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1000&q=80',
      description: 'World adventure capital surrounded by the Remarkables mountain range, glacial fjords, and sheer granite peaks of Milford Sound.',
      highlights: ['Milford Sound Fjord Cruise', 'Bungy Jump & Canyon Swing', 'Lake Wakatipu TSS Earnslaw', 'Routeburn Alpine Track'],
      bestTimeToVisit: 'December - March (Summer) or June - August (Ski)',
      averageBudgetPerDay: '₹9,900/day',
      vibe: 'High Adventure & Fjords',
      activeTravelersCount: 16,
      pastTravelersCount: 160
    }
  ].map((d, idx) => ({
    ...d,
    likes: (idx * 17 + 34) % 100 + 15,
    likedBy: idx === 0 ? ['670000000000000000000001'] : [],
    rating: 4.9,
    postedByAdmin: true,
    creatorName: adminUser.name,
    creatorId: adminUser._id,
    reviews: [
      {
        _id: `rev_seed_${idx}_1`,
        userId: user1._id,
        userName: user1.name,
        userAvatar: user1.avatar,
        rating: 5,
        comment: `Traveled using this official guide! Highlights and transit recommendations were completely spot on.`,
        traveledDate: 'Verified Traveler • Season 2026',
        verifiedTraveled: true,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 3)
      },
      {
        _id: `rev_seed_${idx}_2`,
        userId: user2._id,
        userName: user2.name,
        userAvatar: user2.avatar,
        rating: 5,
        comment: `The daily budget estimate (${d.averageBudgetPerDay}) and season timing were very helpful. Highly recommend!`,
        traveledDate: 'Verified Traveler',
        verifiedTraveled: true,
        createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 6)
      }
    ]
  }));

  // Seed Trips: Distinguishing "Traveling at same time" (upcoming / traveling_now) vs "Already done travel" (completed)
  inMemory.trips = [
    // SAME TIME / CURRENT & UPCOMING TRAVELERS
    {
      _id: '672000000000000000000001',
      userId: user1._id,
      creatorName: user1.name,
      creatorEmail: user1.email,
      creatorAvatar: user1.avatar,
      title: 'Backpacking Tokyo to Kyoto Cherry Blossom Circuit',
      destination: 'Kyoto & Tokyo',
      country: 'Japan',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-11-10',
      endDate: '2026-11-24',
      budget: '₹1,12,000',
      travelStyle: 'Backpacker',
      status: 'upcoming', // Travel at same time!
      description: 'Planning a 2-week railway circuit through Tokyo, Hakone hot springs, and Kyoto. Looking for fellow photographers or food lovers traveling at the same time to share food platters and explore night photography.',
      highlights: ['Shinjuku street food crawl', 'Sunrise hike Fushimi Inari', 'Hakone Onsen dip', 'Gion tea house tour'],
      itinerary: [
        { day: 1, title: 'Touchdown Tokyo & Shibuya Crossing', activities: ['Arrival at Narita', 'Hotel check-in', 'Shibuya Sky evening view'] },
        { day: 2, title: 'Akihabara & Asakusa Sensoji', activities: ['Morning at Senso-ji', 'Street snacks at Nakamise', 'Electronics district'] },
        { day: 3, title: 'Shinkansen to Kyoto', activities: ['Bullet train to Kyoto', 'Gion night wander', 'Ramen dinner'] },
        { day: 4, title: 'Kyoto Temples & Bamboo Forest', activities: ['Arashiyama at dawn', 'Kinkaku-ji Gold Pavilion', 'Traditional tea ceremony'] }
      ],
      lookingForCompanions: true,
      companions: [
        { userId: user2._id, name: user2.name, avatar: user2.avatar, joinedAt: new Date() }
      ],
      travelAdvice: '',
      rating: 5,
      reviewsCount: 0,
      likes: 19,
      likedBy: ['670000000000000000000001']
    },
    {
      _id: '672000000000000000000002',
      userId: user2._id,
      creatorName: user2.name,
      creatorEmail: user2.email,
      creatorAvatar: user2.avatar,
      title: 'Island Hopping & Remote Work in Bali & Nusa Penida',
      destination: 'Bali & Nusa Penida',
      country: 'Indonesia',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-11-01',
      endDate: '2026-11-20',
      budget: '₹70,000',
      travelStyle: 'Solo',
      status: 'traveling_now', // Active traveler right now!
      description: 'Currently in Ubud! Working remotely mornings and surfing or exploring waterfalls afternoons. Looking for digital nomad buddies or travel mates around Canggu and Nusa Penida this month.',
      highlights: ['Mount Batur dawn trek', 'Nusa Penida manta ray snorkeling', 'Ubud co-working hubs', 'Tegalalang rice terrace walk'],
      itinerary: [
        { day: 1, title: 'Arrival Ubud & Co-working setup', activities: ['Airport pickup', 'Check into eco-villa', 'Sunset dinner at cafe'] },
        { day: 2, title: 'Waterfalls & Sacred Monkey Forest', activities: ['Tegenungan Waterfall', 'Ubud Market crafts', 'Campuhan Ridge walk'] },
        { day: 3, title: 'Ferry to Nusa Penida', activities: ['Sanur speed boat', 'Kelingking Cliff viewpoints', 'Crystal Bay sunset'] }
      ],
      lookingForCompanions: true,
      companions: [],
      travelAdvice: '',
      rating: 5,
      reviewsCount: 0,
      likes: 27,
      likedBy: []
    },
    {
      _id: '672000000000000000000003',
      userId: adminUser._id,
      creatorName: adminUser.name,
      creatorEmail: adminUser.email,
      creatorAvatar: adminUser.avatar,
      title: 'Patagonia Glaciers & Fitz Roy Trekking Expedition',
      destination: 'El Chaltén & Torres del Paine',
      country: 'Chile & Argentina',
      coverImage: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-12-05',
      endDate: '2026-12-22',
      budget: '₹1,98,000',
      travelStyle: 'Adventure',
      status: 'upcoming', // Travel at same time!
      description: 'Organizing a small crew of backcountry hikers for Patagonia. We will tackle Laguna de los Tres, Cerro Torre, and the W-Trek in Torres del Paine. Open for 2 experienced trekkers to join logistics.',
      highlights: ['Fitz Roy sunrise glow', 'Perito Moreno ice trekking', 'Mirador Las Torres', 'Wild guanaco photography'],
      itinerary: [
        { day: 1, title: 'El Calafate Base Camp', activities: ['Fly into El Calafate', 'Gear inspection & briefing', 'Asado team dinner'] },
        { day: 2, title: 'Perito Moreno Glacier Walk', activities: ['Catamaran cruise', 'Crampon ice trekking', 'Whiskey on ancient ice'] },
        { day: 3, title: 'Transfer to El Chaltén', activities: ['Scenic Route 40 drive', 'Check into mountain refuge', 'Evening trail prep'] }
      ],
      lookingForCompanions: true,
      companions: [
        { userId: user3._id, name: user3.name, avatar: user3.avatar, joinedAt: new Date() }
      ],
      travelAdvice: '',
      rating: 5,
      reviewsCount: 0,
      likes: 42,
      likedBy: ['670000000000000000000002']
    },

    // ALREADY DONE TRAVEL / VETERANS & COMPLETED ITINERARIES
    {
      _id: '672000000000000000000004',
      userId: user3._id,
      creatorName: user3.name,
      creatorEmail: user3.email,
      creatorAvatar: user3.avatar,
      title: 'Completed: Grand Swiss Alpine Passes & Fondue Trail',
      destination: 'Swiss Alpine Trails',
      country: 'Switzerland',
      coverImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-08-05',
      endDate: '2026-08-18',
      budget: '₹1,75,000',
      travelStyle: 'Adventure',
      status: 'completed', // Already done travel!
      description: 'Just returned from an unforgettable 14 days hiking through Lauterbrunnen, Zermatt, and Murren. Sharing my full verified route, real expense receipts, and gear checklist for anyone heading there!',
      highlights: ['Northface Trail Zermatt', 'Lauterbrunnen 72 waterfalls', 'Schilthorn Piz Gloria 007 museum', 'Stay in Swiss Alpine Club hut'],
      itinerary: [
        { day: 1, title: 'Zurich to Lauterbrunnen Valley', activities: ['Took Swiss Travel Pass train', 'Valley walk past Staubbach Falls', 'Local cheese tasting'] },
        { day: 2, title: 'Murren & Gimmelwald Hikes', activities: ['Cable car to Murren', 'Flower panorama trail', 'Honesty shop in Gimmelwald'] },
        { day: 3, title: 'Zermatt & Matterhorn Base', activities: ['Gornergrat cogwheel train', 'Riffelsee mirror lake photo', 'Rösti mountain lunch'] }
      ],
      lookingForCompanions: false,
      companions: [],
      travelAdvice: 'TIP 1: Buy the Swiss Travel Pass if traveling more than 4 days—it saves 40% on trains and covers lake ferries + city museums. TIP 2: Book mountain huts at least 3 months ahead during July/August. TIP 3: Drink straight from mountain public fountains—freshest water on earth!',
      rating: 4.9,
      reviewsCount: 14,
      likes: 64,
      likedBy: ['670000000000000000000001', '670000000000000000000002']
    },
    {
      _id: '672000000000000000000005',
      userId: user2._id,
      creatorName: user2.name,
      creatorEmail: user2.email,
      creatorAvatar: user2.avatar,
      title: 'Completed: Amalfi Coast Solo Odyssey - Positano to Capri',
      destination: 'Amalfi Coast & Capri',
      country: 'Italy',
      coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-06-12',
      endDate: '2026-06-22',
      budget: '₹1,36,000',
      travelStyle: 'Cultural',
      status: 'completed', // Already done travel!
      description: 'Ten sun-drenched days wandering lemon groves and dramatic cliff stairs. I made mistakes so you do not have to! Read my advice on avoiding tourist traps and catching the right ferries.',
      highlights: ['Sentiero degli Dei hike at 7 AM', 'Private wooden gozzo boat around Capri', 'Limoncello making class in Sorrento', 'Ravello cliffside gardens'],
      itinerary: [
        { day: 1, title: 'Naples to Sorrento Gateway', activities: ['Circumvesuviana train', 'Lemon grove walk', 'Wood-fired Neapolitan pizza'] },
        { day: 2, title: 'Path of the Gods (Sentiero degli Dei)', activities: ['Bomerano to Nocelle hike', '1,700 steps down to Positano', 'Granita break'] },
        { day: 3, title: 'Capri Day Sail', activities: ['Ferry from Sorrento', 'Faraglioni rocks sail', 'Anacapri chairlift to Monte Solaro'] }
      ],
      lookingForCompanions: false,
      companions: [],
      travelAdvice: 'DO NOT rent a car on Amalfi unless you have nerves of steel! SITA buses are cheap but get packed; travel early morning (before 8:30 AM) or use water ferries between Salerno, Amalfi, and Positano. In Capri, take the chairlift up Monte Solaro for the single best panoramic view in Italy.',
      rating: 4.8,
      reviewsCount: 22,
      likes: 83,
      likedBy: ['670000000000000000000003']
    },
    {
      _id: '672000000000000000000006',
      userId: user1._id,
      creatorName: user1.name,
      creatorEmail: user1.email,
      creatorAvatar: user1.avatar,
      title: 'Completed: Iceland Ring Road Campervan Survival Guide',
      destination: 'Reykjavik & Golden Circle',
      country: 'Iceland',
      coverImage: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80',
      startDate: '2026-09-02',
      endDate: '2026-09-12',
      budget: '₹1,58,000',
      travelStyle: 'Adventure',
      status: 'completed', // Already done travel!
      description: 'Drove the full 1,332 km Ring Road in a 4x4 campervan. Witnessed Northern lights 3 nights in a row, soaked in hidden hot pots, and photographed ice caves.',
      highlights: ['Northern Lights dancing over Kirkjufell', 'Diamond Beach icebergs', 'Detifoss waterfall roar', 'Seljavallalaug thermal pool'],
      itinerary: [
        { day: 1, title: 'Keflavik to Golden Circle', activities: ['Campervan pickup', 'Thingvellir continental fissure', 'Strokkur geyser eruption'] },
        { day: 2, title: 'South Coast Waterfalls', activities: ['Walk behind Seljalandsfoss', 'Skogafoss rainbow', 'Reynisfjara basalt columns'] },
        { day: 3, title: 'Glacier Lagoons', activities: ['Jokulsarlon zodiac tour', 'Diamond Beach sunrise', 'Camp at Skaftafell'] }
      ],
      lookingForCompanions: false,
      companions: [],
      travelAdvice: 'Always monitor vedur.is and road.is twice daily—Icelandic winds can easily tear car doors off! Get full gravel & wind damage protection for rental. Buy groceries at Bonus (the piggy bank supermarket) rather than gas stations to cut your food budget by 60%.',
      rating: 5.0,
      reviewsCount: 18,
      likes: 91,
      likedBy: ['670000000000000000000001', '670000000000000000000003']
    }
  ];

  // Seed Global Chat Messages
  inMemory.chats = [
    {
      _id: '673000000000000000000001',
      channel: 'general',
      senderId: adminUser._id,
      senderName: adminUser.name,
      senderAvatar: adminUser.avatar,
      senderRole: 'admin',
      message: 'Welcome everyone to Traverse! Connect with travelers heading your way or ask our travel veterans for verified tips!',
      likes: 12,
      pinned: true,
      createdAt: new Date(Date.now() - 3600 * 1000 * 12)
    },
    {
      _id: '673000000000000000000002',
      channel: 'same-time-buddies',
      senderId: user1._id,
      senderName: user1.name,
      senderAvatar: user1.avatar,
      senderRole: 'user',
      message: 'Hey friends! Anyone landing in Tokyo around mid-November? Doing a photography and ramen crawl across Kyoto and Osaka!',
      likes: 5,
      pinned: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 8)
    },
    {
      _id: '673000000000000000000003',
      channel: 'same-time-buddies',
      senderId: user2._id,
      senderName: user2.name,
      senderAvatar: user2.avatar,
      senderRole: 'user',
      message: 'I am currently in Bali working from Ubud cafes! If anyone wants to share a boat to Nusa Penida this weekend let me know.',
      likes: 7,
      pinned: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 5)
    },
    {
      _id: '673000000000000000000004',
      channel: 'travel-veterans',
      senderId: user3._id,
      senderName: user3.name,
      senderAvatar: user3.avatar,
      senderRole: 'user',
      message: 'Just wrapped up 2 weeks trekking Switzerland. If anyone needs route tips or has questions about mountain passes, ask away!',
      likes: 14,
      pinned: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 3)
    },
    {
      _id: '673000000000000000000005',
      channel: 'itinerary-review',
      senderId: user2._id,
      senderName: user2.name,
      senderAvatar: user2.avatar,
      senderRole: 'user',
      message: 'Posted my Amalfi Coast itinerary with lessons learned on SITA buses vs water ferries. Check out the Community section!',
      likes: 9,
      pinned: false,
      createdAt: new Date(Date.now() - 3600 * 1000 * 2)
    }
  ];

  // Seed Contact Inquiries for Admin Dashboard
  inMemory.inquiries = [
    {
      _id: '674000000000000000000001',
      name: 'Chloe Zhang',
      email: 'chloe@example.com',
      subject: 'Looking for a verified travel buddy guide',
      category: 'Trip Planning Help',
      message: 'Hello Traverse team! I am planning a solo trip to Iceland in January. Can I connect with travelers who have driven the Ring Road in winter?',
      status: 'pending',
      adminNotes: '',
      createdAt: new Date(Date.now() - 3600 * 1000 * 24)
    },
    {
      _id: '674000000000000000000002',
      name: 'Marcus Bell',
      email: 'marcus@example.com',
      subject: 'Partner inquiry for eco-lodge directory',
      category: 'Partnership',
      message: 'We operate sustainable mountain eco-huts across the Dolomites. We would love to offer exclusive group stays for Traverse members.',
      status: 'in_progress',
      adminNotes: 'Contacted Marcus regarding Dolomites trail partnership.',
      createdAt: new Date(Date.now() - 3600 * 1000 * 48)
    }
  ];

  inMemory.notifications = [
    {
      _id: '670000000000000000000101',
      recipient: '670000000000000000000002', // Kai Tanaka
      sender: {
        _id: '670000000000000000000003',
        name: 'Sofia Morales',
        username: 'sofia',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        badge: 'EXPLORER'
      },
      type: 'follow',
      title: 'New Follower! 👤',
      message: 'Sofia Morales started following you! Follow back to become mutual friends and chat.',
      link: '/profile/670000000000000000000003',
      read: false,
      metadata: { senderId: '670000000000000000000003' },
      createdAt: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      _id: '670000000000000000000102',
      recipient: '670000000000000000000002', // Kai Tanaka
      sender: {
        _id: '670000000000000000000001',
        name: 'Archit (Super Admin)',
        username: 'archit',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        badge: 'ADMIN'
      },
      type: 'join_trip',
      title: 'New Travel Buddy! 🎒',
      message: 'Archit (Super Admin) joined your upcoming trip "Backpacking Tokyo to Kyoto Cherry Blossom Circuit"!',
      link: '/planner',
      read: false,
      metadata: { tripTitle: 'Backpacking Tokyo to Kyoto Cherry Blossom Circuit' },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000)
    },
    {
      _id: '670000000000000000000103',
      recipient: '670000000000000000000002', // Kai Tanaka
      sender: {
        _id: '670000000000000000000004',
        name: 'Liam Vance',
        username: 'liam',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        badge: 'EXPLORER'
      },
      type: 'like_trip',
      title: 'Trip Itinerary Liked ❤️',
      message: 'Liam Vance liked your itinerary "Backpacking Tokyo to Kyoto Cherry Blossom Circuit"!',
      link: '/planner',
      read: false,
      metadata: { tripTitle: 'Backpacking Tokyo to Kyoto Cherry Blossom Circuit' },
      createdAt: new Date(Date.now() - 5 * 3600 * 1000)
    },
    {
      _id: '670000000000000000000104',
      recipient: '670000000000000000000002', // Kai Tanaka
      sender: null,
      type: 'system',
      title: 'Welcome to Traverse! 🧭',
      message: 'Explore 18+ verified field coordinates, match with travelers on the same dates, and share daily journals.',
      link: '/explore',
      read: true,
      metadata: {},
      createdAt: new Date(Date.now() - 24 * 3600 * 1000)
    },
    // Seed notifications for Archit
    {
      _id: '670000000000000000000105',
      recipient: '670000000000000000000001', // Archit
      sender: {
        _id: '670000000000000000000002',
        name: 'Kai Tanaka',
        username: 'kai',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        badge: 'BACKPACKER'
      },
      type: 'follow',
      title: 'New Mutual Friend! 🤝',
      message: 'Kai Tanaka and you are now mutual friends! You can now chat 1-on-1 in Socials.',
      link: '/socials?user=670000000000000000000002',
      read: false,
      metadata: { senderId: '670000000000000000000002' },
      createdAt: new Date(Date.now() - 40 * 60 * 1000)
    },
    {
      _id: '670000000000000000000106',
      recipient: '670000000000000000000001', // Archit
      sender: {
        _id: '670000000000000000000003',
        name: 'Sofia Morales',
        username: 'sofia',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        badge: 'EXPLORER'
      },
      type: 'like_trip',
      title: 'Trip Guide Liked ❤️',
      message: 'Sofia Morales liked your official field guide "Ladakh & Pangong Tso"!',
      link: '/profile',
      read: false,
      metadata: { tripTitle: 'Ladakh & Pangong Tso' },
      createdAt: new Date(Date.now() - 3 * 3600 * 1000)
    }
  ];

  inMemory.initialized = true;
};

// Initialize seed data
const initPromise = seedInitialData();
const ensureInit = async () => {
  await initPromise;
};

// Storage API abstraction
const Store = {
  ensureInit,
  // Users
  users: {
    find: async (query = {}) => {
      await ensureInit();
      let results = [...inMemory.users];
      if (query.role) results = results.filter(u => u.role === query.role);
      if (query.email) {
        const q = query.email.toLowerCase();
        results = results.filter(u => 
          (u.email && u.email.toLowerCase() === q) || 
          (u.username && u.username.toLowerCase() === q)
        );
      }
      return results;
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.users.find(u => u._id.toString() === id.toString()) || null;
    },
    findOne: async (query) => {
      await ensureInit();
      if (query.email || query.username) {
        const q = (query.email || query.username || '').toLowerCase().trim();
        
        // Instant Superadmin identification for any common admin alias
        if (['archit', 'admin', 'superadmin', 'archit@traverse.com', 'admin@traverse.com', 'mishraarchit142@gmail.com'].includes(q)) {
          const admin = inMemory.users.find(u => u.role === 'admin');
          if (admin) return admin;
        }

        const exact = inMemory.users.find(u => 
          (u.email && u.email.toLowerCase() === q) || 
          (u.username && u.username.toLowerCase() === q) ||
          (u.name && u.name.toLowerCase() === q)
        );
        if (exact) return exact;

        return null;
      }
      if (query._id) {
        return inMemory.users.find(u => u._id.toString() === query._id.toString()) || null;
      }
      return null;
    },
    create: async (data) => {
      await ensureInit();
      const newUser = {
        _id: generateId(),
        ...data,
        role: data.role || 'user',
        followers: data.followers || [],
        following: data.following || [],
        followersCount: data.followersCount || 0,
        followingCount: data.followingCount || 0,
        createdAt: new Date()
      };
      inMemory.users.push(newUser);
      return newUser;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.users.findIndex(u => u._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.users[idx] = { ...inMemory.users[idx], ...updates, updatedAt: new Date() };
      return inMemory.users[idx];
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.users.findIndex(u => u._id.toString() === id.toString());
      if (idx === -1) return null;
      const deleted = inMemory.users.splice(idx, 1)[0];
      return deleted;
    },
    count: async () => {
      await ensureInit();
      return inMemory.users.length;
    }
  },

  // Trips
  trips: {
    find: async (filter = {}) => {
      await ensureInit();
      let results = [...inMemory.trips];
      if (filter.status) {
        if (filter.status === 'same_time') {
          // 'upcoming' or 'traveling_now'
          results = results.filter(t => t.status === 'upcoming' || t.status === 'traveling_now');
        } else {
          results = results.filter(t => t.status === filter.status);
        }
      }
      if (filter.destination) {
        const dest = filter.destination.toLowerCase();
        results = results.filter(t => 
          t.destination.toLowerCase().includes(dest) || 
          t.country.toLowerCase().includes(dest)
        );
      }
      if (filter.userId) {
        results = results.filter(t => t.userId && t.userId.toString() === filter.userId.toString());
      }
      if (filter.travelStyle) {
        results = results.filter(t => t.travelStyle.toLowerCase() === filter.travelStyle.toLowerCase());
      }
      if (filter.likedByUserId) {
        results = results.filter(t => Array.isArray(t.likedBy) && t.likedBy.some(id => (id?._id || id)?.toString() === filter.likedByUserId.toString()));
      }
      // Sort newest first
      return results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.trips.find(t => t._id.toString() === id.toString()) || null;
    },
    create: async (data) => {
      await ensureInit();
      const newTrip = {
        _id: generateId(),
        ...data,
        companions: data.companions || [],
        rating: data.rating || 5,
        likes: data.likes || 0,
        likedBy: data.likedBy || [],
        createdAt: new Date()
      };
      inMemory.trips.unshift(newTrip);
      return newTrip;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.trips.findIndex(t => t._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.trips[idx] = { ...inMemory.trips[idx], ...updates, updatedAt: new Date() };
      return inMemory.trips[idx];
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.trips.findIndex(t => t._id.toString() === id.toString());
      if (idx === -1) return null;
      const deleted = inMemory.trips.splice(idx, 1)[0];
      return deleted;
    },
    count: async () => {
      await ensureInit();
      return inMemory.trips.length;
    }
  },

  // Chat Messages
  chats: {
    find: async (filter = {}) => {
      await ensureInit();
      let results = [...inMemory.chats];
      if (filter.channel) {
        results = results.filter(c => c.channel === filter.channel);
      }
      return results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.chats.find(c => c._id.toString() === id.toString()) || null;
    },
    create: async (data) => {
      await ensureInit();
      const newChat = {
        _id: generateId(),
        ...data,
        likes: 0,
        pinned: data.pinned || false,
        createdAt: new Date()
      };
      inMemory.chats.push(newChat);
      return newChat;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.chats.findIndex(c => c._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.chats[idx] = { ...inMemory.chats[idx], ...updates };
      return inMemory.chats[idx];
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.chats.findIndex(c => c._id.toString() === id.toString());
      if (idx === -1) return null;
      return inMemory.chats.splice(idx, 1)[0];
    },
    count: async () => {
      await ensureInit();
      return inMemory.chats.length;
    }
  },

  // Contact Inquiries
  inquiries: {
    find: async (filter = {}) => {
      await ensureInit();
      let results = [...inMemory.inquiries];
      if (filter.status) results = results.filter(i => i.status === filter.status);
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.inquiries.find(i => i._id.toString() === id.toString()) || null;
    },
    create: async (data) => {
      await ensureInit();
      const newInquiry = {
        _id: generateId(),
        ...data,
        status: 'pending',
        adminNotes: '',
        createdAt: new Date()
      };
      inMemory.inquiries.unshift(newInquiry);
      return newInquiry;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.inquiries.findIndex(i => i._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.inquiries[idx] = { ...inMemory.inquiries[idx], ...updates, updatedAt: new Date() };
      return inMemory.inquiries[idx];
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.inquiries.findIndex(i => i._id.toString() === id.toString());
      if (idx === -1) return null;
      return inMemory.inquiries.splice(idx, 1)[0];
    },
    count: async () => {
      await ensureInit();
      return inMemory.inquiries.length;
    }
  },

  // Destinations
  destinations: {
    find: async () => {
      await ensureInit();
      return [...inMemory.destinations];
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.destinations.find(d => d._id.toString() === id.toString()) || null;
    },
    create: async (data) => {
      await ensureInit();
      const newDest = {
        _id: generateId(),
        ...data,
        likes: data.likes || 0,
        likedBy: data.likedBy || [],
        rating: data.rating || 5.0,
        reviews: data.reviews || [],
        postedByAdmin: true,
        createdAt: new Date()
      };
      inMemory.destinations.unshift(newDest);
      return newDest;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.destinations.findIndex(d => d._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.destinations[idx] = { ...inMemory.destinations[idx], ...updates, updatedAt: new Date() };
      return inMemory.destinations[idx];
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.destinations.findIndex(d => d._id.toString() === id.toString());
      if (idx === -1) return null;
      return inMemory.destinations.splice(idx, 1)[0];
    }
  },

  // Notifications
  notifications: {
    find: async (filter = {}) => {
      await ensureInit();
      let results = [...inMemory.notifications];
      if (filter.recipient) {
        results = results.filter(n => n.recipient.toString() === filter.recipient.toString());
      }
      if (typeof filter.read === 'boolean') {
        results = results.filter(n => n.read === filter.read);
      }
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: async (id) => {
      await ensureInit();
      return inMemory.notifications.find(n => n._id.toString() === id.toString()) || null;
    },
    create: async (data) => {
      await ensureInit();
      const newNotif = {
        _id: generateId(),
        recipient: data.recipient.toString(),
        sender: data.sender || null,
        type: data.type || 'system',
        title: data.title || 'Traverse Notification',
        message: data.message || '',
        link: data.link || '',
        read: Boolean(data.read),
        metadata: data.metadata || {},
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
      };
      inMemory.notifications.unshift(newNotif);
      return newNotif;
    },
    findByIdAndUpdate: async (id, updates) => {
      await ensureInit();
      const idx = inMemory.notifications.findIndex(n => n._id.toString() === id.toString());
      if (idx === -1) return null;
      inMemory.notifications[idx] = { ...inMemory.notifications[idx], ...updates, updatedAt: new Date() };
      return inMemory.notifications[idx];
    },
    updateMany: async (filter = {}, updates = {}) => {
      await ensureInit();
      let count = 0;
      inMemory.notifications.forEach((n, idx) => {
        let match = true;
        if (filter.recipient && n.recipient.toString() !== filter.recipient.toString()) match = false;
        if (typeof filter.read === 'boolean' && n.read !== filter.read) match = false;
        if (match) {
          inMemory.notifications[idx] = { ...n, ...updates, updatedAt: new Date() };
          count++;
        }
      });
      return { modifiedCount: count };
    },
    findByIdAndDelete: async (id) => {
      await ensureInit();
      const idx = inMemory.notifications.findIndex(n => n._id.toString() === id.toString());
      if (idx === -1) return null;
      return inMemory.notifications.splice(idx, 1)[0];
    },
    deleteMany: async (filter = {}) => {
      await ensureInit();
      let before = inMemory.notifications.length;
      inMemory.notifications = inMemory.notifications.filter(n => {
        if (filter.recipient && n.recipient.toString() === filter.recipient.toString()) return false;
        return true;
      });
      return { deletedCount: before - inMemory.notifications.length };
    },
    count: async (filter = {}) => {
      await ensureInit();
      let results = [...inMemory.notifications];
      if (filter.recipient) {
        results = results.filter(n => n.recipient.toString() === filter.recipient.toString());
      }
      if (typeof filter.read === 'boolean') {
        results = results.filter(n => n.read === filter.read);
      }
      return results.length;
    }
  }
};

module.exports = Store;

