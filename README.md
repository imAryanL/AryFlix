# 🎬 AryFlix

AryFlix is a modern, full-featured movie and TV show discovery web app inspired by Letterboxd and IMDb. It’s designed for both casual viewers and passionate fans who want to explore what’s trending, what’s in theaters, what’s coming soon, and where to watch it. AryFlix bridges the gap between streaming and theatrical content in one personalized entertainment hub.

[🌐 Live Website](https://ary-flix.vercel.app)

---

## 📌 Features

### 🎥 Content Discovery
- **Trending Movies & TV Shows** — Hero carousel with popular content.
- **Now Playing in Theatres** — Live cinema releases with Fandango ticket links.
- **Watch at Home** — Popular TV shows available on streaming.
- **Coming Soon** — Upcoming theatrical releases.
- **New & Upcoming Shows** — Latest series updates.
- **Trending Anime** — Discover what's hot in anime.
- **Streaming Platforms** — Filter by Netflix, Prime, Disney+, Max, Apple TV+.

### 🔍 Smart Search & Filtering
- **Intelligent Search** — Prioritizes popular and relevant titles.
- **Advanced Filtering** — Filter by genre, year, rating, media type.
- **Anime Support** — Filter exclusively for anime content.
- **Infinite Scroll** — Seamless loading of additional content.

### 🙋 Personalized Experience
- **User Authentication** — Sign up/login with email and username.
- **Watchlist** — Save and organize favorites.
- **User Ratings** — Rate movies/shows from 1 to 10.
- **State Persistence** — Watchlist stays intact across sessions.

### 🎞️ Rich Media Details
- **Dual Trailer System** — TMDB + YouTube fallback trailers.
- **Actor Info** — Full cast and actor filmography.
- **Multiple Ratings** — IMDb, Rotten Tomatoes, TMDB.
- **Streaming Info** — Where to watch it.
- **MPAA/TV Ratings** — Age and content ratings (PG, R, TV-MA, etc).

### 🎟️ Theatre Integration
- **Fandango Ticket Booking** — Direct purchase links.
- **Local Showtimes** — See what's playing near you.
- **“Get Tickets” Buttons** — Seamless ticket experience.

### 🧑‍💻 Technical Excellence
- **Responsive Design** — Fully mobile and desktop friendly.
- **Dark Theme** — Sleek, modern look.
- **Smooth Navigation** — React Router + scroll-to-top support.
- **Loading States** — Polished spinners and transitions.
- **Error Handling** — Graceful fallbacks and 404 pages.
- **Real-time Updates** — Watchlist changes reflected instantly.
- **Smart Caching** — Optimized for speed and performance.
- **Secure Auth** — JWT authentication, rate-limiting, and protected routes.

---

## 💡 What Makes AryFlix Special

- 🎞️ **Dual Trailer Support**: TMDB + YouTube fallback ensures reliable trailer coverage.
- 🔎 **Smart Discovery**: Surfacing popular, relevant titles first.
- 🎮 **Comprehensive Coverage**: Movies, TV shows, anime, theatres, and streaming.
- 🎟️ **Theatre Support**: Built-in ticket purchasing and showtime info.
- 🌟 **Personalization**: Watchlists and ratings that persist across sessions.

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React 19**
- **Tailwind CSS**
- **React Router**
- **Deployed on Vercel**

### ⚙️ Backend
- **Node.js + Express**
- **APIs Used**:
  - TMDB API (movie and TV metadata)
  - OMDB API (IMDb and Rotten Tomatoes ratings)
  - YouTube Data API (trailers)
- **Authentication**: JWT

### 🛢️ Database
- **PostgreSQL via Supabase**
- Handles user accounts, watchlist, and ratings

### 🌍 Deployment
- **Frontend**: [Vercel](https://vercel.com)
- **Backend**: [Render](https://render.com)
- **Keepalive**: [UptimeRobot](https://uptimerobot.com) for backend uptime

---

## 📸 Screenshots

> _Coming soon — project UI images will be added here_

---

## 📂 Installation (For Developers)

### Backend

```bash
cd aryflix-backend
npm install
# Set up .env file first
npm run dev
```

### Environment Variables

Create `.env` files in both directories with:

```env
# Backend (.env in aryflix-backend/)
TMDB_API_KEY=your_tmdb_key
YOUTUBE_API_KEY=your_youtube_key
OMDB_API_KEY=your_omdb_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=5000

# Frontend (.env in AryFlix/)
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
- Create a Supabase project
- Set up tables: `watchlist`, `ratings`, `usernames`
- Configure Row Level Security (RLS)

**Get API Keys:**
- [TMDB API](https://developers.themoviedb.org/3/getting-started/introduction)
- [YouTube Data API](https://developers.google.com/youtube/v3/getting-started)
- [OMDb API](http://www.omdbapi.com/apikey.aspx)
- [Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

```bash
npm start
```

### Frontend

```bash
cd aryflix
npm install
npm run dev
```

---

## 🙋 About the Developer

Hi, I'm Aryan! I created AryFlix as a passion project to combine the streaming and theatrical movie world into one app. Feel free to reach out or explore more of my work!

---

## 📄 License

This project is licensed under the MIT License.

