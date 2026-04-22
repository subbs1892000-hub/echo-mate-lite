# EchoMateLite

EchoMateLite is a lightweight MERN social media platform with JWT authentication, profile management, post creation, and a reverse-chronological feed.

## Project Structure

```text
EchoMateLite/
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── api/
│       │   └── axiosInstance.js
│       ├── components/
│       │   ├── Loader.jsx
│       │   ├── Navbar.jsx
│       │   ├── PostCard.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProfilePage.jsx
│       │   └── SignupPage.jsx
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   └── profileRoutes.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── package.json
│   └── server.js
└── README.md
```

## Backend APIs

- `POST /auth/signup`
- `POST /auth/login`
- `GET /posts`
- `POST /posts`
- `GET /profile`
- `PUT /profile`

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Update `.env` with your MongoDB URI and JWT secret.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
```

## Run Locally

Start backend:

```bash
cd server
npm run dev
```

Start frontend:

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173` and backend on `http://localhost:5000`.

## AWS Deployment Readiness

- Backend uses environment variables for `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.
- Frontend uses `VITE_API_BASE_URL` so the API endpoint can be changed for production.
- CORS is configured through `CLIENT_URL`.
- Both apps have production build/start scripts for deployment pipelines.
