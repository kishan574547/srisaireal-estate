# 🏛️ Sri Sai Real Estate – Full Stack Setup Guide

## Project Structure
```
sri-sai-real-estate/
├── client/          ← React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx       ← Public home page
│   │   │   ├── Login.jsx      ← Admin login
│   │   │   └── Admin.jsx      ← Admin dashboard
│   │   ├── services/
│   │   │   └── api.js         ← Axios API calls
│   │   ├── App.jsx            ← Routes + protected routes
│   │   ├── main.jsx           ← Entry point
│   │   └── index.css          ← Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json            ← Vercel deployment config
│   └── package.json
│
└── server/          ← Node.js + Express backend
    ├── config/
    │   └── cloudinary.js      ← Cloudinary setup
    ├── middleware/
    │   ├── auth.js            ← JWT auth middleware
    │   └── upload.js          ← Multer + Cloudinary upload
    ├── models/
    │   └── Property.js        ← Mongoose schema
    ├── routes/
    │   ├── authRoutes.js      ← Login, verify token
    │   └── propertyRoutes.js  ← CRUD operations
    ├── server.js              ← Express app entry
    ├── .env                   ← Environment variables
    └── package.json
```

---

## ⚡ Local Development Setup

### Step 1 – Backend Setup
```bash
cd server
npm install
```

Edit `server/.env` and fill in your Cloudinary API Secret:
```
CLOUDINARY_API_SECRET=your_actual_secret_here
```

Start backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 2 – Frontend Setup
```bash
cd client
npm install
npm run dev
# App runs on http://localhost:5173
```

### Step 3 – Access
- **Home Page**: http://localhost:5173
- **Admin Login**: http://localhost:5173/login
  - Email: `ntarunreddy80@gmail.com`
  - Password: `731980`
- **Admin Dashboard**: http://localhost:5173/admin

---

## 🌐 Deployment

### Backend → Render
1. Push server folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, select `server` as root directory
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env`
7. Note your Render URL (e.g. `https://sri-sai-api.onrender.com`)

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, select `client` as root directory
3. Framework preset: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
5. Update `client/vercel.json` with your Render URL
6. Also update CORS in `server/server.js` with your Vercel URL
7. Deploy!

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | Admin login |
| GET | `/api/auth/verify` | ✅ | Verify JWT token |

### Properties
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/properties` | ❌ | List all (with filters) |
| GET | `/api/properties/:id` | ❌ | Get single property |
| POST | `/api/properties` | ✅ | Create property |
| PUT | `/api/properties/:id` | ✅ | Update property |
| DELETE | `/api/properties/:id` | ✅ | Delete property |

### Query Filters (GET /api/properties)
- `?type=Apartment` – filter by property type
- `?status=For Sale` – filter by status
- `?city=Vijayawada` – filter by city
- `?featured=true` – featured only
- `?page=1&limit=10` – pagination

---

## ✅ Features Implemented
- [x] JWT Authentication with localStorage persistence
- [x] Protected admin routes (React + backend)
- [x] Login with redirect to admin dashboard
- [x] Upload property with up to 10 images (Cloudinary)
- [x] Edit property (update details + add/remove images)
- [x] Delete property (removes images from Cloudinary too)
- [x] Real-time property refresh after CRUD operations
- [x] Professional admin dashboard with stats
- [x] Luxury home page with hero, featured, all properties
- [x] Search + filter by type, status, city
- [x] Responsive design
- [x] Toast notifications
- [x] Image preview in admin

---

## 🔮 Coming Soon (Phase 2)
- Builder / Developer details
- Owner contact information
- WhatsApp enquiry button
- Property detail page
- Advanced search with price range
- Google Maps integration