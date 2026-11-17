# 🚀 Traverse Production Deployment Guide

Complete step-by-step instructions for deploying Traverse to **Render** (Backend) and **Vercel** (Frontend).

---

## 🏗️ Architecture Overview

- **Frontend (Vercel)**: React 18, Vite 6, Tailwind CSS, Leaflet maps, Socket.io client.
- **Backend (Render)**: Node.js, Express, Socket.io (WebSocket), MongoDB Atlas / persistent store.
- **Real-Time Communication**: Socket.io WebSocket connections from Vercel to Render.

---

## Part 1: Deploy Backend on Render

1. Sign in to [Render.com](https://render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository containing Traverse.
4. Configure the Web Service settings:
   - **Name**: `traverse-backend` (or your preferred name)
   - **Region**: Choose the region closest to you (e.g., `Singapore`, `Frankfurt`, or `Oregon`)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** and set **Health Check Path**:
   - `/health`
6. Add the following **Environment Variables**:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `10000` | Render standard port |
   | `MONGO_URI` | `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/traverse?retryWrites=true&w=majority` | MongoDB connection URI |
   | `JWT_SECRET` | `<generate-a-secure-random-32-char-key>` | JWT authentication key |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | (You can update this after Vercel deployment) |

7. Click **Create Web Service**.
8. Wait for the build to finish. Once live, copy your backend URL (e.g., `https://traverse-backend.onrender.com`).

*(Optional: If deploying with Render Blueprints, Render will auto-detect the included `render.yaml` file).*

---

## Part 2: Deploy Frontend on Vercel

1. Sign in to [Vercel.com](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client` (or leave as root `/` — both are pre-configured!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   |---|---|---|
   | `VITE_API_URL` | `https://your-backend.onrender.com` | Use your Render backend URL (no trailing slash) |

6. Click **Deploy**.
7. Once deployed, Vercel will give you a domain (e.g., `https://traverse.vercel.app`).

---

## Part 3: Final Link (CORS Update)

1. Go back to your Render Dashboard → `traverse-backend` → **Environment**.
2. Update `CLIENT_URL` to your actual Vercel domain:
   - `CLIENT_URL` = `https://traverse.vercel.app`
3. Render will automatically redeploy with the updated CORS origin.

---

## ✅ Verification Checklist

- [ ] Open `https://your-backend.onrender.com/health` in your browser. Should return `{"status":"online", ...}`.
- [ ] Open your Vercel URL. Homepage should load smoothly.
- [ ] Test Navigation: Open `/socials`, `/explore`, `/trip-planner` and refresh the page (SPA routing handles direct hits without 404).
- [ ] Test Login: Log in using one-click demo traveler button (`kai@traverse.com` / `password123`) or create a new user.
- [ ] Test Live Chat & Notifications: Open `/socials` — check that the live indicator shows active connection and messages sync in real-time.

