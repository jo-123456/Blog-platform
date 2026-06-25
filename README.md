# ✦ Inkwell — Full-Stack Blogging Platform

A professional, eye-catching blogging platform with user authentication, post management, and a rich comment system.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher

---

### 1. Install & Start the Backend

```bash
cd backend
npm install
node server.js
```

The backend runs on **http://localhost:5000**

> The database (SQLite via sql.js) is created automatically as `backend/blog.db`.
> Seed data (3 sample posts + demo user) is inserted on first run.

**Demo credentials:**
- Email: `demo@blog.com`
- Password: `demo1234`

---

### 2. Install & Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## ✨ Features

### Authentication
- User registration with username, email, password, bio
- JWT-based login (7-day tokens)
- Protected routes (write, edit, settings)
- Auto-generated avatar via DiceBear

### Posts
- Create, edit, delete blog posts
- Rich HTML content editor with toolbar shortcuts
- Cover image support (URL paste or pick from samples)
- Categories, tags, excerpt
- Auto-calculated read time
- Post views tracking
- Like / unlike posts
- Draft vs published status

### Comments
- Threaded comments (replies to comments)
- Edit and delete own comments
- Like comments
- Real-time comment count

### Discovery
- Homepage with featured post (first post shown large)
- Category filter bar
- Full-text search
- Explore page with category cards
- Author profile pages with stats

### UI/UX
- Glassmorphism navbar with scroll effect
- Skeleton loading states
- Animated fade-in cards
- Mobile responsive design
- Dark ink hero sections with ambient orbs
- Preview mode in post editor

---

## 🏗️ Project Structure

```
blog-platform/
├── backend/
│   ├── db/
│   │   └── database.js       # sql.js SQLite setup + helpers
│   ├── middleware/
│   │   └── auth.js           # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js           # /api/auth/*
│   │   ├── posts.js          # /api/posts/*
│   │   └── comments.js       # /api/posts/:slug/comments/*
│   ├── server.js             # Express app + seed data
│   ├── .env                  # Environment variables
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.jsx / .css
        │   ├── PostCard.jsx / .css
        │   ├── CommentSection.jsx / .css
        │   └── Footer.jsx / .css
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   └── useApi.js      # Axios instance with auth interceptor
        ├── pages/
        │   ├── Home.jsx / .css
        │   ├── PostDetail.jsx / .css
        │   ├── PostEditor.jsx / .css
        │   ├── Login.jsx / Auth.css
        │   ├── Register.jsx
        │   ├── AuthorProfile.jsx / .css
        │   ├── Explore.jsx / .css
        │   └── Settings.jsx / .css
        ├── App.js
        ├── index.js
        └── index.css          # Global tokens + typography
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Current user |
| PUT | /api/auth/profile | ✓ | Update profile |
| GET | /api/posts | — | List posts (paginated) |
| GET | /api/posts/:slug | — | Single post |
| POST | /api/posts | ✓ | Create post |
| PUT | /api/posts/:id | ✓ | Edit post |
| DELETE | /api/posts/:id | ✓ | Delete post |
| POST | /api/posts/:id/like | ✓ | Toggle like |
| GET | /api/posts/meta/categories | — | Category counts |
| GET | /api/posts/:slug/comments | — | Get comments |
| POST | /api/posts/:slug/comments | ✓ | Add comment |
| PUT | /api/posts/:slug/comments/:id | ✓ | Edit comment |
| DELETE | /api/posts/:slug/comments/:id | ✓ | Delete comment |
| POST | /api/posts/:slug/comments/:id/like | ✓ | Like comment |

---

## ⚙️ Environment Variables

`backend/.env`:
```
PORT=5000
JWT_SECRET=your_secret_here
NODE_ENV=development
```

---

## 🎨 Design System

- **Display font:** Playfair Display (serif)
- **Body font:** Inter (sans-serif)
- **Mono font:** JetBrains Mono
- **Primary palette:** Deep ink (#0f172a), warm paper (#fafaf9), amber accent (#d97706)
- **Radius system:** 8px / 12px / 20px
- **Motion:** subtle fade-in + translateY on load, translateY(-4px) on card hover
