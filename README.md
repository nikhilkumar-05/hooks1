# LPU Hooks — Campus Social Networking Platform

A LinkedIn-inspired campus social networking platform engineered exclusively for the **Lovely Professional University (LPU)** student and faculty community.

Built with the **MERN** stack (**MongoDB, Express.js, React, Node.js**) and **TypeScript**, styled with **Tailwind CSS**, and backed by real-time database persistence and an automated campus **AI Content Moderation Engine**.

---

## 📸 Key Highlights

- **LinkedIn-Inspired 3-Column Interface**: Left profile summary & campus shortcuts, center post composer and public feed, right suggested connections, active clubs, and upcoming events.
- **Real Database Persistence**: 100% connected to local MongoDB Community Server with zero hardcoded feed items or mock arrays.
- **Pre-Publication AI Safety Engine**: Automated detection and pre-publication blocking of prohibited categories:
  - Sexually explicit content, pornography, and nudity
  - Sexual harassment and unwanted advances
  - Threats, violence, and bodily injury
  - Hate speech, discrimination, and slurs
  - Campus ragging, senior harassment, and fresher intimidation
- **Threaded Commenting System**: Support for top-level comments and nested threaded replies.
- **Student Networking & Following**: Connect, disconnect, follow, and unfollow peers with instant relationship synchronization.
- **Clubs & Events Integration**: One-click club joining and event RSVP tracking with attendance counters.
- **Post Bookmarking / Saved Posts**: Save valuable campus discussions, hackathon guides, or club announcements for quick reference anytime.
- **Mobile Responsive**: Thumb-friendly layout with fixed bottom navigation matching standard mobile apps.
- **Strict Privacy**: Direct chat and messaging functionalities are completely excluded as per campus networking guidelines.

---

## 🛠️ Architecture & Technology Stack

```
hook1/
├── backend/
│   ├── controllers/         # MVC Controllers (auth, post, comment, club, event, user, notification)
│   ├── middleware/          # JWT authentication middleware (protect, optionalAuth)
│   ├── models/              # Mongoose schemas (User, Post, Comment, Club, Event, Connection, Notification)
│   ├── routes/              # Express REST API routes
│   ├── services/            # AI Content Moderation Service
│   ├── server.js            # Express server entry point
│   ├── seed.js              # Database seed script for campus demo data
│   ├── .env.example         # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Navbar, LeftSidebar, RightSidebar, PostComposer, PostCard, CommentSection, etc.)
│   │   ├── context/         # React AuthContext (JWT auth state, current student profile)
│   │   ├── pages/           # Feed, Network, Clubs, Events, Profile, Auth
│   │   ├── services/        # Axios API service client
│   │   ├── types/           # TypeScript data interfaces
│   │   ├── App.tsx          # Application router
│   │   └── main.tsx         # Root entry
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── vite.config.ts       # Vite configuration with /api reverse proxy
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (`node -v`)
- **MongoDB Community Server**: Running locally on port `27017`

To start local MongoDB (macOS / Homebrew):
```bash
brew services start mongodb-community
```
Verify MongoDB is running:
```bash
mongosh --eval "db.adminCommand('ping')"
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *Default configuration in `backend/.env`:*
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/hooks
   JWT_SECRET=hooks_secret_key_lpu_campus_2026_super_secure
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database with demo campus students, clubs, events, and approved posts:
   ```bash
   npm run seed
   ```
   *(To wipe all records: `npm run seed:clean`)*
5. Start the backend server:
   ```bash
   npm start
   # or with live reloading:
   npm run dev
   ```
   *Backend runs on `http://localhost:5001` with health-check at `http://localhost:5001/api/health`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

You can sign in with any seeded LPU student account, or use the **1-Click Instant Demo Login** buttons on the sign-in screen:

| Student Name | University Email | Password | Role / Headline |
| :--- | :--- | :--- | :--- |
| **Aman Sharma** | `aman.sharma@lpu.in` | `password123` | Tech Lead @ LPU Developers Guild |
| **Priya Patel** | `priya.patel@lpu.in` | `password123` | AI & ML Researcher (CSE) |
| **Rohit Kumar** | `rohit.kumar@lpu.in` | `password123` | Robotics Captain (RAIS) |
| **Sneha Verma** | `sneha.verma@lpu.in` | `password123` | Design Lead @ LPU Design Circle |
| **Vikram Singh** | `vikram.singh@lpu.in` | `password123` | Coordinator @ E-Cell LPU |

*Or register a new account on the registration page.*

---

## 🛡️ AI Content Moderation System

Every post, image URL, and comment undergoes pre-publication moderation:

- **Prohibited content is blocked immediately** with HTTP 422 and a policy violation notification.
- Zero tolerance against **ragging, senior intimidation, hate speech, threats, and sexually explicit material**.
- **Images** are checked for NSFW / explicit markers and safe protocols.
- Ambiguous content is routed to review status (`REVIEW_REQUIRED`) and excluded from the public feed until approved.

---

## 📡 Backend API Endpoints

### Authentication
- `POST /api/auth/register` — Create student account
- `POST /api/auth/login` — Sign in with email & password
- `GET /api/auth/me` — Retrieve current authenticated student

### Posts & Feed
- `GET /api/posts` — Get chronological campus feed (supports `?filter=following` or `?filter=saved`)
- `POST /api/posts` — Create campus post (AI moderated)
- `POST /api/posts/:id/like` — Like a post (generates author notification)
- `DELETE /api/posts/:id/like` — Unlike a post
- `POST /api/posts/:id/save` — Bookmark / save post for later
- `DELETE /api/posts/:id` — Delete post (author only)

### Threaded Comments
- `GET /api/comments/:postId` — Get threaded comments and nested replies
- `POST /api/comments/:postId` — Post comment or nested reply (AI moderated)
- `POST /api/comments/:id/like` — Like a comment
- `DELETE /api/comments/:id` — Delete comment (author only)

### Student Network & Profiles
- `GET /api/users` — Search and list students
- `GET /api/users/:id` — Get student profile and their posts
- `PATCH /api/users/me` — Update current student profile
- `GET /api/users/me/connections` — Get list of active connections
- `GET /api/users/me/saved-posts` — Get bookmarked posts
- `POST /api/users/:id/connect` — Toggle connection
- `POST /api/users/:id/follow` — Toggle following

### Clubs & Events
- `GET /api/clubs` — List campus clubs
- `POST /api/clubs/:id/join` — Join a club
- `DELETE /api/clubs/:id/join` — Leave a club
- `GET /api/events` — List campus events
- `POST /api/events/:id/rsvp` — RSVP to an event
- `DELETE /api/events/:id/rsvp` — Cancel RSVP

### Notifications & System
- `GET /api/notifications` — Get user notifications & unread counter
- `PATCH /api/notifications/:id/read` — Mark notification(s) as read
- `GET /api/health` — System status & MongoDB connection state

