# Traverse 🧭 — Trip Planner Platform & Global Traveler Community

**Traverse** is a full-stack modern MERN platform engineered to solve two fundamental problems of modern exploration:
1. **Synchronous Travel Matching**: Connect with adventurers traveling to the same location at the **exact same time** (sync dates, share rentals, split logistics, or grab street food together).
2. **Travel Alumni & Veterans**: Read verified day-by-day itineraries and unvarnished advice from travelers who have **already completed their journey** (avoid scams, see realistic budgets, and get tested tips).

---

## 🌟 Key Features & Pages

### 1. 🏠 Home Page (`/`)
- Dynamic Hero section highlighting synchronous traveler matching and veteran insights.
- Quick search bar allowing instant filtering by **"Traveling Same Time"** vs **"Done Travel (Veterans)"**.
- Real-time traveler counters, social proof statistics, and featured community itineraries.
- Curated top destinations teaser and instant live chat launchpad.

### 2. 🗺️ Explore Destinations (`/explore`)
- Curated worldwide destinations (Kyoto & Osaka, Amalfi Coast, Swiss Alpine Trails, Bali & Nusa Penida, Iceland Ring Road, Banff National Park).
- Filter by geographical regions (East Asia, Southern Europe, Central Europe, Southeast Asia, North America).
- Interactive details modal showing daily budget estimates, best seasons, active travelers count, and top attractions.

### 3. 📝 Interactive Trip Planner (`/planner`)
- Step-by-step itinerary builder:
  - **Trip Objective Selection**: Choose whether you are **planning a future trip** (to match with companions) or logging a **completed journey** (to share advice).
  - Destination, Country, Travel Dates, Estimated Budget, and Travel Style (Solo, Backpacker, Adventure, Cultural, Couple, Friends/Group, Luxury).
  - Cover image selector with travel presets or custom URL.
  - **Dynamic Day-by-Day Schedule**: Add/remove days, assign day titles, and create detailed daily activity lists.
  - **Veteran Advice Field**: For completed journeys, log "What I learned / Tips for future travelers".
  - **Companion Toggle**: Open or close slots for companions to join your group.

### 4. 👥 Community Traveler Hub (`/community`)
- **Tab 1: "Traveling At The Same Time"**:
  - Live synchronous matching.
  - Date overlap picker: Enter your departure and return dates to filter trips whose dates intersect with yours.
  - Open companion slots filter & instant "Sync / Join as Travel Buddy" button.
- **Tab 2: "Already Done Travel (Alumni & Reviews)"**:
  - Verified itineraries with traveler ratings (⭐ 5.0) and collapsible "Read Veteran Advice" cards.
- Search by destination and filter by travel style.

### 5. 💬 Live Global Chat Room (`/chat`)
- Real-time communication powered by **Socket.io**.
- Dedicated thematic channels:
  - `#general-lounge`: Global wanderlust discussions.
  - `#same-time-buddies`: Matching upcoming and current travelers.
  - `#travel-veterans`: Q&A with travelers who finished trips.
  - `#itinerary-review`: Feedback on day-by-day plans.
  - `#budget-hacks`: Flight deals, discount passes, and cost savers.
- Real-time typing indicators (`"Kai is typing..."`), active online user counters, quick emoji bar, and admin announcement pins.

### 6. 📖 About Us (`/about`)
- Origin story, core philosophy, and mission breakdown.
- The 2 Core Problems Traverse solves.
- Principles: Safety & Transparency, Unvarnished Realism, Sustainable Wandering.
- Leadership team profiles.

### 7. 📬 Contact Us (`/contact`)
- Interactive contact form with category selector (General, Trip Planning Help, Partner Issue, Feedback, Bug Report).
- Direct persistence to MongoDB with routing into the Admin Dashboard.
- Support FAQs and 24/7 global travel helpline info.

### 8. 🔐 Authentication (`/login` & `/signup`)
- JWT-based authentication with bcrypt password hashing.
- One-click demo login buttons for immediate testing:
  - 👑 **Super Admin**: `archit` (or `archit@traverse.com`) / `archit123`
  - 🎒 **Traveler 1**: `kai@traverse.com` / `password123`
  - 🌍 **Traveler 2**: `sofia@traverse.com` / `password123`
- Automatic redirection to the **Community** hub upon login.

### 9. 👤 User Profile (`/profile`)
- Displays traveler passport details: avatar, bio, travel style, home city, and visited countries tags.
- Profile editor to update bio, visited countries, and avatar.
- "My Journeys" management: view, edit, and delete your published itineraries.

### 10. 🛡️ Admin Operations Dashboard (`/admin`)
- Accessible only to admin accounts.
- **Metrics Overview**: Total users, total trips, same-time active trips, completed itineraries, and support tickets.
- **User Directory**: View all registered users, promote users to admin or demote admins, and delete accounts.
- **Trip Moderation**: Inspect all platform itineraries and remove inappropriate posts.
- **Support Inbox**: Review contact inquiries, update status (Pending, In Progress, Resolved), and record internal notes.
- **Chat Moderation**: Pin announcements and delete flagged messages.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React Icons, React Router v6 |
| **Backend** | Node.js, Express, Socket.io, JWT, bcryptjs, CORS |
| **Database** | MongoDB / Mongoose (with seamless in-memory auto-fallback preloaded with rich seed data) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# From workspace root:
cd server && npm install
cd ../client && npm install
```

### 2. Run the Server
```bash
# Starts Express REST API and Socket.io server on http://localhost:5000
npm run server
```

### 3. Run the Client (Vite Dev Server)
```bash
# In a separate terminal:
npm run client
```
The client will open on `http://localhost:5173` and automatically proxies all API and WebSocket requests to the backend.

### 4. Or Run Full Production Build
```bash
npm run build
npm run server
```
The Express server on `http://localhost:5000` will serve both the backend API and the compiled frontend application from a single port!

