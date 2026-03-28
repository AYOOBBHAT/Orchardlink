# 🍎 OrchardLink

OrchardLink is a platform that connects apple farmers in Kashmir directly with consumers by allowing users to adopt (lease) apple trees and receive fresh produce at harvest time.

---

## 🚀 Problem

* Farmers earn less due to middlemen
* Buyers don’t trust the quality or origin of produce
* No direct connection between farmers and consumers

---

## 💡 Solution

OrchardLink eliminates middlemen by enabling users to:

* 🌳 Adopt a real apple tree from a farmer
* 📸 Track its growth through updates
* 🍎 Receive fresh apples directly after harvest

---

## 🧩 Features

### 👨‍🌾 Farmer

* Register as a farmer
* Add trees with details and images
* Upload orchard photos (Cloudinary integration)

### 👤 Adopter

* Browse available trees
* Adopt a tree
* View adopted trees in dashboard

### 📊 Dashboard

* Track tree status (Growing → Fruiting → Ready → Delivered)
* View timeline updates with images

### 🌐 Marketplace

* Explore trees listed by farmers
* View farmer details and expected yield

---

## ⚙️ Tech Stack

* **Frontend:** Next.js + Tailwind CSS
* **Backend:** Node.js + Express
* **Database:** MongoDB
* **Image Storage:** Cloudinary

---

## 🔄 How It Works

1. Farmers list their trees on the platform
2. Users browse and adopt a tree
3. Farmers upload updates (growth stages)
4. Users track progress via dashboard
5. Apples are delivered after harvest

---

## 🎯 Future Improvements

* 💳 Payment integration
* 📦 Delivery tracking system
* 📱 Mobile app
* 🌍 Multi-fruit support (cherry, walnut, etc.)
* 🤖 AI-based yield prediction

---

## 🧠 Inspiration

Inspired by the idea of direct farm-to-consumer models and bringing transparency and trust into agricultural supply chains.

---

## 📌 One-line Pitch

**“OrchardLink lets you adopt a real apple tree in Kashmir and receive fresh produce directly from farmers.”**

---

## 🌐 Deploy (Railway API + Vercel frontend)

### 1. Backend on [Railway](https://railway.app)

1. Push this repo to GitHub.
2. **New project → Deploy from GitHub** → pick the repo.
3. **Root directory:** leave as **repository root** (where `server.js` and `package.json` live — not `frontend/`).
4. Railway runs **`npm start`** (`node server.js`). It sets **`PORT`** automatically — do not hardcode it.
5. In **Variables**, add (see `.env.example` in the repo root):

   | Variable | Notes |
   |----------|--------|
   | `MONGO_URI` | MongoDB Atlas URI or Railway MongoDB plugin URL |
   | `JWT_SECRET` | Long random string |
   | `CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Or `API_KEY` / `API_SECRET` / `CLOUDINARY_CLOUD_NAME` |
   | `CLIENT_ORIGINS` | *Optional.* Comma-separated Vercel URLs, e.g. `https://your-app.vercel.app` |

6. **Generate domain** (Settings → Networking) and copy the public URL, e.g. `https://orchardlink-api-production.up.railway.app`.
7. Confirm **`GET`** that URL shows `API Running`.

Your API base for the browser is: **`https://<railway-host>/api`** (no trailing slash).

### 2. Frontend on [Vercel](https://vercel.com)

1. **Add New Project** → import the same GitHub repo.
2. **Root Directory:** set to **`frontend`** (important).
3. Framework: **Next.js** (auto-detected).
4. **Environment Variables** (Production / Preview as needed):

   | Name | Example value |
   |------|----------------|
   | `NEXT_PUBLIC_API_URL` | `https://orchardlink-api-production.up.railway.app/api` |

5. Deploy. After the API URL is final, update `NEXT_PUBLIC_API_URL` and **redeploy** (this value is baked in at build time).

### 3. Local dev

- API: copy `.env.example` → `.env` in the repo root; run `npm start` (default `PORT=5000` in `.env` if you use it).
- Frontend: copy `frontend/.env.example` → `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`, then `npm run dev` inside `frontend/`.
